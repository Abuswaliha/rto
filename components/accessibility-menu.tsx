"use client";

import { useState, useRef, useEffect } from "react";
import {
  Accessibility,
  Check,
  Eye,
  Palette,
  RotateCcw,
  Sparkles,
  Type,
  X,
} from "lucide-react";
import { useAccessibility, ColorMode, TextSize } from "./accessibility-provider";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

const COLOR_MODES: Array<{
  id: ColorMode;
  label: string;
  desc: string;
  icon: string;
  badge?: string;
}> = [
  {
    id: "default",
    label: "Standard Colors",
    desc: "Default Smart RTO theme",
    icon: "🎨",
  },
  {
    id: "high-contrast-dark",
    label: "High Contrast Dark",
    desc: "Deep black background with sharp amber/cyan text",
    icon: "🌙",
    badge: "AAA Contrast",
  },
  {
    id: "high-contrast-light",
    label: "High Contrast Light",
    desc: "Clean white background with stark black borders",
    icon: "☀️",
    badge: "AAA Contrast",
  },
  {
    id: "protanopia",
    label: "Protanopia (Red-Blind)",
    desc: "Blue-based palette with clear status contrast",
    icon: "🔴",
    badge: "Color Blind",
  },
  {
    id: "deuteranopia",
    label: "Deuteranopia (Green-Blind)",
    desc: "Blue-based palette with clear status contrast",
    icon: "🟢",
    badge: "Color Blind",
  },
  {
    id: "tritanopia",
    label: "Tritanopia (Blue-Blind)",
    desc: "Orange-based palette with clear status contrast",
    icon: "🔵",
    badge: "Color Blind",
  },
  {
    id: "monochrome",
    label: "Monochrome / Grayscale",
    desc: "Pure black, gray, and white display",
    icon: "🔳",
  },
];

const TEXT_SIZES: Array<{
  id: TextSize;
  label: string;
  desc: string;
  symbol: string;
}> = [
  { id: "sm", label: "Small (90%)", desc: "Compact layout", symbol: "A-" },
  { id: "normal", label: "Normal (100%)", desc: "Default size", symbol: "A" },
  { id: "lg", label: "Large (115%)", desc: "Enhanced readability", symbol: "A+" },
  { id: "xl", label: "Extra Large (130%)", desc: "Maximum legibility", symbol: "A++" },
];

/**
 * Top-Nav Inline Accessibility Toolbar (A- A A+ and Color Mode switcher using shadcn UI)
 */
