import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History as HistoryIcon, Trash2 } from "lucide-react";
import { useAppState } from "../context/AppContext";
import { isDesktopApp } from "../lib/isDesktopApp";
import {
  getFontHistory,
  removeFontHistoryEntry,
  clearFontHistory,
  timeAgo,
  type FontHistoryEntry,
} from "../lib/fontHistory";

export default function History() {
  const navigate = useNavigate();
  const { setImageSrc, setTextBoxes, setSourceBox, setSearchedText } =
    useAppState();
  const [entries, setEntries] = useState<FontHistoryEntry[]>([]);

  useEffect(() => {
    if (!isDesktopApp) {
      navigate("/");
      return;
    }
    setEntries(getFontHistory());
  }, [navigate]);

  function viewEntry(entry: FontHistoryEntry) {
    setTextBoxes([]);
    setImageSrc(entry.imageSrc);
    setSourceBox(entry.sourceBox);
    setSearchedText(entry.searchedText);
    navigate("/results");
  }

  function removeEntry(id: string) {
    setEntries(removeFontHistoryEntry(id));
  }

  function clearAll() {
    setEntries(clearFontHistory());
  }

  if (!isDesktopApp) return null;

  return (
    <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
      <div className="max-w-2xl w-full mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft size={15} /> Back to Home
        </button>

        <div className="flex items-center gap-2 mb-1">
          <HistoryIcon size={20} className="text-slate-800" />
          <h1 className="text-xl font-semibold text-neutral-900">
            Font History
          </h1>
        </div>
        <p className="text-sm text-neutral-400 mb-6">
          Only visible to you, on this device.
        </p>

        {entries.length === 0 ? (
          <p className="text-sm text-neutral-400 mt-10 text-center">
            No searches yet — identify a font and it'll show up here.
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white/70 p-3 hover:border-rose-200 transition-colors"
              >
                <img
                  src={entry.imageSrc}
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.visibility = "hidden";
                  }}
                  className="w-12 h-12 shrink-0 rounded-lg object-cover bg-neutral-100"
                />
                <button
                  onClick={() => viewEntry(entry)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="text-sm font-medium text-neutral-900 truncate">
                    {entry.searchedText || "Untitled search"}
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {entry.matchCount} fonts · {timeAgo(entry.createdAt)}
                  </div>
                </button>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="shrink-0 p-1.5 text-neutral-400 hover:text-rose-600"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <button
              onClick={clearAll}
              className="w-full text-center text-xs font-medium text-neutral-400 hover:text-rose-600 pt-2"
            >
              Clear all history
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
