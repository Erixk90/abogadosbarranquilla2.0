import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { CmsContext } from "@/context/CmsContext";
import {
  CmsMediaAsset,
  CmsPost,
  CmsService,
  CmsSettings,
  CmsState,
  createPostDraft,
  createServiceDraft,
  defaultHomeServices,
  defaultHomeSettings,
  normalizePost,
  sortPosts,
  sortServices,
} from "@/lib/cms";
import {
  deletePost as deletePostRequest,
  deleteMedia as deleteMediaRequest,
  deleteService as deleteServiceRequest,
  fetchCmsState,
  uploadMedia as uploadMediaRequest,
  upsertPost,
  upsertService,
  upsertSettings,
} from "@/lib/cms-api";

export const CmsProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<CmsState>({
    posts: [],
    media: [],
    settings: defaultHomeSettings,
    services: defaultHomeServices,
  });

  useEffect(() => {
    let cancelled = false;

    void fetchCmsState()
      .then((nextState) => {
        if (!cancelled) {
          setState(nextState);
        }
      })
      .catch((error) => {
        console.error("Failed to load CMS state", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const nextState = await fetchCmsState();
      setState(nextState);
    } catch (error) {
      console.error("Failed to refresh CMS state", error);
    }
  }, []);

  const value = useMemo(() => {
    const posts = sortPosts(state.posts);
    const services = sortServices(state.services);
    const media = [...state.media].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    const publishedPosts = posts.filter((post) => post.status === "published");
    const featuredPosts = publishedPosts.filter((post) => post.featured).slice(0, 3);

    const getPostBySlug = (slug: string) => publishedPosts.find((post) => post.slug === slug);
    const getPostById = (id: string) => state.posts.find((post) => post.id === id);
    const getMediaById = (id: string) => state.media.find((asset) => asset.id === id);

    const savePost = (post: CmsPost) => {
      const existingSlugs = state.posts.filter((item) => item.id !== post.id).map((item) => item.slug);
      const normalized = normalizePost(post, existingSlugs);

      setState((current) => {
        const nextPosts = current.posts.some((item) => item.id === normalized.id)
          ? current.posts.map((item) => (item.id === normalized.id ? normalized : item))
          : [...current.posts, normalized];
        return { ...current, posts: nextPosts };
      });

      void upsertPost(normalized)
        .then(() => refresh())
        .catch((error) => {
          console.error("Failed to save post", error);
        });

      return normalized;
    };

    const deletePost = (id: string) => {
      setState((current) => ({
        ...current,
        posts: current.posts.filter((item) => item.id !== id),
      }));

      void deletePostRequest(id)
        .then(() => refresh())
        .catch((error) => {
          console.error("Failed to delete post", error);
        });
    };

    const saveSettings = (settings: CmsSettings) => {
      setState((current) => ({ ...current, settings }));

      void upsertSettings(settings)
        .then(() => refresh())
        .catch((error) => {
          console.error("Failed to save settings", error);
        });
    };

    const saveService = (service: CmsService) => {
      const normalized: CmsService = {
        ...service,
        updatedAt: new Date().toISOString(),
        order: Number(service.order) || 1,
      };

      setState((current) => {
        const nextServices = current.services.some((item) => item.id === normalized.id)
          ? current.services.map((item) => (item.id === normalized.id ? normalized : item))
          : [...current.services, normalized];
        return { ...current, services: nextServices };
      });

      void upsertService(normalized)
        .then(() => refresh())
        .catch((error) => {
          console.error("Failed to save service", error);
        });

      return normalized;
    };

    const deleteService = (id: string) => {
      setState((current) => ({
        ...current,
        services: current.services.filter((item) => item.id !== id),
      }));

      void deleteServiceRequest(id)
        .then(() => refresh())
        .catch((error) => {
          console.error("Failed to delete service", error);
        });
    };

    const uploadMedia = async ({ file, alt }: { file: File; alt?: string }) => {
      const mediaAsset = await uploadMediaRequest(file, alt);

      setState((current) => ({
        ...current,
        media: [mediaAsset, ...current.media.filter((item) => item.id !== mediaAsset.id)],
      }));

      return mediaAsset;
    };

    const deleteMedia = async (id: string) => {
      await deleteMediaRequest(id);
      setState((current) => ({
        ...current,
        media: current.media.filter((item) => item.id !== id),
      }));
    };

    return {
      posts,
      publishedPosts,
      featuredPosts,
      media,
      settings: state.settings,
      services,
      getPostBySlug,
      getPostById,
      savePost,
      deletePost,
      draftPost: createPostDraft,
      getMediaById,
      saveSettings,
      saveService,
      deleteService,
      draftService: createServiceDraft,
      uploadMedia,
      deleteMedia,
    };
  }, [state]);

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
};
