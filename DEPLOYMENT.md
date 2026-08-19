# Despliegue de TramitexFederal

Esta guía prepara un despliegue autohospedado. No contiene credenciales reales y ningún comando debe ejecutarse contra producción sin una ventana de cambio y un respaldo verificado.

## Plataforma soportada

- Node.js: `20.19.x`, `22.12+` o `24.x`. Para un despliegue nuevo se recomienda Node.js 24 LTS; no usar versiones impares.
- pnpm: `11.1.2` (fijado en `package.json`).
- PostgreSQL: 16 o posterior, con TLS, respaldos administrados y una cuenta de aplicación sin privilegios de superusuario.
- Una ruta o volumen persistente privado para documentos, separado de `public/` y de la imagen/contenedor de la aplicación.

```bash
corepack enable
corepack prepare pnpm@11.1.2 --activate
node --version
pnpm --version
```

## Variables de entorno

Usa `.env.example` como inventario, pero guarda los valores reales en el gestor de secretos de la plataforma. No confirmes archivos `.env` en Git.

| Variable | Requerida | Propósito |
| --- | --- | --- |
| `NODE_ENV=production` | Sí | Activa el modo de producción. |
| `NEXT_PUBLIC_SITE_URL` | Sí | URL HTTPS canónica, sin slash final; es la única variable pública. |
| `NEXTAUTH_URL` | Sí | URL canónica que usa Auth.js. |
| `DATABASE_URL` | Sí | URL privada de PostgreSQL con TLS según el proveedor. |
| `AUTH_SECRET` | Sí | Secreto aleatorio de al menos 32 caracteres. Generar con `openssl rand -base64 48`. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Sí | Site key pública de Cloudflare Turnstile para el registro. |
| `TURNSTILE_SECRET_KEY` | Sí | Secret key de Turnstile; nunca exponer al navegador. |
| `RESEND_API_KEY` | Sí | API key server-only para correos de recuperación. |
| `EMAIL_FROM` | Sí | Remitente verificado para correo transaccional. |
| `DOCUMENT_STORAGE_PATH` | Sí | Ruta absoluta de almacenamiento privado persistente. Nunca dentro de `public/`. |
| `ALLOWED_ORIGINS` | Según proxy | Hosts autorizados para Server Actions, separados por coma y sin rutas. |
| `HOSTNAME` | Opcional | Interfaz de escucha; `127.0.0.1` detrás de proxy o `0.0.0.0` en contenedor. |
| `PORT` | Opcional | Puerto HTTP interno; predeterminado `3000`. |
| `BACKUP_DIR` | Operativa | Destino privado del script de respaldo PostgreSQL. |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Una vez | Solo para crear el primer administrador. Eliminar después. |
| `ADMIN_RESET_EXISTING` | No | Mantener `false`; usar `true` únicamente para un restablecimiento deliberado. |

Antes de cualquier operación ejecuta `pnpm env:check`.

## PostgreSQL, migraciones y seed

La migración inicial está versionada en `prisma/migrations`. En producción nunca ejecutes `prisma migrate dev`, `db push` ni generes una migración nueva.

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:deploy
pnpm db:seed
```

El seed es idempotente y contiene solamente roles, permisos, servicios, requisitos y configuraciones del sistema. No crea clientes, expedientes ni usuarios.

## Primer administrador

Define temporalmente `ADMIN_NAME`, `ADMIN_EMAIL` y una `ADMIN_PASSWORD` de 12 o más caracteres con mayúscula, minúscula, número y símbolo. Después ejecuta:

```bash
pnpm db:create-admin
```

El comando se niega a sobrescribir una cuenta existente. Para un restablecimiento intencional, define temporalmente `ADMIN_RESET_EXISTING=true`. Borra inmediatamente las cuatro variables del entorno y del historial seguro de la plataforma.

## Build y arranque

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

`pnpm start` ejecuta el servidor de producción de Next.js desde el artefacto `.next` generado. Conserva el directorio completo del release y no reutilices un build creado con variables públicas de otro entorno.

## Almacenamiento privado

- Monta `DOCUMENT_STORAGE_PATH` como volumen persistente con lectura/escritura solo para el usuario del proceso Node.
- No lo montes debajo del repositorio, `public/`, un bucket público ni un CDN.
- Respalda archivos y base de datos en la misma ventana lógica; la base contiene las claves que enlazan ambos.
- Añade análisis antimalware antes de aceptar documentos de terceros a gran escala.

## Dominio, HTTPS y proxy

- Termina TLS 1.2/1.3 en un balanceador o proxy y redirige HTTP a HTTPS.
- Envía `Host`, `X-Forwarded-Proto` y `X-Forwarded-For`; el proxy debe reemplazar, no confiar ciegamente en, cabeceras recibidas del cliente.
- Configura el dominio en `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_URL` y `ALLOWED_ORIGINS` antes del build.
- Supervisa `GET /api/health`; un `503` indica que PostgreSQL no está disponible.

## Backups

Antes de cada migración y al menos diariamente:

```powershell
$env:DATABASE_URL = "valor-del-gestor-de-secretos"
$env:BACKUP_DIR = "D:\backups\tramitexfederal"
.\scripts\backup-postgres.ps1
```

Mantén copias cifradas fuera del servidor. Respalda también el volumen de documentos y prueba restauraciones en un entorno aislado con `pg_restore --clean --if-exists --dbname=<destino> <archivo.dump>` y la copia correspondiente de documentos.

## Rollback

1. Conserva el artefacto anterior y toma respaldos coordinados de PostgreSQL y documentos.
2. Si falla la aplicación sin cambios incompatibles de esquema, vuelve a iniciar el artefacto anterior.
3. Si la migración cambió datos o esquema de forma incompatible, no improvises una reversión: restaura base y documentos juntos en una instancia nueva, valida y cambia el tráfico.
4. Para correcciones normales de esquema, prefiere una migración hacia adelante revisada.

## Orden exacto de una publicación

```bash
corepack enable
corepack prepare pnpm@11.1.2 --activate
pnpm install --frozen-lockfile
pnpm env:check
pnpm db:generate
pnpm test
pnpm lint
pnpm typecheck
pnpm build
# Tomar y verificar backup aquí.
pnpm db:deploy
pnpm db:seed
# Solo en la primera publicación: pnpm db:create-admin
pnpm start
```

Tras iniciar, comprueba HTTPS, `/api/health`, login, autorización por rol, consulta pública por un folio controlado y carga/descarga de un documento de prueba sin información personal real.
