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

## Comparación build vs producción

| Artefacto | Local (build) | Producción | Resultado |
| --- | --- | --- | --- |
| JS principal | `index-BioBrn3i.js` (SHA256 `38F374…86B0`) | idéntico | ✅ iguales |
| CSS | `index-BAw54v0I.css` | idéntico | ✅ iguales |
| HTML | SHA256 `40BABB…2D89` | idéntico | ✅ iguales |

> Conclusión: producción corresponde al último commit. El "drift" detectado inicialmente era por un `client/dist` viejo en el árbol de trabajo (está gitignored).

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

## Pendientes

### Alta prioridad
- [ ] **Forzar HTTPS**: `http://abogadosbq.com/` responde 200 sin redirigir. Agregar redirect 301 a HTTPS y `Strict-Transport-Security` en el dominio web (la API ya la envía).
- [ ] **Unificar host www / no-www**: ambos responden 200 sin 301. Redirigir `abogadosbq.com` → `www.abogadosbq.com` (el canonical apunta a www).
- [ ] **Soft 404**: rutas inexistentes devuelven 200. Definir 404 real en el rewrite del `.htaccess`.
- [ ] **Headers de seguridad en el sitio estático**: faltan `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`.
- [ ] **Imagen de portada de 1.88 MB** (`/media/1787511004514-...-431742.png`): comprimir/reconvertir a WebP.

### Media
- [ ] **OG por noticia no visible para crawlers sin JS**: la ruta ya tiene SEO por noticia en cliente, pero falta prerender/SSR para que WhatsApp/Google vean el preview propio del artículo.
- [ ] **Sitemap**: solo 2 URLs estáticas y `lastmod` viejo (2026-08-08). Generar sitemap dinámico incluyendo `/noticias/:slug`.
- [ ] `llms.txt`: la entrada "Política y avisos" apunta a `sitemap.xml` (etiqueta incorrecta).
- [ ] **Sin analítica** (GA/GTM/Meta Pixel/Clarity): no se pueden medir visitas ni conversiones.
- [ ] **JSON-LD**: `streetAddress` sin dirección real, `addressLink` genérico (`https://maps.google.com`), horario 24/7 a verificar, sin `sameAs` de redes ni `aggregateRating`.
- [ ] Confirmar coherencia entre `AGENTS.md` y `client/vite.config.ts` sobre el proxy de dev.

### Baja prioridad
- [ ] Dos H2 "Noticias recientes" en la home (hero + sección). Se mantienen ambos carruseles por decisión de producto.
- [ ] Alt genérico `"Imagen de portada"` en imágenes del CMS.
- [ ] Imágenes sin `width`/`height` (riesgo CLS); hero como `background-image` inline.
- [ ] Errores de contenido en CMS: título "...Agraria y **Ruralulo**"; `post-07` con `coverImage` relativa `/hero-law-firm.jpg` (inconsistente con URLs absolutas).
- [ ] Servicio `service-familiar` = "Derecho Familiar" (debería ser "Derecho de Familia").
- [ ] Reducir peso/dependencias del bundle principal de la home (sonner, tooltip, react-query).

## Notas operativas

- Contenido de producción vive en `server/data/cms.json` del servidor; el del repo está vacío. No re-seedear prod.
- El sitio es SPA: `.htaccess` enruta todo a `index.html`, por eso `/noticias/:slug` funciona en prod sin cambios de servidor.
