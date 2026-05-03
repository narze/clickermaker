export type FontId = "baloo2" | "fredoka" | "bungee" | "pressstart2p";

export const FONTS: { id: FontId; label: string; ttf: string; json: string; sizeScale: number }[] = [
  { id: "baloo2", label: "Baloo 2", ttf: "/fonts/baloo2.woff", json: "/fonts/baloo2.json", sizeScale: 1.0 },
  { id: "fredoka", label: "Fredoka", ttf: "/fonts/fredoka.woff", json: "/fonts/fredoka.json", sizeScale: 1.0 },
  { id: "bungee", label: "Bungee", ttf: "/fonts/bungee.woff", json: "/fonts/bungee.json", sizeScale: 1.0 },
  { id: "pressstart2p", label: "Press Start 2P", ttf: "/fonts/pressstart2p.woff", json: "/fonts/pressstart2p.json", sizeScale: 0.75 },
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
    { char: "N", keycapColor: "#ffffff", letterColor: "#e91e63" },
    { char: "A", keycapColor: "#ffffff", letterColor: "#e91e63" },
    { char: "M", keycapColor: "#ffffff", letterColor: "#e91e63" },
    { char: "E", keycapColor: "#ffffff", letterColor: "#e91e63" },
  ],
  baseColor: "#f8a8c4",
  font: "baloo2",
  defaultKeycapColor: "#ffffff",
  defaultLetterColor: "#e91e63",
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
