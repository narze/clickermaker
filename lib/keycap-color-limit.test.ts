import { describe, expect, test } from "bun:test";
import type { Keycap } from "./types";
import {
  MAX_KEYCAP_COLORS,
  keycapColorChangeAllowed,
  keycapColorsUsed,
  withinKeycapColorLimit,
} from "./types";

const cap = (keycapColor: string, letterColor: string): Keycap => ({
  char: "A",
  keycapColor,
  letterColor,
});

describe("keycapColorsUsed", () => {
  test("counts both surface and letter colors, case-insensitively", () => {
    const keycaps = [cap("#FFFFFF", "#2a2a2a"), cap("#ffffff", "#2A2A2A")];
    expect([...keycapColorsUsed(keycaps)].sort()).toEqual([
      "#2a2a2a",
      "#ffffff",
    ]);
  });

  test("does not include the base color (only keycaps are inspected)", () => {
    // Five distinct keycap colors regardless of any base tray color.
    const keycaps = [
      cap("#ffffff", "#ffe24a"),
      cap("#ffffff", "#2ec4e6"),
      cap("#ffffff", "#c5b3e8"),
      cap("#ffffff", "#111111"),
    ];
    expect(keycapColorsUsed(keycaps).size).toBe(5);
  });
});

describe("withinKeycapColorLimit", () => {
  test("white caps with four different letter colors is over the limit", () => {
    const keycaps = [
      cap("#ffffff", "#ffe24a"),
      cap("#ffffff", "#2ec4e6"),
      cap("#ffffff", "#c5b3e8"),
      cap("#ffffff", "#111111"),
    ];
    // white + 4 letters = 5 distinct > MAX_KEYCAP_COLORS
    expect(withinKeycapColorLimit(keycaps)).toBe(false);
  });

  test("exactly MAX_KEYCAP_COLORS distinct colors is allowed", () => {
    const keycaps = [
      cap("#ffffff", "#ffe24a"),
      cap("#ffffff", "#2ec4e6"),
      cap("#ffffff", "#c5b3e8"),
    ];
    expect(keycapColorsUsed(keycaps).size).toBe(MAX_KEYCAP_COLORS);
    expect(withinKeycapColorLimit(keycaps)).toBe(true);
  });
});

describe("keycapColorChangeAllowed", () => {
  const atLimit = [
    cap("#ffffff", "#ffe24a"),
    cap("#ffffff", "#2ec4e6"),
    cap("#ffffff", "#c5b3e8"),
  ];

  test("re-selecting a color already used is always allowed", () => {
    expect(
      keycapColorChangeAllowed(atLimit, 0, "letterColor", "#ffe24a"),
    ).toBe(true);
  });

  test("switching to a color already in the design is allowed", () => {
    expect(
      keycapColorChangeAllowed(atLimit, 0, "letterColor", "#2ec4e6"),
    ).toBe(true);
  });

  test("introducing a fifth color is rejected", () => {
    // The shared white surface stays in use on the other keycaps, so changing
    // one keycap's surface to a brand-new color genuinely adds a fifth color.
    expect(
      keycapColorChangeAllowed(atLimit, 0, "keycapColor", "#111111"),
    ).toBe(false);
  });

  test("freeing a unique color makes room for a new one", () => {
    // keycap 0's letter (#ffe24a) is the only user of that color, so swapping
    // it for a brand-new color keeps the distinct count at the limit.
    expect(
      keycapColorChangeAllowed(atLimit, 0, "letterColor", "#b5e8c9"),
    ).toBe(true);
  });

  test("out-of-range index is rejected", () => {
    expect(keycapColorChangeAllowed(atLimit, 9, "keycapColor", "#ffffff")).toBe(
      false,
    );
  });
});
