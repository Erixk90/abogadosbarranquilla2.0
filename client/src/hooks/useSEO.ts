import { useEffect } from "react";

interface SeoOptions {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

const setMeta = (property: string, content: string) => {
  let el = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    if (property.startsWith("og:") || property.startsWith("twitter:")) {
      el.setAttribute("property", property);
    } else {
      el.setAttribute("name", property);
    }
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

export const useSEO = (options: SeoOptions) => {
  useEffect(() => {
    if (options.title) {
      document.title = options.title;
    }

    if (options.description) {
      setMeta("description", options.description);
      setMeta("og:description", options.ogDescription || options.description);
      setMeta("twitter:description", options.ogDescription || options.description);
    }

    if (options.ogTitle) {
      setMeta("og:title", options.ogTitle);
      setMeta("twitter:title", options.ogTitle);
    }

    if (options.ogImage) {
      setMeta("og:image", options.ogImage);
      setMeta("twitter:image", options.ogImage);
    }

    if (options.canonical) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", options.canonical);
    }
  }, [options.title, options.description, options.canonical, options.ogTitle, options.ogDescription, options.ogImage]);
};
