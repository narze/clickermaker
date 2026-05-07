/** Swatches matched to physical PLA keycap filaments (pastel pink, yellow, cyan, white, mint, lavender). */
export const BASE_PALETTE: { name: string; hex: string }[] = [
  { name: "Pastel Pink", hex: "#f2b5c8" },
  { name: "Yellow", hex: "#ffe24a" },
  { name: "Cyan", hex: "#2ec4e6" },
  { name: "White", hex: "#ffffff" },
  { name: "Mint", hex: "#b5e8c9" },
  { name: "Lavender", hex: "#c5b3e8" },
  { name: "Charcoal", hex: "#2a2a2a" },
];

export const KEYCAP_PALETTE: { name: string; hex: string }[] = [
  { name: "Pastel Pink", hex: "#f2b5c8" },
  { name: "Yellow", hex: "#ffe24a" },
  { name: "Cyan", hex: "#2ec4e6" },
  { name: "White", hex: "#ffffff" },
  { name: "Mint", hex: "#b5e8c9" },
  { name: "Lavender", hex: "#c5b3e8" },
  { name: "Charcoal", hex: "#2a2a2a" },
];

export const LETTER_PALETTE: { name: string; hex: string }[] = [
  { name: "Hot Pink", hex: "#e91e63" },
  { name: "Cobalt", hex: "#1e6cd8" },
  { name: "Forest", hex: "#2a7d4f" },
  { name: "Tangerine", hex: "#e8772a" },
  { name: "Plum", hex: "#7d3aa8" },
  { name: "Sun", hex: "#e8b62a" },
  { name: "White", hex: "#ffffff" },
  { name: "Charcoal", hex: "#2a2a2a" },
];

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
