import type { WaveRequest } from "./keycap-wave";

export const WORD_WAVE_DEBOUNCE_MS = 150;

type TimerApi = {
  setTimeout: (cb: () => void, ms: number) => number;
  clearTimeout: (id: number) => void;
};

export type DesignerWaveController = {
  restoreFromUrl: () => void;
  triggerVisibleEdit: (awaitGlyphs: boolean) => void;
  scheduleWordWave: () => void;
  dispose: () => void;
};

export function createDesignerWaveController({
  getPrefersReducedMotion,
  timer,
  onWave,
}: {
  getPrefersReducedMotion: () => boolean;
  timer: TimerApi;
  onWave: (request: WaveRequest) => void;
}): DesignerWaveController {
  let nextWaveId = 0;
  let pendingWordWaveId: number | null = null;

  const clearPendingWordWave = () => {
    if (pendingWordWaveId === null) return;
    timer.clearTimeout(pendingWordWaveId);
    pendingWordWaveId = null;
  };

  const emitWave = (awaitGlyphs: boolean) => {
    clearPendingWordWave();
    if (getPrefersReducedMotion()) return;
    nextWaveId += 1;
    onWave({ id: nextWaveId, awaitGlyphs });
  };

  return {
    restoreFromUrl() {
      clearPendingWordWave();
    },
    triggerVisibleEdit(awaitGlyphs: boolean) {
      emitWave(awaitGlyphs);
    },
    scheduleWordWave() {
      clearPendingWordWave();
      if (getPrefersReducedMotion()) return;
      pendingWordWaveId = timer.setTimeout(() => {
        pendingWordWaveId = null;
        emitWave(true);
      }, WORD_WAVE_DEBOUNCE_MS);
    },
    dispose() {
      clearPendingWordWave();
    },
  };
}
