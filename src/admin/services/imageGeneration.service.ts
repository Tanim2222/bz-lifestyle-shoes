// Converts any image URL (data:, blob:, or https:) into base64 + mimeType,
// since the backend needs raw bytes to hand to Gemini.
async function urlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const response = await fetch(url);
  const blob = await response.blob();
  const mimeType = blob.type || "image/jpeg";

  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return { data, mimeType };
}

export async function generateProductImage(baseImageUrl: string, prompt: string): Promise<string> {
  const baseImage = await urlToBase64(baseImageUrl);

  const response = await fetch("/api/generate-product-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, baseImage }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error ?? "Failed to generate image.");
  }
  return json.imageDataUrl as string;
}

// Cuts out the subject from any photo (box, tag, background and all) and
// composites it onto a plain studio-color backdrop.
export async function removeBackground(baseImageUrl: string, bgColor: string): Promise<string> {
  const baseImage = await urlToBase64(baseImageUrl);

  const response = await fetch("/api/remove-background", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseImage, bgColor }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error ?? "Failed to remove background.");
  }
  return json.imageDataUrl as string;
}
