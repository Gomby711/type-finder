// Step 1 (runs under Electron): rasterizes public/favicon.svg into the PNG
// sizes needed for a Windows .ico. Run with: electron scripts/render-icon-pngs.js
const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

const SIZES = [16, 24, 32, 48, 64, 128, 256];
const SVG_PATH = path.join(__dirname, "..", "..", "public", "favicon.svg");
const OUT_DIR = path.join(__dirname, "..", "build");

async function main() {
  await app.whenReady();

  const svg = fs.readFileSync(SVG_PATH, "utf-8");
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  const html = `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent;}
  </style></head><body>
    <script>
      const SIZES = ${JSON.stringify(SIZES)};
      window.renderAll = function() {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const out = {};
            for (const size of SIZES) {
              const canvas = document.createElement('canvas');
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, size, size);
              ctx.drawImage(img, 0, 0, size, size);
              out[size] = canvas.toDataURL('image/png');
            }
            resolve(out);
          };
          img.onerror = reject;
          img.src = ${JSON.stringify(svgDataUrl)};
        });
      };
    </script>
  </body></html>`;

  const win = new BrowserWindow({
    width: 300,
    height: 300,
    show: false,
    webPreferences: { offscreen: true },
  });

  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  const pngDataUrls = await win.webContents.executeJavaScript("window.renderAll()");
  win.destroy();

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const size of SIZES) {
    const base64 = pngDataUrls[size].replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(path.join(OUT_DIR, `icon-${size}.png`), Buffer.from(base64, "base64"));
  }

  console.log("Rendered icon PNGs:", SIZES.join(", "));
  app.quit();
}

main().catch((err) => {
  console.error(err);
  app.exit(1);
});
