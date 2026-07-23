import { FONT_CATALOG } from "../data/fonts";

const ROWS = 16;
const TILES_PER_ROW = 12;

// Only Google Fonts are actually loaded/renderable client-side (see
// loadGoogleFonts.ts) — Adobe entries would silently fall back to a
// generic typeface, so keep the marquee to fonts that truly render.
const RENDERABLE_FONTS = FONT_CATALOG.filter((f) => f.source === "google");

// Cycled per row so the marquee reads as a designed, alternating pattern
// rather than one flat wash of color — tuned to the rose/indigo/teal brand.
// Kept faint (low alpha) so it stays a background texture, not competing
// with the actual page content on top of it.
const ROW_COLORS = [
  "text-rose-900/25",
  "text-indigo-900/22",
  "text-teal-900/22",
  "text-fuchsia-900/22",
  "text-slate-800/20",
  "text-rose-800/22",
];

// Each row cycles through a different slice of the catalog so the whole
// background shows off font variety instead of repeating the same handful.
function rowFonts(row: number) {
  const offset = row * 9;
  return Array.from(
    { length: TILES_PER_ROW },
    (_, i) => RENDERABLE_FONTS[(offset + i * 4) % RENDERABLE_FONTS.length],
  );
}

export default function FloatingLogoBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 flex flex-col justify-between py-4 -rotate-6 scale-125">
        {Array.from({ length: ROWS }, (_, r) => {
          const tiles = rowFonts(r);
          const strip = [...tiles, ...tiles];
          const direction = r % 2 === 0 ? "wtf-scroll-left" : "wtf-scroll-right";
          const duration = 42 + r * 9;
          return (
            <div
              key={r}
              className={`flex w-max items-center gap-12 whitespace-nowrap ${ROW_COLORS[r % ROW_COLORS.length]}`}
              style={{ animation: `${direction} ${duration}s linear infinite` }}
            >
              {strip.map((font, i) => (
                <span
                  key={i}
                  className="text-4xl font-semibold"
                  style={{ fontFamily: `"${font.name}", sans-serif` }}
                >
                  {font.name}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 42%, rgba(255,241,242,0.9) 0%, rgba(255,241,242,0.5) 45%, rgba(255,241,242,0) 75%)",
        }}
      />
    </div>
  );
}
