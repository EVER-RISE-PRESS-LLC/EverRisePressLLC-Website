"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const THEME_KEY = "everise-admin-theme";
const SCALE_KEY = "everise-admin-scale";
const SCALE_MIN = 90;
const SCALE_MAX = 150;
const SCALE_STEP = 10;
const SCALE_DEFAULT = 100;

type Theme = "dark" | "light";

interface AdminAppearanceContextValue {
  theme: Theme;
  scale: number;
  hydrated: boolean;
  toggleTheme: () => void;
  decreaseScale: () => void;
  increaseScale: () => void;
  resetScale: () => void;
}

const AdminAppearanceContext = createContext<AdminAppearanceContextValue | null>(null);

function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(THEME_KEY) === "light" ? "light" : null;
}

function readStoredScale(): number | null {
  if (typeof window === "undefined") return null;
  const value = parseInt(localStorage.getItem(SCALE_KEY) || "", 10);
  if (!Number.isFinite(value)) return null;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(value / SCALE_STEP) * SCALE_STEP));
}

function applyToDocument(theme: Theme, scale: number) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.fontSize = scale === SCALE_DEFAULT ? "" : `${scale}%`;
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [scale, setScale] = useState<number>(SCALE_DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    const savedTheme = readStoredTheme();
    const savedScale = readStoredScale();
    setTheme(savedTheme ?? "dark");
    setScale(savedScale ?? SCALE_DEFAULT);
    applyToDocument(savedTheme ?? "dark", savedScale ?? SCALE_DEFAULT);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyToDocument(theme, scale);
  }, [theme, scale, hydrated]);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.fontSize = "";
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const decreaseScale = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(SCALE_MIN, prev - SCALE_STEP);
      localStorage.setItem(SCALE_KEY, String(next));
      return next;
    });
  }, []);

  const increaseScale = useCallback(() => {
    setScale((prev) => {
      const next = Math.min(SCALE_MAX, prev + SCALE_STEP);
      localStorage.setItem(SCALE_KEY, String(next));
      return next;
    });
  }, []);

  const resetScale = useCallback(() => {
    setScale(SCALE_DEFAULT);
    localStorage.setItem(SCALE_KEY, String(SCALE_DEFAULT));
    setHydrated(true);
  }, []);

  return (
    <AdminAppearanceContext.Provider
      value={{ theme, scale, hydrated, toggleTheme, decreaseScale, increaseScale, resetScale }}
    >
      <div className={cn("min-h-svh bg-background text-foreground antialiased")}>
        {children}
      </div>
      <Toaster theme={theme} richColors position="bottom-right" />
    </AdminAppearanceContext.Provider>
  );
}

export function useAdminAppearance() {
  const context = useContext(AdminAppearanceContext);
  if (!context) {
    throw new Error("useAdminAppearance must be used within AdminThemeProvider");
  }
  return context;
}
