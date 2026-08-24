import "server-only";
import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { fileTypeFromBuffer } from "file-type";

const maxFileSize = 10 * 1024 * 1024;
const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const extensions: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" };
const defaultSupabaseBucket = "documentos-tramites";

export class FileValidationError extends Error {}

type SupabaseStorageConfig = {
  url: string;
  serviceRoleKey: string;
  bucket: string;
};

function normalizeStorageKey(storageKey: string) {
  const safeKey = path.basename(storageKey);
  if (safeKey !== storageKey) throw new Error("Invalid storage key.");
  return safeKey;
}

function getSupabaseStorageConfig(): SupabaseStorageConfig | null {
  const rawUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (Boolean(rawUrl) !== Boolean(serviceRoleKey)) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together.");
  }
  if (!rawUrl || !serviceRoleKey) return null;

  const url = new URL(rawUrl);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("SUPABASE_URL must use HTTPS in production.");
  }

  return {
    url: url.origin,
    serviceRoleKey,
    bucket: process.env.SUPABASE_STORAGE_BUCKET?.trim() || defaultSupabaseBucket,
  };
}

function supabaseHeaders(config: SupabaseStorageConfig) {
  return {
    Authorization: `Bearer ${config.serviceRoleKey}`,
    apikey: config.serviceRoleKey,
  };
}

function getStorageRoot() {
  const configuredPath = process.env.DOCUMENT_STORAGE_PATH?.trim();
  if (process.env.NODE_ENV === "production" && !configuredPath) {
    throw new Error("Configure Supabase Storage or DOCUMENT_STORAGE_PATH in production.");
  }
  if (process.env.NODE_ENV === "production" && configuredPath && !path.isAbsolute(configuredPath)) {
    throw new Error("DOCUMENT_STORAGE_PATH must be an absolute path in production.");
  }

  const root = path.resolve(/* turbopackIgnore: true */ configuredPath || path.join(process.cwd(), "storage", "private"));
  const publicRoot = path.resolve(process.cwd(), "public");
  const relativeToPublic = path.relative(publicRoot, root);
  if (!relativeToPublic || (!relativeToPublic.startsWith("..") && !path.isAbsolute(relativeToPublic))) {
    throw new Error("Private document storage cannot be located inside /public.");
  }
  return root;
}

function resolveStoragePath(storageKey: string) {
  return path.join(/* turbopackIgnore: true */ getStorageRoot(), normalizeStorageKey(storageKey));
}

async function uploadToSupabase(config: SupabaseStorageConfig, storageKey: string, buffer: Buffer, mimeType: string) {
  const response = await fetch(
    `${config.url}/storage/v1/object/${encodeURIComponent(config.bucket)}/${encodeURIComponent(storageKey)}`,
    {
      method: "POST",
      headers: {
        ...supabaseHeaders(config),
        "Content-Type": mimeType,
        "Cache-Control": "no-store",
        "x-upsert": "false",
      },
      body: new Uint8Array(buffer),
    },
  );

  if (!response.ok) {
    console.error("Supabase Storage upload failed.", { status: response.status });
    throw new Error("No fue posible guardar el archivo en el almacenamiento privado.");
  }
}

async function downloadFromSupabase(config: SupabaseStorageConfig, storageKey: string) {
  const response = await fetch(
    `${config.url}/storage/v1/object/authenticated/${encodeURIComponent(config.bucket)}/${encodeURIComponent(storageKey)}`,
    {
      headers: supabaseHeaders(config),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Private file unavailable.");
  }
  return Buffer.from(await response.arrayBuffer());
}

async function removeFromSupabase(config: SupabaseStorageConfig, storageKey: string) {
  const response = await fetch(`${config.url}/storage/v1/object/${encodeURIComponent(config.bucket)}`, {
    method: "DELETE",
    headers: {
      ...supabaseHeaders(config),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [storageKey] }),
  });

  if (!response.ok && response.status !== 404) {
    console.error("Supabase Storage delete failed.", { status: response.status });
    throw new Error("No fue posible eliminar el archivo del almacenamiento privado.");
  }
}

export async function savePrivateFile(file: File) {
  if (!file.size) throw new FileValidationError("Selecciona un archivo.");
  if (file.size > maxFileSize) throw new FileValidationError("El archivo supera el límite de 10 MB.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !allowedMimeTypes.has(detected.mime)) {
    throw new FileValidationError("Solo se permiten archivos PDF, JPG o PNG válidos.");
  }

  const storageKey = `${randomUUID()}.${extensions[detected.mime]}`;
  const supabase = getSupabaseStorageConfig();
  if (supabase) {
    await uploadToSupabase(supabase, storageKey, buffer, detected.mime);
  } else {
    await mkdir(getStorageRoot(), { recursive: true });
    await writeFile(resolveStoragePath(storageKey), buffer, { flag: "wx" });
  }

  return {
    storageKey,
    mimeType: detected.mime,
    sizeBytes: file.size,
    originalName: path.basename(file.name).slice(0, 180),
  };
}

export async function readPrivateFile(storageKey: string) {
  const safeKey = normalizeStorageKey(storageKey);
  const supabase = getSupabaseStorageConfig();
  if (supabase) return downloadFromSupabase(supabase, safeKey);
  return readFile(/* turbopackIgnore: true */ resolveStoragePath(safeKey));
}

export async function removePrivateFile(storageKey: string) {
  const safeKey = normalizeStorageKey(storageKey);
  const supabase = getSupabaseStorageConfig();
  if (supabase) {
    await removeFromSupabase(supabase, safeKey);
    return;
  }

  await unlink(resolveStoragePath(safeKey)).catch((error: unknown) => {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  });
}
