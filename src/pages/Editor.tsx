import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUp,
  RotateCw,
  Scan,
  Search,
  Trash2,
  Undo2,
  ZoomIn,
} from "lucide-react";
import { useAppState } from "../context/AppContext";
import { detectTextBoxes, recognizeCrop, makeManualBox } from "../lib/ocr";
import type { TextBox } from "../types";

type DragRect = { x0: number; y0: number; x1: number; y1: number };

export default function Editor() {
  const navigate = useNavigate();
  const {
    imageSrc,
    setImageSrc,
    textBoxes,
    setTextBoxes,
    setSourceBox,
    setSearchedText,
  } = useAppState();

  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const naturalSize = useRef({ w: 0, h: 0 });

  const [scanning, setScanning] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [marqueeMode, setMarqueeMode] = useState(false);
  const [dragRect, setDragRect] = useState<DragRect | null>(null);
  const [identifyingId, setIdentifyingId] = useState<string | null>(null);

  const runDetection = useCallback(async () => {
    if (!imageSrc) return;
    setScanning(true);
    setSelectedId(null);
    try {
      const { w, h } = naturalSize.current;
      const boxes = await detectTextBoxes(imageSrc, w, h);
      setTextBoxes(boxes);
    } finally {
      setScanning(false);
    }
  }, [imageSrc, setTextBoxes]);

  useEffect(() => {
    if (!imageSrc) {
      navigate("/");
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      naturalSize.current = { w: img.naturalWidth, h: img.naturalHeight };
      runDetection();
    };
    img.src = imageSrc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  function getPercentFromClient(clientX: number, clientY: number) {
    const rect = imgRef.current!.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    };
  }

  function handleStageMouseDown(e: React.MouseEvent) {
    if (!marqueeMode) return;
    const { x, y } = getPercentFromClient(e.clientX, e.clientY);
    setDragRect({ x0: x, y0: y, x1: x, y1: y });

    function onMove(ev: MouseEvent) {
      const { x: cx, y: cy } = getPercentFromClient(ev.clientX, ev.clientY);
      setDragRect((prev) => (prev ? { ...prev, x1: cx, y1: cy } : prev));
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setDragRect((prev) => {
        if (prev) finalizeMarquee(prev);
        return null;
      });
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function finalizeMarquee(rect: DragRect) {
    const x = Math.min(rect.x0, rect.x1);
    const y = Math.min(rect.y0, rect.y1);
    const width = Math.abs(rect.x1 - rect.x0);
    const height = Math.abs(rect.y1 - rect.y0);
    if (width < 1.5 || height < 1.5) return;

    const box = makeManualBox(x, y, width, height);
    setTextBoxes([...textBoxes, box]);
    setSelectedId(box.id);
    setMarqueeMode(false);
  }

  async function handleIdentify(box: TextBox) {
    let text = box.text.trim();
    if (!text) {
      setIdentifyingId(box.id);
      try {
        const { w, h } = naturalSize.current;
        text = (await recognizeCrop(imageSrc!, w, h, box)) || "Selected text";
        const updated = { ...box, text };
        setTextBoxes(textBoxes.map((b) => (b.id === box.id ? updated : b)));
        box = updated;
      } finally {
        setIdentifyingId(null);
      }
    }
    setSourceBox(box);
    setSearchedText(text);
    navigate("/results");
  }

  function handleRemove(id: string) {
    setTextBoxes(textBoxes.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function handleUploadNew(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setTextBoxes([]);
      setRotation(0);
      setScale(1);
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleReset() {
    setRotation(0);
    setScale(1);
    runDetection();
  }

  if (!imageSrc) return null;

  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 sm:p-10">
        <div
          onMouseDown={handleStageMouseDown}
          style={{
            transform: `rotate(${rotation}deg) scale(${scale})`,
            cursor: marqueeMode ? "crosshair" : "default",
          }}
          className="relative inline-block select-none transition-transform duration-150"
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Uploaded"
            draggable={false}
            className="max-h-[55vh] max-w-[92vw] sm:max-h-[65vh] sm:max-w-[80vw] block rounded shadow-2xl"
          />

          {dragRect && (
            <div
              className="absolute border-2 border-dashed border-rose-400 bg-rose-400/10"
              style={{
                left: `${Math.min(dragRect.x0, dragRect.x1)}%`,
                top: `${Math.min(dragRect.y0, dragRect.y1)}%`,
                width: `${Math.abs(dragRect.x1 - dragRect.x0)}%`,
                height: `${Math.abs(dragRect.y1 - dragRect.y0)}%`,
              }}
            />
          )}

          {textBoxes.map((box) => {
            const isSelected = box.id === selectedId;
            return (
              <div
                key={box.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!marqueeMode) setSelectedId(box.id);
                }}
                className={`absolute border-2 border-dashed cursor-pointer ${
                  isSelected
                    ? "border-rose-500 bg-rose-500/10"
                    : "border-neutral-500/60 bg-black/5 hover:border-rose-400"
                }`}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
              >
                {isSelected && (
                  <div className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-xl bg-white shadow-lg px-1 py-1 whitespace-nowrap z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIdentify(box);
                      }}
                      disabled={identifyingId === box.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Search size={14} />
                      {identifyingId === box.id
                        ? "Reading…"
                        : "Identify font"}
                    </button>
                    <div className="w-px h-5 bg-neutral-200" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(box.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-500 hover:bg-neutral-100"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-white text-sm font-medium flex items-center gap-3">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Scanning image for text…
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-white/60 bg-white/70 backdrop-blur-lg px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-center gap-3 sm:gap-7 flex-wrap overflow-y-auto max-h-[40vh]">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUploadNew(file);
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700"
        >
          <ArrowUp size={15} /> Upload new
        </button>

        <button
          onClick={() => setMarqueeMode((m) => !m)}
          className={`flex items-center gap-1.5 text-sm font-medium ${
            marqueeMode
              ? "text-rose-600"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <Scan size={15} />
          {marqueeMode ? "Draw a box on the image…" : "Select custom"}
        </button>

        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <RotateCw size={15} className="text-neutral-400" />
          <span className="w-8 sm:w-10 text-right text-neutral-400">-180°</span>
          <input
            type="range"
            min={-180}
            max={180}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-20 sm:w-40 accent-rose-500"
          />
          <span className="w-10 text-neutral-400">+180°</span>
          <input
            type="number"
            min={-180}
            max={180}
            value={rotation}
            onChange={(e) =>
              setRotation(
                Math.min(180, Math.max(-180, Number(e.target.value) || 0)),
              )
            }
            className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-neutral-800 outline-none focus:border-rose-400"
          />
          <span className="text-neutral-400">°</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <ZoomIn size={15} className="text-neutral-400" />
          <span className="w-8 sm:w-10 text-right text-neutral-400">50%</span>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-20 sm:w-40 accent-rose-500"
          />
          <span className="w-10 text-neutral-400">200%</span>
          <input
            type="number"
            min={50}
            max={200}
            value={Math.round(scale * 100)}
            onChange={(e) =>
              setScale(
                Math.min(200, Math.max(50, Number(e.target.value) || 100)) /
                  100,
              )
            }
            className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-neutral-800 outline-none focus:border-rose-400"
          />
          <span className="text-neutral-400">%</span>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          <Undo2 size={15} /> Reset
        </button>
      </div>
    </main>
  );
}
