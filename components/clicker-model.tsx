"use client";
import { RoundedBox } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { Design } from "@/lib/types";
import { FONTS } from "@/lib/types";

const KEYCAP_W = 0.92;
const KEYCAP_D = 0.92;
const KEYCAP_H = 0.46;
const KEYCAP_SPACING = 1.04;
const BASE_H = 0.5;
const BASE_DEPTH = 1.5;
const BASE_PAD = 0.34;
const FRAME_INSET_H = 0.04;
const LANYARD_W = 0.62;
const LANYARD_GAP = 0.04;

// Base size targets ~70% of KEYCAP_W (0.92). sizeScale adjusts per-font optical size.
const BASE_FONT_SIZE = 0.65;
// ~2mm real-world extrusion height
const LETTER_DEPTH = 0.097;

const fontCache = new Map<string, Promise<any>>();

async function loadFont(url: string) {
  if (!fontCache.has(url)) {
    const promise = (async () => {
      const opentype = await import("opentype.js");
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      return opentype.parse(buffer);
    })();
    fontCache.set(url, promise);
  }
  return fontCache.get(url)!;
}

// XDA profile: top face is ~75% of base width (real ≈ 13.9mm / 18.5mm)
const XDA_TOP_SCALE = 0.75;
const XDA_CORNER_R = 0.06; // corner radius on the top face

/**
 * Tapered rounded-box for XDA keycap profile.
 * Shape is a rounded rect in XY plane, extruded along +Z, then rotated
 * so the flat top faces +Y. Vertices are linearly interpolated: top stays
 * at topW, bottom expands to w, giving the characteristic taper.
 */
function createXdaGeometry(w: number, d: number, h: number, topScale: number, cornerR: number): THREE.BufferGeometry {
  const topW = w * topScale;
  const topD = d * topScale;
  const halfH = h / 2;
  const r = Math.min(cornerR, topW / 2, topD / 2);
  const hw = topW / 2, hd = topD / 2;

  const shape = new THREE.Shape();
  shape.moveTo(-hw + r, -hd);
  shape.lineTo(hw - r, -hd);
  shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
  shape.lineTo(hw, hd - r);
  shape.quadraticCurveTo(hw, hd, hw - r, hd);
  shape.lineTo(-hw + r, hd);
  shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
  shape.lineTo(-hw, -hd + r);
  shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: false,
    steps: 1,
    curveSegments: 8,
  });

  // rotateX(+π/2): (x,y,z) → (x,-z,y) — shape XY becomes XZ, top at y=0
  geo.rotateX(Math.PI / 2);
  // center vertically: top at +halfH, bottom at -halfH
  geo.translate(0, halfH, 0);

  // Linear taper: top stays topW, bottom expands to w
  const scaleFactor = w / topW;
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = (halfH - y) / h; // 0 at top, 1 at bottom
    const s = 1 + (scaleFactor - 1) * t;
    pos.setX(i, pos.getX(i) * s);
    pos.setZ(i, pos.getZ(i) * s);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function ExtrudedLetter({
  position,
  fontUrl,
  sizeScale,
  char,
  color,
}: {
  position: [number, number, number];
  fontUrl: string;
  sizeScale: number;
  char: string;
  color: string;
}) {
  const [geometry, setGeometry] = useState<THREE.ExtrudeGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pendingGeo: THREE.ExtrudeGeometry | null = null;

    async function build() {
      try {
        const font = await loadFont(fontUrl);
        if (cancelled) return;

        const size = BASE_FONT_SIZE * sizeScale;
        const glyph = font.charToGlyph(char);
        const path = glyph.getPath(0, 0, size);

        const shapePath = new THREE.ShapePath();
        for (const cmd of path.commands) {
          switch (cmd.type) {
            case "M":
              shapePath.moveTo(cmd.x, -cmd.y);
              break;
            case "L":
              shapePath.lineTo(cmd.x, -cmd.y);
              break;
            case "Q":
              shapePath.quadraticCurveTo(cmd.x1, -cmd.y1, cmd.x, -cmd.y);
              break;
            case "C":
              shapePath.bezierCurveTo(cmd.x1, -cmd.y1, cmd.x2, -cmd.y2, cmd.x, -cmd.y);
              break;
            case "Z":
              if (shapePath.currentPath) {
                shapePath.currentPath.closePath();
              }
              break;
          }
        }

        const shapes = shapePath.toShapes(false);
        pendingGeo = new THREE.ExtrudeGeometry(shapes, {
          depth: LETTER_DEPTH,
          curveSegments: 32,
          bevelEnabled: true,
          bevelThickness: 0.008,
          bevelSize: 0.008,
          bevelSegments: 4,
        });

        pendingGeo.computeBoundingBox();
        const bb = pendingGeo.boundingBox!;
        pendingGeo.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, 0);

        if (!cancelled) {
          setGeometry(pendingGeo);
        }
      } catch (err) {
        console.error("Failed to build letter geometry:", err);
      }
    }

    build();

    return () => {
      cancelled = true;
      if (pendingGeo) {
        pendingGeo.dispose();
      }
    };
  }, [fontUrl, sizeScale, char]);

  useEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  if (!geometry) return null;

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geometry}
      castShadow
    >
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} toneMapped={false} />
    </mesh>
  );
}

