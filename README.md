# Abogados Barranquilla - Aplicación Web Jurídica

Sitio web de un bufete de abogados en Barranquilla y la Costa Caribe colombiana, compuesto por **dos aplicaciones independientes** listas para desplegar en cPanel:

| App | Carpeta | Stack | Deploy en cPanel |
| --- | --- | --- | --- |
| **Frontend** | `client/` | React + Vite + TypeScript + Tailwind/shadcn | Build estático en `public_html` |
| **Backend (API CMS)** | `server/` | Node.js (HTTP nativo) + SQLite (better-sqlite3) | Node.js App Selector en subdominio |

## Características

### Backend (`server/`)
- API CMS: gestión de noticias, servicios y configuración de la home
- Autenticación: cookies HttpOnly con rate limiting (5 intentos login/15min, 10 uploads/min)
- Sesiones SQLite con hash SHA-256, TTL automático y limpieza por lectura
- Seguridad: HSTS, headers de seguridad, CORS configurable, validación de UUIDs, sanitización de URLs y rechazo de SVG
- Persistencia en `server/data/cms.json` + `server/data/sessions.db`

### Frontend (`client/`)
- SPA con React Router, ScrollToHash y sección de noticias en carrusel
- SEO: metatags dinámicos por ruta (`useSEO`), Open Graph, Twitter Cards, JSON-LD `LegalService`, sitemap.xml y robots.txt
- Admin panel: `/admin/login` con CRUD de noticias, medios, servicios y home
- URL de la API configurable con `VITE_API_URL` (dev usa el proxy de Vite)

## Tecnologías

- **Frontend**: React 18, TanStack Query, Tailwind CSS + shadcn/ui, React Router DOM, React Hook Form + Zod, Radix UI
- **Backend**: Node.js HTTP nativo, better-sqlite3 (WAL, synchronous=FULL)

## Desarrollo local

Requisitos: Node.js 18+ y npm (o pnpm).

```bash
# Instalar dependencias de ambas apps
npm install

# Terminal 1: frontend (Vite en http://localhost:8080)
npm run dev

# Terminal 2: API (Node en http://localhost:8787)
npm run dev:api
```

URLs:
- Frontend: http://localhost:8080
- API: http://localhost:8787
- Login admin: http://localhost:8080/admin/login

## Despliegue en cPanel

### 1. Backend (API en subdominio `api.abogadosbq.com`)

1. En cPanel usa **"Setup Node.js App"**:
   - **App root**: sube el contenido de `server/` a una carpeta del plan (p. ej. `~/abogados-api`) y apúntalo ahí
   - **Application startup file**: `index.js`
   - **Application URL**: `https://api.abogadosbq.com`
   - **Enviroment variables** (en la misma sección):
     ```text
     PORT=<el que asigne cPanel o uno propio>
     ADMIN_PASSWORD=tu_password_seguro
     CORS_ORIGIN=https://www.abogadosbq.com,https://abogadosbq.com
     TRUST_PROXY=1
     SESSION_TTL_HOURS=168
     ```
2. Instala dependencias: `npm install` dentro de `~/abogados-api` (solo necesita `better-sqlite3`).
3. Reinicia la app Node desde el panel.

### 2. Frontend (estático en el dominio principal)

```bash
cd client
echo "VITE_API_URL=https://api.abogadosbq.com" > .env
npm install
npm run build
```

Sube el contenido de `client/dist/` a `public_html` del dominio principal. El `.htaccess` incluido en el build se encarga del routing SPA (todas las rutas caen en `index.html`). Asegúrate de que mod_rewrite esté activo.

## Administración

- Credenciales: variable de entorno `ADMIN_PASSWORD` (default dev: `admin-bq`)
- URL admin: `/admin/login`
- Toda escritura en la API requiere sesión de admin válida

## Variables de entorno

### `server/.env`
```bash
PORT=8787
ADMIN_PASSWORD=admin-bq
SESSION_TTL_HOURS=168
CORS_ORIGIN=
TRUST_PROXY=0
```

### `client/.env`
```bash
VITE_API_URL=
```

## Estructura del proyecto

```
.
├── client/                  # Aplicación React (build → public_html)
│   ├── public/              # Assets estáticos, .htaccess, robots.txt, sitemap.xml
│   ├── src/
│   │   ├── components/      # UI reutilizable y secciones
│   │   ├── hooks/           # useSEO, use-mobile, use-toast
│   │   ├── lib/             # cms.ts, cms-api.ts, admin-auth.ts, api-config.ts
│   │   ├── pages/           # Páginas públicas y admin
│   │   ├── context/         # CmsProvider, AdminAuthContext
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/                  # API Node.js (app de cPanel)
│   ├── index.js             # Servidor HTTP principal
│   ├── session-store.js     # Sesiones SQLite
│   ├── data/                # cms.json + sessions.db (runtime, no commitear)
│   ├── uploads/             # Archivos subidos (runtime, no commitear)
│   ├── package.json
│   └── .env.example
├── package.json             # Workspace raíz (client + server)
└── README.md
```

## Notas de seguridad

- La API solo expone posts publicados y bloques/servicios activos para visitantes anónimos
- `server/data/cms.json`, `server/data/sessions.db` y `server/uploads/` están en `.gitignore` (son datos de runtime)
- HSTS está activo en la API; ambas apps deben servirse por HTTPS
- CORS por defecto permite solo orígenes del mismo host; en producción define `CORS_ORIGIN` con el dominio real
