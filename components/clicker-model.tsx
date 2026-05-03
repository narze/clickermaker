"use client";
import { RoundedBox, Text } from "@react-three/drei";
import { Suspense, useMemo } from "react";
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

function CenteredLetter({
  position,
  fontUrl,
  char,
  color,
}: {
  position: [number, number, number];
  fontUrl: string;
  char: string;
  color: string;
}) {
  return (
    <Text
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      font={fontUrl}
      fontSize={0.6}
      anchorX="center"
      anchorY="middle"
      color={color}
      material-toneMapped={false}
    >
      {char}
    </Text>
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
  const fontUrl = useMemo(
    () => FONTS.find((f) => f.id === design.font)?.ttf ?? FONTS[0].ttf,
    [design.font],
  );
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
            <RoundedBox
              position={[x, keycapCenterY, 0]}
              args={[KEYCAP_W, KEYCAP_H, KEYCAP_D]}
              radius={0.07}
              smoothness={4}
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
            </RoundedBox>

            {kc.char && (
              <Suspense fallback={null}>
                <CenteredLetter
                  position={[x, keycapTopY + 0.001, 0]}
                  fontUrl={fontUrl}
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
