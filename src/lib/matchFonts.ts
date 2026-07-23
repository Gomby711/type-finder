import { FONT_CATALOG } from "../data/fonts";
import type { FontMatch, TextBox } from "../types";

// Real-world images are overwhelmingly set in sans-serif, then serif/display;
// script and monospace show up far less often as "text found in a photo".
// This baseline just reflects that prior when we have no other signal.
const CATEGORY_BASELINE: Record<FontMatch["category"], number> = {
  "sans-serif": 5,
  serif: 4,
  display: 3,
  handwriting: 2,
  monospace: 1,
};

/**
 * Scores how well a font might match the selected text region. We don't have
 * a real recognition model, so the box's own aspect ratio (width / height,
 * both in percent of the image) is the only geometric cue available: a wide,
 * short box reads as tightly-set/condensed letterforms; a taller, squarer
 * box reads as normally-set or looser letterforms (serif, script).
 */
function scoreFont(font: FontMatch, box: TextBox | null): number {
  let score = CATEGORY_BASELINE[font.category];

  if (box && box.height > 0) {
    const aspect = box.width / box.height;

    if (aspect >= 3.2) {
      // wide relative to its own height -> looks condensed/tightly set
      score += font.condensed ? 6 : -2;
    } else if (aspect <= 1.6) {
      // tall/narrow crop -> looser, more expressive letterforms
      if (font.category === "handwriting") score += 5;
      if (font.category === "serif") score += 2;
      if (font.condensed) score -= 3;
    } else {
      // middle-of-the-road box -> favor normal-width sans/serif
      if (!font.condensed && (font.category === "sans-serif" || font.category === "serif")) {
        score += 3;
      }
    }
  }

  // small jitter so repeated searches on the same crop don't always render
  // in the exact same order, mirroring how a real matcher reports varying
  // confidence rather than a rigid ranking
  score += Math.random() * 1.5;

  return score;
}

export function matchFonts(box: TextBox | null): FontMatch[] {
  return [...FONT_CATALOG].sort(
    (a, b) => scoreFont(b, box) - scoreFont(a, box),
  );
}
