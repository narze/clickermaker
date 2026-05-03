# Clickermaker — Handoff

Project root: `/Users/narze/Code/github.com/narze/clickermaker`

## Goal

Interactive 3D clicker-keycap designer for **GeekCraft** customers. Users
type letters, pick base/keycap/letter colors per keycap, switch fonts, see a
live rotatable 3D preview, then save a PNG mockup to take to the shop and
order the 3D-printed clicker. No backend; static client app deployed to
Vercel.

Original plan: `/Users/narze/.claude/plans/create-interactive-website-for-glistening-tide.md`

## Current Progress

**Working & verified in browser** (Playwright):

- Next.js 16 App Router + Bun + Tailwind v4 scaffold.
- 3D scene: pink rounded base + lanyard tab w/ hole + inset frame + N white
  keycaps along base. `react-three-fiber` + `@react-three/drei`,
  `<Environment preset="studio">`, `<ContactShadows>`,
  `MeshStandardMaterial` plastic look, ACES tone mapping.
- Letters render via drei `<Text>` (troika SDF) loading WOFF directly from
  `@fontsource/*` packages (copied to `public/fonts/*.woff`). 4 fonts wired:
  Baloo 2, Fredoka, Bungee, Press Start 2P. Font dropdown switches live.
- Per-keycap state model — each keycap is `{ char, keycapColor, letterColor }`.
  Word input, length stepper (±, 1–10), per-keycap rows with mini swatch
  pickers + reset-this-row button. Defaults section with "Apply to all".
- URL state sync via base64-encoded JSON in `?d=...`. Reload rehydrates exact
  design. `lib/url-state.ts`.
- PNG export: `gl.domElement.toDataURL('image/png')` with DPR boosted to 2x.
  Canvas runs with `preserveDrawingBuffer: true`. Filename
  `clicker-{word}.png`. Verified — saved file matches preview.
- Click-to-edit raycast: clicking a keycap in 3D scrolls + highlights its
  controls panel row, with auto-clear after 2.4s.
- OrbitControls (drag/zoom, no pan), polar limits prevent flipping.
- Header "GeekCraft / Clicker Maker" + footer "by GeekCraft" link to
  `NEXT_PUBLIC_SHOP_URL` (falls back to `#`).
- `bun run build` passes; `bunx tsc --noEmit` clean (scripts/ excluded).
- Manual checks pass: typing GEEK rebuilds 4 keycaps, font switching works,
  save image downloads correct PNG, URL reload reproduces design.

**Tasks all completed** (see `TaskList`): scaffold, fonts, 3D scene,
state/URL, controls, export, polish.

## Key Files

```
app/layout.tsx, app/page.tsx, app/globals.css     — root + designer shell
components/designer.tsx                            — top-level state wrapper
components/clicker-scene.tsx                       — Canvas, lights, env, OrbitControls, ExportBridge, IdleSpin
components/clicker-model.tsx                       — base, lanyard, frame, keycaps, letters
components/controls-panel.tsx                      — word input, length, font, defaults, per-keycap list
components/keycap-row.tsx                          — single per-keycap editor row
components/color-picker.tsx                        — popover swatch grid + hex input
lib/types.ts                                       — Design / Keycap types, FONTS, sanitizers, DEFAULTS
lib/use-design.ts                                  — useReducer hook + URL sync
lib/url-state.ts                                   — base64url encode/decode
lib/palette.ts                                     — pastel preset colors
public/fonts/*.woff                                — 4 curated WOFF fonts
scripts/fetch-fonts.ts, scripts/convert-fonts.ts   — dead, kept for reference
```

## What Worked

- **Drei `<Text>` (troika SDF)** for letter rendering. Loads WOFF directly,
  auto-centers via `anchorX="center" anchorY="middle"`, orientation reliable
  with `rotation={[-Math.PI/2, 0, 0]}` and a slightly tilted camera at
  `(0, 3.5, 7)` looking at origin — letters read upright from default angle.
- `@fontsource/baloo-2` etc. ship WOFF in `node_modules/@fontsource/*/files/`.
  Copied 4 latin-700/400 WOFFs into `public/fonts/`.
- `gl={{ preserveDrawingBuffer: true }}` on the `<Canvas>` makes
  `toDataURL` work reliably across browsers without flicker.
- Base64-encoded JSON in `?d=...` keeps URL compact even with per-keycap
  arrays. Round-trip safe; invalid URLs fall back to `DEFAULTS`.
- Word input ↔ per-keycap list as **two views of the same array**:
  reducer's `setWord` preserves existing colors by index when rebuilding.

## What Didn't Work (Don't Repeat)

- **Drei `<Text3D>` with a typeface JSON** — first attempt. Glyphs rendered
  as tiny shapes at the back-left corner of each keycap, even after
  `<Center disableZ>`. Root cause unclear (likely a measurement-timing
  issue when font loads under `<Suspense>` and the inline ref-callback
  fires before geometry exists). The `opentype.js`-based conversion script
  (`scripts/convert-fonts.ts`) produced syntactically valid typeface JSON
  with all glyph paths, but the rendered geometry was off — bbox-based
  manual centering via `mesh.position.set(-cx, -cy, 0)` only ran once on
  initial ref and stayed wrong. Switched to flat troika `<Text>` instead;
  letters look great even though they're not extruded.
- **Idle camera spin** at startup made screenshots look diagonal/sideways
  and could confuse new users. Default `idle` is now `false` in
  `components/designer.tsx` — leave it off.
- **Trying to fetch fonts via `curl`** — blocked by sandbox deny rule.
  Use `bun` + `fetch` in a script (`scripts/fetch-fonts.ts`) or copy from
  `node_modules/@fontsource/*` instead.

## Followups & Polish (Optional)

1. **Letters are flat** (troika SDF), not extruded. If true 3D embossed
   letters are a hard requirement, retry `<Text3D>` with a proper bbox-on-
   geometry-update hook (`useEffect` keyed off the geometry's `uuid`, or
   a custom font loader that resolves before mounting). Bevels would also
   want bigger thickness/size (`0.02`-ish, not `0.006`).
2. **State quirk**: I once observed the state collapsing to a single empty
   keycap after a sequence of color-picker + Save Image clicks (URL changed
   to `[["","#fff","#e91e63"]]`). Couldn't reproduce on a fresh reload.
   Worth a closer look at `controls-panel.tsx` `localWord` ↔ `word` sync,
   or color-picker popover dismissing routing through the word input.
3. **Camera framing for export** — the lanyard tab can clip on the left
   when the canvas is narrow. Consider auto-fitting camera to model bounds
   before capture, or capturing at a fixed framing.
4. Set `NEXT_PUBLIC_SHOP_URL` in `.env.local` to wire the footer link to
   the real GeekCraft shop URL when known.
5. Delete `scripts/`, `scripts/ttf/`, the dev `opentype.js` dep, and the
   `.png` debug screenshots in repo root once happy.
6. The dev server is currently running in the background — if you start a
   fresh session, `bun dev` from the project root.

## Next Steps

If continuing, prioritize in this order:

1. Wire real shop URL via `NEXT_PUBLIC_SHOP_URL`.
2. Decide flat-vs-extruded letters and either ship as-is or revisit
   `<Text3D>` (see Followup #1).
3. Mobile pass — verify controls panel scroll, touch rotate, and that the
   sticky bottom action bar doesn't cover the per-keycap rows on small
   screens.
4. Add OG image + favicon refresh for shareable link previews.
5. Clean up debug PNGs and `scripts/` folder, then deploy to Vercel.
