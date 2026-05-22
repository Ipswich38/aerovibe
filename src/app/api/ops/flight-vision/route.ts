import { checkAuth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { SECURITY_DIRECTIVE, sanitizeMessage } from "@/lib/agent-security";

const GROQ_API    = "https://api.groq.com/openai/v1/chat/completions";
const OR_API      = "https://openrouter.ai/api/v1/chat/completions";
const OR_HEADERS  = { "HTTP-Referer": "https://waevpoint.quest", "X-Title": "Waevpoint Ops" };
const GROQ_MODELS = ["meta-llama/llama-4-scout-17b-16e-instruct"];
const OR_MODELS   = ["meta-llama/llama-3.2-90b-vision-instruct:free", "qwen/qwen2.5-vl-7b-instruct:free"];

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

  const groqKey = process.env.GROQ_API_KEY;
  const orKey   = process.env.OPENROUTER_API_KEY;
  if (!groqKey && !orKey) {
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

  function tryFetch(apiUrl: string, apiKey: string, model: string, extra: Record<string, string> = {}): Promise<Response> {
    return fetch(apiUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", ...extra },
      body: JSON.stringify({ model, messages, stream: true, max_tokens: 1500, temperature: 0.4 }),
    });
  }

  let upstream: Response | null = null;

  // Try Groq models first
  if (groqKey) {
    for (const model of GROQ_MODELS) {
      try {
        const res = await tryFetch(GROQ_API, groqKey, model);
        if (res.ok && res.body) { upstream = res; break; }
        console.warn(`Groq vision ${res.status} on ${model}`);
      } catch (e) { console.error(`Groq vision error (${model}):`, e); }
    }
  }

  // Fallback to OpenRouter
  if (!upstream && orKey) {
    for (const model of OR_MODELS) {
      try {
        const res = await tryFetch(OR_API, orKey, model, OR_HEADERS);
        if (res.ok && res.body) { upstream = res; break; }
        console.warn(`OR vision ${res.status} on ${model}`);
      } catch (e) { console.error(`OR vision error (${model}):`, e); }
    }
  }

  if (!upstream || !upstream.body) {
    return new Response("Vision service unavailable", { status: 502 });
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
