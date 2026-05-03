"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { isValidHex, normalizeHex } from "@/lib/palette";

export function ColorPicker({
  value,
  onChange,
  swatches,
  label,
  size = "md",
}: {
  value: string;
  onChange: (v: string) => void;
  swatches: { name: string; hex: string }[];
  label?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setHex(value), [value]);
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

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        aria-label={label ? `${label} — ${value}` : `Color ${value}`}
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
            {swatches.map((s) => (
              <button
                key={s.hex}
                type="button"
                title={s.name}
                aria-label={s.name}
                onClick={() => {
                  onChange(s.hex);
                  setHex(s.hex);
                  setOpen(false);
                }}
                className={cn(
                  swatchSize,
                  "rounded-md border-2 border-white ring-1 ring-black/10 hover:ring-black/40 transition",
                  value.toLowerCase() === s.hex.toLowerCase() &&
                    "ring-2 ring-pink-500 ring-offset-1",
                )}
                style={{ backgroundColor: s.hex }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label className="relative inline-block w-7 h-7 cursor-pointer rounded-md border-2 border-white ring-1 ring-black/10 overflow-hidden">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <span
                className="absolute inset-0"
                style={{ backgroundColor: value }}
              />
            </label>
            <input
              type="text"
              value={hex}
              maxLength={7}
              onChange={(e) => {
                const v = e.target.value;
                setHex(v);
                if (isValidHex(v)) onChange(normalizeHex(v));
              }}
              onBlur={() => {
                if (isValidHex(hex)) onChange(normalizeHex(hex));
                else setHex(value);
              }}
              className="flex-1 rounded-md border border-neutral-300 bg-white px-2 py-1 font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="#ffffff"
            />
          </div>
        </div>
      )}
    </div>
  );
}
