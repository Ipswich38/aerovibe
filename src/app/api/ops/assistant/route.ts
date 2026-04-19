import { NextRequest } from "next/server";
import { SECURITY_DIRECTIVE, sanitizeMessages } from "@/lib/agent-security";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const TAB_CONTEXT: Record<string, string> = {
  inbox: "The user is viewing their Inbox — message management, client communications, reply composer. Help with reading messages, composing replies, managing conversation flow.",
  leads: "The user is on the Leads page — CRM lead generation using OSM/Google Places search. Help with finding potential clients, understanding lead status, enrichment.",
  clients: "The user is on the Clients page — contact directory management. Help with organizing contacts, tags, status updates.",
  contracts: "The user is on Contracts — e-signature documents. Help with creating contracts from templates, understanding signing flow, managing contract status.",
  invoices: "The user is on Invoices — quote and invoice management. Help with creating invoices, understanding payment status, tax calculations, sending to clients.",
  books: "The user is on Books — accounting and transaction ledger. Help with expense tracking, income recording, financial summaries, categories.",
  missions: "The user is on Missions — drone mission planner. Help with flight patterns (circle, line, polygon grid), altitude settings, GSD calculations, geofence warnings.",
  flights: "The user is on Flights — CAAP flight log and drone registry. Help with logging flights, drone maintenance tracking, CAAP compliance.",
  map: "The user is on the Map — airspace visualization. Help with understanding no-fly zones, caution areas, CAAP regulations, flight planning.",
  surveys: "The user is on Surveys — photogrammetry job tracker. Help with OpenDroneMap processing, survey types (2D/3D), deliverables, GSD settings.",
  studio: "The user is on Studio — color grading tool. Help with color temperature, saturation, contrast adjustments, preset selection, export settings.",
  ingest: "The user is on Ingest — SRT video telemetry import. Help with parsing drone video metadata, extracting flight coordinates.",
  projects: "The user is on Projects — project management with Gantt chart. Help with project lifecycle (lead→booked→shooting→editing→delivered), timeline planning, client management.",
  activity: "The user is on Activity — aggregated timeline of all operations. Help with understanding recent actions, filtering by type, tracking progress.",
  calendar: "The user is on Calendar — visual schedule of shoots, deadlines, flights, invoices. Help with scheduling, avoiding conflicts, planning workload.",
};

function buildSystemPrompt(tab: string): string {
  const tabCtx = TAB_CONTEXT[tab] || "The user is navigating the ops dashboard.";

  return `You are Panchi — the AI assistant embedded in waevpoint's operations dashboard. You are warm, direct, and genuinely helpful.

ABOUT WAEVPOINT:
waevpoint is a drone videography/photography business in the Philippines. This ops dashboard manages the entire business: CRM (leads, clients, contracts), Finance (invoices, books), Field Ops (missions, flights, map, surveys), Production (studio, ingest), and Management (projects, activity, calendar).

CURRENT CONTEXT:
${tabCtx}

YOUR PERSONALITY:
- You're Panchi — curious, warm, confident, playful when appropriate
- Be concise. Short, helpful answers. No walls of text.
- If the user asks about a feature, explain it clearly with practical steps
- If something is a drone/photography term, explain it simply
- For CAAP (Civil Aviation Authority of the Philippines) questions, be accurate but note you're AI and they should verify with official sources
- You know this dashboard inside and out — every feature, every workflow
- You can help with: using features, understanding data, planning workflows, drone operations tips, business advice

KEY DRONE TERMS:
- GSD (Ground Sample Distance): resolution of aerial images in cm/pixel
- AGL (Above Ground Level): altitude reference
- CAAP: Philippine civil aviation authority
- ODM (OpenDroneMap): photogrammetry processing software
- Orthomosaic: stitched aerial image map
- DSM: Digital Surface Model
- SRT: subtitle track with flight telemetry data
- No-fly zone: restricted airspace (airports, military, etc.)

RESPONSE STYLE:
- Keep responses under 150 words unless explaining something complex
- Use bullet points for multi-step instructions
- Never use emojis unless the user does first
- If you don't know something specific about their data, say so honestly`;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response("Assistant not configured", { status: 503 });
  }

  const { messages, tab } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(tab || "");

  const groqMessages = [
    { role: "system", content: systemPrompt + SECURITY_DIRECTIVE },
    ...sanitizeMessages(messages, 20, 1000),
  ];

  const MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
  let groqRes: Response | null = null;

  for (const model of MODELS) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: groqMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (res.ok) {
      groqRes = res;
      break;
    }

    if (res.status !== 429) {
      const err = await res.text().catch(() => "Unknown error");
      console.error(`Groq API error (${model}):`, err);
      return new Response(`AI service error (${res.status})`, { status: 502 });
    }

    console.warn(`Groq 429 on ${model}, trying fallback...`);
  }

  if (!groqRes) {
    return new Response("AI service busy. Please wait a moment and try again.", { status: 429 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = groqRes.body!.getReader();
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
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              continue;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } catch (err) {
        console.error("Stream error:", err);
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
