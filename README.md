# TramitexFederal

Sitio público para la gestión y asesoría de trámites de transporte público federal y SICT.

## Desarrollo

1. Copia `.env.example` a `.env.local` y ajusta la URL si es necesario.
2. Instala dependencias: `pnpm install`.
3. Inicia el entorno: `pnpm dev`.
4. Abre `http://localhost:3000`.

## Comandos

- `pnpm lint`: ejecuta ESLint.
- `pnpm build`: genera la compilación de producción.
- `pnpm start`: inicia la compilación de producción.

## Base de datos

La fase de PostgreSQL y Prisma ya está preparada, pero requiere una instancia de PostgreSQL antes de aplicar cambios.

1. Copia `.env.example` como `.env` y completa `DATABASE_URL` con una conexión privada.
2. Ejecuta `pnpm db:migrate --name init` para crear la migración y aplicarla.
3. Ejecuta `pnpm db:seed` para crear el catálogo inicial de servicios y requisitos.
4. Opcionalmente, abre `pnpm db:studio` para inspeccionar los datos.

Los archivos y referencias de documentos privados se guardan como metadatos; nunca deben residir dentro de `public/`.

## Acceso administrativo

El acceso usa Auth.js con correo y contraseña, una sesión JWT de ocho horas y roles aplicados en el servidor. Después de migrar la base de datos:

1. Genera `AUTH_SECRET` con `openssl rand -base64 32` y configúralo en `.env`.
2. Define `ADMIN_NAME`, `ADMIN_EMAIL` y una contraseña segura de 12 o más caracteres.
3. Ejecuta `pnpm db:create-admin` una sola vez (también sirve para restablecer esa cuenta).
4. Inicia la app e ingresa en `/login`.

La ruta `/admin` exige una sesión válida y no debe exponerse contenido administrativo en componentes públicos.

## Dashboard

El dashboard administrativo presenta trámites activos, documentos pendientes, revisiones, procesos en curso, clientes, ingresos del mes, gráficas de volumen y distribución por estado, y la actividad reciente. Los datos provienen directamente de PostgreSQL y muestran estados vacíos hasta que el equipo comience a operar.

## CRM

Las rutas administrativas `/admin/clientes`, `/admin/empresas` y `/admin/vehiculos` permiten registrar y consultar clientes, empresas con socios y unidades. Todas las altas se validan en el servidor y generan un evento de auditoría.

## Expedientes

En `/admin/tramites` se crean expedientes con un folio único de formato `TRM-AÑO-00001`. Cada expediente copia los requisitos configurados del servicio a un checklist propio y conserva el historial de estados, mensajes públicos y notas internas.

## Documentos privados

Los documentos se cargan desde el expediente, aceptan únicamente PDF, JPG y PNG de hasta 10 MB, validan el tipo real del archivo y se guardan fuera de `public/` con un identificador aleatorio. Configura `DOCUMENT_STORAGE_PATH` como una ruta absoluta privada. Cada descarga pasa por una ruta autenticada y queda registrada en la actividad.

## Finanzas

Desde cada expediente se gestionan cotizaciones con conceptos, impuestos y total, así como pagos con método y referencia. El saldo se calcula en servidor a partir de los pagos registrados. Las vistas `/admin/cotizaciones` y `/admin/pagos` centralizan la consulta.

## Seguimiento público

`/seguimiento?folio=TRM-AÑO-00001` consulta el expediente real y expone solamente folio, nombre del servicio, estado público, fecha de actualización y mensaje autorizado. La consulta nunca devuelve documentos, RFC, CURP, datos de contacto, pagos ni notas internas.

## Seguridad y calidad

La aplicación aplica cabeceras de seguridad, sesiones con cookies seguras en producción, autorización en servidor, validación Zod y límites de intentos para login, contacto y seguimiento. El limitador incluido es local al proceso: antes de desplegar varias instancias debe sustituirse por un almacén compartido (Redis o equivalente). Ejecuta `pnpm test`, `pnpm lint` y `pnpm build` antes de cada despliegue.

## Rutas públicas

- `/`: inicio
- `/servicios`: catálogo de servicios
- `/servicios/[slug]`: detalle de servicio
- `/requisitos`: requisitos por tipo de cliente
- `/seguimiento`: consulta pública mock y segura
- `/contacto`: formulario de solicitud

El resto del panel administrativo se implementará en las siguientes fases.
