"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type TextSize = "sm" | "normal" | "lg" | "xl";
export type ColorMode =
  | "default"
  | "high-contrast-dark"
  | "high-contrast-light"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "monochrome";

interface AccessibilityState {
  textSize: TextSize;
  colorMode: ColorMode;
  dyslexiaFont: boolean;
  highlightLinks: boolean;
  setTextSize: (size: TextSize) => void;
  setColorMode: (mode: ColorMode) => void;
  setDyslexiaFont: (val: boolean) => void;
  setHighlightLinks: (val: boolean) => void;
  resetAccessibility: () => void;
}

const AccessibilityContext = createContext<AccessibilityState>({
  textSize: "normal",
  colorMode: "default",
  dyslexiaFont: false,
  highlightLinks: false,
  setTextSize: () => {},
  setColorMode: () => {},
  setDyslexiaFont: () => {},
  setHighlightLinks: () => {},
  resetAccessibility: () => {},
});

const STORAGE_KEY = "smart_rto_accessibility_settings";

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [textSize, setTextSizeState] = useState<TextSize>("normal");
  const [colorMode, setColorModeState] = useState<ColorMode>("default");
  const [dyslexiaFont, setDyslexiaFontState] = useState(false);
  const [highlightLinks, setHighlightLinksState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.textSize) setTextSizeState(parsed.textSize);
        if (parsed.colorMode) setColorModeState(parsed.colorMode);
        if (parsed.dyslexiaFont !== undefined) setDyslexiaFontState(parsed.dyslexiaFont);
        if (parsed.highlightLinks !== undefined) setHighlightLinksState(parsed.highlightLinks);
      }
    } catch {
      // Ignore storage read error
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply text size to root
    const root = document.documentElement;
    root.classList.remove("text-size-sm", "text-size-normal", "text-size-lg", "text-size-xl");
    root.classList.add(`text-size-${textSize}`);

    // Apply color mode to root
    root.classList.remove(
      "color-default",
      "color-high-contrast-dark",
      "color-high-contrast-light",
      "color-protanopia",
      "color-deuteranopia",
      "color-tritanopia",
      "color-monochrome"
    );
    root.classList.add(`color-${colorMode}`);

    // Dyslexia & Highlight
    if (dyslexiaFont) {
      root.classList.add("dyslexia-friendly-font");
    } else {
      root.classList.remove("dyslexia-friendly-font");
    }

    if (highlightLinks) {
      root.classList.add("highlight-all-links");
    } else {
      root.classList.remove("highlight-all-links");
    }

    // Persist to local storage
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          textSize,
          colorMode,
          dyslexiaFont,
          highlightLinks,
        })
      );
    } catch {
      // Ignore
    }
  }, [textSize, colorMode, dyslexiaFont, highlightLinks, mounted]);

  function setTextSize(size: TextSize) {
    setTextSizeState(size);
  }

  function setColorMode(mode: ColorMode) {
    setColorModeState(mode);
  }

  function setDyslexiaFont(val: boolean) {
    setDyslexiaFontState(val);
  }

  function setHighlightLinks(val: boolean) {
    setHighlightLinksState(val);
  }

  function resetAccessibility() {
    setTextSizeState("normal");
    setColorModeState("default");
    setDyslexiaFontState(false);
    setHighlightLinksState(false);
  }

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        colorMode,
        dyslexiaFont,
        highlightLinks,
        setTextSize,
        setColorMode,
        setDyslexiaFont,
        setHighlightLinks,
        resetAccessibility,
      }}
    >
      {/* SVG Colorblind Filters */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          {/* Protanopia: Red-Blind Filter */}
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0, 0, 0
                      0.558, 0.442, 0, 0, 0
                      0, 0.242, 0.758, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>

          {/* Deuteranopia: Green-Blind Filter */}
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0, 0, 0
                      0.7, 0.3, 0, 0, 0
                      0, 0.3, 0.7, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>

          {/* Tritanopia: Blue-Blind Filter */}
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95, 0.05, 0, 0, 0
                      0, 0.433, 0.567, 0, 0
                      0, 0.475, 0.525, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
        </defs>
      </svg>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
