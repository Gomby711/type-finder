import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="px-6 py-4 lg:px-12 flex items-center justify-between backdrop-blur-sm bg-white/30 border-b border-white/50 sticky top-0 z-20">
      <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="bg-slate-900 px-2.5 py-2 rounded-xl text-white flex items-center justify-center gap-0.5 w-9 h-9">
          <span className="font-bold text-lg leading-none">T</span>
          <span className="w-[2px] h-4 bg-white animate-[blink_1s_step-end_infinite]" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          TypeFinder
        </span>
      </Link>
    </header>
  );
}
