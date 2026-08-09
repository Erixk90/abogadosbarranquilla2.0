import http from "node:http";
import { readFile, writeFile, mkdir, access, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID, timingSafeEqual, createHash } from "node:crypto";
import { createSessionStore } from "./session-store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "cms.json");
const uploadsDir = path.join(__dirname, "uploads");
const port = Number(process.env.PORT || 8787);
const adminPassword = process.env.ADMIN_PASSWORD || "admin-bq";
const corsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const sessionCookieName = "abq_session";
const sessionTtlMs = Number(process.env.SESSION_TTL_HOURS || 24 * 7) * 60 * 60 * 1000;
const sessionStore = await createSessionStore({ ttlMs: sessionTtlMs });
const maxUploadBytes = 6 * 1024 * 1024;
const defaultBodyLimit = 1024 * 1024;
const loginRateLimit = { maxAttempts: 5, windowMs: 15 * 60 * 1000 };

const securityLog = (event, ip, extra) => {
  const entry = `[${new Date().toISOString()}] ${event} ip=${ip}`;
  console.log(extra ? `${entry} ${extra}` : entry);
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const defaultSecurityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "X-DNS-Prefetch-Control": "off",
  "X-Permitted-Cross-Domain-Policies": "none",
};

const applySecurityHeaders = (res, extra = {}) => {
  for (const [key, value] of Object.entries({ ...defaultSecurityHeaders, ...extra })) {
    res.setHeader(key, value);
  }
};

const sendJson = (res, statusCode, payload) => {
  applySecurityHeaders(res, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.writeHead(statusCode);
  res.end(JSON.stringify(payload));
};

const sendUnauthorized = (res) => {
  sendJson(res, 401, { error: "Unauthorized" });
};

const sendText = (res, statusCode, payload, contentType = "text/plain; charset=utf-8") => {
  applySecurityHeaders(res, { "Content-Type": contentType });
  res.writeHead(statusCode);
  res.end(payload);
};

const isPathWithin = (base, target) => {
  const relative = path.relative(base, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
};

const detectImageType = (buffer) => {
  if (!buffer || buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mimeType: "image/jpeg", extension: ".jpg" };
  }

  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e &&
    buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a &&
    buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return { mimeType: "image/png", extension: ".png" };
  }

  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return { mimeType: "image/webp", extension: ".webp" };
  }

  if (buffer.toString("ascii", 0, 6) === "GIF87a" || buffer.toString("ascii", 0, 6) === "GIF89a") {
    return { mimeType: "image/gif", extension: ".gif" };
  }

  return null;
};

const safeEqual = (a, b) => {
  const aHash = createHash("sha256").update(String(a)).digest();
  const bHash = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(aHash, bHash);
};

const sanitizeHttpUrl = (value, fallback = "") => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;

  if (raw.startsWith("/")) {
    return raw;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // invalid URL
  }

  return fallback;
};

const loginAttempts = new Map();
const uploadRateMap = new Map();
const meRateMap = new Map();

const getClientIp = (req) => {
  if (process.env.TRUST_PROXY === "1") {
    return (req.headers["x-forwarded-for"] || "").split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  }
  return req.socket.remoteAddress || "unknown";
};

const isRateLimited = (key) => {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now - record.windowStart > loginRateLimit.windowMs) {
    loginAttempts.set(key, { windowStart: now, count: 0 });
    return { limited: false, retryAfterMs: 0 };
  }

  if (record.count >= loginRateLimit.maxAttempts) {
    return { limited: true, retryAfterMs: record.windowStart + loginRateLimit.windowMs - now };
  }

  return { limited: false, retryAfterMs: 0 };
};

const recordLoginAttempt = (key, success) => {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now - record.windowStart > loginRateLimit.windowMs) {
    loginAttempts.set(key, { windowStart: now, count: success ? 0 : 1 });
    return;
  }

  loginAttempts.set(key, { windowStart: record.windowStart, count: success ? 0 : record.count + 1 });
};

