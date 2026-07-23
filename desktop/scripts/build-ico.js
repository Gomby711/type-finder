// Step 2 (plain Node, no Electron): packs the rendered PNG sizes into a
// single multi-resolution build/icon.ico and cleans up the intermediates.
const fs = require("fs");
const path = require("path");

const SIZES = [16, 24, 32, 48, 64, 128, 256];
const OUT_DIR = path.join(__dirname, "..", "build");
const PNG_PATH = path.join(OUT_DIR, "icon.png");
const ICO_PATH = path.join(OUT_DIR, "icon.ico");

async function main() {
  const pngPaths = SIZES.map((size) => path.join(OUT_DIR, `icon-${size}.png`));
  for (const p of pngPaths) {
    if (!fs.existsSync(p)) {
      throw new Error(`Missing ${p} — run "npm run render-icon-pngs" first`);
    }
  }

  fs.copyFileSync(path.join(OUT_DIR, "icon-256.png"), PNG_PATH);

  const { default: pngToIco } = await import("png-to-ico");
  const icoBuffer = await pngToIco(pngPaths);
  fs.writeFileSync(ICO_PATH, icoBuffer);

  for (const p of pngPaths) fs.unlinkSync(p);

  console.log(`Wrote ${PNG_PATH} and ${ICO_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
