"use client"
import { useCallback, useRef, useState } from "react"
import { useDesign } from "@/lib/use-design"
import { ClickerScene, type ExportFn } from "./clicker-scene"
import { ControlsPanel } from "./controls-panel"

export function Designer() {
  const d = useDesign()
  const exportRef = useRef<ExportFn | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [idle, setIdle] = useState(false)

  const stopIdle = useCallback(() => setIdle(false), [])

  const onKeycapClick = useCallback((i: number) => {
    setHighlightedIndex(i)
    setIdle(false)
    // Auto-clear highlight after a few seconds so it's not permanently stuck
    window.setTimeout(() => {
      setHighlightedIndex((cur) => (cur === i ? null : cur))
    }, 2400)
  }, [])

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
          idle={idle}
          onUserInteract={stopIdle}
        />
        <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-widest text-neutral-400">
          drag to rotate · click a keycap to edit
        </p>
      </div>
      <ControlsPanel
        design={d.design}
        word={d.word}
        highlightedIndex={highlightedIndex}
        onSetWord={d.setWord}
        onSetKeycapChar={d.setKeycapChar}
        onSetKeycapColor={d.setKeycapColor}
        onSetLetterColor={d.setLetterColor}
        onResetKeycap={d.resetKeycap}
        onAddKeycap={d.addKeycap}
        onRemoveKeycap={d.removeKeycap}
        onSetBaseColor={d.setBaseColor}
        onSetDefaultKeycapColor={d.setDefaultKeycapColor}
        onSetDefaultLetterColor={d.setDefaultLetterColor}
        onApplyDefaultsToAll={d.applyDefaultsToAll}
        onSetFont={d.setFont}
        onReset={d.reset}
        onSaveImage={onSaveImage}
      />
    </div>
  )
}