const getIpHitCount = (map, ip, windowMs = 60 * 1000) => {
  const now = Date.now();
  const record = map.get(ip);

  if (!record || now - record.windowStart > windowMs) {
    map.set(ip, { windowStart: now, count: 1 });
    return 1;
  }

  map.set(ip, { windowStart: record.windowStart, count: record.count + 1 });
  return record.count + 1;
};

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isValidId = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const makeSlug = (title, existingSlugs, fallbackId) => {
  const base = slugify(title) || "noticia";
  let candidate = base;
  let suffix = 2;

  while (existingSlugs.includes(candidate) && candidate !== fallbackId) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};

const sortPosts = (posts) =>
  [...posts].sort((a, b) => {
    const aTime = new Date(a.publishedAt ?? a.updatedAt).getTime();
    const bTime = new Date(b.publishedAt ?? b.updatedAt).getTime();
    return bTime - aTime;
  });

const sortServices = (services) =>
  [...services].sort((a, b) => a.order - b.order || b.updatedAt.localeCompare(a.updatedAt));

const defaultSettings = {
  hero: {
    title: "Excelencia Jurídica",
    highlight: "a Su Servicio",
    subtitle:
      "Con más de 20 años de experiencia, brindamos asesoría legal integral con la máxima profesionalidad y dedicación personalizada para cada cliente.",
    image: "",
    video: "",
    whatsappNumber: "573001477860",
    whatsappMessage: "Hola, me gustaría solicitar una consulta legal gratuita. ¿Podrían ayudarme?",
  },
  about: {
    title: "Nosotros",
    description:
      "Somos un estudio jurídico comprometido con la excelencia, la integridad y la obtención de resultados excepcionales para nuestros clientes.",
    image: "",
    imageAlt: "Equipo profesional del estudio jurídico",
    storyTitle: "Nuestra Historia",
    story: [
      "Fundado en 2003, nuestro estudio jurídico ha crecido hasta convertirse en una de las firmas legales más respetadas y confiables de la región.",
      "Nuestro equipo de abogados altamente calificados se especializa en diversas áreas del derecho, garantizando una representación integral y especializada para cada caso.",
      "Creemos firmemente en la importancia de construir relaciones duraderas con nuestros clientes, basadas en la confianza, la transparencia y resultados excepcionales.",
    ],
    missionTitle: "Nuestra Misión",
    mission:
      "Proporcionar servicios legales de la más alta calidad, combinando experiencia, innovación y un compromiso inquebrantable con la justicia. Trabajamos incansablemente para proteger los derechos e intereses de nuestros clientes, siempre con integridad y profesionalismo.",
    stats: [
      { icon: "scale", value: "1000+", label: "Casos Exitosos" },
      { icon: "users", value: "20+", label: "Años de Experiencia" },
      { icon: "award", value: "95%", label: "Casos Ganados" },
      { icon: "clock", value: "24/7", label: "Atención al Cliente" },
    ],
  },
  contact: {
    title: "Contacto",
    description:
      "Estamos aquí para ayudarle. Contáctenos para una consulta inicial gratuita y personalizada.",
    whatsappNumber: "573001477860",
    whatsappMessage: "Hola, me gustaría solicitar información sobre sus servicios legales",
    phoneLabel: "WhatsApp",
    phone: "+57 3001477860",
    email: "director@abogadosbq.com",
    address: "080001 Barranquilla",
    addressLink: "https://maps.google.com",
    hoursLabel: "Horario",
    hours: "Lunes a Domingo: 00:00 - 24:00",
    schedule: [
      { days: "Lunes - Viernes:", hours: "00:00 - 24:00" },
      { days: "Sábados:", hours: "00:00 - 24:00" },
      { days: "Domingos:", hours: "00:00 - 24:00" },
    ],
    emergencyNote: "* Consultas de emergencia disponibles 24/7",
  },
};

const sortMedia = (assets) =>
  [...assets].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

const sanitizeFileName = (value) =>
  value
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const extensionFromMime = (mimeType) => {
  const map = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };

  return map[mimeType] || ".bin";
};

