"use client"
import { useCallback, useRef, useState } from "react"
import { useDesign } from "@/lib/use-design"
import { th } from "@/lib/i18n/th"
import { ClickerScene, type ExportFn } from "./clicker-scene"
import { ControlsPanel } from "./controls-panel"

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
    setKeycapChar,
    setKeycapColor,
    setLetterColor,
  } = d
  const exportRef = useRef<ExportFn | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [idle, setIdle] = useState(false)
  const [waveToken, setWaveToken] = useState(0)

  const stopIdle = useCallback(() => setIdle(false), [])
  const triggerWave = useCallback(() => {
    setWaveToken((current) => current + 1)
  }, [])

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
      triggerWave()
    },
    [setBaseColor, triggerWave],
  )

  const onSetKeycapChar = useCallback(
    (index: number, char: string) => {
      setKeycapChar(index, char)
      triggerWave()
    },
    [setKeycapChar, triggerWave],
  )

  const onSetKeycapColor = useCallback(
    (index: number, color: string) => {
      setKeycapColor(index, color)
      triggerWave()
    },
    [setKeycapColor, triggerWave],
  )

  const onSetLetterColor = useCallback(
    (index: number, color: string) => {
      setLetterColor(index, color)
      triggerWave()
    },
    [setLetterColor, triggerWave],
  )

  const onResetKeycap = useCallback(
    (index: number) => {
      resetKeycap(index)
      triggerWave()
    },
    [resetKeycap, triggerWave],
  )

  const onAddKeycap = useCallback(() => {
    addKeycap()
    triggerWave()
  }, [addKeycap, triggerWave])

  const onRemoveKeycap = useCallback(() => {
    removeKeycap()
    triggerWave()
  }, [removeKeycap, triggerWave])

  const onApplyDefaultsToAll = useCallback(() => {
    applyDefaultsToAll()
    triggerWave()
  }, [applyDefaultsToAll, triggerWave])

  const onRandomizeColors = useCallback(() => {
    randomizeColors()
    triggerWave()
  }, [randomizeColors, triggerWave])

  const onReset = useCallback(() => {
    reset()
    triggerWave()
  }, [reset, triggerWave])

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
          waveToken={waveToken}
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
        onSetWord={d.setWord}
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
        onSetFont={d.setFont}
        onReset={onReset}
        onSaveImage={onSaveImage}
      />
    </div>
  )
}
