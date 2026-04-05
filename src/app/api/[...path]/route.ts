import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function proxy(request: NextRequest, path: string[]) {
  const url = `${BACKEND_URL}/api/${path.join("/")}${request.nextUrl.search}`;
  const isSSE = request.headers.get("accept")?.includes("text/event-stream");

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!["origin", "host", "referer"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const res = await fetch(url, {
    method: request.method,
    headers,
    body: ["GET", "HEAD", "DELETE"].includes(request.method) ? null : await request.arrayBuffer(),
    // @ts-ignore — Node.js fetch 스트리밍
    duplex: "half",
    cache: "no-store",
  });

  const resHeaders = new Headers();
  res.headers.forEach((value, key) => {
    if (!["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) {
      resHeaders.set(key, value);
    }
  });

  if (isSSE) {
    resHeaders.set("Content-Type", "text/event-stream");
    resHeaders.set("Cache-Control", "no-cache, no-transform");
    resHeaders.set("Connection", "keep-alive");
    resHeaders.set("X-Accel-Buffering", "no");

    // TransformStream으로 명시적 스트리밍 — Next.js 내부 버퍼링 방지
    const { readable, writable } = new TransformStream();
    res.body?.pipeTo(writable).catch(() => {});
    return new Response(readable, { status: res.status, headers: resHeaders });
  }

  return new NextResponse(res.body, {
    status: res.status,
    headers: resHeaders,
  });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await params).path);
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await params).path);
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await params).path);
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await params).path);
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await params).path);
}
