import { describe, expect, test } from "bun:test";
import {
  GLYPH_WAVE_FALLBACK_MS,
  createKeycapWaveRuntime,
} from "./keycap-wave-runtime";

describe("createKeycapWaveRuntime", () => {
  test("restarts from the left when a newer wave request arrives mid-animation", () => {
    const runtime = createKeycapWaveRuntime();

    runtime.requestWave({ id: 1, awaitGlyphs: false }, 0);
    expect(runtime.sample(160, 3).presses[1]).toBeGreaterThan(0);

    runtime.requestWave({ id: 2, awaitGlyphs: false }, 160);
    const restarted = runtime.sample(161, 3);

    expect(restarted.atRest).toBe(false);
    expect(restarted.presses[0]).toBeGreaterThan(0);
    expect(restarted.presses[1]).toBe(0);
  });

  test("waits for glyph readiness before starting a glyph-aware wave", () => {
    const runtime = createKeycapWaveRuntime();

    runtime.syncExpectedGlyphKeys(["0:/fonts/baloo2.woff:1:A"]);
    runtime.requestWave({ id: 1, awaitGlyphs: true }, 0);

    expect(runtime.sample(100, 1)).toEqual({ atRest: true, presses: [0] });

    runtime.markGlyphReady("0:/fonts/baloo2.woff:1:A", 100);
    const started = runtime.sample(101, 1);

    expect(started.atRest).toBe(false);
    expect(started.presses[0]).toBeGreaterThan(0);
  });

  test("falls back to keycap motion when glyph rebuilds take too long", () => {
    const runtime = createKeycapWaveRuntime();

    runtime.syncExpectedGlyphKeys(["0:/fonts/baloo2.woff:1:A"]);
    runtime.requestWave({ id: 1, awaitGlyphs: true }, 0);

    expect(runtime.sample(GLYPH_WAVE_FALLBACK_MS - 1, 1)).toEqual({
      atRest: true,
      presses: [0],
    });

    runtime.sample(GLYPH_WAVE_FALLBACK_MS + 1, 1);
    const fallback = runtime.sample(GLYPH_WAVE_FALLBACK_MS + 2, 1);

    expect(fallback.atRest).toBe(false);
    expect(fallback.presses[0]).toBeGreaterThan(0);
  });

  test("forceRest cancels export-time motion and returns rest samples", () => {
    const runtime = createKeycapWaveRuntime();

    runtime.requestWave({ id: 1, awaitGlyphs: false }, 0);
    expect(runtime.sample(1, 2).atRest).toBe(false);

    runtime.forceRest();

    expect(runtime.sample(1, 2)).toEqual({ atRest: true, presses: [0, 0] });
  });
});
