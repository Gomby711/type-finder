const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

const SITE_URL = "https://tf.evtlee.com";

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 480,
    minHeight: 640,
    autoHideMenuBar: true,
    backgroundColor: "#fdf1f8",
    icon: path.join(__dirname, "build", "icon.png"),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Launch maximized so the image view fills the screen like it does in a
  // maximized browser tab on the site, instead of a small fixed 1360x900 window.
  mainWindow.once("ready-to-show", () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.loadURL(SITE_URL);

  // Open any target=_blank / external links (font store links, etc.) in the
  // user's real browser instead of another app window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function send(channel, ...args) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args);
  }
}

app.whenReady().then(() => {
  createWindow();

  if (process.platform === "win32") {
    autoUpdater.autoDownload = true;
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// --- Auto update wiring (Windows only, per product requirement) ---
autoUpdater.on("update-available", (info) => send("update:available", info.version));
autoUpdater.on("update-downloaded", (info) => send("update:downloaded", info.version));
autoUpdater.on("error", (err) => send("update:error", err ? err.message : "Unknown error"));

ipcMain.handle("update:check", () => {
  if (process.platform !== "win32") return null;
  return autoUpdater.checkForUpdates();
});

ipcMain.on("update:install", () => {
  // Quits the app, installs the downloaded update, and relaunches the new
  // version automatically.
  autoUpdater.quitAndInstall();
});

ipcMain.handle("app:version", () => app.getVersion());
