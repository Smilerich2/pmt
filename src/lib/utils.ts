import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Strip accent markers (*text*) from a title for plain-text display */
export function stripAccent(title: string): string {
  return title.replace(/\*([^*]+)\*/g, "$1");
}
