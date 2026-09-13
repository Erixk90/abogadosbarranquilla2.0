# Auditoría abogadosbq.com

Fecha: 2026-09-13
Alcance: revisión de producción (`https://www.abogadosbq.com` y `https://api.abogadosbq.com`), comparación con el build del repo y mejoras aplicadas.

## Resumen

- El sitio está **online y funcional** (200 OK).
- El build del último commit **coincide byte a byte con producción** (mismo SHA-256 de `index-*.js` e `index.html`). **No hay deploy drift.**
- Se implementó **URL propia por noticia** (`/noticias/:slug`) con botones de compartir.
- El resto de hallazgos quedan listados abajo como pendientes.

## Entorno local verificado

- `npm run dev` → Vite en `http://localhost:8081` (8080 estaba ocupado por `AgentService`).
- `npm run dev:api` → API en `http://localhost:8787` (usa `server/data/cms.json`, que está **vacío**: posts=0, media=0, services=0).
- El front en dev **no usa el API local**: `client/vite.config.ts` proxya `/api` y `/media` a `https://api.abogadosbq.com` (producción).
  - Nota: `AGENTS.md` dice que el proxy va a `127.0.0.1:8787`; el archivo real apunta a prod. Conviene alinear la doc o el config.

## Comparación build vs producción (estado final)

El build actual (`npm run build`) produce `index-CwBj9yCx.js` + `index-Co5a3bB9.css` y su `index.html` con SHA-256 `A6A453B4…4FAA1A`. Se subió `client/dist/` a `public_html` y **producción coincide** con ese build.

Verificado en prod con navegador headless:

- Home: 200, `index.html` idéntico, muestra "Noticias recientes" y enlaza a `/noticias/<slug>`.
- Artículo (`/noticias/<slug>`): renderiza `<h1>`, `<title>`, `canonical` y `og:title` propios de la noticia.
- Slug inexistente: muestra "Noticia no encontrada".
- Assets `index-CwBj9yCx.js`, `index-Co5a3bB9.css`, `NewsPost-BUHnIC_S.js`: 200.

> El "drift" detectado al inicio fue por un `client/dist` viejo en el árbol de trabajo (está gitignored); no era un problema real de producción.

## Implementado en esta sesión

- Nueva página `client/src/pages/NewsPost.tsx` en la ruta `/noticias/:slug`:
  - Render completo de la noticia (portada, categoría, fecha, contenido, tags).
  - SEO por noticia (`title`, `description`, `canonical`, `og:*`).
  - Botones de compartir: WhatsApp, Facebook, X y copiar enlace.
  - CTA de WhatsApp y estados de carga / no encontrada.
- `CmsContext` / `CmsProvider`: nueva bandera `ready` para distinguir "cargando" de "no existe".
- `App.tsx`: ruta `/noticias/:slug` (lazy) antes del catch-all.
- Carruseles (hero y sección noticias): las tarjetas ahora **navegan a la URL propia**; se eliminaron los modales (bundle principal bajó de 432.53 kB a 405.88 kB).
- `ScrollToHash`: vuelve al inicio al cambiar a una ruta sin hash (páginas de noticia).
- Verificado con `npm run lint` (0 errores) y `npm run build` (OK).

### Fix de entorno en dev (importante)

- `client/.env` tenía `VITE_API_URL=https://api.abogadosbq.com`, lo que hacía que el navegador en dev llamara al API de prod desde `localhost` → bloqueado por CORS (el API solo manda `Access-Control-Allow-Origin` para `www.abogadosbq.com`) → las noticias no cargaban.
- Cambios: `client/.env` → `VITE_API_URL=` (vacío) y `client/src/lib/api-config.ts` usa el fallback absoluto **solo en producción** (`import.meta.env.DEV ? "" : "https://api.abogadosbq.com"`). En dev queda `/api` relativo y usa el proxy de Vite.
- En prod el bundle embebe `https://api.abogadosbq.com/api` (verificado).

## Pendientes