export function TopNavAccessibilityControls() {
  const { textSize, setTextSize, colorMode, setColorMode } = useAccessibility();
  const [openDropdown, setOpenDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs" ref={menuRef}>
      {/* Text Zoom Group */}
      <div className="flex items-center rounded-lg border border-white/20 bg-black/20 p-0.5 backdrop-blur-xs">
        {TEXT_SIZES.map((sz) => (
          <Button
            key={sz.id}
            type="button"
            variant={textSize === sz.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setTextSize(sz.id)}
            title={sz.label}
            className={`h-6 px-1.5 py-0 text-[11px] font-bold ${
              textSize === sz.id
                ? "bg-[#167c74] text-white hover:bg-[#167c74]"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {sz.symbol}
          </Button>
        ))}
      </div>

      {/* Color Mode Quick Dropdown */}
      <div className="relative">
        <Button
          type="button"
          variant={colorMode !== "default" ? "default" : "outline"}
          size="sm"
          onClick={() => setOpenDropdown((prev) => !prev)}
          className={`h-7 gap-1.5 px-2.5 text-[11px] font-bold ${
            colorMode !== "default"
              ? "bg-[#167c74] text-white border-[#167c74]"
              : "border-white/20 bg-black/20 text-white hover:bg-white/10"
          }`}
          title="Color Blindness & Contrast Settings"
        >
          <Palette size={13} />
          <span>
            {colorMode === "default"
              ? "Color Mode"
              : COLOR_MODES.find((c) => c.id === colorMode)?.label || "Color Mode"}
          </span>
        </Button>

        {openDropdown && (
          <Card className="absolute right-0 top-9 z-50 w-72 p-3 shadow-2xl animate-in fade-in zoom-in-95 border-[#cfe3dd] bg-white">
            <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Palette size={14} className="text-[#167c74]" />
                <CardTitle className="text-xs">Color Blind & Contrast</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                onClick={() => setOpenDropdown(false)}
              >
                <X size={13} />
              </Button>
            </CardHeader>

            <CardContent className="p-0 mt-2 space-y-1 max-h-60 overflow-y-auto pr-1">
              {COLOR_MODES.map((mode) => {
                const active = colorMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setColorMode(mode.id);
                      setOpenDropdown(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl p-2 text-left transition-all ${
                      active
                        ? "border border-[#cfe3dd] bg-[#edf7f4] text-[#167c74]"
                        : "hover:bg-slate-50 text-[#152321]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{mode.icon}</span>
                      <div>
                        <span className="block text-xs font-bold leading-tight">{mode.label}</span>
                        <span className="text-[10px] text-[#5e6f68]">{mode.desc}</span>
                      </div>
                    </div>
                    {active && <Check size={14} className="text-[#167c74]" />}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Accessibility Modal Dialog built strictly with shadcn UI components
 */
export function AccessibilityModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    textSize,
    setTextSize,
    colorMode,
    setColorMode,
    dyslexiaFont,
    setDyslexiaFont,
    highlightLinks,
    setHighlightLinks,
    resetAccessibility,
  } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
      <Card className="w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 border-[#cfe3dd] bg-white space-y-6">
        {/* Modal Header */}
        <CardHeader className="p-0 flex flex-row items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#ddf3ef] text-[#167c74]">
              <Accessibility size={22} />
            </div>
            <div>
              <CardTitle className="text-base font-extrabold text-[#152321]">
                Accessibility & Visual Assistance
              </CardTitle>
              <CardDescription className="text-xs text-[#5e6f68]">
                Customize font zoom levels, color blindness filters, and reading aids.
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 rounded-full p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </Button>
        </CardHeader>

        {/* Modal Content */}
        <CardContent className="p-0 space-y-6 max-h-[65vh] overflow-y-auto pr-1">
          {/* 1. Font Size / Zoom Controls */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#0f7655]">
                1. Text Size & Page Zoom
              </Label>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {TEXT_SIZES.find((s) => s.id === textSize)?.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TEXT_SIZES.map((size) => {
                const isSelected = textSize === size.id;
                return (
                  <Button
                    key={size.id}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setTextSize(size.id)}
                    className={`h-auto flex flex-col items-center justify-center p-3 text-center rounded-2xl ${
                      isSelected
                        ? "bg-[#167c74] text-white ring-2 ring-[#167c74]/20"
                        : "border-[#dce8e5] bg-white hover:bg-[#f4fbf8] text-[#152321]"
                    }`}
                  >
                    <strong className="text-base font-black">{size.symbol}</strong>
                    <span className="mt-1 text-[10px] opacity-80">{size.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 2. Color Blindness & High Contrast Modes */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#0f7655]">
                2. Color Blindness & Contrast Filters
              </Label>
              <Badge variant="secondary" className="text-[10px]">
                {COLOR_MODES.find((c) => c.id === colorMode)?.label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {COLOR_MODES.map((mode) => {
                const isSelected = colorMode === mode.id;
                return (
                  <Card
                    key={mode.id}
                    onClick={() => setColorMode(mode.id)}
                    className={`cursor-pointer p-3.5 transition-all hover:scale-[1.01] ${
                      isSelected
                        ? "border-[#167c74] bg-[#edf7f4] ring-2 ring-[#167c74]/20 shadow-xs"
                        : "border-[#dce8e5] bg-white hover:border-[#167c74]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{mode.icon}</span>
                        <div>
                          <strong className="block text-xs font-bold text-[#152321]">
                            {mode.label}
                          </strong>
                          <span className="text-[10px] text-[#5e6f68] leading-tight block">
                            {mode.desc}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check size={16} className="text-[#167c74] shrink-0" />}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 3. Additional Visual Aids */}
          <div className="space-y-2.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-[#0f7655]">
              3. Visual Reading Aids
            </Label>

            <div className="space-y-2">
              <Card className="p-3.5 border-[#cfe3dd] bg-[#f9fbfb]">
                <label className="flex cursor-pointer items-center justify-between">
                  <div>
                    <strong className="block text-xs text-[#152321]">
                      Dyslexia-Friendly Typography
                    </strong>
                    <span className="text-[10px] text-[#5e6f68]">
                      Applies enhanced letter-spacing and high-legibility character forms
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={dyslexiaFont}
                    onChange={(e) => setDyslexiaFont(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#167c74]"
                  />
                </label>
              </Card>

              <Card className="p-3.5 border-[#cfe3dd] bg-[#f9fbfb]">
                <label className="flex cursor-pointer items-center justify-between">
                  <div>
                    <strong className="block text-xs text-[#152321]">
                      Highlight Interactive Links & Buttons
                    </strong>
                    <span className="text-[10px] text-[#5e6f68]">
                      Adds high-visibility focus indicators around all interactive targets
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={highlightLinks}
                    onChange={(e) => setHighlightLinks(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#167c74]"
                  />
                </label>
              </Card>
            </div>
          </div>
        </CardContent>

        {/* Modal Footer */}
        <CardFooter className="p-0 pt-4 border-t border-slate-100 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={resetAccessibility}
            className="gap-1.5 text-xs text-[#5e6f68]"
          >
            <RotateCcw size={14} /> Reset Defaults
          </Button>

          <Button size="sm" onClick={onClose} className="px-6 font-bold">
            Done
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
