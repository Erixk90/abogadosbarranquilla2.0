import type { CmsMediaAsset, CmsPost, CmsService, CmsSettings, CmsState } from "@/lib/cms";
import { API_BASE } from "@/lib/api-config";

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const fetchCmsState = () => request<CmsState>("/cms");

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export const upsertPost = (post: CmsPost) =>
  request<CmsPost>(`/cms/posts${post.id ? `/${post.id}` : ""}`, {
    method: post.id ? "PUT" : "POST",
    body: JSON.stringify(post),
  });

export const deletePost = (id: string) =>
  request<{ ok: true }>(`/cms/posts/${id}`, { method: "DELETE" });

export const upsertSettings = (settings: CmsSettings) =>
  request<CmsSettings>("/cms/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });

export const upsertService = (service: CmsService) =>
  request<CmsService>(`/cms/services${service.id ? `/${service.id}` : ""}`, {
    method: service.id ? "PUT" : "POST",
    body: JSON.stringify(service),
  });

export const deleteService = (id: string) =>
  request<{ ok: true }>(`/cms/services/${id}`, { method: "DELETE" });

export const fetchMedia = () => request<CmsMediaAsset[]>("/cms/media");

export const uploadMedia = async (file: File, alt = "") => {
  const dataUrl = await fileToDataUrl(file);

  return request<CmsMediaAsset>("/cms/media", {
    method: "POST",
    body: JSON.stringify({
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      alt,
      dataUrl,
    }),
  });
};

export const deleteMedia = (id: string) => request<{ ok: true }>(`/cms/media/${id}`, { method: "DELETE" });
