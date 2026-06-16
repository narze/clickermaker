"use client"
import { Download, Minus, Plus, RefreshCw, Shuffle } from "lucide-react"
import type { Design, FontId, KeyLayout } from "@/lib/types"
import {
  FONTS,
  MAX_KEYCAPS,
  MAX_KEYCAP_COLORS,
  MIN_KEYCAPS,
  keycapColorsUsed,
  sanitizeWord,
} from "@/lib/types"
import {
  BASE_PALETTE,
  KEYCAP_PALETTE,
  LETTER_PALETTE,
  getPaletteColorName,
} from "@/lib/palette"
import { th } from "@/lib/i18n/th"
import { cn } from "@/lib/utils"
import { ColorPicker } from "./color-picker"
import { KeycapRow } from "./keycap-row"

export function ControlsPanel({
  design,
  word,
  highlightedIndex,
  onSetWord,
  onSetKeycapChar,
  onSetKeycapColor,
  onSetLetterColor,
  onResetKeycap,
  onAddKeycap,
  onRemoveKeycap,
  onSetBaseColor,
  onSetDefaultKeycapColor,
  onSetDefaultLetterColor,
  onApplyDefaultsToAll,
  onRandomizeColors,
  onSetFont,
  onSetKeyLayout,
  onReset,
  onSaveImage,
}: {
  design: Design
  word: string
  highlightedIndex: number | null
  onSetWord: (w: string) => void
  onSetKeycapChar: (i: number, c: string) => void
  onSetKeycapColor: (i: number, c: string) => void
  onSetLetterColor: (i: number, c: string) => void
  onResetKeycap: (i: number) => void
  onAddKeycap: () => void
  onRemoveKeycap: () => void
  onSetBaseColor: (c: string) => void
  onSetDefaultKeycapColor: (c: string) => void
  onSetDefaultLetterColor: (c: string) => void
  onApplyDefaultsToAll: () => void
  onRandomizeColors: () => void
  onSetFont: (f: FontId) => void
  onSetKeyLayout: (layout: KeyLayout) => void
  onReset: () => void
  onSaveImage: () => void
}) {
  const n = design.keycaps.length
  const colorsUsed = keycapColorsUsed(design.keycaps).size
  const colorLimitReached = colorsUsed >= MAX_KEYCAP_COLORS

  return (
    <aside className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 lg:max-h-[80vh] lg:overflow-y-auto">
      {/* Word + length */}
      <Section title={th.controls.yourText}>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={word}
            placeholder={th.controls.typeWord}
            maxLength={MAX_KEYCAPS}
            onChange={(e) => {
              const v = sanitizeWord(e.target.value)
              onSetWord(v)
            }}
            className="w-full rounded-lg border-2 border-neutral-200 bg-white px-3 py-2 text-lg font-bold uppercase tracking-wider focus:border-pink-500 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              {th.controls.keycapCount(n)}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onRemoveKeycap}
                disabled={n <= MIN_KEYCAPS}
                aria-label={th.controls.removeKeycap}
                className="rounded-md border border-neutral-200 bg-white p-1.5 hover:bg-neutral-50 disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <button
                type="button"
                onClick={onAddKeycap}
                disabled={n >= MAX_KEYCAPS}
                aria-label={th.controls.addKeycap}
                className="rounded-md border border-neutral-200 bg-white p-1.5 hover:bg-neutral-50 disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Font */}
      <Section title={th.controls.font}>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onSetFont(f.id)}
              className={cn(
                "rounded-lg border-2 px-3 py-2 text-sm transition",
                design.font === f.id
                  ? "border-pink-500 bg-pink-50 font-bold text-pink-700"
                  : "border-neutral-200 bg-white hover:border-neutral-400",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Key orientation */}
      <Section title={th.controls.keyLayout}>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSetKeyLayout("horizontal")}
            className={cn(
              "rounded-lg border-2 px-3 py-2 text-sm transition",
              design.keyLayout === "horizontal"
                ? "border-pink-500 bg-pink-50 font-bold text-pink-700"
                : "border-neutral-200 bg-white hover:border-neutral-400",
            )}
          >
            {th.controls.keyLayoutHorizontal}
          </button>
          <button
            type="button"
            onClick={() => onSetKeyLayout("vertical")}
            className={cn(
              "rounded-lg border-2 px-3 py-2 text-sm transition",
              design.keyLayout === "vertical"
                ? "border-pink-500 bg-pink-50 font-bold text-pink-700"
                : "border-neutral-200 bg-white hover:border-neutral-400",
            )}
          >
            {th.controls.keyLayoutVertical}
          </button>
        </div>
      </Section>

      {/* Base color */}
      <Section title={th.controls.baseColor}>
        <div className="flex items-center gap-3">
          <ColorPicker
            value={design.baseColor}
            onChange={onSetBaseColor}
            swatches={BASE_PALETTE}
            label={th.controls.base}
          />
          <span className="text-xs text-neutral-500">
            {getPaletteColorName(BASE_PALETTE, design.baseColor)}
          </span>
        </div>
      </Section>

      {/* Defaults */}
      <Section
        title={th.controls.defaultColorsTitle}
        subtitle={th.controls.defaultColorsSubtitle}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <ColorPicker
              value={design.defaultKeycapColor}
              onChange={onSetDefaultKeycapColor}
              swatches={KEYCAP_PALETTE}
              label={th.controls.defaultKeycapColor}
            />
            <span className="text-xs text-neutral-500">
              {th.controls.keycap}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ColorPicker
              value={design.defaultLetterColor}
              onChange={onSetDefaultLetterColor}
              swatches={LETTER_PALETTE}
              label={th.controls.defaultLetterColor}
            />
            <span className="text-xs text-neutral-500">
              {th.controls.letter}
            </span>
          </div>
          <button
            type="button"
            onClick={onApplyDefaultsToAll}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
          >
            {th.controls.applyToAll}
          </button>
          <button
            type="button"
            onClick={onRandomizeColors}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
          >
            <Shuffle className="size-3.5" />
            {th.controls.randomColors}
          </button>
        </div>
      </Section>

      {/* Per-keycap list */}
      <Section
        title={th.controls.perKeycap}
        subtitle={th.colorLimit.hint(MAX_KEYCAP_COLORS)}
      >
        <div
          className={cn(
            "mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
            colorLimitReached
              ? "bg-pink-50 text-pink-700"
              : "bg-neutral-100 text-neutral-500",
          )}
        >
          {th.colorLimit.used(colorsUsed, MAX_KEYCAP_COLORS)}
        </div>
        <div className="flex flex-col gap-1">
          {design.keycaps.map((kc, i) => (
            <KeycapRow
              key={i}
              index={i}
              keycap={kc}
              keycaps={design.keycaps}
              highlighted={highlightedIndex === i}
              onCharChange={(c) => onSetKeycapChar(i, c)}
              onKeycapColor={(c) => onSetKeycapColor(i, c)}
              onLetterColor={(c) => onSetLetterColor(i, c)}
              onReset={() => onResetKeycap(i)}
            />
          ))}
        </div>
      </Section>

      {/* Actions */}
      <div className="sticky bottom-0 -mx-5 -mb-5 flex gap-2 border-t border-neutral-100 bg-white/95 px-5 py-3 backdrop-blur">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          <RefreshCw className="size-4" />
          {th.controls.reset}
        </button>
        <button
          type="button"
          onClick={onSaveImage}
          className="flex items-center gap-1.5 rounded-lg bg-pink-500 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
        >
          <Download className="size-4" />
          {th.controls.saveImage}
        </button>
      </div>
    </aside>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h3>
      {subtitle && (
        <p className="-mt-1 mb-2 text-xs text-neutral-400">{subtitle}</p>
      )}
      {children}
    </section>
  )
}
