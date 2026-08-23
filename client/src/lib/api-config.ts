const rawUrl = (import.meta.env.VITE_API_URL as string | undefined) || "https://api.abogadosbq.com";
const origin = rawUrl.replace(/\/+$/, "");

export const API_BASE = origin ? `${origin}/api` : "/api";
