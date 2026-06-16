export type FontId = "baloo2" | "fredoka" | "bungee" | "pressstart2p";

export const FONTS: { id: FontId; label: string; ttf: string; sizeScale: number }[] = [
  { id: "baloo2", label: "Baloo 2", ttf: "/fonts/baloo2.woff", sizeScale: 1.0 },
  { id: "fredoka", label: "Fredoka", ttf: "/fonts/fredoka.woff", sizeScale: 1.0 },
  { id: "bungee", label: "Bungee", ttf: "/fonts/bungee.woff", sizeScale: 1.0 },
  { id: "pressstart2p", label: "Press Start 2P", ttf: "/fonts/pressstart2p.woff", sizeScale: 0.75 },
];

export type Keycap = {
  char: string;
  keycapColor: string;
  letterColor: string;
};

/** Key slots run along X (left→right) or along Z (top→bottom on the tray). */
export type KeyLayout = "horizontal" | "vertical";

export type Design = {
  keycaps: Keycap[];
  baseColor: string;
  font: FontId;
  defaultKeycapColor: string;
  defaultLetterColor: string;
  keyLayout: KeyLayout;
};

export const MAX_KEYCAPS = 10;
export const MIN_KEYCAPS = 1;

/** Max distinct colors allowed on the keycaps (surface + letter). Base color excluded. */
export const MAX_KEYCAP_COLORS = 4;

/**
 * Distinct colors used across all keycaps — both surface and letter colors,
 * compared case-insensitively. The base/tray color is intentionally excluded.
 */
export function keycapColorsUsed(keycaps: Keycap[]): Set<string> {
  const set = new Set<string>();
  for (const k of keycaps) {
    set.add(k.keycapColor.toLowerCase());
    set.add(k.letterColor.toLowerCase());
  }
  return set;
}

/** True when the keycaps use no more than `MAX_KEYCAP_COLORS` distinct colors. */
export function withinKeycapColorLimit(keycaps: Keycap[]): boolean {
  return keycapColorsUsed(keycaps).size <= MAX_KEYCAP_COLORS;
}

/**
 * Whether setting keycap `index`'s `field` to `candidate` keeps the design
 * within the keycap color limit. Used to enable/disable swatches in the picker.
 */
export function keycapColorChangeAllowed(
  keycaps: Keycap[],
  index: number,
  field: "keycapColor" | "letterColor",
  candidate: string,
): boolean {
  if (index < 0 || index >= keycaps.length) return false;
  const next = keycaps.map((k, i) =>
    i === index ? { ...k, [field]: candidate } : k,
  );
  return withinKeycapColorLimit(next);
}

export const DEFAULTS: Design = {
  keycaps: [
    { char: "N", keycapColor: "#ffffff", letterColor: "#2a2a2a" },
    { char: "A", keycapColor: "#ffffff", letterColor: "#2a2a2a" },
    { char: "M", keycapColor: "#ffffff", letterColor: "#2a2a2a" },
    { char: "E", keycapColor: "#ffffff", letterColor: "#2a2a2a" },
  ],
  baseColor: "#f2b5c8",
  font: "baloo2",
  defaultKeycapColor: "#ffffff",
  defaultLetterColor: "#2a2a2a",
  keyLayout: "horizontal",
};

export function sanitizeChar(s: string): string {
  const up = s.toUpperCase();
  const m = up.match(/[A-Z0-9!?+\-*/.]/);
  return m ? m[0] : "";
}

export function sanitizeWord(s: string, max = MAX_KEYCAPS): string {
  return s
    .toUpperCase()
    .replace(/[^A-Z0-9!?+\-*/. ]/g, "")
    .slice(0, max);
}
