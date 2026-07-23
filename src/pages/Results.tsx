import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useAppState } from "../context/AppContext";
import { matchFonts } from "../lib/matchFonts";
import { fontStoreUrl } from "../data/fonts";
import { CATEGORY_STYLES, CATEGORY_LABELS } from "../lib/categoryStyles";
import { isDesktopApp } from "../lib/isDesktopApp";
import { addFontHistoryEntry } from "../lib/fontHistory";
import type { FontCategory, FontMatch, FontSource } from "../types";

const CATEGORIES: { value: FontCategory; label: string }[] = (
  Object.keys(CATEGORY_LABELS) as FontCategory[]
).map((value) => ({ value, label: CATEGORY_LABELS[value] }));

const SOURCES: { value: FontSource; label: string }[] = [
  { value: "google", label: "Google Fonts" },
  { value: "adobe", label: "Adobe Fonts" },
];

const FALLBACK_STACK: Record<FontCategory, string> = {
  "sans-serif": "Arial, Helvetica, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  display: "Impact, Arial, sans-serif",
  handwriting: "'Brush Script MT', cursive",
  monospace: "'Courier New', monospace",
};

const PAGE_SIZE = 30;
const MAX_PAGE_BUTTONS = 7;

function previewStyle(font: FontMatch, fontSize: number) {
  return {
    fontFamily:
      font.source === "google"
        ? `"${font.name}", sans-serif`
        : FALLBACK_STACK[font.category],
    fontSize: `${fontSize}px`,
    lineHeight: 1.2,
  };
}

