"use client";
import { RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Keycap } from "@/lib/types";
import { MAX_KEYCAP_COLORS, keycapColorChangeAllowed, sanitizeChar } from "@/lib/types";
import { KEYCAP_PALETTE, LETTER_PALETTE } from "@/lib/palette";
import { th } from "@/lib/i18n/th";
import { cn } from "@/lib/utils";
import { ColorPicker } from "./color-picker";

export function KeycapRow({
  index,
  keycap,
  keycaps,
  highlighted,
  onCharChange,
  onKeycapColor,
  onLetterColor,
  onReset,
}: {
  index: number;
  keycap: Keycap;
  /** All keycaps in the design — used to enforce the keycap color limit. */
  keycaps: Keycap[];
  highlighted: boolean;
  onCharChange: (c: string) => void;
  onKeycapColor: (c: string) => void;
  onLetterColor: (c: string) => void;
  onReset: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const colorLimitNote = th.colorLimit.hint(MAX_KEYCAP_COLORS);
  const colorLimitDisabledHint = th.colorLimit.swatchDisabled(MAX_KEYCAP_COLORS);

  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [highlighted]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 rounded-lg p-2 transition-colors",
        highlighted ? "bg-pink-50 ring-2 ring-pink-300" : "hover:bg-neutral-50",
      )}
    >
      <div className="w-6 text-right text-xs font-semibold text-neutral-400">
        {index + 1}
      </div>
      <input
        type="text"
        value={keycap.char}
        onChange={(e) => {
          const v = sanitizeChar(e.target.value.slice(-1));
          onCharChange(v);
        }}
        onFocus={(e) => e.target.select()}
        maxLength={1}
        aria-label={th.keycapRow.keycapCharacter(index)}
        className="w-10 h-10 rounded-md border-2 border-neutral-200 bg-white text-center text-lg font-bold uppercase focus:border-pink-500 focus:outline-none"
      />
      <div className="flex items-center gap-1">
        <ColorPicker
          value={keycap.keycapColor}
          onChange={onKeycapColor}
          swatches={KEYCAP_PALETTE}
          label={th.controls.keycap}
          size="sm"
          isColorEnabled={(hex) =>
            keycapColorChangeAllowed(keycaps, index, "keycapColor", hex)
          }
          note={colorLimitNote}
          disabledHint={colorLimitDisabledHint}
        />
        <ColorPicker
          value={keycap.letterColor}
          onChange={onLetterColor}
          swatches={LETTER_PALETTE}
          label={th.controls.letter}
          size="sm"
          isColorEnabled={(hex) =>
            keycapColorChangeAllowed(keycaps, index, "letterColor", hex)
          }
          note={colorLimitNote}
          disabledHint={colorLimitDisabledHint}
        />
      </div>
      <button
        type="button"
        onClick={onReset}
        aria-label={th.keycapRow.resetKeycap(index)}
        className="ml-auto rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
      >
        <RotateCcw className="size-4" />
      </button>
    </div>
  );
}
