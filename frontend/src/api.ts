/// <reference types="vite/client" />

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path}`;
}
