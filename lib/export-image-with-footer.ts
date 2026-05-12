import type { Design } from "@/lib/types"
import { FONTS } from "@/lib/types"
import {
  BASE_PALETTE,
  KEYCAP_PALETTE,
  LETTER_PALETTE,
  getPaletteDisplayName,
} from "@/lib/palette"

const COLOR_JOINER = " · "

export function designPaletteColorNames(
  design: Design,
  whenUnknown: string
): string[] {
  const names: string[] = []
  const add = (n: string) => {
    if (!names.includes(n)) names.push(n)
  }
  add(getPaletteDisplayName(BASE_PALETTE, design.baseColor, whenUnknown))
  add(
    getPaletteDisplayName(
      KEYCAP_PALETTE,
      design.defaultKeycapColor,
      whenUnknown
    )
  )
  add(
    getPaletteDisplayName(
      LETTER_PALETTE,
      design.defaultLetterColor,
      whenUnknown
    )
  )
  for (const k of design.keycaps) {
    add(getPaletteDisplayName(KEYCAP_PALETTE, k.keycapColor, whenUnknown))
    add(getPaletteDisplayName(LETTER_PALETTE, k.letterColor, whenUnknown))
  }
  return names
}

function wrapColorPartsToLines(
  ctx: CanvasRenderingContext2D,
  colorsPrefix: string,
  parts: string[],
  maxWidth: number
): string[] {
  const prefix = `${colorsPrefix}: `
  const lines: string[] = []
  let cur = ""

  const pushCur = () => {
    if (!cur) return
    lines.push(lines.length === 0 ? `${prefix}${cur}` : cur)
    cur = ""
  }

  for (const part of parts) {
    const trial = cur ? `${cur}${COLOR_JOINER}${part}` : part
    const candidate = lines.length === 0 ? `${prefix}${trial}` : trial
    if (ctx.measureText(candidate).width <= maxWidth) {
      cur = trial
    } else {
      pushCur()
      const firstCandidate = `${prefix}${part}`
      const nextCandidate = part
      if (lines.length === 0 && ctx.measureText(firstCandidate).width <= maxWidth) {
        cur = part
      } else if (lines.length > 0 && ctx.measureText(nextCandidate).width <= maxWidth) {
        cur = part
      } else {
        lines.push(lines.length === 0 ? firstCandidate : nextCandidate)
      }
    }
  }
  pushCur()
  return lines
}

function buildFooterLines(
  ctx: CanvasRenderingContext2D,
  fontLine: string,
  colorsPrefix: string,
  colorParts: string[],
  maxWidth: number,
  fontPx: number
): string[] {
  ctx.font = `${fontPx}px system-ui, "Noto Sans Thai", ui-sans-serif, sans-serif`
  return [fontLine, ...wrapColorPartsToLines(ctx, colorsPrefix, colorParts, maxWidth)]
}

function pickFooterFontSize(
  ctx: CanvasRenderingContext2D,
  fontLine: string,
  colorsPrefix: string,
  colorParts: string[],
  maxWidth: number
): { lines: string[]; fontPx: number } {
  const maxPx = Math.min(28, Math.max(13, Math.floor(maxWidth * 0.036)))
  const minPx = 11
  for (let fontPx = maxPx; fontPx >= minPx; fontPx--) {
    const lines = buildFooterLines(
      ctx,
      fontLine,
      colorsPrefix,
      colorParts,
      maxWidth,
      fontPx
    )
    if (lines.every((ln) => ctx.measureText(ln).width <= maxWidth)) {
      return { lines, fontPx }
    }
  }
  return {
    lines: buildFooterLines(
      ctx,
      fontLine,
      colorsPrefix,
      colorParts,
      maxWidth,
      minPx
    ),
    fontPx: minPx,
  }
}

/** Renders PNG `dataUrl` with a light footer listing font + palette color names (no hex). */
export function compositeExportPngWithFooter(
  dataUrl: string,
  design: Design,
  labels: {
    whenUnknownColor: string
    fontPrefix: string
    colorsPrefix: string
  }
): Promise<string | null> {
  const fontLine = `${labels.fontPrefix}: ${
    FONTS.find((f) => f.id === design.font)?.label ?? design.font
  }`
  const colorParts = designPaletteColorNames(design, labels.whenUnknownColor)

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const padX = Math.max(16, Math.floor(img.width * 0.04))
      const maxTextWidth = img.width - padX * 2
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(null)
        return
      }

      const { lines: footerLines, fontPx } = pickFooterFontSize(
        ctx,
        fontLine,
        labels.colorsPrefix,
        colorParts,
        maxTextWidth
      )

      const lineHeight = Math.ceil(fontPx * 1.45)
      const padY = Math.max(14, Math.floor(fontPx * 0.85))
      const footerH = padY * 2 + footerLines.length * lineHeight

      canvas.width = img.width
      canvas.height = img.height + footerH
      ctx.fillStyle = "#fafafa"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      ctx.fillStyle = "#4b5563"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.font = `${fontPx}px system-ui, "Noto Sans Thai", ui-sans-serif, sans-serif`

      let y = img.height + padY
      const cx = canvas.width / 2
      for (const line of footerLines) {
        ctx.fillText(line, cx, y)
        y += lineHeight
      }

      resolve(canvas.toDataURL("image/png"))
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}
