import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const logout = () => {
  localStorage.removeItem("clerk-db-jwt");
  window.location.href = "/auth";
};
