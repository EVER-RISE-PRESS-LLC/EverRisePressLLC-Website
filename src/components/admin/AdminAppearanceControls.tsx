"use client";

import { Minus, Moon, Plus, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAdminAppearance } from "./AdminThemeProvider";

export function AdminAppearanceControls() {
  const { theme, toggleTheme, scale, decreaseScale, increaseScale, resetScale, hydrated } =
    useAdminAppearance();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </TooltipContent>
        </Tooltip>

        <div className="mx-1 h-5 w-px bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={decreaseScale}
              disabled={scale <= 90}
              aria-label="Decrease text size"
            >
              <Minus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Decrease UI size</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={resetScale}
              className="min-w-11 cursor-pointer rounded-md px-2 py-1.5 text-center text-xs font-medium tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Reset UI size to 100%"
            >
              {hydrated ? `${scale}%` : "100%"}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Reset to 100%</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={increaseScale}
              disabled={scale >= 150}
              aria-label="Increase text size"
            >
              <Plus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Increase UI size</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
