const rawUrl = (import.meta.env.VITE_API_URL as string | undefined) || "";
const origin = rawUrl.replace(/\/+$/, "");

export const API_BASE = origin ? `${origin}/api` : "/api";
