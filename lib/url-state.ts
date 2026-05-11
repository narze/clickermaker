import {
  type Design,
  type KeyLayout,
  DEFAULTS,
  FONTS,
  MAX_KEYCAPS,
  sanitizeChar,
  type FontId,
} from "./types";
import { isValidHex, normalizeHex } from "./palette";

function b64urlEncode(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return atob(padded);
}

export function encodeDesign(d: Design): string {
  const compact: {
    k: [string, string, string][];
    b: string;
    f: string;
    dk: string;
    dl: string;
    kl?: 1;
  } = {
    k: d.keycaps.map((k) => [k.char, k.keycapColor, k.letterColor]),
    b: d.baseColor,
    f: d.font,
    dk: d.defaultKeycapColor,
    dl: d.defaultLetterColor,
  };
  if (d.keyLayout === "vertical") compact.kl = 1;
  return b64urlEncode(JSON.stringify(compact));
}

export function decodeDesign(s: string): Design | null {
  try {
    const obj = JSON.parse(b64urlDecode(s)) as {
      k?: [string, string, string][];
      b?: string;
      f?: string;
      dk?: string;
      dl?: string;
      kl?: number;
    };
    if (!obj || !Array.isArray(obj.k)) return null;
    const keycaps = obj.k
      .slice(0, MAX_KEYCAPS)
      .map(([c, kc, lc]) => ({
        char: sanitizeChar(c ?? ""),
        keycapColor: isValidHex(kc) ? normalizeHex(kc) : DEFAULTS.defaultKeycapColor,
        letterColor: isValidHex(lc) ? normalizeHex(lc) : DEFAULTS.defaultLetterColor,
      }))
      .filter((_, i) => i < MAX_KEYCAPS);
    if (keycaps.length === 0) return null;

    const fontIds = FONTS.map((f) => f.id);
    const font = (fontIds as string[]).includes(obj.f ?? "")
      ? (obj.f as FontId)
      : DEFAULTS.font;

    const keyLayout: KeyLayout = obj.kl === 1 ? "vertical" : "horizontal";

    return {
      keycaps,
      baseColor: isValidHex(obj.b ?? "") ? normalizeHex(obj.b!) : DEFAULTS.baseColor,
      font,
      defaultKeycapColor: isValidHex(obj.dk ?? "")
        ? normalizeHex(obj.dk!)
        : DEFAULTS.defaultKeycapColor,
      defaultLetterColor: isValidHex(obj.dl ?? "")
        ? normalizeHex(obj.dl!)
        : DEFAULTS.defaultLetterColor,
      keyLayout,
    };
  } catch {
    return null;
  }
}
