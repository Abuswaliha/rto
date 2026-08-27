"use client";

import { useLanguage, languages, LanguageCode } from "./language-provider";
import { Check, Globe, Sparkles } from "lucide-react";

export function LanguageSection() {
  const { language, setLanguage } = useLanguage();

  return (
    <section className="my-8 rounded-3xl border border-[#cfe5df] bg-gradient-to-br from-[#f2f9f6] via-white to-[#e4f3ee] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#167c74] text-white shadow-md shadow-[#167c74]/20">
            <Globe size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0f7655]">
                Accessibility & Language
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#167c74]/10 px-2 py-0.5 text-[10px] font-bold text-[#167c74]">
                <Sparkles size={11} /> 11 Languages
              </span>
            </div>
            <h3 className="mt-0.5 text-xl font-extrabold text-[#152321]">
              Choose portal language / अपनी भाषा चुनें
            </h3>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs font-medium leading-relaxed text-[#5e6f68]">
        Select your preferred language. Smart RTO instantly updates all guidance, titles, button labels and service options across all pages.
      </p>

      {/* Language pill grid */}
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {languages.map((item) => {
          const active = language === item.code;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setLanguage(item.code as LanguageCode)}
              className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                active
                  ? "bg-[#167c74] text-white shadow-md shadow-[#167c74]/25 ring-2 ring-[#167c74] ring-offset-2"
                  : "border border-[#d0e2dc] bg-white text-[#263a33] hover:border-[#167c74] hover:bg-[#edf7f4] hover:shadow-sm"
              }`}
            >
              <span>{item.name}</span>
              {active ? (
                <Check size={14} className="shrink-0 text-white" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-[#cbdcd6] transition-colors group-hover:bg-[#167c74]" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
