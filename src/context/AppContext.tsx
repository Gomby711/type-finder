import { createContext, useContext, useState, type ReactNode } from "react";
import type { TextBox } from "../types";

interface AppState {
  imageSrc: string | null;
  setImageSrc: (src: string | null) => void;
  textBoxes: TextBox[];
  setTextBoxes: (boxes: TextBox[]) => void;
  searchedText: string;
  setSearchedText: (text: string) => void;
  sourceBox: TextBox | null;
  setSourceBox: (box: TextBox | null) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [searchedText, setSearchedText] = useState("");
  const [sourceBox, setSourceBox] = useState<TextBox | null>(null);

  return (
    <AppContext.Provider
      value={{
        imageSrc,
        setImageSrc,
        textBoxes,
        setTextBoxes,
        searchedText,
        setSearchedText,
        sourceBox,
        setSourceBox,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}
