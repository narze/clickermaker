/**
 * Converts WOFF fonts to Three.js typeface JSON format.
 * Run once when fonts change: bun scripts/gen-typeface.mjs
 */
import opentype from "opentype.js";
import fs from "fs";

const FONTS = [
  { src: "public/fonts/baloo2.woff", out: "public/fonts/baloo2.json" },
  { src: "public/fonts/fredoka.woff", out: "public/fonts/fredoka.json" },
  { src: "public/fonts/bungee.woff", out: "public/fonts/bungee.json" },
  { src: "public/fonts/pressstart2p.woff", out: "public/fonts/pressstart2p.json" },
];

// Characters needed for keycap labels
const CHARS =
  " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

function glyphToOutline(glyph, scale) {
  const cmds = glyph.path.commands;
  let o = "";
  for (const c of cmds) {
    switch (c.type) {
      case "M":
        o += `m ${Math.round(c.x * scale)} ${Math.round(c.y * scale)} `;
        break;
      case "L":
        o += `l ${Math.round(c.x * scale)} ${Math.round(c.y * scale)} `;
        break;
      case "Q":
        o += `q ${Math.round(c.x1 * scale)} ${Math.round(c.y1 * scale)} ${Math.round(c.x * scale)} ${Math.round(c.y * scale)} `;
        break;
      case "C":
        // Three.js uses 'b' for cubic bezier
        o += `b ${Math.round(c.x1 * scale)} ${Math.round(c.y1 * scale)} ${Math.round(c.x2 * scale)} ${Math.round(c.y2 * scale)} ${Math.round(c.x * scale)} ${Math.round(c.y * scale)} `;
        break;
      case "Z":
        o += "z ";
        break;
    }
  }
  return o.trim();
}

for (const { src, out } of FONTS) {
  const buf = fs.readFileSync(src);
  const font = opentype.parse(buf.buffer);
  const scale = 1000 / font.unitsPerEm;

  const glyphs = {};
  for (const char of CHARS) {
    const glyph = font.charToGlyph(char);
    if (!glyph) continue;
    const ha = Math.round((glyph.advanceWidth ?? 0) * scale);
    const o = glyphToOutline(glyph, scale);
    // Bounding box from raw glyph metrics
    const xMin = Math.round((glyph.xMin ?? 0) * scale);
    const xMax = Math.round((glyph.xMax ?? 0) * scale);
    glyphs[char] = { x_min: xMin, x_max: xMax, ha, o };
  }

  const typeface = {
    glyphs,
    familyName:
      font.names.fullName?.en ??
      font.names.fontFamily?.en ??
      "Unknown",
    ascender: Math.round(font.ascender * scale),
    descender: Math.round(font.descender * scale),
    underlineThickness: Math.round((font.tables.post?.underlineThickness ?? 50) * scale / font.unitsPerEm * 1000),
    underlinePosition: Math.round((font.tables.post?.underlinePosition ?? -100) * scale / font.unitsPerEm * 1000),
    boundingBox: {
      yMin: Math.round(font.descender * scale),
      xMin: 0,
      yMax: Math.round(font.ascender * scale),
      xMax: 1000,
    },
    resolution: 1000,
    original_font_information: {},
  };

  fs.writeFileSync(out, JSON.stringify(typeface));
  console.log(`✓ ${out}  (${Object.keys(glyphs).length} glyphs)`);
}
