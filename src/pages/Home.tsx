import { useNavigate } from "react-router-dom";
import { useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import { ArrowUp, Layers, Sparkles, Type, X, Zap } from "lucide-react";
import { useAppState } from "../context/AppContext";
import FloatingLogoBackground from "../components/FloatingLogoBackground";

export default function Home() {
  const navigate = useNavigate();
  const { setImageSrc, setTextBoxes, setSourceBox, setSearchedText } =
    useAppState();
  const [query, setQuery] = useState("");
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openImage(src: string) {
    setTextBoxes([]);
    setSourceBox(null);
    setSearchedText("");
    setImageSrc(src);
    navigate("/editor");
  }

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Please upload a jpg, png, or webp.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPastedImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const file = Array.from(e.clipboardData.items)
      .find((item) => item.type.startsWith("image/"))
      ?.getAsFile();
    if (file) {
      e.preventDefault();
      handleFile(file);
    }
  }

  function handleSearch() {
    if (pastedImage) {
      openImage(pastedImage);
      return;
    }
    if (!query.trim()) return;
    setError(null);
    setChecking(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setChecking(false);
      openImage(query.trim());
    };
    img.onerror = () => {
      setChecking(false);
      setError(
        "Couldn't load that as an image. Paste a direct image link (ending in .jpg/.png/.webp), paste a copied image, or upload one instead.",
      );
    };
    img.src = query.trim();
  }

  return (
    <main className="flex-1 relative px-6 lg:px-12 flex flex-col items-center justify-center overflow-hidden">
      <FloatingLogoBackground />

      <div className="relative z-10 text-center max-w-3xl mx-auto mb-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-sm font-medium mb-4 shadow-sm border border-rose-200">
          <Sparkles className="w-4 h-4" />
          <span>Font detection for designers</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-4 leading-[1.1]">
          Identify any font in{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-500">
            seconds.
          </span>
        </h1>
        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Paste a copied image, drop a saved one, or enter a site or image
          URL. We'll scan it for text — you pick which piece to identify.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto mt-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-rose-100 p-3">
        <div
          onDragOver={(e: DragEvent) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e: DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2 transition-all ${
            dragOver
              ? "border-rose-300 bg-rose-50/50 ring-4 ring-rose-50"
              : "border-rose-100"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {pastedImage ? (
            <div className="flex items-center gap-2 pl-2 flex-1 min-w-0">
              <img
                src={pastedImage}
                alt=""
                className="w-9 h-9 rounded-lg object-cover shrink-0"
              />
              <span className="text-sm text-slate-600 truncate">
                Image ready to search
              </span>
              <button
                onClick={() => setPastedImage(null)}
                className="text-slate-400 hover:text-slate-600 shrink-0 p-1"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Paste an image, or enter a site / image URL…"
              className="flex-1 min-w-0 px-3 py-2.5 text-base outline-none bg-transparent placeholder:text-slate-400"
            />
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload an image"
            className="shrink-0 rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ArrowUp size={17} />
          </button>
          <button
            onClick={handleSearch}
            disabled={checking || (!query.trim() && !pastedImage)}
            className="shrink-0 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm shadow-rose-200 disabled:opacity-30 disabled:shadow-none"
          >
            {checking ? "Checking…" : "Detect"}
          </button>
        </div>

        {error && <p className="text-sm text-rose-600 mt-3 px-2">{error}</p>}
        <p className="text-xs text-slate-400 mt-3 px-2 pb-1">
          Tip — copy an image (right-click → Copy Image), then click the bar
          and press Ctrl+V.
        </p>
      </div>

      <div className="relative z-10 mt-6 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/80 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 shrink-0 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
            <Zap className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Runs right in your browser
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
              No round-trip to a server — nothing you upload gets stored.
            </p>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/80 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 shrink-0 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              1,300+ real fonts
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
              Real fonts from Google Fonts and Adobe Fonts — never a fake
              name.
            </p>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/80 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 shrink-0 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
            <Type className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Always a real download
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
              Every match links to its real source — free or licensed.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