const parseDataUrl = (value) => {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(value || "");
  if (!match) return null;

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
};

const readBody = (req, maxBytes = defaultBodyLimit) =>
  new Promise((resolve, reject) => {
    let raw = "";
    let totalBytes = 0;

    req.on("data", (chunk) => {
      totalBytes += chunk.length;
      raw += chunk.toString();
      if (totalBytes > maxBytes) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });

const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    const key = rawKey?.trim();
    if (!key) return acc;
    try {
      acc[key] = decodeURIComponent(rawValue.join("=") || "");
    } catch {
      acc[key] = rawValue.join("=") || "";
    }
    return acc;
  }, {});
};

const isRequestSecure = (req) =>
  Boolean(req.socket.encrypted) ||
  String(req.headers["x-forwarded-proto"] || "").split(",")[0]?.trim() === "https";

const getRequestBaseUrl = (req) => {
  const proto = isRequestSecure(req) ? "https" : "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  return `${proto}://${host}`;
};

const absolutizeMediaUrls = (value, baseUrl) => {
  if (typeof value === "string") {
    return value.startsWith("/media/") ? `${baseUrl}${value}` : value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => absolutizeMediaUrls(item, baseUrl));
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = absolutizeMediaUrls(item, baseUrl);
    }
    return out;
  }
  return value;
};

const applyCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  if (!origin) return;

  const allowed = corsOrigins.length > 0
    ? corsOrigins.includes(origin)
    : origin === `http://${req.headers.host}` || origin === `https://${req.headers.host}`;

  if (!allowed) return;

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");
};

const buildSessionCookie = (token, secure) =>
  `${sessionCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}; Max-Age=${Math.floor(sessionTtlMs / 1000)}`;

