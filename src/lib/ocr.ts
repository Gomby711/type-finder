import { createWorker, type Word } from "tesseract.js";
import type { TextBox } from "../types";

let nextId = 1;

let workerPromise: ReturnType<typeof createWorker> | null = null;
function getWorker() {
  if (!workerPromise) workerPromise = createWorker("eng");
  return workerPromise;
}

function flattenWords(words: Word[] | undefined, into: Word[]) {
  if (words) into.push(...words);
}

/**
 * Runs OCR on an image and returns one TextBox per detected word, in
 * percent-of-image coordinates so boxes stay aligned regardless of how
 * large the image is rendered on screen.
 *
 * Word-level data only comes back when `blocks` output is explicitly
 * requested — the default recognize() result nests nothing below page text.
 */
export async function detectTextBoxes(
  imageSrc: string,
  naturalWidth: number,
  naturalHeight: number,
): Promise<TextBox[]> {
  const worker = await getWorker();
  const { data } = await worker.recognize(imageSrc, {}, { blocks: true });

  const words: Word[] = [];
  for (const block of data.blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        flattenWords(line.words, words);
      }
    }
  }

  const boxes: TextBox[] = [];
  for (const word of words) {
    if (!word.text.trim() || word.confidence < 40) continue;
    const { x0, y0, x1, y1 } = word.bbox;
    const w = x1 - x0;
    const h = y1 - y0;
    if (w <= 0 || h <= 0) continue;

    boxes.push({
      id: `box-${nextId++}`,
      x: (x0 / naturalWidth) * 100,
      y: (y0 / naturalHeight) * 100,
      width: (w / naturalWidth) * 100,
      height: (h / naturalHeight) * 100,
      text: word.text,
      rotation: 0,
    });
  }
  return boxes;
}

/**
 * Crops the given percent-based region out of an image and runs OCR on just
 * that crop, so a user-drawn marquee selection can resolve to real text.
 */
export async function recognizeCrop(
  imageSrc: string,
  naturalWidth: number,
  naturalHeight: number,
  box: TextBox,
): Promise<string> {
  const px = {
    x: (box.x / 100) * naturalWidth,
    y: (box.y / 100) * naturalHeight,
    w: (box.width / 100) * naturalWidth,
    h: (box.height / 100) * naturalHeight,
  };

  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = px.w;
  canvas.height = px.h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, px.x, px.y, px.w, px.h, 0, 0, px.w, px.h);

  const worker = await getWorker();
  const { data } = await worker.recognize(canvas.toDataURL());
  return data.text.trim();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function makeManualBox(
  xPct: number,
  yPct: number,
  wPct: number,
  hPct: number,
): TextBox {
  return {
    id: `box-${nextId++}`,
    x: xPct,
    y: yPct,
    width: wPct,
    height: hPct,
    text: "",
    rotation: 0,
  };
}
