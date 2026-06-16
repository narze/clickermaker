"use client";
import { useEffect, useRef, useState } from "react";
import { th } from "@/lib/i18n/th";
import { cn } from "@/lib/utils";
import { getPaletteColorName } from "@/lib/palette";

export function ColorPicker({
  value,
  onChange,
  swatches,
  label,
  size = "md",
  isColorEnabled,
  note,
  disabledHint,
}: {
  value: string;
  onChange: (v: string) => void;
  swatches: { name: string; hex: string }[];
  label?: string;
  size?: "sm" | "md";
  /** Optional: returns false for swatches that should be disabled (e.g. color limit). */
  isColorEnabled?: (hex: string) => boolean;
  /** Optional helper text shown under the swatches when some are disabled. */
  note?: string;
  /** Optional tooltip shown on disabled swatches. */
  disabledHint?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const swatchSize = size === "sm" ? "w-6 h-6" : "w-7 h-7";
  const triggerSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const colorName = getPaletteColorName(swatches, value);
  const swatchStates = swatches.map((s) => ({
    ...s,
    enabled: isColorEnabled ? isColorEnabled(s.hex) : true,
  }));
  const hasDisabled = swatchStates.some((s) => !s.enabled);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        aria-label={label ? `${label} — ${colorName}` : th.colorPicker.colorValue(colorName)}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          triggerSize,
          "rounded-lg border-2 border-white shadow-sm ring-1 ring-black/10 hover:ring-black/30 transition focus:outline-none focus:ring-2 focus:ring-pink-500",
        )}
        style={{ backgroundColor: value }}
      />
      {open && (
        <div
          role="dialog"
          className="absolute z-30 mt-2 w-56 rounded-xl bg-white p-3 shadow-xl ring-1 ring-black/10"
        >
          {label && (
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              {label}
            </div>
          )}
          <div className="grid grid-cols-4 gap-1.5">
            {swatchStates.map((s) => {
              const enabled = s.enabled;
              const selected = value.toLowerCase() === s.hex.toLowerCase();
              return (
                <button
                  key={s.hex}
                  type="button"
                  title={!enabled ? disabledHint ?? s.name : s.name}
                  aria-label={s.name}
                  aria-disabled={!enabled || undefined}
                  disabled={!enabled}
                  onClick={() => {
                    if (!enabled) return;
                    onChange(s.hex);
                    setOpen(false);
                  }}
                  className={cn(
                    swatchSize,
                    "rounded-md border-2 border-white ring-1 ring-black/10 transition",
                    enabled
                      ? "hover:ring-black/40"
                      : "cursor-not-allowed opacity-30",
                    selected && "ring-2 ring-pink-500 ring-offset-1",
                  )}
                  style={{ backgroundColor: s.hex }}
                />
              );
            })}
          </div>
          <div className="mt-3 text-xs font-medium text-neutral-500">{colorName}</div>
          {hasDisabled && note && (
            <div className="mt-1 text-[11px] leading-snug text-neutral-400">
              {note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