export default function Results() {
  const navigate = useNavigate();
  const { searchedText, sourceBox, imageSrc } = useAppState();
  const [customText, setCustomText] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [checkedCategories, setCheckedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [checkedSources, setCheckedSources] = useState<Set<string>>(new Set());
  const [condensedOnly, setCondensedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!imageSrc) navigate("/");
  }, [imageSrc, navigate]);

  const allMatches = useMemo(() => matchFonts(sourceBox), [sourceBox]);

  useEffect(() => {
    if (!isDesktopApp || !imageSrc || !sourceBox || !searchedText) return;
    addFontHistoryEntry({
      imageSrc,
      searchedText,
      sourceBox,
      matchCount: allMatches.length,
    });
    // Record once per visit to this results page — not on every filter change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const matches = useMemo(() => {
    return allMatches.filter((f) => {
      if (checkedCategories.size && !checkedCategories.has(f.category))
        return false;
      if (checkedSources.size && !checkedSources.has(f.source)) return false;
      if (condensedOnly && !f.condensed) return false;
      return true;
    });
  }, [allMatches, checkedCategories, checkedSources, condensedOnly]);

  useEffect(() => {
    setPage(1);
  }, [checkedCategories, checkedSources, condensedOnly, sourceBox]);

  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleMatches = matches.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const previewText = customText.trim() || searchedText || "Sample";

  function pageNumbers(): (number | "…")[] {
    if (totalPages <= MAX_PAGE_BUTTONS) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const nums = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    const sorted = [...nums].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
    const out: (number | "…")[] = [];
    sorted.forEach((n, i) => {
      if (i > 0 && n - (sorted[i - 1] as number) > 1) out.push("…");
      out.push(n);
    });
    return out;
  }

  function toggleIn(set: Set<string>, setter: (s: Set<string>) => void, value: string) {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  }

  if (!imageSrc) return null;

  const filtersContent = (
    <>
        <div className="mb-6">
          <h3 className="font-medium text-xs uppercase tracking-wide text-neutral-500 mb-2.5">
            Source
          </h3>
          <div className="space-y-2">
            {SOURCES.map((s) => (
              <label
                key={s.value}
                className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checkedSources.has(s.value)}
                  onChange={() =>
                    toggleIn(checkedSources, setCheckedSources, s.value)
                  }
                  className="accent-rose-600"
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-xs uppercase tracking-wide text-neutral-500 mb-2.5">
            Categories
          </h3>
          <div className="space-y-2">
            {CATEGORIES.map((c) => (
              <label
                key={c.value}
                className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checkedCategories.has(c.value)}
                  onChange={() =>
                    toggleIn(checkedCategories, setCheckedCategories, c.value)
                  }
                  className="accent-rose-600"
                />
                {c.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-xs uppercase tracking-wide text-neutral-500 mb-2.5">
            Width
          </h3>
          <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={condensedOnly}
              onChange={(e) => setCondensedOnly(e.target.checked)}
              className="accent-rose-600"
            />
            Condensed only
          </label>
        </div>
    </>
  );

  return (
    <main className="flex-1 flex flex-col lg:flex-row min-h-0">
      <aside className="hidden lg:block w-72 shrink-0 border-r border-white/60 bg-white/60 backdrop-blur-lg p-6 overflow-y-auto">
        <h2 className="font-semibold text-neutral-900 mb-5">Filters</h2>
        {filtersContent}
      </aside>

      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative ml-auto h-full w-[85vw] max-w-xs bg-white p-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-neutral-900">Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-1 text-neutral-500 hover:text-neutral-800"
              >
                <X size={18} />
              </button>
            </div>
            {filtersContent}
          </div>
        </div>
      )}

      <section className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="border-b border-white/60 bg-white/60 backdrop-blur-lg px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white/80 px-3 py-1.5 text-sm font-medium text-neutral-700 shrink-0"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 min-w-0 truncate">
            Results for{" "}
            <span className="bg-neutral-900 text-white px-2.5 py-0.5 rounded-lg">
              {searchedText || "…"}
            </span>
          </h1>
          <button
            onClick={() => navigate("/editor")}
            className="flex items-center gap-1 text-sm font-medium text-rose-700 hover:text-rose-800 shrink-0"
          >
            <ArrowLeft size={14} /> Back to Image
          </button>
          <span className="text-sm text-neutral-500 shrink-0">
            {matches.length} fonts
          </span>
        </div>

        <div className="border-b border-white/60 bg-white/60 backdrop-blur-lg px-4 py-3 sm:px-6 flex items-center gap-3 sm:gap-4 flex-wrap">
          <input
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Type your own text"
            className="flex-1 min-w-[140px] rounded-lg border border-neutral-200 bg-white/80 px-3 py-1.5 text-sm outline-none focus:border-rose-400"
          />
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="rounded-lg border border-neutral-200 bg-white/80 px-2 py-1.5 text-sm outline-none"
          >
            {[24, 32, 48, 64, 96].map((s) => (
              <option key={s} value={s}>
                {s}px
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-neutral-200/70">
          {visibleMatches.map((font, i) => {
            const cat = CATEGORY_STYLES[font.category];
            return (
              <div
                key={font.id}
                className={`px-4 py-5 sm:px-6 sm:py-6 flex flex-col sm:flex-row items-start gap-3 sm:gap-6 ${
                  i % 2 === 1 ? "bg-white/40" : "bg-white/70"
                }`}
              >
                <div className="flex items-center gap-3 w-full sm:w-auto sm:contents">
                  <div className="w-9 h-9 shrink-0 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-sm font-semibold">
                    {font.name[0]}
                  </div>

                  <div className="flex-1 min-w-0 sm:hidden">
                    <span className="font-semibold text-neutral-900">
                      {font.name}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="hidden sm:flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-semibold text-neutral-900">
                      {font.name}
                    </span>
                    <span
                      className={`text-xs font-medium rounded-full px-2 py-0.5 ${cat.bg} ${cat.text}`}
                    >
                      {CATEGORY_LABELS[font.category]}
                      {font.condensed ? " · Condensed" : ""}
                    </span>
                    <span className="text-sm text-neutral-400">
                      By {font.foundry}
                    </span>
                  </div>
                  <div className="flex sm:hidden items-center gap-2 flex-wrap mb-1.5">
                    <span
                      className={`text-xs font-medium rounded-full px-2 py-0.5 ${cat.bg} ${cat.text}`}
                    >
                      {CATEGORY_LABELS[font.category]}
                      {font.condensed ? " · Condensed" : ""}
                    </span>
                    <span className="text-xs text-neutral-400">
                      By {font.foundry}
                    </span>
                  </div>
                  <div
                    className="truncate text-neutral-900"
                    style={previewStyle(font, fontSize)}
                  >
                    {previewText}
                  </div>
                  {font.source === "adobe" && (
                    <p className="text-xs text-neutral-400 mt-1">
                      Preview unavailable here — Adobe Fonts requires a
                      licensed web project to embed.
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 w-full sm:w-auto">
                  <span className="text-sm text-neutral-500">
                    {font.source === "google" ? "Free" : "Adobe Fonts"}
                  </span>
                  <a
                    href={fontStoreUrl(font)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700 transition-colors whitespace-nowrap"
                  >
                    Get this font <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            );
          })}

          {matches.length === 0 && (
            <div className="p-12 text-center text-neutral-400">
              No fonts match the selected filters.
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-6 flex items-center justify-center gap-1.5 flex-wrap">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-300 bg-white/70 text-neutral-600 hover:bg-white disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>

              {pageNumbers().map((n, i) =>
                n === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-neutral-400">
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      n === currentPage
                        ? "bg-neutral-900 text-white"
                        : "border border-neutral-300 bg-white/70 text-neutral-700 hover:bg-white"
                    }`}
                  >
                    {n}
                  </button>
                ),
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-300 bg-white/70 text-neutral-600 hover:bg-white disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
