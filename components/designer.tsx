"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  createDesignerWaveController,
  type DesignerWaveController,
} from "@/lib/designer-wave"
import type { WaveRequest } from "@/lib/keycap-wave"
import { compositeExportPngWithFooter } from "@/lib/export-image-with-footer"
import { useDesign } from "@/lib/use-design"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { th } from "@/lib/i18n/th"
import { ClickerScene, type ExportFn } from "./clicker-scene"
import { ControlsPanel } from "./controls-panel"

export function Designer() {
  const d = useDesign()
  const prefersReducedMotion = usePrefersReducedMotion()
  const {
    addKeycap,
    applyDefaultsToAll,
    randomizeColors,
    removeKeycap,
    reset,
    resetKeycap,
    setBaseColor,
    setFont,
    setKeyLayout,
    setKeycapChar,
    setKeycapColor,
    setLetterColor,
    setWord,
  } = d
  const exportRef = useRef<ExportFn | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [idle, setIdle] = useState(false)
  const [waveRequest, setWaveRequest] = useState<WaveRequest>({ id: 0, awaitGlyphs: false })

  const waveController = useMemo<DesignerWaveController>(
    () =>
      createDesignerWaveController({
        getPrefersReducedMotion: () => prefersReducedMotion,
        timer: {
          setTimeout: (cb, ms) => window.setTimeout(cb, ms),
          clearTimeout: (id) => window.clearTimeout(id),
        },
        onWave: (request) => {
          setWaveRequest(request)
        },
      }),
    [prefersReducedMotion],
  )
  const stopIdle = useCallback(() => setIdle(false), [setIdle])

  useEffect(() => {
    return () => waveController.dispose()
  }, [waveController])

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    if (!params.has("d")) return
    waveController.restoreFromUrl()
  }, [waveController])

  const onKeycapClick = useCallback((i: number) => {
    setHighlightedIndex(i)
    setIdle(false)
    // Auto-clear highlight after a few seconds so it's not permanently stuck
    window.setTimeout(() => {
      setHighlightedIndex((cur) => (cur === i ? null : cur))
    }, 2400)
  }, [setHighlightedIndex, setIdle])

  const onSetBaseColor = useCallback(
    (color: string) => {
      setBaseColor(color)
      waveController.triggerVisibleEdit(false)
    },
    [setBaseColor, waveController],
  )

  const onSetWord = useCallback(
    (word: string) => {
      setWord(word)
      waveController.scheduleWordWave()
    },
    [setWord, waveController],
  )

  const onSetKeycapChar = useCallback(
    (index: number, char: string) => {
      setKeycapChar(index, char)
      waveController.triggerVisibleEdit(false)
    },
    [setKeycapChar, waveController],
  )

  const onSetKeycapColor = useCallback(
    (index: number, color: string) => {
      setKeycapColor(index, color)
      waveController.triggerVisibleEdit(false)
    },
    [setKeycapColor, waveController],
  )

  const onSetLetterColor = useCallback(
    (index: number, color: string) => {
      setLetterColor(index, color)
      waveController.triggerVisibleEdit(false)
    },
    [setLetterColor, waveController],
  )

  const onResetKeycap = useCallback(
    (index: number) => {
      resetKeycap(index)
      waveController.triggerVisibleEdit(false)
    },
    [resetKeycap, waveController],
  )

  const onAddKeycap = useCallback(() => {
    addKeycap()
    waveController.triggerVisibleEdit(false)
  }, [addKeycap, waveController])

  const onRemoveKeycap = useCallback(() => {
    removeKeycap()
    waveController.triggerVisibleEdit(false)
  }, [removeKeycap, waveController])

  const onApplyDefaultsToAll = useCallback(() => {
    applyDefaultsToAll()
    waveController.triggerVisibleEdit(false)
  }, [applyDefaultsToAll, waveController])

  const onRandomizeColors = useCallback(() => {
    randomizeColors()
    waveController.triggerVisibleEdit(false)
  }, [randomizeColors, waveController])

  const onReset = useCallback(() => {
    reset()
    waveController.triggerVisibleEdit(false)
  }, [reset, waveController])

  const onSetFont = useCallback(
    (font: Parameters<typeof setFont>[0]) => {
      setFont(font)
      waveController.triggerVisibleEdit(true)
    },
    [setFont, waveController],
  )

  const onSetKeyLayout = useCallback(
    (layout: Parameters<typeof setKeyLayout>[0]) => {
      setKeyLayout(layout)
      waveController.triggerVisibleEdit(false)
    },
    [setKeyLayout, waveController],
  )

  const onSaveImage = useCallback(() => {
    const fn = exportRef.current
    if (!fn) return
    const raw = fn()
    if (!raw) return
    const word = d.word.replace(/[^A-Z0-9]/gi, "") || "geekcraft"
    const download = (href: string) => {
      const a = document.createElement("a")
      a.href = href
      a.download = `clicker-${word.toLowerCase()}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
    void compositeExportPngWithFooter(raw, d.design, {
      whenUnknownColor: th.palette.notInSwatches,
      fontPrefix: th.exportImage.fontPrefix,
      colorsPrefix: th.exportImage.colorsPrefix,
    }).then((composed) => download(composed ?? raw))
  }, [d.word, d.design])

  return (
    <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="relative h-[60vh] min-h-[420px] overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 via-white to-sky-50 shadow-sm ring-1 ring-black/5 lg:h-[80vh]">
        <ClickerScene
          design={d.design}
          exportRef={exportRef}
          onKeycapClick={onKeycapClick}
          highlightedIndex={highlightedIndex}
          waveRequest={waveRequest}
          idle={idle}
          onUserInteract={stopIdle}
        />
        <div className="pointer-events-none absolute bottom-3 left-1/2 flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-1 px-4 text-center">
          <p className="text-[11px] uppercase tracking-widest text-neutral-400">
            {th.designer.hint}
          </p>
          <p className="text-[11px] leading-relaxed text-neutral-500/90">
            {th.designer.disclaimer}
          </p>
        </div>
      </div>
      <ControlsPanel
        design={d.design}
        word={d.word}
        highlightedIndex={highlightedIndex}
        onSetWord={onSetWord}
        onSetKeycapChar={onSetKeycapChar}
        onSetKeycapColor={onSetKeycapColor}
        onSetLetterColor={onSetLetterColor}
        onResetKeycap={onResetKeycap}
        onAddKeycap={onAddKeycap}
        onRemoveKeycap={onRemoveKeycap}
        onSetBaseColor={onSetBaseColor}
        onSetDefaultKeycapColor={d.setDefaultKeycapColor}
        onSetDefaultLetterColor={d.setDefaultLetterColor}
        onApplyDefaultsToAll={onApplyDefaultsToAll}
        onRandomizeColors={onRandomizeColors}
        onSetFont={onSetFont}
        onSetKeyLayout={onSetKeyLayout}
        onReset={onReset}
        onSaveImage={onSaveImage}
      />
    </div>
  )
}
