import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Results from "./pages/Results";
import { FONT_CATALOG } from "./data/fonts";
import { ensureGoogleFontsLoaded } from "./lib/loadGoogleFonts";

export default function App() {
  useEffect(() => {
    ensureGoogleFontsLoaded(
      FONT_CATALOG.filter((f) => f.source === "google").map((f) => f.name),
    );
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="relative h-[100dvh] overflow-hidden flex flex-col bg-gradient-to-br from-rose-100 via-fuchsia-50 to-teal-100 text-slate-800">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-200/40 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            <Header />
            <div className="flex-1 flex flex-col min-h-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/editor" element={<Editor />} />
                <Route path="/results" element={<Results />} />
              </Routes>
            </div>
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
