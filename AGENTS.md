# AGENTS.md

## Repo Shape
- Monorepo con dos apps independientes (workspaces npm):
  - `client/` — SPA Vite + React + TypeScript. `client/src/main.tsx` monta `client/src/App.tsx`; `App.tsx` posee providers y routing.
  - `server/` — API CMS Node.js puro (`node:http`). Entrada: `server/index.js`; sesiones SQLite en `server/session-store.js`; datos en `server/data/cms.json`; uploads en `server/uploads/`.
- `client/src/pages/Index.tsx` compone las secciones de la landing.
- Mantén las rutas custom por encima de la ruta catch-all `*` en `client/src/App.tsx`.
- `/noticias` es la misma ruta home del SPA y hace scroll al carrusel de noticias; no lo conviertas en un blog separado salvo que ese sea el cambio UX deseado.
- El frontend habla con la API en `/api`; en dev Vite proxya `/api` y `/media` a `http://127.0.0.1:8787`. En producción `VITE_API_URL` define el origen absoluto de la API (ej. `https://api.abogadosbq.com`).

## Commands
- Usa scripts npm; `npm install` en la raíz instala ambos workspaces.
- `npm run dev` — frontend Vite en puerto `8080` (host `::`).
- `npm run dev:api` — API Node en puerto `8787`.
- `npm run build`, `npm run lint`, `npm run preview` — operan sobre `client/`.
- No hay script `test` en `package.json`.
- Verifica con `npm run lint` y `npm run build` antes de entregar.
- Admin login usa `ADMIN_PASSWORD` en el servidor; el fallback por defecto es `admin-bq`.
- Los endpoints de escritura del CMS requieren cookie de sesión autenticada.
- El contenido del CMS persiste en `server/data/cms.json`.

## Conventions
- En `client/`, importa con `@/*` para rutas de `client/src/*`.
- `client/vite.config.ts` desactiva sourcemaps del build a propósito.
- `client/tailwind.config.ts` solo escanea `./pages`, `./components`, `./app` y `./src`; actualízalo si agregas UI fuera de ahí.
- `client/eslint.config.js` ignora `dist`; `react-refresh/only-export-components` es warning y `@typescript-eslint/no-unused-vars` está apagado.
- Mantén los datos seed del CMS solo en `server/data/cms.json`; el frontend hidrata desde la API y no debe re-seedear el mismo contenido localmente.
- `server/index.js` aplica CORS solo si el origen está en `CORS_ORIGIN` (o coincide con el Host). No agregues `Access-Control-Allow-Origin: *`.
- Las URLs de media se devuelven absolutas (según el Host de la request) para que funcionen con el frontend en otro origen.