### Alta prioridad (verificado en prod 2026-09-13)
- [x] **Forzar HTTPS**: `http://abogadosbq.com/` ahora 301 → `https://www.abogadosbq.com/`.
- [x] **Unificar host www / no-www**: `https://abogadosbq.com/` ahora 301 → `https://www.abogadosbq.com/`.
- [x] **Soft 404**: `/ruta-inexistente-xyz` devuelve **404** real con el SPA ("No encontrada").
- [x] **Headers de seguridad en el sitio estático**: presentes en respuestas 200 (`nosniff`, `SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, HSTS `max-age=63072000; includeSubDomains`, CSP). Rutas válidas (`/`, `/noticias`, `/noticias/:slug`, `/admin/login`) y assets siguen 200. Pendiente: comprobar el admin en navegador (CSP).
- [x] **Imagen de portada de 1.88 MB** (`1787511004514-...-431742.png`, 1254×1254): convertida a WebP q82 → 95.4 KB (-95%). WebP subido y verificado (`1789335637109-...-431742.webp`, `Content-Type: image/webp` en prod). Cover del post "La dignidad humana…" ya apunta al WebP. PNG viejo ya no referenciado. **Bug corregido**: `mimeTypes` de `server/index.js` no incluía `.webp` ni `.gif` y los servía como `application/octet-stream`; API redesplegado.

### Media
- [x] **OG por noticia para crawlers (prerender en build)**: nuevo `client/scripts/prerender-news.mjs` (postbuild) que escribe `dist/noticias/<slug>.html` por cada noticia publicada, con `title`, `description`, `canonical`, `og:*` y `twitter:*` propios (sin ejecutar JS). El `.htaccess` sirve `/<ruta>.html` si existe. Bug corregido: la regla del SPA `^(noticias|admin)...` reescribía también el `.html` prerenderizado; se le añadió `RewriteCond %{REQUEST_FILENAME} !-f` (el `/index` era el síntoma). Verificado en prod: las 5 noticias sirven el HTML con su título/OG propios vía `curl` (sin JS); `/`, `/noticias`, `/admin/login`, assets y sitemap siguen 200; 404 real intacto. `og:image:width/height` se quitan en artículos. Limitación: si editas una noticia, el preview se actualiza en el próximo build/deploy.
- [x] **Sitemap**: nuevo script `client/scripts/generate-sitemap.mjs` (postbuild) que consulta `api.abogadosbq.com/api/cms` y escribe `dist/sitemap.xml` con `/`, `/noticias` y cada `/noticias/:slug` (con `lastmod` real). Fallback: si el API no responde en 10 s, conserva el sitemap estático. Generó 5 noticias. Pendiente deploy de `dist/sitemap.xml`.
- [x] `llms.txt`: corregida la entrada "Política y avisos" → "Mapa del sitio". Pendiente deploy de `dist/llms.txt`.
- [ ] **Sin analítica** (GA/GTM/Meta Pixel/Clarity): no se pueden medir visitas ni conversiones.
- [ ] **JSON-LD**: `streetAddress` sin dirección real, `addressLink` genérico (`https://maps.google.com`), horario 24/7 a verificar, sin `sameAs` de redes ni `aggregateRating`.
- [x] Coherencia `AGENTS.md` vs `client/vite.config.ts`: actualizado `AGENTS.md` para reflejar que el proxy de dev apunta a `https://api.abogadosbq.com`; el API local `127.0.0.1:8787` queda solo para probar escrituras cambiando los `target`.

### Baja prioridad
- [ ] Dos H2 "Noticias recientes" en la home (hero + sección). Se mantienen ambos carruseles por decisión de producto.
- [ ] Alt genérico `"Imagen de portada"` en imágenes del CMS.
- [ ] Imágenes sin `width`/`height` (riesgo CLS); hero como `background-image` inline.
- [ ] Errores de contenido en CMS: título "...Agraria y **Ruralulo**"; `post-07` con `coverImage` relativa `/hero-law-firm.jpg` (inconsistente con URLs absolutas).
- [ ] Servicio `service-familiar` = "Derecho Familiar" (debería ser "Derecho de Familia").
- [ ] Reducir peso/dependencias del bundle principal de la home (sonner, tooltip, react-query).

## Handoff para próxima sesión

Estado de partida: la URL por noticia ya está **implementada y desplegada en prod**. Queda resolver los pendientes de la sección anterior, **punto por punto** (empezar por "Alta prioridad").

Contexto clave para retomar:

- El sitio estático vive en `client/public/` → se sube `client/dist/` a `public_html`. La API (`server/`) no se toca en estos puntos.
- Redirects/headers se editan en `client/public/.htaccess` y requieren `npm run build` + re-subir a `public_html`.
- Dev: `npm run dev` (Vite; si 8080 está ocupado por `AgentService` toma 8081) y `npm run dev:api` (API en 8787, `cms.json` local vacío). El front en dev proxya `/api` a prod.
- No hay script de test; verificar con `npm run lint` y `npm run build`.
- No se han hecho commits; hay cambios sin commitear (ver `git status`).
- No re-seedear `server/data/cms.json` de prod.

Orden sugerido de los pendientes de alta prioridad:

1. Forzar HTTPS (301 + HSTS).
2. Unificar www / no-www (301 a `www`).
3. Headers de seguridad del sitio estático.
4. Soft 404 real.
5. Imagen de portada de 1.88 MB → WebP.

## Notas operativas

- Contenido de producción vive en `server/data/cms.json` del servidor; el del repo está vacío. No re-seedear prod.
- El sitio es SPA: `.htaccess` enruta todo a `index.html`, por eso `/noticias/:slug` funciona en prod sin cambios de servidor.
