import { z } from "zod";

// Slug: 3-48 chars, lowercase letters, numbers, hyphens only
export const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(48, "Slug must be at most 48 characters")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers, and hyphens (no leading/trailing hyphens)"
  );

export const createPageSchema = z.object({
  slug:     slugSchema,
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128)
    .optional(),
});

export const verifyPasswordSchema = z.object({
  password: z.string().min(1, "Password is required").max(128),
});

export const updateContentSchema = z.object({
  content: z.string().max(500_000, "Content too large"),
  clientId: z.string().max(64).optional(),
});

export const renameSlugSchema = z.object({
  newSlug: slugSchema,
});

export const setPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128)
    .nullable(),
});

/** MIME types allowed for upload — must stay in sync with the client-side
 * category filters (FilePanel matchCategory) and the formats advertised in
 * the guide (ZIP, TAR, PDF, images, MP4/MP3, TXT, JSON, CSV, code). */
export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "image/bmp", "image/x-icon", "image/vnd.microsoft.icon",
  "application/pdf",
  "text/plain", "text/csv", "text/markdown",
  "application/json",
  "application/zip", "application/x-zip-compressed",
  "application/x-rar-compressed", "application/x-tar",
  "application/gzip", "application/x-7z-compressed",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "audio/mpeg", "audio/wav", "audio/x-wav", "audio/ogg", "audio/flac", "audio/x-flac", "audio/mp4",
  "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska",
]);

export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

export const uploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  mimetype: z.string().refine(
    (m) => ALLOWED_MIME_TYPES.has(m),
    "File type not allowed"
  ),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, "File exceeds 500 MB limit"),
});
