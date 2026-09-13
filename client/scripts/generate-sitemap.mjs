import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://www.abogadosbq.com";
const API_CMS = "https://api.abogadosbq.com/api/cms";
const OUT = path.resolve(__dirname, "../dist/sitemap.xml");

const escapeXml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const toDay = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10);
};

const urlEntry = (loc, lastmod, changefreq, priority) =>
  [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");

const renderSitemap = (posts) => {
  const entries = [
    urlEntry(`${SITE_URL}/`, toDay(), "weekly", "1.0"),
    urlEntry(`${SITE_URL}/noticias`, toDay(), "daily", "0.8"),
  ];
  for (const post of posts) {
    if (!post || !post.slug) continue;
    const lastmod = toDay(post.updatedAt || post.publishedAt);
    entries.push(urlEntry(`${SITE_URL}/noticias/${post.slug}`, lastmod, "monthly", "0.6"));
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
};

const main = async () => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(API_CMS, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const posts = (data.posts || []).filter((post) => post.status === "published");
    await writeFile(OUT, renderSitemap(posts), "utf8");
    console.log(`sitemap: ${posts.length} noticias -> ${OUT}`);
  } catch (error) {
    console.warn(`sitemap: no se pudo generar (${error.message}); se conserva el sitemap estatico`);
  }
};

main();
