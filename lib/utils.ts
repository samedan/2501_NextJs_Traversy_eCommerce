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

// Format number witj Deacimal places
// 49.99 -> 49=int, 99=dec
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}
