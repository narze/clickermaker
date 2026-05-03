# Clickermaker — Handoff

Project root: `/Users/narze/Code/github.com/narze/clickermaker`

## Goal

Interactive 3D clicker-keycap designer for **GeekCraft** customers. Users
type letters, pick base/keycap/letter colors per keycap, switch fonts, see a
live rotatable 3D preview, then save a PNG mockup to take to the shop and
order the 3D-printed clicker. No backend; static client app deployed to
Vercel.

## Current State (as of 2026-05-03)

**All features working and verified in browser.**

### Git log
```
<latest> Extrude letters via opentype.js + ShapePath for smooth curves
a09b4d9 XDA profile: tapered keycap with wider base than top
4e1d30d Restyle keycap to XDA profile (radius bump — superseded by above)
82b0c89 Increase letter size to ~70% of keycap face
4293d11 Initial commit: GeekCraft Clicker Maker
```

### What's implemented

- Next.js 16 App Router + Bun + Tailwind v4 scaffold.
- 3D scene: pink rounded base + lanyard tab + inset frame + N XDA-profile
  keycaps. `react-three-fiber` + `@react-three/drei`, `<Environment
  preset="studio">`, `<ContactShadows>`, ACES tone mapping.
- **XDA keycap profile**: custom `ExtrudeGeometry`-based tapered mesh.
  Top face ≈ 75% of base width (`XDA_TOP_SCALE=0.75`), linearly tapered
  via vertex-wise scaling after extrusion. Constants in
  `components/clicker-model.tsx`: `XDA_TOP_SCALE`, `XDA_CORNER_R`.
- **Embossed letters**: `ExtrudeGeometry` built at runtime from WOFF via
  `opentype.js` (`LETTER_DEPTH=0.097` ≈ 2mm real-world). `opentype.parse`
  reads the WOFF `ArrayBuffer`, `glyph.getPath` produces outline commands,
  which are replayed into a Three.js `ShapePath`, then `toShapes(false)` →
  `ExtrudeGeometry` with `curveSegments: 32` and a small bevel for smooth
  curves. This replaces the reverted `TextGeometry` approach that produced
  jagged edges.
- **Font sizes**: `BASE_FONT_SIZE=0.65` (≈70% of KEYCAP_W=0.92). Per-font
  `sizeScale` in `FONTS` array (`lib/types.ts`); Press Start 2P uses 0.75×.
- 4 fonts wired: Baloo 2, Fredoka, Bungee, Press Start 2P. Only `.woff`
  files in `public/fonts/` (no typeface JSON needed).
- Per-keycap state: `{ char, keycapColor, letterColor }`. Word input, length
  stepper, per-keycap color rows, defaults section.
- URL state sync: base64-encoded JSON in `?d=...`.
- PNG export: `gl.domElement.toDataURL('image/png')` with DPR boosted to 2×.
- Click-to-edit raycast: clicking a keycap highlights its controls row.
- OrbitControls (drag/zoom, no pan), polar limits.
- `CameraFit` component widens vFOV on narrow/portrait viewports so all
  keycaps stay visible.
- OG image at `public/og.png` (1200×630). `metadataBase` set from
  `VERCEL_URL` env var.
- `bun run build` passes clean, `bunx tsc --noEmit` clean.

## Key Files

```
app/layout.tsx, app/page.tsx, app/globals.css     — root + designer shell
components/designer.tsx                            — top-level state wrapper
components/clicker-scene.tsx                       — Canvas, lights, env, OrbitControls,
                                                     ExportBridge, IdleSpin, CameraFit
components/clicker-model.tsx                       — base, lanyard, frame, keycaps (XDA),
                                                     embossed letters (ExtrudeGeometry via opentype.js)
components/controls-panel.tsx                      — word input, length, font, defaults, per-keycap
components/keycap-row.tsx                          — single per-keycap editor row
components/color-picker.tsx                        — popover swatch grid + hex input
lib/types.ts                                       — Design/Keycap types, FONTS (with sizeScale+ttf),
                                                     sanitizers, DEFAULTS
lib/use-design.ts                                  — useReducer hook + URL sync
lib/url-state.ts                                   — base64url encode/decode
lib/palette.ts                                     — pastel preset colors
public/fonts/*.woff                                — 4 WOFF fonts (parsed by opentype.js at runtime)
public/og.png                                      — OG image (1200×630)
```

