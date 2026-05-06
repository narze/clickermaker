"use client";
import { RoundedBox } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { Design } from "@/lib/types";
import { FONTS } from "@/lib/types";
import type { Font } from "opentype.js";

const KEYCAP_W = 0.88;
const KEYCAP_D = 0.88;
const KEYCAP_H = 0.62;
const KEYCAP_SPACING = 0.94;
const BASE_DEPTH = 1.22;
const BASE_PAD = 0.22;
const FLOOR_H = 0.2;
const WALL_H = 0.24;
const WALL_T = 0.1;
const DIVIDER_T = 0.11;
const INNER_INSET = 0.12;
const LANYARD_RING_R = 0.23;
const LANYARD_HOLE_R = 0.085;
const LANYARD_STEM_W = 0.19;
const LETTER_Y_INSET = 0.04;

// Base size targets ~70% of KEYCAP_W (0.92). sizeScale adjusts per-font optical size.
const BASE_FONT_SIZE = 0.65;
// ~2mm real-world extrusion height
const LETTER_DEPTH = 0.097;

const fontCache = new Map<string, Promise<Font>>();

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

const PLUNGER_TOP_SCALE = 0.82;
const PLUNGER_CORNER_R = 0.16;

/**
 * Tapered rounded rect used for the physical clicker plungers.
 * The top stays smaller than the base and a small bevel softens the top edge.
 */
function createPlungerGeometry(
  w: number,
  d: number,
  h: number,
  topScale: number,
  cornerR: number,
): THREE.BufferGeometry {
  const topW = w * topScale;
  const topD = d * topScale;
  const halfH = h / 2;
  const r = Math.min(cornerR, topW / 2, topD / 2);
  const hw = topW / 2;
  const hd = topD / 2;

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
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.02,
    bevelSegments: 5,
    steps: 1,
    curveSegments: 18,
  });

  geo.rotateX(Math.PI / 2);
  geo.translate(0, halfH, 0);

  const scaleFactor = w / topW;
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = (halfH - y) / h;
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

function BasePlastic({ color }: { color: string }) {
  return <meshStandardMaterial color={color} roughness={0.68} metalness={0.03} />;
}

function FramePlastic({ color }: { color: string }) {
  return <meshStandardMaterial color={color} roughness={0.76} metalness={0.02} />;
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
  const baseHeight = FLOOR_H + WALL_H;
  const trayTopY = baseHeight;
  const keycapBottomY = FLOOR_H;
  const keycapCenterY = keycapBottomY + KEYCAP_H / 2;
  const keycapTopY = keycapBottomY + KEYCAP_H;
  const { fontUrl, sizeScale } = useMemo(() => {
    const f = FONTS.find((f) => f.id === design.font) ?? FONTS[0];
    return { fontUrl: f.ttf, sizeScale: f.sizeScale };
  }, [design.font]);

  const keycapGeo = useMemo(() => createPlungerGeometry(KEYCAP_W, KEYCAP_D, KEYCAP_H, PLUNGER_TOP_SCALE, PLUNGER_CORNER_R), []);
  useEffect(() => () => keycapGeo.dispose(), [keycapGeo]);
  const frameColor = useMemo(() => darken(design.baseColor, 0.18), [design.baseColor]);
  const lanyardX = -baseWidth / 2 - LANYARD_RING_R * 0.4;
  const sideWallZ = BASE_DEPTH / 2 - WALL_T / 2;
  const dividerY = FLOOR_H + WALL_H / 2;
  const buttonTravel = Math.max(0, KEYCAP_H - WALL_H);

  return (
    <group position={[0, -baseHeight / 2, 0]}>
      {/* Single-piece housing */}
      <RoundedBox
        position={[0, baseHeight / 2, 0]}
        args={[baseWidth, baseHeight, BASE_DEPTH]}
        radius={0.1}
        smoothness={5}
        castShadow
        receiveShadow
      >
        <BasePlastic color={design.baseColor} />
      </RoundedBox>

      {/* Lanyard loop */}
      <mesh
        position={[lanyardX, baseHeight / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <torusGeometry
          args={[
            (LANYARD_RING_R + LANYARD_HOLE_R) / 2,
            (LANYARD_RING_R - LANYARD_HOLE_R) / 2,
            20,
            40,
          ]}
        />
        <meshStandardMaterial color={design.baseColor} roughness={0.66} metalness={0.03} />
      </mesh>
      <RoundedBox
        position={[lanyardX + LANYARD_RING_R * 0.58, baseHeight / 2, 0]}
        args={[LANYARD_STEM_W, 0.12, 0.32]}
        radius={0.04}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <BasePlastic color={design.baseColor} />
      </RoundedBox>

      {/* Tray floor tint */}
      <RoundedBox
        position={[0, FLOOR_H + 0.012, 0]}
        args={[baseWidth - INNER_INSET * 2, 0.024, BASE_DEPTH - INNER_INSET * 2]}
        radius={0.04}
        smoothness={4}
        receiveShadow
      >
        <FramePlastic color={frameColor} />
      </RoundedBox>

      {/* Dividers */}
      {Array.from({ length: Math.max(0, n - 1) }).map((_, i) => {
        const dividerX = (i - (n - 2) / 2) * KEYCAP_SPACING + KEYCAP_SPACING / 2;
        return (
          <RoundedBox
            key={`divider-${i}`}
            position={[dividerX, dividerY, 0]}
            args={[DIVIDER_T, WALL_H, BASE_DEPTH - INNER_INSET * 2.1]}
            radius={0.05}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <BasePlastic color={design.baseColor} />
          </RoundedBox>
        );
      })}

      {/* Keycaps + letters */}
      {design.keycaps.map((kc, i) => {
        const x = (i - (n - 1) / 2) * KEYCAP_SPACING;
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
                roughness={0.56}
                metalness={0.04}
                emissive={isHighlighted ? "#ffffff" : "#000000"}
                emissiveIntensity={isHighlighted ? 0.08 : 0}
              />
            </mesh>

            {kc.char && (
              <Suspense fallback={null}>
                <ExtrudedLetter
                  position={[x, keycapTopY - LETTER_Y_INSET * 0.65, 0]}
                  fontUrl={fontUrl}
                  sizeScale={sizeScale}
                  char={kc.char}
                  color={kc.letterColor}
                />
              </Suspense>
            )}

            {/* Exposed plunger travel area below the tray line */}
            <mesh position={[x, FLOOR_H + buttonTravel / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[KEYCAP_W * 0.7, buttonTravel, KEYCAP_D * 0.7]} />
              <meshStandardMaterial color={darken(kc.keycapColor, 0.16)} roughness={0.6} metalness={0.02} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
