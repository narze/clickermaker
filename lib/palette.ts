import { th } from "@/lib/i18n/th";

/** Swatches matched to physical PLA keycap filaments (pastel pink, yellow, cyan, white, mint, lavender). */
export const BASE_PALETTE: { name: string; hex: string }[] = [
  { name: th.palette.pastelPink, hex: "#f2b5c8" },
  { name: th.palette.yellow, hex: "#ffe24a" },
  { name: th.palette.cyan, hex: "#2ec4e6" },
  { name: th.palette.white, hex: "#ffffff" },
  { name: th.palette.mint, hex: "#b5e8c9" },
  { name: th.palette.lavender, hex: "#c5b3e8" },
  { name: th.palette.charcoal, hex: "#2a2a2a" },
];

export const KEYCAP_PALETTE: { name: string; hex: string }[] = [
  { name: th.palette.pastelPink, hex: "#f2b5c8" },
  { name: th.palette.yellow, hex: "#ffe24a" },
  { name: th.palette.cyan, hex: "#2ec4e6" },
  { name: th.palette.white, hex: "#ffffff" },
  { name: th.palette.mint, hex: "#b5e8c9" },
  { name: th.palette.lavender, hex: "#c5b3e8" },
  { name: th.palette.charcoal, hex: "#2a2a2a" },
];

export const LETTER_PALETTE = KEYCAP_PALETTE;

export function getPaletteColorName(
  swatches: { name: string; hex: string }[],
  hex: string,
): string {
  const match = swatches.find((swatch) => swatch.hex.toLowerCase() === hex.toLowerCase());
  return match?.name ?? hex.toUpperCase();
}

export function isValidHex(s: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(s);
}

export function normalizeHex(s: string): string {
  let v = s.trim();
  if (!v.startsWith("#")) v = "#" + v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    v = "#" + v.slice(1).split("").map(c => c + c).join("");
  }
  return v.toLowerCase();
}
