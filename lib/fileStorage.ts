import { put, del } from "@vercel/blob";
import crypto from "crypto";
import path from "path";

/**
 * Guarda un archivo subido en Vercel Blob con nombre no adivinable.
 * El acceso sigue controlado por la app: las rutas de servido (admin/public)
 * verifican autenticacion/autorizacion/consentimiento antes de devolver el
 * contenido, en vez de exponer la URL del blob directamente al cliente.
 */
export async function saveUploadedFile(file: File, subdir: "photos" | "documents"): Promise<string> {
  const ext = path.extname(file.name) || "";
  const randomName = `${subdir}/${crypto.randomUUID()}${ext}`;
  const blob = await put(randomName, file, { access: "public", addRandomSuffix: false });
  return blob.url;
}

export async function deleteUploadedFile(url: string): Promise<void> {
  try {
    await del(url);
  } catch {
    /* el archivo ya no existe en el storage */
  }
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_DOCUMENT_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"];
