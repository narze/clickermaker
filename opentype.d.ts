declare module "opentype.js" {
  export type PathCommand =
    | { type: "M"; x: number; y: number }
    | { type: "L"; x: number; y: number }
    | { type: "Q"; x1: number; y1: number; x: number; y: number }
    | { type: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
    | { type: "Z" };

  export interface Path {
    commands: PathCommand[];
  }

  export interface Glyph {
    getPath(x: number, y: number, fontSize: number): Path;
  }

  export interface Font {
    charToGlyph(char: string): Glyph;
  }

  export function load(url: string): Promise<Font>;
  export function parse(buffer: ArrayBuffer): Font;
}
