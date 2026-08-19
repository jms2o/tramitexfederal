import "server-only";
import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { fileTypeFromBuffer } from "file-type";

const maxFileSize = 10 * 1024 * 1024;
const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const extensions: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" };
export class FileValidationError extends Error {}

function getStorageRoot() {
  const configuredPath = process.env.DOCUMENT_STORAGE_PATH?.trim();
  if (process.env.NODE_ENV === "production" && !configuredPath) {
    throw new Error("DOCUMENT_STORAGE_PATH is required in production.");
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
  const safeKey = path.basename(storageKey);
  if (safeKey !== storageKey) throw new Error("Invalid storage key.");
  return path.join(/* turbopackIgnore: true */ getStorageRoot(), safeKey);
}

export async function savePrivateFile(file: File) {
  if (!file.size) throw new FileValidationError("Selecciona un archivo.");
  if (file.size > maxFileSize) throw new FileValidationError("El archivo supera el límite de 10 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !allowedMimeTypes.has(detected.mime)) throw new FileValidationError("Solo se permiten archivos PDF, JPG o PNG válidos.");
  const storageKey = `${randomUUID()}.${extensions[detected.mime]}`;
  await mkdir(getStorageRoot(), { recursive: true });
  await writeFile(resolveStoragePath(storageKey), buffer, { flag: "wx" });
  return { storageKey, mimeType: detected.mime, sizeBytes: file.size, originalName: path.basename(file.name).slice(0, 180) };
}

export async function readPrivateFile(storageKey: string) {
  return readFile(/* turbopackIgnore: true */ resolveStoragePath(storageKey));
}

export async function removePrivateFile(storageKey: string) {
  await unlink(resolveStoragePath(storageKey)).catch((error: unknown) => {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  });
}
