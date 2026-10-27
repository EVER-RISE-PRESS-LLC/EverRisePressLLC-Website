import { NextRequest, NextResponse } from "next/server";

export function sameOrigin(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

export async function readBoundedJson(request: Request, limit = 250_000): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > limit) throw new Error("REQUEST_TOO_LARGE");
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw new Error("REQUEST_TOO_LARGE"); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { return null; }
}

export function adminJson(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
}
export function mutationError(request: NextRequest) {
  return sameOrigin(request) ? null : adminJson({ error: "Please open this page on the EverRise Press website and try again." }, 403);
}