const clearSessionCookie = (secure) =>
  `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;

const ensureStore = async () => {
  await mkdir(dataDir, { recursive: true });
  await mkdir(uploadsDir, { recursive: true });

  try {
    await access(dataFile);
  } catch {
    await writeFile(dataFile, JSON.stringify({ posts: [], media: [], settings: defaultSettings, services: [] }, null, 2), "utf8");
  }
};

const readStore = async () => {
  await ensureStore();
  const raw = await readFile(dataFile, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return {
      posts: Array.isArray(parsed.posts) ? parsed.posts : [],
      media: Array.isArray(parsed.media) ? parsed.media : [],
      settings: parsed.settings && typeof parsed.settings === "object" ? parsed.settings : defaultSettings,
      services: Array.isArray(parsed.services) ? parsed.services : [],
    };
  } catch {
    return { posts: [], media: [], settings: defaultSettings, services: [] };
  }
};

const getSession = async (req) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[sessionCookieName];
  if (!token) return null;

  sessionStore.pruneExpired();
  return sessionStore.getSession(token) ? token : null;
};

const requireAuth = async (req, res) => {
  const session = await getSession(req);
  if (!session) {
    sendUnauthorized(res);
    return null;
  }

  return session;
};

const writeStoreQueue = [];
let writeLockActive = false;

const acquireWriteLock = () => new Promise((resolve) => {
  if (!writeLockActive) { writeLockActive = true; resolve(); return; }
  writeStoreQueue.push(resolve);
});

const releaseWriteLock = () => {
  if (writeStoreQueue.length > 0) {
    writeStoreQueue.shift()();
  } else {
    writeLockActive = false;
  }
};

const writeStore = async (state) => {
  await acquireWriteLock();
  try {
    await mkdir(dataDir, { recursive: true });
    await writeFile(dataFile, JSON.stringify(state, null, 2), "utf8");
  } finally {
    releaseWriteLock();
  }
};

const normalizePost = (incoming, existingPosts, existing) => {
  const timestamp = new Date().toISOString();
  const id = incoming.id || existing?.id || randomUUID();
  const slug = makeSlug(incoming.slug || incoming.title || existing?.title || "noticia", existingPosts.map((item) => item.slug).filter((item) => item !== existing?.slug), id);
  const publishedAt = incoming.status === "published"
    ? existing?.publishedAt ?? incoming.publishedAt ?? timestamp
    : null;

  return {
    id,
    title: incoming.title || existing?.title || "Sin título",
    slug,
    excerpt: incoming.excerpt || "",
    content: incoming.content || "",
    coverImage: sanitizeHttpUrl(incoming.coverImage, existing?.coverImage),
    category: incoming.category || "General",
    tags: Array.isArray(incoming.tags) ? incoming.tags.filter(Boolean) : [],
    status: incoming.status || existing?.status || "draft",
    featured: Boolean(incoming.featured),
    publishedAt,
    createdAt: existing?.createdAt || incoming.createdAt || timestamp,
    updatedAt: timestamp,
  };
};

const normalizeService = (incoming, existing) => ({
  id: incoming.id || existing?.id || randomUUID(),
  title: incoming.title || existing?.title || "Servicio",
  description: incoming.description || existing?.description || "",
  icon: incoming.icon || existing?.icon || "scale",
  order: Number.isFinite(Number(incoming.order)) ? Number(incoming.order) : existing?.order || 1,
  active: Boolean(incoming.active),
  updatedAt: new Date().toISOString(),
});

const normalizeSettings = (incoming, current) => ({
  hero: {
    title: incoming?.hero?.title || current?.hero?.title || defaultSettings.hero.title,
    highlight: incoming?.hero?.highlight || current?.hero?.highlight || defaultSettings.hero.highlight,
    subtitle: incoming?.hero?.subtitle || current?.hero?.subtitle || defaultSettings.hero.subtitle,
    image: sanitizeHttpUrl(incoming?.hero?.image ?? current?.hero?.image, defaultSettings.hero.image),
    video: sanitizeHttpUrl(incoming?.hero?.video ?? current?.hero?.video, defaultSettings.hero.video),
    whatsappNumber: incoming?.hero?.whatsappNumber || current?.hero?.whatsappNumber || defaultSettings.hero.whatsappNumber,
    whatsappMessage: incoming?.hero?.whatsappMessage || current?.hero?.whatsappMessage || defaultSettings.hero.whatsappMessage,
  },
  about: {
    title: incoming?.about?.title || current?.about?.title || defaultSettings.about.title,
    description: incoming?.about?.description || current?.about?.description || defaultSettings.about.description,
    image: sanitizeHttpUrl(incoming?.about?.image ?? current?.about?.image, defaultSettings.about.image),
    imageAlt: incoming?.about?.imageAlt || current?.about?.imageAlt || defaultSettings.about.imageAlt,
    storyTitle: incoming?.about?.storyTitle || current?.about?.storyTitle || defaultSettings.about.storyTitle,
    story: Array.isArray(incoming?.about?.story) ? incoming.about.story : current?.about?.story || defaultSettings.about.story,
    missionTitle: incoming?.about?.missionTitle || current?.about?.missionTitle || defaultSettings.about.missionTitle,
    mission: incoming?.about?.mission || current?.about?.mission || defaultSettings.about.mission,
    stats: Array.isArray(incoming?.about?.stats) ? incoming.about.stats : current?.about?.stats || defaultSettings.about.stats,
  },
  contact: {
    title: incoming?.contact?.title || current?.contact?.title || defaultSettings.contact.title,
    description: incoming?.contact?.description || current?.contact?.description || defaultSettings.contact.description,
    whatsappNumber: incoming?.contact?.whatsappNumber || current?.contact?.whatsappNumber || defaultSettings.contact.whatsappNumber,
    whatsappMessage: incoming?.contact?.whatsappMessage || current?.contact?.whatsappMessage || defaultSettings.contact.whatsappMessage,
    phoneLabel: incoming?.contact?.phoneLabel || current?.contact?.phoneLabel || defaultSettings.contact.phoneLabel,
    phone: incoming?.contact?.phone || current?.contact?.phone || defaultSettings.contact.phone,
    email: incoming?.contact?.email || current?.contact?.email || defaultSettings.contact.email,
    address: incoming?.contact?.address || current?.contact?.address || defaultSettings.contact.address,
    addressLink: sanitizeHttpUrl(incoming?.contact?.addressLink ?? current?.contact?.addressLink, defaultSettings.contact.addressLink),
    hoursLabel: incoming?.contact?.hoursLabel || current?.contact?.hoursLabel || defaultSettings.contact.hoursLabel,
    hours: incoming?.contact?.hours || current?.contact?.hours || defaultSettings.contact.hours,
    schedule: Array.isArray(incoming?.contact?.schedule) ? incoming.contact.schedule : current?.contact?.schedule || defaultSettings.contact.schedule,
    emergencyNote: incoming?.contact?.emergencyNote ?? current?.contact?.emergencyNote ?? defaultSettings.contact.emergencyNote,
  },
});

const normalizeMedia = (incoming, filename, url) => ({
  id: incoming.id || randomUUID(),
  filename,
  originalName: incoming.originalName || filename,
  mimeType: incoming.mimeType || "application/octet-stream",
  size: Number(incoming.size) || 0,
  url,
  alt: incoming.alt || incoming.originalName || "",
  uploadedAt: new Date().toISOString(),
});

const handleCmsRequest = async (req, res, pathname) => {
  const state = await readStore();
  const parts = pathname.split("/").filter(Boolean);
  const authenticated = Boolean(await getSession(req));
  const publicPosts = state.posts.filter((item) => item.status === "published");

  if (pathname === "/api/cms" && req.method === "GET") {
    const baseUrl = getRequestBaseUrl(req);
    sendJson(res, 200, absolutizeMediaUrls({
      posts: sortPosts(authenticated ? state.posts : publicPosts),
      media: sortMedia(state.media || []),
      settings: state.settings || defaultSettings,
      services: sortServices(authenticated ? state.services || [] : (state.services || []).filter((item) => item.active)),
    }, baseUrl));
    return;
  }

  if (pathname === "/api/cms/posts" && req.method === "GET") {
    sendJson(res, 200, sortPosts(authenticated ? state.posts : publicPosts));
    return;
  }

  if (pathname.startsWith("/api/cms/posts/") && req.method === "GET") {
    const id = parts[3];
    const post = state.posts.find((item) => item.id === id || item.slug === id);
    if (!post) {
      sendJson(res, 404, { error: "Post not found" });
      return;
    }
    if (post.status !== "published" && !authenticated) {
      sendJson(res, 404, { error: "Post not found" });
      return;
    }
    sendJson(res, 200, post);
    return;
  }

  if (pathname === "/api/cms/posts" && req.method === "POST") {
    if (!(await requireAuth(req, res))) return;
    const body = await readBody(req);
    const nextPost = normalizePost(body, state.posts);
    state.posts = state.posts.some((item) => item.id === nextPost.id)
      ? state.posts.map((item) => (item.id === nextPost.id ? nextPost : item))
      : [...state.posts, nextPost];
    await writeStore(state);
    sendJson(res, 200, nextPost);
    return;
  }

  if (pathname.startsWith("/api/cms/posts/") && (req.method === "PUT" || req.method === "PATCH")) {
    if (!(await requireAuth(req, res))) return;
    const id = parts[3];
    if (!isValidId(id)) { sendJson(res, 400, { error: "Invalid ID format" }); return; }
    const body = await readBody(req);
    const existing = state.posts.find((item) => item.id === id);
    const nextPost = normalizePost({ ...body, id }, state.posts, existing);
    state.posts = existing
      ? state.posts.map((item) => (item.id === id ? nextPost : item))
      : [...state.posts, nextPost];
    await writeStore(state);
    sendJson(res, 200, nextPost);
    return;
  }

  if (pathname.startsWith("/api/cms/posts/") && req.method === "DELETE") {
    if (!(await requireAuth(req, res))) return;
    const id = parts[3];
    if (!isValidId(id)) { sendJson(res, 400, { error: "Invalid ID format" }); return; }
    state.posts = state.posts.filter((item) => item.id !== id);
    await writeStore(state);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (pathname === "/api/cms/media" && req.method === "GET") {
    if (!authenticated) {
      sendUnauthorized(res);
      return;
    }
    sendJson(res, 200, absolutizeMediaUrls(sortMedia(state.media || []), getRequestBaseUrl(req)));
    return;
  }

  if (pathname === "/api/cms/settings" && req.method === "GET") {
    sendJson(res, 200, state.settings || defaultSettings);
    return;
  }

  if (pathname === "/api/cms/settings" && req.method === "PUT") {
    if (!(await requireAuth(req, res))) return;
    const body = await readBody(req);
    state.settings = normalizeSettings(body, state.settings || defaultSettings);
    await writeStore(state);
    sendJson(res, 200, state.settings);
    return;
  }

  if (pathname === "/api/cms/services" && req.method === "GET") {
    sendJson(res, 200, sortServices(authenticated ? state.services || [] : (state.services || []).filter((item) => item.active)));
    return;
  }

  if (pathname === "/api/cms/services" && req.method === "POST") {
    if (!(await requireAuth(req, res))) return;
    const body = await readBody(req);
    const nextService = normalizeService(body);
    state.services = (state.services || []).some((item) => item.id === nextService.id)
      ? (state.services || []).map((item) => (item.id === nextService.id ? nextService : item))
      : [...(state.services || []), nextService];
    await writeStore(state);
    sendJson(res, 200, nextService);
    return;
  }

  if (pathname.startsWith("/api/cms/services/") && (req.method === "PUT" || req.method === "PATCH")) {
    if (!(await requireAuth(req, res))) return;
    const id = parts[3];
    if (!isValidId(id)) { sendJson(res, 400, { error: "Invalid ID format" }); return; }
    const body = await readBody(req);
    const existing = (state.services || []).find((item) => item.id === id);
    const nextService = normalizeService({ ...body, id }, existing);
    state.services = existing
      ? (state.services || []).map((item) => (item.id === id ? nextService : item))
      : [...(state.services || []), nextService];
    await writeStore(state);
    sendJson(res, 200, nextService);
    return;
  }

  if (pathname.startsWith("/api/cms/services/") && req.method === "DELETE") {
    if (!(await requireAuth(req, res))) return;
    const id = parts[3];
    if (!isValidId(id)) { sendJson(res, 400, { error: "Invalid ID format" }); return; }
    state.services = (state.services || []).filter((item) => item.id !== id);
    await writeStore(state);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (pathname === "/api/cms/media" && req.method === "POST") {
    if (!(await requireAuth(req, res))) return;

    const ip = getClientIp(req);
    const uploadCount = getIpHitCount(uploadRateMap, ip);
    if (uploadCount > 10) {
      securityLog("UPLOAD_RATE_LIMITED", ip);
      sendJson(res, 429, { error: "Too many uploads, try again later" });
      return;
    }

    const body = await readBody(req, maxUploadBytes + 512 * 1024);
    const parsed = parseDataUrl(body.dataUrl);

    if (!parsed) {
      sendJson(res, 400, { error: "Invalid file data" });
      return;
    }

    if (parsed.buffer.length === 0 || parsed.buffer.length > maxUploadBytes) {
      sendJson(res, 413, { error: "File too large" });
      return;
    }

    const detected = detectImageType(parsed.buffer);
    const declaredMime = String(parsed.mimeType).toLowerCase();
    if (!detected || detected.mimeType !== declaredMime || detected.mimeType === "image/svg+xml") {
      sendJson(res, 415, { error: "Unsupported or invalid image type" });
      return;
    }

    const safeBase = sanitizeFileName(body.originalName || "media").replace(/\.[^.]+$/, "") || "media";
    const filename = `${Date.now()}-${randomUUID()}-${safeBase}${extensionFromMime(detected.mimeType)}`;
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, parsed.buffer);

    const asset = normalizeMedia(body, filename, `/media/${filename}`);
    asset.mimeType = detected.mimeType;
    asset.size = parsed.buffer.length;

    state.media = [asset, ...(state.media || []).filter((item) => item.id !== asset.id)];
    await writeStore(state);
    sendJson(res, 200, absolutizeMediaUrls(asset, getRequestBaseUrl(req)));
    return;
  }

  if (pathname.startsWith("/api/cms/media/") && req.method === "DELETE") {
    if (!(await requireAuth(req, res))) return;
    const id = parts[3];
    if (!isValidId(id)) { sendJson(res, 400, { error: "Invalid ID format" }); return; }
    const asset = (state.media || []).find((item) => item.id === id);

    if (asset?.filename) {
      await unlink(path.join(uploadsDir, asset.filename)).catch(() => {});
    }

    state.media = (state.media || []).filter((item) => item.id !== id);
    await writeStore(state);
    sendJson(res, 200, { ok: true });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
};

const handleAuthRequest = async (req, res, pathname) => {
  if (pathname === "/api/auth/me" && req.method === "GET") {
    const ip = getClientIp(req);
    const meCount = getIpHitCount(meRateMap, ip);
    if (meCount > 30) {
      sendJson(res, 429, { error: "Too many requests" });
      return;
    }
    const session = await getSession(req);
    sendJson(res, 200, { authenticated: Boolean(session) });
    return;
  }

  if (pathname === "/api/auth/login" && req.method === "POST") {
    const body = await readBody(req, 16 * 1024);
    const ip = getClientIp(req);
    const rate = isRateLimited(ip);

    if (rate.limited) {
      securityLog("LOGIN_RATE_LIMITED", ip);
      sendJson(res, 429, { error: "Too many attempts", retryAfterMs: rate.retryAfterMs });
      return;
    }

    const passwordOk = safeEqual((body.password || "").trim(), adminPassword);
    if (!passwordOk) {
      recordLoginAttempt(ip, false);
      securityLog("LOGIN_FAILED", ip);
      sendUnauthorized(res);
      return;
    }

    recordLoginAttempt(ip, true);
    securityLog("LOGIN_OK", ip);
    const token = sessionStore.createSession();
    applySecurityHeaders(res, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": buildSessionCookie(token, isRequestSecure(req)),
    });
    res.writeHead(200);
    res.end(JSON.stringify({ authenticated: true }));
    return;
  }

  if (pathname === "/api/auth/logout" && req.method === "POST") {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[sessionCookieName];

    if (token) {
      sessionStore.deleteSession(token);
    }

    applySecurityHeaders(res, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": clearSessionCookie(isRequestSecure(req)),
    });
    res.writeHead(200);
    res.end(JSON.stringify({ authenticated: false }));
    return;
  }

  sendJson(res, 404, { error: "Not found" });
};

const serveMedia = async (res, pathname) => {
  if (pathname.startsWith("/media/")) {
    const mediaFile = path.resolve(uploadsDir, path.basename(pathname));
    if (!isPathWithin(uploadsDir, mediaFile)) {
      sendText(res, 404, "Not found");
      return;
    }

    try {
      const file = await readFile(mediaFile);
      const ext = path.extname(mediaFile).toLowerCase();
      sendText(res, 200, file, mimeTypes[ext] || "application/octet-stream");
    } catch {
      sendText(res, 404, "Not found");
    }
    return;
  }

  sendJson(res, 404, { error: "Not found" });
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const { pathname } = url;

  applyCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    applySecurityHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if (pathname.startsWith("/api/auth")) {
      await handleAuthRequest(req, res, pathname);
      return;
    }

    if (pathname.startsWith("/api/cms")) {
      await handleCmsRequest(req, res, pathname);
      return;
    }

    await serveMedia(res, pathname);
  } catch (error) {
    const errorId = randomUUID();
    console.error(`[${errorId}]`, error.message || error);
    sendJson(res, 500, { error: "Internal server error", id: errorId });
  }
});

server.listen(port, () => {
  console.log(`CMS API listening on http://localhost:${port}`);
  if (!process.env.ADMIN_PASSWORD || adminPassword === "admin-bq") {
    console.warn("[security] Contraseña de administración por defecto en uso. Define ADMIN_PASSWORD en producción.");
  }
});

const shutdown = () => {
  sessionStore.close();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
