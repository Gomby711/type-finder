import type { FontCategory } from "../types";

export const CATEGORY_STYLES: Record<FontCategory, { bg: string; text: string }> = {
  "sans-serif": { bg: "bg-sky-100", text: "text-sky-700" },
  serif: { bg: "bg-amber-100", text: "text-amber-800" },
  display: { bg: "bg-rose-100", text: "text-rose-700" },
  handwriting: { bg: "bg-emerald-100", text: "text-emerald-700" },
  monospace: { bg: "bg-slate-200", text: "text-slate-700" },
};

export const CATEGORY_LABELS: Record<FontCategory, string> = {
  "sans-serif": "Sans Serif",
  serif: "Serif",
  display: "Display",
  handwriting: "Handwriting",
  monospace: "Monospace",
};
