import { describe, expect, test } from "bun:test";
import type { WaveRequest } from "./keycap-wave";
import {
  WORD_WAVE_DEBOUNCE_MS,
  createDesignerWaveController,
} from "./designer-wave";

class FakeTimer {
  now = 0;
  nextId = 1;
  timeouts = new Map<number, { at: number; cb: () => void }>();

  setTimeout = (cb: () => void, ms: number) => {
    const id = this.nextId++;
    this.timeouts.set(id, { at: this.now + ms, cb });
    return id;
  };

  clearTimeout = (id: number) => {
    this.timeouts.delete(id);
  };

  advance(ms: number) {
    const target = this.now + ms;

    while (true) {
      const next = Array.from(this.timeouts.entries())
        .sort((a, b) => a[1].at - b[1].at)
        .find(([, timeout]) => timeout.at <= target);
      if (!next) break;

      const [id, timeout] = next;
      this.timeouts.delete(id);
      this.now = timeout.at;
      timeout.cb();
    }

    this.now = target;
  }
}

function makeController(prefersReducedMotion = false) {
  const timer = new FakeTimer();
  const requests: WaveRequest[] = [];
  const controller = createDesignerWaveController({
    getPrefersReducedMotion: () => prefersReducedMotion,
    timer,
    onWave: (request) => {
      requests.push(request);
    },
  });

  return { controller, requests, timer };
}

describe("createDesignerWaveController", () => {
  test("skips edit-triggered waves for reduced-motion users", () => {
    const { controller, requests, timer } = makeController(true);

    controller.triggerVisibleEdit(false);
    controller.scheduleWordWave();
    timer.advance(WORD_WAVE_DEBOUNCE_MS);

    expect(requests).toEqual([]);
  });

  test("keeps initial URL-restored designs silent", () => {
    const { controller, requests } = makeController();

    controller.restoreFromUrl();

    expect(requests).toEqual([]);
  });

  test("debounces word edits into a single glyph-aware wave", () => {
    const { controller, requests, timer } = makeController();

    controller.scheduleWordWave();
    timer.advance(100);
    controller.scheduleWordWave();
    timer.advance(WORD_WAVE_DEBOUNCE_MS - 1);

    expect(requests).toEqual([]);

    timer.advance(1);

    expect(requests).toEqual([{ id: 1, awaitGlyphs: true }]);
  });

  test("cancels pending word waves and restarts immediately for the newest edit", () => {
    const { controller, requests, timer } = makeController();

    controller.scheduleWordWave();
    controller.triggerVisibleEdit(false);
    timer.advance(WORD_WAVE_DEBOUNCE_MS);
    controller.triggerVisibleEdit(true);

    expect(requests).toEqual([
      { id: 1, awaitGlyphs: false },
      { id: 2, awaitGlyphs: true },
    ]);
  });
});
