import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://www.abogadosbq.com";
const API_CMS = "https://api.abogadosbq.com/api/cms";
const DIST = path.resolve(__dirname, "../dist");
const TEMPLATE = path.join(DIST, "index.html");

const escapeText = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeAttr = (value) => escapeText(value).replace(/"/g, "&quot;");

const absoluteUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

const setMeta = (html, key, value) => {
  const escaped = escapeAttr(value);
  const pattern = new RegExp(`(<meta\\s+(?:property|name)="${key}"\\s+content=")[^"]*(")`, "i");
  if (pattern.test(html)) return html.replace(pattern, `$1${escaped}$2`);
  return html.replace("</head>", `  <meta property="${key}" content="${escaped}" />\n  </head>`);
};

const setCanonical = (html, url) =>
  html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/i, `$1${escapeAttr(url)}$2`);

const stripOgImageSize = (html) =>
  html
    .replace(/\s*<meta\s+property="og:image:width"\s+content="[^"]*"\s*\/?>/i, "")
    .replace(/\s*<meta\s+property="og:image:height"\s+content="[^"]*"\s*\/?>/i, "");

const renderPost = (template, post) => {
  const url = `${SITE_URL}/noticias/${post.slug}`;
  const title = `${post.title} | Abogados Barranquilla`;
  const description =
    post.excerpt ||
    post.content.replace(/\s+/g, " ").trim().slice(0, 155) ||
    "Noticias jurídicas del estudio Abogados BQ en Barranquilla.";
  const image = absoluteUrl(post.coverImage);

  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeText(title)}</title>`);
  html = setMeta(html, "description", description);
  html = setMeta(html, "og:title", post.title);
  html = setMeta(html, "og:description", description);
  html = setMeta(html, "og:url", url);
  html = setMeta(html, "twitter:title", post.title);
  html = setMeta(html, "twitter:description", description);
  if (image) {
    html = stripOgImageSize(html);
    html = setMeta(html, "og:image", image);
    html = setMeta(html, "twitter:image", image);
  }
  html = setCanonical(html, url);
  return html;
};

const main = async () => {
  try {
    const template = await readFile(TEMPLATE, "utf8");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(API_CMS, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const posts = (data.posts || []).filter(
      (post) => post.status === "published" && post.slug && /^[a-z0-9._-]+$/i.test(post.slug)
    );
    const dir = path.join(DIST, "noticias");
    await mkdir(dir, { recursive: true });
    for (const post of posts) {
      await writeFile(path.join(dir, `${post.slug}.html`), renderPost(template, post), "utf8");
    }
    console.log(`prerender: ${posts.length} noticias -> ${dir}`);
  } catch (error) {
    console.warn(`prerender: no se pudo generar (${error.message})`);
  }
};

main();
