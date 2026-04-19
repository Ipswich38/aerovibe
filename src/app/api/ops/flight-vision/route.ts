import { NextRequest } from "next/server";
import { SECURITY_DIRECTIVE, sanitizeMessage } from "@/lib/agent-security";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const HF_BASE = "https://router.huggingface.co/v1";
const PRIMARY_MODEL = "google/gemma-4-31B-it:together";
const FALLBACK_MODEL = "Qwen/Qwen2-VL-7B-Instruct";

const SYSTEM_PROMPT = `You are Captain Panchi's vision system — analyzing whatever the drone pilot shows you. This could be a live camera view of the environment, a drone photo, a drone video frame, a DJI Fly screenshot, a roof close-up, an aerial survey image, a landscape, a construction site, a person, a vehicle, a building, or literally anything. Analyze what you actually see — don't assume context.

Study the image carefully and report on EVERYTHING relevant:

WHAT YOU SEE: describe the scene factually. What's in the image — terrain, structures, people, vehicles, vegetation, water, sky, objects. Be specific with counts, colors, materials, conditions.

SAFETY: anything that affects drone operations — people nearby, obstacles (wires, poles, cranes, trees), no-fly concerns, wind indicators (flags, trees bending, dust), weather visible (clouds, haze, rain). Only mention if visible.

LIGHTING & EXPOSURE: quality of light, harsh shadows vs diffuse, time of day estimate, whether the image is well-exposed, overexposed, or underexposed. ND filter recommendation if relevant.

CONDITION ASSESSMENT: if the image shows a structure, roof, solar panels, road, construction, crop, or anything inspectable — assess its visible condition. Cracks, rust, wear, damage, moss, debris, missing parts, discoloration, deformation. Be specific about what you see and where.

COMPOSITION & QUALITY: image sharpness, motion blur, framing, resolution adequacy. For aerial photos: estimate altitude, GSD if nadir, overlap with previous shots.

ACTIONABLE RECOMMENDATIONS: based on what you see, give 2-3 specific next steps. Could be camera settings, flight adjustments, areas to investigate closer, safety warnings, or composition improvements. Tailor to what's actually in the image.

Keep analysis concise — the pilot is in the field. Lead with the most important observations first. Don't pad with generic advice that doesn't relate to what's visible.

CRITICAL FORMAT RULE: Do NOT use markdown. No asterisks, no hashtags, no bullet points, no bold, no headers. Write in plain natural sentences and paragraphs. Use line breaks to separate sections. Number items verbally (first, second, third) not with symbols.`;

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = process.env.HF_TOKEN;
  if (!token) {
    return new Response("Vision not configured", { status: 503 });
  }

  const { imageDataUrl, context } = await req.json();
  if (!imageDataUrl || typeof imageDataUrl !== "string") {
    return new Response("Image required", { status: 400 });
  }
  if (!imageDataUrl.startsWith("data:image/")) {
    return new Response("Invalid image format", { status: 400 });
  }
  if (imageDataUrl.length > 10_000_000) {
    return new Response("Image too large", { status: 413 });
  }

  const safeContext = context ? sanitizeMessage(context) : "";
  const userText = safeContext
    ? `Analyze this scene for drone flight planning. Additional context from pilot: ${safeContext}`
    : "Analyze this scene for drone flight planning. What do you see?";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT + SECURITY_DIRECTIVE },
    {
      role: "user",
      content: [
        { type: "text", text: userText },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ],
    },
  ];

  async function tryModel(model: string): Promise<Response> {
    return fetch(`${HF_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_tokens: 1500,
        temperature: 0.4,
      }),
    });
  }

  let upstream: Response;
  try {
    upstream = await tryModel(PRIMARY_MODEL);
    if (!upstream.ok || !upstream.body) {
      console.warn(`Vision primary failed (${upstream.status}), trying fallback`);
      upstream = await tryModel(FALLBACK_MODEL);
    }
  } catch {
    try {
      upstream = await tryModel(FALLBACK_MODEL);
    } catch (err) {
      console.error("Vision fallback failed:", err);
      return new Response("Vision service unavailable", { status: 502 });
    }
  }

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "");
    console.error(`Vision model error ${upstream.status}: ${errText.slice(0, 200)}`);
    return new Response(`Vision error (${upstream.status})`, { status: 502 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              continue;
            }
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              const content = delta?.content;
              // Skip reasoning tokens (Gemma 4 <think> blocks)
              if (content && !delta?.reasoning_content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch { /* skip */ }
          }
        }
      } catch (err) {
        console.error("Vision stream error:", err);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
