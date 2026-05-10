export const KEYCAP_WAVE_PRESS_RATIO = 0.2

export type WaveRequest = {
  id: number
  awaitGlyphs: boolean
}

export const KEYCAP_WAVE_CONFIG = {
  pressMs: 140,
  releaseMs: 220,
  settleMs: 110,
  staggerMs: 70,
  overshootRatio: 0.12,
} as const

export function getKeycapWaveDurationMs(keycapCount: number): number {
  if (keycapCount <= 0) return 0
  return (
    (keycapCount - 1) * KEYCAP_WAVE_CONFIG.staggerMs +
    KEYCAP_WAVE_CONFIG.pressMs +
    KEYCAP_WAVE_CONFIG.releaseMs +
    KEYCAP_WAVE_CONFIG.settleMs
  )
}

export function sampleKeycapWavePress(elapsedMs: number, index: number): number {
  if (elapsedMs < 0) return 0

  const localMs = elapsedMs - index * KEYCAP_WAVE_CONFIG.staggerMs
  if (localMs <= 0) return 0

  const { pressMs, releaseMs, settleMs, overshootRatio } = KEYCAP_WAVE_CONFIG

  if (localMs < pressMs) {
    return easeOutCubic(localMs / pressMs)
  }

  if (localMs < pressMs + releaseMs) {
    const t = (localMs - pressMs) / releaseMs
    return lerp(1, -overshootRatio, easeInOutSine(t))
  }

  if (localMs < pressMs + releaseMs + settleMs) {
    const t = (localMs - pressMs - releaseMs) / settleMs
    return lerp(-overshootRatio, 0, easeOutCubic(t))
  }

  return 0
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2
}
