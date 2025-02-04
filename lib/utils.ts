import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert prisma object into regular JS objkect
// 'T' typescrypt generic for any type
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