function darken(hex: string, amount = 0.18): string {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  hsl.l = Math.max(0, hsl.l - amount);
  c.setHSL(hsl.h, hsl.s, hsl.l);
  return `#${c.getHexString()}`;
}

export function ClickerModel({
  design,
  onKeycapClick,
  highlightedIndex,
}: {
  design: Design;
  onKeycapClick?: (i: number) => void;
  highlightedIndex?: number | null;
}) {
  const n = design.keycaps.length;
  const baseWidth = n * KEYCAP_SPACING + BASE_PAD * 2;
  const { fontUrl, sizeScale } = useMemo(() => {
    const f = FONTS.find((f) => f.id === design.font) ?? FONTS[0];
    return { fontUrl: f.ttf, sizeScale: f.sizeScale };
  }, [design.font]);

  const keycapGeo = useMemo(
    () => createXdaGeometry(KEYCAP_W, KEYCAP_D, KEYCAP_H, XDA_TOP_SCALE, XDA_CORNER_R),
    []
  );
  useEffect(() => () => keycapGeo.dispose(), [keycapGeo]);
  const frameColor = useMemo(() => darken(design.baseColor, 0.18), [design.baseColor]);
  const lanyardX = -baseWidth / 2 - LANYARD_W / 2 - LANYARD_GAP;

  return (
    <group position={[0, -BASE_H / 2, 0]}>
      {/* Lanyard tab */}
      <group position={[lanyardX, BASE_H / 2, 0]}>
        <RoundedBox
          args={[LANYARD_W, BASE_H, BASE_DEPTH * 0.62]}
          radius={0.18}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={design.baseColor} roughness={0.62} metalness={0.04} />
        </RoundedBox>
        {/* lanyard hole — render a darker disc + ring on top + bottom */}
        <mesh position={[0, BASE_H / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.16, 32]} />
          <meshStandardMaterial color={frameColor} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -BASE_H / 2 - 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.16, 32]} />
          <meshStandardMaterial color={frameColor} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        {/* hole center */}
        <mesh position={[0, BASE_H / 2 + 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.08, 24]} />
          <meshStandardMaterial color="#1d1d1d" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Base body */}
      <RoundedBox
        position={[0, BASE_H / 2, 0]}
        args={[baseWidth, BASE_H, BASE_DEPTH]}
        radius={0.16}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={design.baseColor} roughness={0.6} metalness={0.04} />
      </RoundedBox>

      {/* Inset frame area where keycaps sit (slightly darker plate on top of base) */}
      <RoundedBox
        position={[0, BASE_H + FRAME_INSET_H / 2, 0]}
        args={[baseWidth - 0.16, FRAME_INSET_H, BASE_DEPTH - 0.16]}
        radius={0.05}
        smoothness={4}
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} roughness={0.75} metalness={0.04} />
      </RoundedBox>

      {/* Keycaps + letters */}
      {design.keycaps.map((kc, i) => {
        const x = (i - (n - 1) / 2) * KEYCAP_SPACING;
        const keycapBottomY = BASE_H + FRAME_INSET_H;
        const keycapCenterY = keycapBottomY + KEYCAP_H / 2;
        const keycapTopY = keycapBottomY + KEYCAP_H;
        const isHighlighted = highlightedIndex === i;

        return (
          <group key={i}>
            <mesh
              position={[x, keycapCenterY, 0]}
              geometry={keycapGeo}
              castShadow
              receiveShadow
              onClick={(e) => {
                e.stopPropagation();
                onKeycapClick?.(i);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                if (typeof document !== "undefined") {
                  document.body.style.cursor = "pointer";
                }
              }}
              onPointerOut={() => {
                if (typeof document !== "undefined") {
                  document.body.style.cursor = "";
                }
              }}
            >
              <meshStandardMaterial
                color={kc.keycapColor}
                roughness={0.5}
                metalness={0.05}
                emissive={isHighlighted ? "#ffffff" : "#000000"}
                emissiveIntensity={isHighlighted ? 0.12 : 0}
              />
            </mesh>

            {kc.char && (
              <Suspense fallback={null}>
                <ExtrudedLetter
                  position={[x, keycapTopY, 0]}
                  fontUrl={fontUrl}
                  sizeScale={sizeScale}
                  char={kc.char}
                  color={kc.letterColor}
                />
              </Suspense>
            )}
          </group>
        );
      })}
    </group>
  );
}
