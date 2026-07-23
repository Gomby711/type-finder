declare global {
  interface Window {
    typeFinderDesktop?: { isDesktopApp: true };
  }
}

export const isDesktopApp =
  typeof window !== "undefined" && Boolean(window.typeFinderDesktop?.isDesktopApp);
