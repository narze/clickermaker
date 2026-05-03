<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Text Extrusion via opentype.js

Letter geometry is built at runtime with `opentype.js` (parses WOFF → glyph path → Three.js `ShapePath` → `ExtrudeGeometry`).  
- Do **not** use `THREE.FontLoader` / `TextGeometry` / typeface JSON — those were reverted due to poor curve quality.
- `ExtrudeGeometry` uses `curveSegments: 32` and a small bevel for smooth edges.
- `opentype.parse(buffer)` is used instead of the deprecated `opentype.load(url)`.
- Type declarations live in `opentype.d.ts`.
