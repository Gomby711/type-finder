import { Link, useNavigate } from "react-router-dom";
import { Download, History } from "lucide-react";
import { isDesktopApp } from "../lib/isDesktopApp";

const DOWNLOAD_URL =
  "https://github.com/Gomby711/type-finder/releases/latest/download/TypeFinder-Setup.exe";

export default function Header() {
  const navigate = useNavigate();

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
          onClick={() => navigate("/history")}
          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium transition-colors shadow-sm"
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
    </header>
  );
}
