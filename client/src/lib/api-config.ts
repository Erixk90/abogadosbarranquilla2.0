const configuredUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const fallbackUrl = import.meta.env.DEV ? "" : "https://api.abogadosbq.com";
const origin = (configuredUrl || fallbackUrl).replace(/\/+$/, "");

export const API_BASE = origin ? `${origin}/api` : "/api";
