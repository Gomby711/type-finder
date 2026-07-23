const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("typeFinderDesktop", {
  isDesktopApp: true,
  platform: process.platform,
  getVersion: () => ipcRenderer.invoke("app:version"),
  checkForUpdate: () => ipcRenderer.invoke("update:check"),
  installUpdate: () => ipcRenderer.send("update:install"),
  onUpdateAvailable: (cb) =>
    ipcRenderer.on("update:available", (_e, version) => cb(version)),
  onUpdateDownloaded: (cb) =>
    ipcRenderer.on("update:downloaded", (_e, version) => cb(version)),
  onUpdateError: (cb) =>
    ipcRenderer.on("update:error", (_e, message) => cb(message)),
});

// Injects a small floating "update available" widget into the page. This
// only ever runs inside the desktop app shell — the live website itself is
// untouched, since window.typeFinderDesktop only exists here.
window.addEventListener("DOMContentLoaded", () => {
  if (process.platform !== "win32") return;

  const style = document.createElement("style");
  style.textContent = `
    #tf-update-banner {
      position: fixed;
      bottom: 16px;
      right: 16px;
      z-index: 2147483647;
      display: none;
      align-items: center;
      gap: 10px;
      max-width: 300px;
      padding: 12px 14px;
      border-radius: 14px;
      background: #0f172a;
      color: #fff;
      font: 500 13px/1.4 -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    #tf-update-banner button {
      background: #e11d48;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 6px 12px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    #tf-update-banner button:hover {
      background: #be123c;
    }
    #tf-update-banner button:disabled {
      opacity: 0.6;
      cursor: default;
    }
  `;
  document.head.appendChild(style);

  const banner = document.createElement("div");
  banner.id = "tf-update-banner";
  banner.innerHTML =
    '<span id="tf-update-text">A new version is ready.</span>' +
    '<button id="tf-update-btn" type="button">Update now</button>';
  document.body.appendChild(banner);

  const btn = banner.querySelector("#tf-update-btn");
  const text = banner.querySelector("#tf-update-text");

  window.typeFinderDesktop.onUpdateDownloaded((version) => {
    text.textContent = `Version ${version} is ready to install.`;
    banner.style.display = "flex";
  });

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.textContent = "Restarting…";
    window.typeFinderDesktop.installUpdate();
  });
});
