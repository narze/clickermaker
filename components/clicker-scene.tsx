"use client";
import { Canvas, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import type { Design } from "@/lib/types";
import { ClickerModel } from "./clicker-model";

export type ExportFn = () => string | null;

function ExportBridge({ exportRef }: { exportRef: React.MutableRefObject<ExportFn | null> }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    exportRef.current = () => {
      try {
        const prev = gl.getPixelRatio();
        gl.setPixelRatio(Math.min(window.devicePixelRatio * 2, 4));
        gl.render(scene, camera);
        const url = gl.domElement.toDataURL("image/png");
        gl.setPixelRatio(prev);
        gl.render(scene, camera);
        return url;
      } catch (err) {
        console.error("Export failed", err);
        return null;
      }
    };
    return () => {
      exportRef.current = null;
    };
  }, [gl, scene, camera, exportRef]);
  return null;
}

function IdleSpin({ active }: { active: boolean }) {
  const t = useRef(0);
  const { camera } = useThree();
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      t.current += dt * 0.35;
      const r = Math.hypot(camera.position.x, camera.position.z);
      camera.position.x = Math.sin(t.current) * r;
      camera.position.z = Math.cos(t.current) * r;
      camera.lookAt(0, 0, 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, camera]);
  return null;
}

export function ClickerScene({
  design,
  onKeycapClick,
  highlightedIndex,
  exportRef,
  idle,
  onUserInteract,
}: {
  design: Design;
  onKeycapClick?: (i: number) => void;
  highlightedIndex?: number | null;
  exportRef: React.MutableRefObject<ExportFn | null>;
  idle: boolean;
  onUserInteract: () => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      onPointerDown={onUserInteract}
      onWheel={onUserInteract}
      camera={{ position: [0, 3.5, 7], fov: 32 }}
    >
      <color attach="background" args={["#fafafa"]} />
      <PerspectiveCamera makeDefault position={[0, 3.5, 7]} fov={32} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 8, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 4, -3]} intensity={0.45} />

      <Suspense fallback={null}>
        <Environment preset="studio" background={false} />
        <ClickerModel
          design={design}
          onKeycapClick={onKeycapClick}
          highlightedIndex={highlightedIndex}
        />
        <ContactShadows
          position={[0, -0.001, 0]}
          opacity={0.45}
          scale={20}
          blur={2}
          far={2}
          color="#000000"
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={3.5}
        maxDistance={14}
        minPolarAngle={Math.PI * 0.12}
        maxPolarAngle={Math.PI * 0.49}
        onStart={onUserInteract}
      />
      <IdleSpin active={idle} />
      <ExportBridge exportRef={exportRef} />
      <fog attach="fog" args={["#fafafa", 14, 30]} />
      <SceneTuning />
      <CameraFit keycapCount={design.keycaps.length} />
    </Canvas>
  );
}

function SceneTuning() {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
  }, [gl]);
  return null;
}

// Widens vFOV on portrait/narrow viewports so the full model stays visible.
function CameraFit({ keycapCount }: { keycapCount: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const aspect = size.width / size.height;
    // Model geometry constants (must match clicker-model.tsx)
    const KEYCAP_SPACING = 1.04;
    const BASE_PAD = 0.34;
    const LANYARD_W = 0.62;
    const LANYARD_GAP = 0.04;
    const n = keycapCount;
    const baseWidth = n * KEYCAP_SPACING + BASE_PAD * 2;
    // Use the wider (left) side: lanyard extends past base edge
    const modelHalfWidth = baseWidth / 2 + LANYARD_W + LANYARD_GAP + 0.3;
    // Effective camera depth to world origin (camera at [0, 3.5, 7])
    const camDepth = Math.sqrt(3.5 * 3.5 + 7 * 7);
    const minVFov = (2 * Math.atan(modelHalfWidth / (camDepth * aspect)) * 180) / Math.PI;
    camera.fov = Math.max(32, Math.min(80, minVFov));
    camera.updateProjectionMatrix();
  }, [camera, size, keycapCount]);
  return null;
}
