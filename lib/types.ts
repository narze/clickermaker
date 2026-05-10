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

export type Design = {
  keycaps: Keycap[];
  baseColor: string;
  font: FontId;
  defaultKeycapColor: string;
  defaultLetterColor: string;
};

export const MAX_KEYCAPS = 10;
export const MIN_KEYCAPS = 1;

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
