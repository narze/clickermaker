"use client";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  type Design,
  type Keycap,
  type FontId,
  DEFAULTS,
  MAX_KEYCAPS,
  MIN_KEYCAPS,
  sanitizeChar,
  sanitizeWord,
} from "./types";
import { decodeDesign, encodeDesign } from "./url-state";
import { BASE_PALETTE, KEYCAP_PALETTE, LETTER_PALETTE } from "./palette";
import { normalizeHex } from "./palette";

type Action =
  | { type: "setWord"; word: string }
  | { type: "setKeycapChar"; index: number; char: string }
  | { type: "setKeycapColor"; index: number; color: string }
  | { type: "setLetterColor"; index: number; color: string }
  | { type: "resetKeycap"; index: number }
  | { type: "addKeycap" }
  | { type: "removeKeycap" }
  | { type: "setBaseColor"; color: string }
  | { type: "setDefaultKeycapColor"; color: string }
  | { type: "setDefaultLetterColor"; color: string }
  | { type: "applyDefaultsToAll" }
  | { type: "randomizeColors" }
  | { type: "setFont"; font: FontId }
  | { type: "loadDesign"; design: Design }
  | { type: "reset" };

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function makeKeycap(
  char: string,
  defaults: { defaultKeycapColor: string; defaultLetterColor: string },
): Keycap {
  return {
    char: sanitizeChar(char),
    keycapColor: defaults.defaultKeycapColor,
    letterColor: defaults.defaultLetterColor,
  };
}

function reducer(state: Design, action: Action): Design {
  switch (action.type) {
    case "setWord": {
      const w = sanitizeWord(action.word);
      const next: Keycap[] = [];
      const len = Math.max(MIN_KEYCAPS, Math.min(MAX_KEYCAPS, w.length || MIN_KEYCAPS));
      for (let i = 0; i < len; i++) {
        const prev = state.keycaps[i];
        const ch = w[i] ?? "";
        if (prev) next.push({ ...prev, char: sanitizeChar(ch) });
        else next.push(makeKeycap(ch, state));
      }
      return { ...state, keycaps: next };
    }
    case "setKeycapChar": {
      if (action.index < 0 || action.index >= state.keycaps.length) return state;
      const next = state.keycaps.slice();
      next[action.index] = { ...next[action.index], char: sanitizeChar(action.char) };
      return { ...state, keycaps: next };
    }
    case "setKeycapColor": {
      if (action.index < 0 || action.index >= state.keycaps.length) return state;
      const next = state.keycaps.slice();
      next[action.index] = { ...next[action.index], keycapColor: normalizeHex(action.color) };
      return { ...state, keycaps: next };
    }
    case "setLetterColor": {
      if (action.index < 0 || action.index >= state.keycaps.length) return state;
      const next = state.keycaps.slice();
      next[action.index] = { ...next[action.index], letterColor: normalizeHex(action.color) };
      return { ...state, keycaps: next };
    }
    case "resetKeycap": {
      if (action.index < 0 || action.index >= state.keycaps.length) return state;
      const next = state.keycaps.slice();
      next[action.index] = {
        ...next[action.index],
        keycapColor: state.defaultKeycapColor,
        letterColor: state.defaultLetterColor,
      };
      return { ...state, keycaps: next };
    }
    case "addKeycap": {
      if (state.keycaps.length >= MAX_KEYCAPS) return state;
      return {
        ...state,
        keycaps: [...state.keycaps, makeKeycap("", state)],
      };
    }
    case "removeKeycap": {
      if (state.keycaps.length <= MIN_KEYCAPS) return state;
      return { ...state, keycaps: state.keycaps.slice(0, -1) };
    }
    case "setBaseColor":
      return { ...state, baseColor: normalizeHex(action.color) };
    case "setDefaultKeycapColor":
      return { ...state, defaultKeycapColor: normalizeHex(action.color) };
    case "setDefaultLetterColor":
      return { ...state, defaultLetterColor: normalizeHex(action.color) };
    case "applyDefaultsToAll":
      return {
        ...state,
        keycaps: state.keycaps.map((k) => ({
          ...k,
          keycapColor: state.defaultKeycapColor,
          letterColor: state.defaultLetterColor,
        })),
      };
    case "randomizeColors": {
      const baseColor = randomItem(BASE_PALETTE).hex;
      const keycapColor = randomItem(KEYCAP_PALETTE).hex;
      const letterChoices = LETTER_PALETTE.filter(
        (swatch) => swatch.hex.toLowerCase() !== keycapColor.toLowerCase(),
      );
      const letterColor = randomItem(letterChoices).hex;

      return {
        ...state,
        baseColor,
        defaultKeycapColor: keycapColor,
        defaultLetterColor: letterColor,
        keycaps: state.keycaps.map((keycap) => ({
          ...keycap,
          keycapColor,
          letterColor,
        })),
      };
    }
    case "setFont":
      return { ...state, font: action.font };
    case "loadDesign":
      return action.design;
    case "reset":
      return DEFAULTS;
    default:
      return state;
  }
}

export function useDesign() {
  const [design, dispatch] = useReducer(reducer, DEFAULTS);
  const initialised = useRef(false);

  // Load from URL hash/query on mount
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const d = params.get("d");
    if (d) {
      const parsed = decodeDesign(d);
      if (parsed) {
        dispatch({ type: "loadDesign", design: parsed });
      }
    }
  }, []);

  // Sync design → URL ?d=
  useEffect(() => {
    if (!initialised.current) return;
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("d", encodeDesign(design));
    window.history.replaceState(null, "", url.toString());
  }, [design]);

  const word = design.keycaps.map((k) => k.char).join("");

  const dispatchers = {
    setWord: useCallback((w: string) => dispatch({ type: "setWord", word: w }), []),
    setKeycapChar: useCallback(
      (i: number, c: string) => dispatch({ type: "setKeycapChar", index: i, char: c }),
      [],
    ),
    setKeycapColor: useCallback(
      (i: number, c: string) => dispatch({ type: "setKeycapColor", index: i, color: c }),
      [],
    ),
    setLetterColor: useCallback(
      (i: number, c: string) => dispatch({ type: "setLetterColor", index: i, color: c }),
      [],
    ),
    resetKeycap: useCallback(
      (i: number) => dispatch({ type: "resetKeycap", index: i }),
      [],
    ),
    addKeycap: useCallback(() => dispatch({ type: "addKeycap" }), []),
    removeKeycap: useCallback(() => dispatch({ type: "removeKeycap" }), []),
    setBaseColor: useCallback((c: string) => dispatch({ type: "setBaseColor", color: c }), []),
    setDefaultKeycapColor: useCallback(
      (c: string) => dispatch({ type: "setDefaultKeycapColor", color: c }),
      [],
    ),
    setDefaultLetterColor: useCallback(
      (c: string) => dispatch({ type: "setDefaultLetterColor", color: c }),
      [],
    ),
    applyDefaultsToAll: useCallback(() => dispatch({ type: "applyDefaultsToAll" }), []),
    randomizeColors: useCallback(() => dispatch({ type: "randomizeColors" }), []),
    setFont: useCallback((f: FontId) => dispatch({ type: "setFont", font: f }), []),
    reset: useCallback(() => dispatch({ type: "reset" }), []),
  };

  return { design, word, ...dispatchers };
}
