import { API_BASE } from "@/lib/api-config";

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const meAdmin = () => request<{ authenticated: boolean }>("/auth/me");

export const loginAdmin = (password: string) =>
  request<{ authenticated: boolean }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });

export const logoutAdmin = () => request<{ authenticated: boolean }>("/auth/logout", { method: "POST" });
