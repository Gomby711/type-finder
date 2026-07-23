const CHUNK_SIZE = 20;

/** Injects <link> stylesheets for the given Google Font family names, chunked to keep each URL short. */
export function ensureGoogleFontsLoaded(families: string[]) {
  for (let i = 0; i < families.length; i += CHUNK_SIZE) {
    const chunk = families.slice(i, i + CHUNK_SIZE);
    const params = chunk
      .map((name) => `family=${encodeURIComponent(name)}:wght@400;700`)
      .join("&");
    const href = `https://fonts.googleapis.com/css2?${params}&display=swap`;

    if (document.querySelector(`link[data-gf-chunk="${i}"]`)) continue;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.gfChunk = String(i);
    document.head.appendChild(link);
  }
}
