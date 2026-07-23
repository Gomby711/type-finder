// Rasterizes the site's public/favicon.svg into the desktop app's Windows
// icon set, so the installer/exe/taskbar icon always matches the site's
// favicon. Run with: node_modules/.bin/electron scripts/generate-icon.js
const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

const SIZE = 1024;
const SVG_PATH = path.join(__dirname, "..", "..", "public", "favicon.svg");
const OUT_DIR = path.join(__dirname, "..", "build");
const PNG_PATH = path.join(OUT_DIR, "icon.png");
const ICO_PATH = path.join(OUT_DIR, "icon.ico");

async function main() {
  await app.whenReady();

  const svg = fs.readFileSync(SVG_PATH, "utf-8");
  const html = `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent;}
    svg{display:block;width:${SIZE}px;height:${SIZE}px;}
  </style></head><body>${svg}</body></html>`;

  const win = new BrowserWindow({
    width: SIZE,
    height: SIZE,
    show: false,
    transparent: true,
    webPreferences: { offscreen: true },
  });

  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  await new Promise((r) => setTimeout(r, 200));

  const image = await win.webContents.capturePage();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(PNG_PATH, image.toPNG());

  const { default: pngToIco } = await import("png-to-ico");
  const icoBuffer = await pngToIco([PNG_PATH]);
  fs.writeFileSync(ICO_PATH, icoBuffer);

  console.log(`Wrote ${PNG_PATH} and ${ICO_PATH}`);
  app.exit(0);
}

main().catch((err) => {
  console.error(err);
  app.exit(1);
});
