import { supabase } from "./supabaseClient";

const BUCKET = "product-images";

function extensionFromMime(mimeType: string): string {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}

// Uploads a File (manual upload) or Blob (AI-generated result) to Supabase
// Storage and returns a permanent public URL — replaces the old blob:/data:
// URLs, which only ever lived inside the current browser tab.
export async function uploadProductImage(fileOrBlob: File | Blob): Promise<string> {
  const mimeType = fileOrBlob.type || "image/jpeg";
  const fileName = `${crypto.randomUUID()}.${extensionFromMime(mimeType)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(fileName, fileOrBlob, {
    contentType: mimeType,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function urlToBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  return response.blob();
}
