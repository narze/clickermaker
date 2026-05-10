import {
  getKeycapWaveDurationMs,
  sampleKeycapWavePress,
  type WaveRequest,
} from "./keycap-wave";

export const GLYPH_WAVE_FALLBACK_MS = 250;

export type KeycapWaveSnapshot = {
  atRest: boolean;
  presses: number[];
};

export type KeycapWaveRuntime = {
  syncExpectedGlyphKeys: (glyphKeys: string[]) => void;
  markGlyphReady: (glyphKey: string, nowMs: number) => void;
  requestWave: (waveRequest: WaveRequest, nowMs: number) => void;
  forceRest: () => void;
  sample: (nowMs: number, keycapCount: number) => KeycapWaveSnapshot;
};

export function createKeycapWaveRuntime({
  glyphFallbackMs = GLYPH_WAVE_FALLBACK_MS,
}: {
  glyphFallbackMs?: number;
} = {}): KeycapWaveRuntime {
  let expectedGlyphKeys: string[] = [];
  let readyGlyphKeys = new Set<string>();
  let waveStartMs: number | null = null;
  let pendingWave: WaveRequest | null = null;
  let pendingWaveDeadlineMs: number | null = null;

  const allExpectedGlyphsReady = () =>
    expectedGlyphKeys.every((glyphKey) => readyGlyphKeys.has(glyphKey));

  const startWave = (nowMs: number) => {
    pendingWave = null;
    pendingWaveDeadlineMs = null;
    waveStartMs = nowMs;
    readyGlyphKeys = new Set(expectedGlyphKeys);
  };

  return {
    syncExpectedGlyphKeys(glyphKeys) {
      expectedGlyphKeys = glyphKeys;
      readyGlyphKeys = new Set(
        Array.from(readyGlyphKeys).filter((glyphKey) => glyphKeys.includes(glyphKey)),
      );
    },
    markGlyphReady(glyphKey, nowMs) {
      readyGlyphKeys.add(glyphKey);
      if (pendingWave?.awaitGlyphs && allExpectedGlyphsReady()) {
        startWave(nowMs);
      }
    },
    requestWave(waveRequest, nowMs) {
      if (waveRequest.id <= 0) return;

      waveStartMs = null;

      if (!waveRequest.awaitGlyphs || expectedGlyphKeys.length === 0 || allExpectedGlyphsReady()) {
        startWave(nowMs);
        return;
      }

      pendingWave = waveRequest;
      pendingWaveDeadlineMs = nowMs + glyphFallbackMs;
    },
    forceRest() {
      waveStartMs = null;
      pendingWave = null;
      pendingWaveDeadlineMs = null;
    },
    sample(nowMs, keycapCount) {
      if (pendingWave && pendingWaveDeadlineMs !== null && nowMs >= pendingWaveDeadlineMs) {
        startWave(nowMs);
      }

      const restSnapshot = {
        atRest: true,
        presses: Array.from({ length: keycapCount }, () => 0),
      };

      if (waveStartMs === null) {
        return restSnapshot;
      }

      const elapsedMs = nowMs - waveStartMs;
      if (elapsedMs >= getKeycapWaveDurationMs(keycapCount)) {
        waveStartMs = null;
        return restSnapshot;
      }

      return {
        atRest: false,
        presses: Array.from({ length: keycapCount }, (_, index) =>
          sampleKeycapWavePress(elapsedMs, index),
        ),
      };
    },
  };
}
