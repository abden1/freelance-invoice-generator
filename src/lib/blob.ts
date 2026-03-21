import { put, del } from "@vercel/blob";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  document: ["application/pdf", "image/jpeg", "image/png"],
};

export async function uploadFile(
  file: File,
  folder: string = "uploads",
  type: "image" | "document" = "image"
): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 10MB limit");
  }

  if (!ALLOWED_TYPES[type].includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${ALLOWED_TYPES[type].join(", ")}`);
  }

  const filename = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  const blob = await put(filename, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}

export async function deleteFile(url: string): Promise<void> {
  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch {
    // Silent fail — file may not exist
  }
}

export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  contentType: string = "application/pdf"
): Promise<string> {
  const blob = await put(filename, buffer, {
    access: "public",
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}
