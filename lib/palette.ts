export const BASE_PALETTE: { name: string; hex: string }[] = [
  { name: "Bubble Pink", hex: "#f8a8c4" },
  { name: "Sky Blue", hex: "#a8d5e8" },
  { name: "Mint", hex: "#b8e6c1" },
  { name: "Peach", hex: "#f5c19c" },
  { name: "Lilac", hex: "#d8b8e8" },
  { name: "Butter", hex: "#f8e8a8" },
  { name: "Cloud", hex: "#f5f5f5" },
  { name: "Charcoal", hex: "#2a2a2a" },
];

export const KEYCAP_PALETTE: { name: string; hex: string }[] = [
  { name: "White", hex: "#ffffff" },
  { name: "Bubble", hex: "#f8a8c4" },
  { name: "Sky", hex: "#a8d5e8" },
  { name: "Mint", hex: "#b8e6c1" },
  { name: "Peach", hex: "#f5c19c" },
  { name: "Lilac", hex: "#d8b8e8" },
  { name: "Butter", hex: "#f8e8a8" },
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
