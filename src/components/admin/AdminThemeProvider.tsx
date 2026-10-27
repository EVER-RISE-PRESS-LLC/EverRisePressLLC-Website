"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, type CSSProperties } from "react";
import { Toaster } from "@/components/ui/sonner";
import "./admin.css";

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

const APPEARANCE_EVENT = "everrise-admin-appearance";
const DEFAULT_SNAPSHOT = "light:100";
let volatileSnapshot = DEFAULT_SNAPSHOT;
let useVolatilePreferences = false;

function readSnapshot() {
  if (typeof window === "undefined") return DEFAULT_SNAPSHOT;
  if (useVolatilePreferences) return volatileSnapshot;
  try {
    const storedTheme = localStorage.getItem(THEME_KEY);
    const storedScale = Number.parseInt(localStorage.getItem(SCALE_KEY) ?? "", 10);
    const theme = storedTheme === "dark" ? "dark" : "light";
    const scale = Number.isFinite(storedScale)
      ? Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(storedScale / SCALE_STEP) * SCALE_STEP))
      : SCALE_DEFAULT;
    volatileSnapshot = `${theme}:${scale}`;
  } catch { useVolatilePreferences = true; }
  return volatileSnapshot;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(APPEARANCE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(APPEARANCE_EVENT, callback);
  };
}

function setPreference(theme: Theme, scale: number) {
  volatileSnapshot = `${theme}:${scale}`;
  try {
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(SCALE_KEY, String(scale));
  } catch { useVolatilePreferences = true; }
  window.dispatchEvent(new Event(APPEARANCE_EVENT));
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => DEFAULT_SNAPSHOT);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [themeValue, scaleValue] = snapshot.split(":");
  const theme = themeValue as Theme;
  const scale = Number(scaleValue);

  useEffect(() => {
    // Radix portals keep physical viewport coordinates. Theme the body while
    // admin is mounted, but scale only the workspace so popup positioning and
    // pointer targets are not multiplied a second time by body zoom.
    const body = document.body;
    const previousTheme = body.dataset.adminTheme;
    const previousDark = body.classList.contains("dark");
    const previousPortalRoot = body.classList.contains("admin-portal-root");
    body.dataset.adminTheme = theme;
    body.classList.add("admin-portal-root");
    body.classList.toggle("dark", theme === "dark");
    return () => {
      if (previousTheme === undefined) delete body.dataset.adminTheme;
      else body.dataset.adminTheme = previousTheme;
      body.classList.toggle("dark", previousDark);
      body.classList.toggle("admin-portal-root", previousPortalRoot);
    };
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const [currentTheme, currentScale] = readSnapshot().split(":");
    setPreference(currentTheme === "dark" ? "light" : "dark", Number(currentScale));
  }, []);
  const changeScale = useCallback((step: number) => {
    const [currentTheme, currentScale] = readSnapshot().split(":");
    setPreference(currentTheme as Theme, Math.min(SCALE_MAX, Math.max(SCALE_MIN, Number(currentScale) + step)));
  }, []);
  const decreaseScale = useCallback(() => changeScale(-SCALE_STEP), [changeScale]);
  const increaseScale = useCallback(() => changeScale(SCALE_STEP), [changeScale]);
  const resetScale = useCallback(() => {
    const [currentTheme] = readSnapshot().split(":");
    setPreference(currentTheme as Theme, SCALE_DEFAULT);
  }, []);

  return (
    <AdminAppearanceContext.Provider value={{ theme, scale, hydrated, toggleTheme, decreaseScale, increaseScale, resetScale }}>
      <div className={`admin-root ${theme === "dark" ? "dark" : ""}`} data-admin-theme={theme}
        style={{ zoom: `${scale}%`, "--admin-scale": scale / SCALE_DEFAULT } as CSSProperties}>
        {children}
      </div>
      <Toaster theme={theme} richColors position="bottom-right" />
    </AdminAppearanceContext.Provider>
  );
}

export function useAdminAppearance() {
  const context = useContext(AdminAppearanceContext);
  if (!context) throw new Error("useAdminAppearance must be used within AdminThemeProvider");
  return context;
}
