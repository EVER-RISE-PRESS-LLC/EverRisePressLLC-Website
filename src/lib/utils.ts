import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Renders DB copy without em/en dashes. Numeric ranges (C5-C6, 2010-2012)
 * keep a plain hyphen; prose dashes become commas.
 */
export function cleanDashes(text: string): string {
  return text
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1-$2")
    .replace(/\s*[–—]\s*/g, ", ");
}
