"use client";

import { Minus, Moon, Plus, RotateCcw, SlidersHorizontal, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAdminAppearance } from "./AdminThemeProvider";

export function AdminAppearanceControls() {
  const { theme, toggleTheme, scale, decreaseScale, increaseScale, resetScale, hydrated } = useAdminAppearance();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Workspace appearance"><SlidersHorizontal className="size-[18px]" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 admin-appearance-menu">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => { if (value !== theme) toggleTheme(); }}>
          <DropdownMenuRadioItem value="light"><Sun className="size-4" /> Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark"><Moon className="size-4" /> Dark</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex justify-between">Workspace size <span className="tabular-nums" aria-live="polite">{hydrated ? scale : 100}%</span></DropdownMenuLabel>
        <DropdownMenuItem disabled={scale <= 90} onSelect={(event) => { event.preventDefault(); decreaseScale(); }}><Minus className="size-4" /> Smaller workspace</DropdownMenuItem>
        <DropdownMenuItem disabled={scale >= 150} onSelect={(event) => { event.preventDefault(); increaseScale(); }}><Plus className="size-4" /> Larger workspace</DropdownMenuItem>
        <DropdownMenuItem disabled={scale === 100} onSelect={(event) => { event.preventDefault(); resetScale(); }}><RotateCcw className="size-4" /> Reset size to 100%</DropdownMenuItem>
        <p className="px-3 py-2 text-xs leading-relaxed text-muted-foreground">Menus and dialogs stay at standard size.</p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
