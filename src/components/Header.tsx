import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, History, Trash2, X } from "lucide-react";
import { isDesktopApp } from "../lib/isDesktopApp";
import { useAppState } from "../context/AppContext";
import {
  getFontHistory,
  removeFontHistoryEntry,
  clearFontHistory,
  type FontHistoryEntry,
} from "../lib/fontHistory";

const DOWNLOAD_URL =
  "https://github.com/Gomby711/type-finder/releases/latest/download/TypeFinder-Setup.exe";

function timeAgo(ts: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Header() {
  const navigate = useNavigate();
  const { setImageSrc, setTextBoxes, setSourceBox, setSearchedText } =
    useAppState();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [entries, setEntries] = useState<FontHistoryEntry[]>([]);

  function openHistory() {
    setEntries(getFontHistory());
    setHistoryOpen(true);
  }

  function viewEntry(entry: FontHistoryEntry) {
    setTextBoxes([]);
    setImageSrc(entry.imageSrc);
    setSourceBox(entry.sourceBox);
    setSearchedText(entry.searchedText);
    setHistoryOpen(false);
    navigate("/results");
  }

  function removeEntry(id: string) {
    setEntries(removeFontHistoryEntry(id));
  }

  function clearAll() {
    setEntries(clearFontHistory());
  }

  return (
    <header className="px-4 py-3 sm:px-6 sm:py-4 lg:px-12 flex items-center justify-between gap-3 backdrop-blur-sm bg-white/30 border-b border-white/50 sticky top-0 z-20">
      <Link
        to="/"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0"
      >
        <div className="bg-slate-900 px-2.5 py-2 rounded-xl text-white flex items-center justify-center gap-0.5 w-9 h-9 shrink-0">
          <span className="font-bold text-lg leading-none">T</span>
          <span className="w-[2px] h-4 bg-white animate-[blink_1s_step-end_infinite]" />
        </div>
        <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">
          TypeFinder
        </span>
      </Link>

      {isDesktopApp ? (
        <button
          onClick={openHistory}
          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-800 border border-slate-200 px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium transition-colors shadow-sm"
          title="Your past searches on this device"
        >
          <History size={15} className="shrink-0" />
          <span>Font History</span>
        </button>
      ) : (
        <a
          href={DOWNLOAD_URL}
          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium transition-colors shadow-sm"
          title="Download the TypeFinder desktop app for Windows"
        >
          <Download size={15} className="shrink-0" />
          <span className="hidden sm:inline">Download App</span>
          <span className="sm:hidden">App</span>
        </a>
      )}

      {historyOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setHistoryOpen(false)}
          />
          <div className="relative ml-auto h-full w-[90vw] max-w-sm bg-white p-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-neutral-900">Font History</h2>
              <button
                onClick={() => setHistoryOpen(false)}
                className="p-1 text-neutral-500 hover:text-neutral-800"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-neutral-400 mb-5">
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
                    className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3 hover:border-rose-200 transition-colors"
                  >
                    <img
                      src={entry.imageSrc}
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.visibility = "hidden";
                      }}
                      className="w-11 h-11 shrink-0 rounded-lg object-cover bg-neutral-100"
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
        </div>
      )}
    </header>
  );
}
