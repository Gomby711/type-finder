import type { TextBox } from "../types";

export interface FontHistoryEntry {
  id: string;
  createdAt: number;
  /** thumbnail (pasted/uploaded images) or the original URL (site/image links) */
  imageSrc: string;
  isRemoteUrl: boolean;
  searchedText: string;
  sourceBox: TextBox;
  matchCount: number;
}

// Desktop-app-only feature: this lives in the Electron window's own storage
// partition, which is scoped to the OS user account that installed the app,
// so each Windows user who runs the app only ever sees their own history.
const STORAGE_KEY = "tf_font_history_v1";
const MAX_ENTRIES = 30;
const THUMBNAIL_MAX_SIZE = 96;

export function getFontHistory(): FontHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFontHistory(entries: FontHistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // localStorage full/unavailable — history just won't persist this time.
  }
}

function makeThumbnail(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, THUMBNAIL_MAX_SIZE / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function addFontHistoryEntry(entry: {
  imageSrc: string;
  searchedText: string;
  sourceBox: TextBox;
  matchCount: number;
}): Promise<void> {
  const isRemoteUrl = !entry.imageSrc.startsWith("data:");
  const thumbnail = isRemoteUrl ? entry.imageSrc : await makeThumbnail(entry.imageSrc);

  const record: FontHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    imageSrc: thumbnail,
    isRemoteUrl,
    searchedText: entry.searchedText,
    sourceBox: entry.sourceBox,
    matchCount: entry.matchCount,
  };

  saveFontHistory([record, ...getFontHistory()]);
}

export function removeFontHistoryEntry(id: string): FontHistoryEntry[] {
  const next = getFontHistory().filter((e) => e.id !== id);
  saveFontHistory(next);
  return next;
}

export function clearFontHistory(): FontHistoryEntry[] {
  saveFontHistory([]);
  return [];
}
