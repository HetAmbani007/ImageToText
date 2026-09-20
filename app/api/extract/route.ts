import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.API_NINJAS_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API_NINJAS_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const incoming = await request.formData();
  const image = incoming.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: "Please provide an image file." }, { status: 400 });
  }

  if (!image.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are supported." }, { status: 415 });
  }

  const form = new FormData();
  form.append("image", image, image.name || "capture.jpg");

  const response = await fetch("https://api.api-ninjas.com/v1/imagetotext", {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body: form,
    cache: "no-store"
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: detail || "The OCR provider could not process this image." },
      { status: response.status }
    );
  }

  const result: unknown = await response.json();
  const text =
    typeof result === "object" &&
    result !== null &&
    "text" in result &&
    typeof result.text === "string"
      ? result.text
      : "";

  return NextResponse.json({ text });
}
