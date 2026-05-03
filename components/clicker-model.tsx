"use client";
import { RoundedBox } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
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

// ~70% of KEYCAP_W; each font has a sizeScale multiplier for optical corrections.
const BASE_FONT_SIZE = 0.65;
// KEYCAP_W=0.92 ≈ 19mm → 1 unit ≈ 20.6mm → 2mm ≈ 0.097 world units
const LETTER_DEPTH = 0.097;

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

function EmbossedLetter({
  position,
  fontJsonUrl,
  sizeScale,
  char,
  color,
}: {
  position: [number, number, number];
  fontJsonUrl: string;
  sizeScale: number;
  char: string;
  color: string;
}) {
  const font = useLoader(FontLoader, fontJsonUrl);

  const geometry = useMemo(() => {
    const size = BASE_FONT_SIZE * sizeScale;
    const geo = new TextGeometry(char, {
      font,
      size,
      depth: LETTER_DEPTH,
      curveSegments: 12,
      bevelEnabled: false,
    });
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const cx = (bb.min.x + bb.max.x) / 2;
    const cy = (bb.min.y + bb.max.y) / 2;
    geo.translate(-cx, -cy, 0);
    return geo;
  }, [font, char, sizeScale]);

  useEffect(() => () => geometry.dispose(), [geometry]);

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
  const { fontJsonUrl, sizeScale } = useMemo(() => {
    const f = FONTS.find((f) => f.id === design.font) ?? FONTS[0];
    return { fontJsonUrl: f.json, sizeScale: f.sizeScale };
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
        <mesh position={[0, BASE_H / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.16, 32]} />
          <meshStandardMaterial color={frameColor} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -BASE_H / 2 - 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.16, 32]} />
          <meshStandardMaterial color={frameColor} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
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

      {/* Inset frame */}
      <RoundedBox
        position={[0, BASE_H + FRAME_INSET_H / 2, 0]}
        args={[baseWidth - 0.16, FRAME_INSET_H, BASE_DEPTH - 0.16]}
        radius={0.05}
        smoothness={4}
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} roughness={0.75} metalness={0.04} />
      </RoundedBox>

      {/* Keycaps + embossed letters */}
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
                <EmbossedLetter
                  position={[x, keycapTopY, 0]}
                  fontJsonUrl={fontJsonUrl}
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