## Architecture Notes

### XDA Keycap Geometry (`createXdaGeometry`)
- Creates a `THREE.Shape` (rounded rect) for the **top** face at `topW = KEYCAP_W × XDA_TOP_SCALE`.
- `ExtrudeGeometry` extrudes it to full height.
- `rotateX(+π/2)` + `translate(0, halfH, 0)` orients it with top at +halfH, bottom at -halfH.
- Vertex loop scales X/Z linearly: `s = 1 + (1/topScale - 1) × t` where t=0 at top, 1 at bottom.
- `computeVertexNormals()` re-derives normals after vertex modification.
- Geometry is shared across all keycap instances via `useMemo` in `ClickerModel`.

### Embossed Letters (`ExtrudedLetter`)
- `fetch(url)` → `opentype.parse(buffer)` parses the WOFF in the browser.
- `glyph.getPath(0, 0, size)` returns outline commands (M/L/Q/C/Z).
- Commands are replayed into `THREE.ShapePath` (Y flipped), then `toShapes(false)`.
- `ExtrudeGeometry(shapes, { depth: LETTER_DEPTH, curveSegments: 32, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 4 })`.
- `computeBoundingBox()` → `translate(-cx, -cy, 0)` centers synchronously.
- `rotation={[-Math.PI/2, 0, 0]}` — local Z maps to world +Y, so extrusion rises above keycap surface.
- Positioned at `[x, keycapTopY, 0]`: back face at surface, front face at surface + LETTER_DEPTH.

### CameraFit
- `useThree()` — watches `size` and `keycapCount`.
- Computes minimum vFOV to fit model half-width at camera depth, clamps 32°–80°.
- Prevents keycaps clipping on narrow (portrait) mobile viewports.

## What Didn't Work (Don't Repeat)

- **`TextGeometry` with typeface JSON**: reverted. Typeface JSONs produced
  low-resolution curves (visible faceting on rounded letters like S, O, C).
  Use `opentype.js` + `ShapePath` + `ExtrudeGeometry` with `curveSegments: 32`
  and a small bevel for smooth embossed edges.
- **`opentype.load(url)`**: deprecated in opentype.js v1.3.5. Use
  `fetch(url)` → `opentype.parse(buffer)` instead.
- **Ref-callback centering for TextGeometry**: fires before geometry is ready.
  Use `useMemo` + `computeBoundingBox()` synchronously.
- **Idle camera spin at startup**: leaves model diagonal in PNG exports.
  `idle` default is `false` in `designer.tsx`.
- **Fetching fonts via curl**: blocked by sandbox. Copy from
  `node_modules/@fontsource/*` instead.

## Remaining Polish / Follow-ups

1. **Vercel deployment**: project not yet linked. Run `vercel link` then
   `vercel --prod`. Add `NEXT_PUBLIC_SHOP_URL` env var in Vercel dashboard.
2. **OG image**: shows "NAME" design. Re-capture after real shop URL is set,
   or use `next/og` dynamic generation.
3. **Mobile touch orbit**: not tested on real device. OrbitControls supports
   touch by default but verify pinch-zoom feels natural.
4. **Letter quality on complex fonts**: Baloo 2 with curved paths is now
   smooth thanks to `opentype.js` + `curveSegments: 32` + small bevel.
   Press Start 2P (pixel font) has sharp corners by design; the bevel
   slightly softens them.
5. **XDA taper on narrow fonts**: letters emboss from the top face (smaller
   area). Verify wide characters (M, W) don't clip the rounded corners.

## Dev Server

```bash
bun dev   # starts on :3000 (or :3001 if :3000 is taken)
```
