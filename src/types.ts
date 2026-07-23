export interface TextBox {
  id: string;
  /** all geometry is in percent (0-100) relative to the image's natural size */
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  rotation: number;
}

export type FontCategory =
  | "serif"
  | "sans-serif"
  | "display"
  | "handwriting"
  | "monospace";

export type FontSource = "google" | "adobe";

export interface FontMatch {
  id: string;
  /** real font family name */
  name: string;
  category: FontCategory;
  /** true for narrow/tightly-set letterforms (Oswald, Bebas Neue, Roboto Condensed, ...) */
  condensed: boolean;
  source: FontSource;
  /** designer/foundry credit; Google Fonts entries just show "Google Fonts" */
  foundry: string;
}
