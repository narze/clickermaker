"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import type { WaveRequest } from "@/lib/keycap-wave"
import { useDesign } from "@/lib/use-design"
import { th } from "@/lib/i18n/th"
import { ClickerScene, type ExportFn } from "./clicker-scene"
import { ControlsPanel } from "./controls-panel"

const WORD_WAVE_DEBOUNCE_MS = 150

export function Designer() {
  const d = useDesign()
  const {
    addKeycap,
    applyDefaultsToAll,
    randomizeColors,
    removeKeycap,
    reset,
    resetKeycap,
    setBaseColor,
    setFont,
    setKeycapChar,
    setKeycapColor,
    setLetterColor,
    setWord,
  } = d
  const exportRef = useRef<ExportFn | null>(null)
  const pendingWordWaveRef = useRef<number | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [idle, setIdle] = useState(false)
  const [waveRequest, setWaveRequest] = useState<WaveRequest>({ id: 0, awaitGlyphs: false })

  const stopIdle = useCallback(() => setIdle(false), [])
  const clearPendingWordWave = useCallback(() => {
    if (pendingWordWaveRef.current !== null) {
      window.clearTimeout(pendingWordWaveRef.current)
      pendingWordWaveRef.current = null
    }
  }, [])
  const triggerWave = useCallback(
    (awaitGlyphs: boolean) => {
      clearPendingWordWave()
      setWaveRequest((current) => ({ id: current.id + 1, awaitGlyphs }))
    },
    [clearPendingWordWave],
  )
  const scheduleWordWave = useCallback(() => {
    clearPendingWordWave()
    pendingWordWaveRef.current = window.setTimeout(() => {
      pendingWordWaveRef.current = null
      setWaveRequest((current) => ({ id: current.id + 1, awaitGlyphs: true }))
    }, WORD_WAVE_DEBOUNCE_MS)
  }, [clearPendingWordWave])

  useEffect(() => {
    return () => clearPendingWordWave()
  }, [clearPendingWordWave])

  const onKeycapClick = useCallback((i: number) => {
    setHighlightedIndex(i)
    setIdle(false)
    // Auto-clear highlight after a few seconds so it's not permanently stuck
    window.setTimeout(() => {
      setHighlightedIndex((cur) => (cur === i ? null : cur))
    }, 2400)
  }, [])

  const onSetBaseColor = useCallback(
    (color: string) => {
      setBaseColor(color)
      triggerWave(false)
    },
    [setBaseColor, triggerWave],
  )

  const onSetWord = useCallback(
    (word: string) => {
      setWord(word)
      scheduleWordWave()
    },
    [scheduleWordWave, setWord],
  )

  const onSetKeycapChar = useCallback(
    (index: number, char: string) => {
      setKeycapChar(index, char)
      triggerWave(false)
    },
    [setKeycapChar, triggerWave],
  )

  const onSetKeycapColor = useCallback(
    (index: number, color: string) => {
      setKeycapColor(index, color)
      triggerWave(false)
    },
    [setKeycapColor, triggerWave],
  )

  const onSetLetterColor = useCallback(
    (index: number, color: string) => {
      setLetterColor(index, color)
      triggerWave(false)
    },
    [setLetterColor, triggerWave],
  )

  const onResetKeycap = useCallback(
    (index: number) => {
      resetKeycap(index)
      triggerWave(false)
    },
    [resetKeycap, triggerWave],
  )

  const onAddKeycap = useCallback(() => {
    addKeycap()
    triggerWave(false)
  }, [addKeycap, triggerWave])

  const onRemoveKeycap = useCallback(() => {
    removeKeycap()
    triggerWave(false)
  }, [removeKeycap, triggerWave])

  const onApplyDefaultsToAll = useCallback(() => {
    applyDefaultsToAll()
    triggerWave(false)
  }, [applyDefaultsToAll, triggerWave])

  const onRandomizeColors = useCallback(() => {
    randomizeColors()
    triggerWave(false)
  }, [randomizeColors, triggerWave])

  const onReset = useCallback(() => {
    reset()
    triggerWave(false)
  }, [reset, triggerWave])

  const onSetFont = useCallback(
    (font: Parameters<typeof setFont>[0]) => {
      setFont(font)
      triggerWave(true)
    },
    [setFont, triggerWave],
  )

  const onSaveImage = useCallback(() => {
    const fn = exportRef.current
    if (!fn) return
    const url = fn()
    if (!url) return
    const word = d.word.replace(/[^A-Z0-9]/gi, "") || "geekcraft"
    const a = document.createElement("a")
    a.href = url
    a.download = `clicker-${word.toLowerCase()}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }, [d.word])

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
        onReset={onReset}
        onSaveImage={onSaveImage}
      />
    </div>
  )
}
