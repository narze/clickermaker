"use client"
import { Canvas, useThree } from "@react-three/fiber"
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei"
import { Suspense, useEffect, useRef } from "react"
import * as THREE from "three"
import type { WaveRequest } from "@/lib/keycap-wave"
import type { Design } from "@/lib/types"
import { ClickerModel, type ClickerModelHandle } from "./clicker-model"

export type ExportFn = () => string | null

const INITIAL_CAMERA_POSITION: [number, number, number] = [-3, 7, 5]
const INITIAL_CAMERA_FOV = 32

function ExportBridge({
  exportRef,
  onBeforeExport,
}: {
  exportRef: React.MutableRefObject<ExportFn | null>
  onBeforeExport: () => void
}) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    exportRef.current = () => {
      try {
        onBeforeExport()
        const prev = gl.getPixelRatio()
        gl.setPixelRatio(Math.min(window.devicePixelRatio * 2, 4))
        gl.render(scene, camera)
        const url = gl.domElement.toDataURL("image/png")
        gl.setPixelRatio(prev)
        gl.render(scene, camera)
        return url
      } catch (err) {
        console.error("Export failed", err)
        return null
      }
    }
    return () => {
      exportRef.current = null
    }
  }, [camera, exportRef, gl, onBeforeExport, scene])
  return null
}

function IdleSpin({ active }: { active: boolean }) {
  const t = useRef(0)
  const { camera } = useThree()
  useEffect(() => {
    if (!active) return
    let raf = 0
    let last = performance.now()
    t.current = Math.atan2(camera.position.x, camera.position.z)
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      t.current += dt * 0.35
      const r = Math.hypot(camera.position.x, camera.position.z)
      camera.position.x = Math.sin(t.current) * r
      camera.position.z = Math.cos(t.current) * r
      camera.lookAt(0, 0, 0)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, camera])
  return null
}

export function ClickerScene({
  design,
  onKeycapClick,
  highlightedIndex,
  exportRef,
  waveRequest,
  idle,
  onUserInteract,
}: {
  design: Design
  onKeycapClick?: (i: number) => void
  highlightedIndex?: number | null
  exportRef: React.MutableRefObject<ExportFn | null>
  waveRequest: WaveRequest
  idle: boolean
  onUserInteract: () => void
}) {
  const modelRef = useRef<ClickerModelHandle | null>(null)

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        preserveDrawingBuffer: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.78,
      }}
      onPointerDown={onUserInteract}
      onWheel={onUserInteract}
      camera={{ position: INITIAL_CAMERA_POSITION, fov: INITIAL_CAMERA_FOV }}
    >
      <color attach="background" args={["#fafafa"]} />
      <PerspectiveCamera
        makeDefault
        position={INITIAL_CAMERA_POSITION}
        fov={INITIAL_CAMERA_FOV}
      />

      <ambientLight intensity={0.2} />
      <directionalLight
        position={[4, 8, 6]}
        intensity={0.72}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 4, -3]} intensity={0.22} />

      <Suspense fallback={null}>
        <Environment preset="studio" background={false} />
        <ClickerModel
          ref={modelRef}
          design={design}
          onKeycapClick={onKeycapClick}
          highlightedIndex={highlightedIndex}
          waveRequest={waveRequest}
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
      <ExportBridge
        exportRef={exportRef}
        onBeforeExport={() => modelRef.current?.forceRest()}
      />
      <fog attach="fog" args={["#fafafa", 14, 30]} />
      <CameraFit keycapCount={design.keycaps.length} />
    </Canvas>
  )
}

// Widens vFOV on portrait/narrow viewports so the full model stays visible.
function CameraFit({ keycapCount }: { keycapCount: number }) {
  const { camera, size } = useThree()
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    const aspect = size.width / size.height
    // Model geometry constants (must match clicker-model.tsx)
    const KEYCAP_SPACING = 0.98
    const BASE_PAD = 0.22
    const LANYARD_RING_R = 0.18
    const n = keycapCount
    const baseWidth = n * KEYCAP_SPACING + BASE_PAD * 2
    const modelHalfWidth = baseWidth / 2 + LANYARD_RING_R * 0.75 + 0.28
    const [camX, camY, camZ] = INITIAL_CAMERA_POSITION
    const camDepth = Math.sqrt(camX * camX + camY * camY + camZ * camZ)
    const minVFov =
      (2 * Math.atan(modelHalfWidth / (camDepth * aspect)) * 180) / Math.PI
    // This scene intentionally adjusts the active PerspectiveCamera after mount.
    // eslint-disable-next-line react-hooks/immutability
    camera.fov = Math.max(INITIAL_CAMERA_FOV, Math.min(80, minVFov))
    camera.updateProjectionMatrix()
  }, [camera, size, keycapCount])
  return null
}
