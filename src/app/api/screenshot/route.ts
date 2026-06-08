import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const r = await fetch(`https://image.thum.io/get/width/1440/crop/900/${url}`, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; waevpoint-bot/1.0)" },
    });
    clearTimeout(timer);

    if (!r.ok) return new Response("Screenshot unavailable", { status: 502 });

    const buf = Buffer.from(await r.arrayBuffer());
    return new Response(buf, {
      headers: {
        "Content-Type": r.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    clearTimeout(timer);
    return new Response("Timeout", { status: 504 });
  }
}
