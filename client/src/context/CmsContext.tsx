import { createContext, useContext } from "react";
import type { CmsMediaAsset, CmsPost, CmsService, CmsSettings } from "@/lib/cms";

type CmsContextValue = {
  posts: CmsPost[];
  publishedPosts: CmsPost[];
  featuredPosts: CmsPost[];
  media: CmsMediaAsset[];
  settings: CmsSettings;
  services: CmsService[];
  getPostBySlug: (slug: string) => CmsPost | undefined;
  getPostById: (id: string) => CmsPost | undefined;
  savePost: (post: CmsPost) => CmsPost;
  deletePost: (id: string) => void;
  draftPost: () => CmsPost;
  saveSettings: (settings: CmsSettings) => void;
  saveService: (service: CmsService) => CmsService;
  deleteService: (id: string) => void;
  draftService: () => CmsService;
  uploadMedia: (input: { file: File; alt?: string }) => Promise<CmsMediaAsset>;
  deleteMedia: (id: string) => Promise<void>;
};

export const CmsContext = createContext<CmsContextValue | null>(null);

export const useCms = () => {
  const context = useContext(CmsContext);

  if (!context) {
    throw new Error("useCms must be used within a CmsProvider");
  }

  return context;
};
