import { checkAuth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { SECURITY_DIRECTIVE, sanitizeMessages } from "@/lib/agent-security";
import { supabaseAdmin } from "@/lib/supabase";

const TAB_CONTEXT: Record<string, string> = {
  inbox: "The user is viewing their Inbox — message management, client communications, reply composer.",
  leads: "The user is on the Leads page — CRM lead generation using OSM/Google Places search.",
  clients: "The user is on the Clients page — contact directory management.",
  contracts: "The user is on Contracts — e-signature documents.",
  invoices: "The user is on Invoices — quote and invoice management.",
  books: "The user is on Books — accounting and transaction ledger.",
  missions: "The user is on Missions — drone mission planner.",
  flights: "The user is on Flights — CAAP flight log and drone registry.",
  checklist: "The user is on Pilot Checklist — pre-flight, post-flight, safety and operational equipment checks. Help them make GO/NO-GO decisions. Treat critical failures seriously: weather/airspace, battery, propellers, GPS/home point, launch zone, SD/media, fire suppression, first-aid, and abnormal aircraft behavior should be corrected before flight.",
  exam: "The user is on Pilot Exam — CAAP RPAS exam practice split into Situational, Theoretical, and Practical sections. Help explain correct answers from PCAR Parts 1, 2, 4, 11 and practical skill-test procedures such as walkaround, startup, takeoff commands, maneuvers, RTH, and post-flight checks.",
  map: "The user is on the Map — airspace visualization.",
  surveys: "The user is on Surveys — photogrammetry job tracker.",
  studio: "The user is on Studio — color grading tool.",
  ingest: "The user is on Ingest — SRT video telemetry import.",
  projects: "The user is on Projects — project management with Gantt chart.",
  activity: "The user is on Activity — aggregated timeline of all operations.",
  calendar: "The user is on Calendar — visual schedule with 24-hour timeline.",
  regs: `The user is viewing the PCAR/RPAS Regulations reference page. You are a CAAP drone regulations expert for the Philippines. Answer questions about PCAR Parts 1, 2, 4, 11, MC 010-2024, RA 9497, registration, pilot licensing, operational limits, no-fly zones, and penalties. Key facts: DJI Mini 5 Pro (248g) sub-250g = no CAAP registration for recreational; commercial = Operator Cert + Remote Pilot License + insurance. Pilot license required for commercial or ≥7kg recreational, min age 18, valid 5 years. Operator Cert: ₱36,400, 3 years, Filipino-only. Registration: ₱1,000 recreational, ₱1,680 per RPA commercial. Limits: 400ft AGL max, 10km from airports, 30m from persons. Special permits for: night, BVLOS, above 400ft, within 10km airports, over populated areas. Fines up to ₱200,000 + confiscation + criminal charges.`,
  drone: `The user is on the Drone Parts page — a visual breakdown of all DJI Mini 5 Pro aircraft components (17 parts) and DJI RC-N3 remote controller parts (15 parts). Key parts: aircraft has Forward-Facing LiDAR, Omnidirectional Vision System, Gimbal & Camera, Downward Vision System, 3D Infrared Sensing, Side Button (QuickTransfer), Battery Buckles, Landing Gears (antennas), Status Indicators, Motors, Propellers (6028F), Intelligent Flight Battery (BWXNN5-2788-7.0), Power Button, Battery Level LEDs, USB-C Port, microSD Slot. RC-N3 has Power Button, Flight Mode Switch (C/N/S), RTH Button, Battery LEDs, Control Sticks (Mode 2 default), Customizable Button (gimbal roll), Photo/Video Button, RC Cable, Phone Holder, Antennas, USB-C, Stick Storage Slots, Gimbal Dial, Shutter/Record Button, Phone Slot.`,
  manual: `The user is viewing the DJI Mini 5 Pro User Manual reference page (v1.0, 2025.09). Answer any question about Mini 5 Pro operations. Key facts: Aircraft model MT5MFND, C0 weight 249.9g (sub-250g), C1 weight 355g. Battery model BWXNN5-2788-7.0 (standard 71.2g), Plus BWXNN5-4680-7.16 (117g, C1 only). Propellers: 6028F, color-coded A and B. Flight modes: Normal (all sensors), Cine (smooth limited speed), Sport (max speed, NO obstacle avoidance), ATTI (auto-fallback — land immediately). RTH: triggered by user, low battery, or 6s signal loss (Failsafe). Always set RTH altitude before flight. Intelligent modes: FocusTrack (Spotlight, POI, ActiveTrack), MasterShots, QuickShots (Dronie, Rocket, Circle, Helix, Boomerang, Asteroid), Hyperlapse, Waypoint Flight, Cruise Control. RC-N3: no screen, uses phone via DJI Fly. Status LEDs: green slow = GNSS, yellow slow = ATTI, red blink = error/low battery, red+yellow alternating = compass calibration needed. Battery tips: charge 5–40°C ideal 22–28°C, discharge to 30% for transport, 200 cycle rating. Sensing system (APAS): Bypass or Brake in Normal/Cine — disabled in Sport. QuickTransfer: press Side Button, uses Wi-Fi 5.8 GHz. Vision system limitations: does not work at night, near water/glass/monochrome surfaces, or above 30m without GNSS.`,
};

const EVENT_COLORS: Record<string, string> = {
  activity:    "#06b6d4",
  appointment: "#a78bfa",
  reminder:    "#fbbf24",
  meeting:     "#34d399",
};

const CALENDAR_TOOLS = [
  {
    type: "function",
    function: {
      name: "list_events",
      description: "List calendar events in a date range. Use before deleting or updating to get event IDs.",
      parameters: {
        type: "object",
        properties: {
          start_date: { type: "string", description: "Start date YYYY-MM-DD" },
          end_date:   { type: "string", description: "End date YYYY-MM-DD (inclusive)" },
          title:      { type: "string", description: "Optional: filter by partial title keyword" },
        },
        required: ["start_date", "end_date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_event",
      description: "Create a new calendar event.",
      parameters: {
        type: "object",
        properties: {
          title:      { type: "string", description: "Event title" },
          event_type: { type: "string", enum: ["activity", "appointment", "reminder", "meeting"] },
          date:       { type: "string", description: "Date YYYY-MM-DD" },
          time:       { type: "string", description: "Start time 24h HH:MM, omit for all-day" },
          end_time:   { type: "string", description: "End time 24h HH:MM" },
          notes:      { type: "string", description: "Extra notes" },
          location:   { type: "string", description: "Location" },
        },
        required: ["title", "event_type", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_event",
      description: "Update fields on an existing calendar event by ID.",
      parameters: {
        type: "object",
        properties: {
          id:         { type: "string", description: "Event UUID from list_events" },
          title:      { type: "string" },
          event_type: { type: "string", enum: ["activity", "appointment", "reminder", "meeting"] },
          date:       { type: "string", description: "YYYY-MM-DD" },
          time:       { type: "string", description: "24h HH:MM, empty string to clear" },
          end_time:   { type: "string", description: "24h HH:MM, empty string to clear" },
          notes:      { type: "string", description: "Empty string to clear" },
          location:   { type: "string", description: "Empty string to clear" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_event",
      description: "Permanently delete a single calendar event by its ID.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "Event UUID to delete" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_events_bulk",
      description: "Delete multiple calendar events at once. Use this when deleting several events (e.g. clearing a whole month) instead of calling delete_event repeatedly.",
      parameters: {
        type: "object",
        properties: {
          ids: {
            type: "array",
            items: { type: "string" },
            description: "Array of event UUIDs to delete",
          },
        },
        required: ["ids"],
      },
    },
  },
];

async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "list_events": {
      let q = supabaseAdmin
        .from("calendar_events")
        .select("id, title, type, date, time, end_time, notes, location")
        .gte("date", args.start_date as string)
        .lte("date", args.end_date as string);
      if (args.title) q = q.ilike("title", `%${args.title}%`);
      const { data } = await q.order("date").order("time", { ascending: true, nullsFirst: true });
      return data ?? [];
    }

    case "create_event": {
      const evType = (args.event_type ?? "activity") as string;
      const { data, error } = await supabaseAdmin
        .from("calendar_events")
        .insert({
          title:    (args.title as string).trim(),
          type:     evType,
          date:     args.date as string,
          time:     (args.time as string | undefined) || null,
          end_time: (args.end_time as string | undefined) || null,
          notes:    (args.notes as string | undefined)?.trim() || null,
          location: (args.location as string | undefined)?.trim() || null,
          color:    EVENT_COLORS[evType] ?? "#06b6d4",
        })
        .select()
        .single();
      if (error) return { error: error.message };
      return { success: true, event: data };
    }

    case "update_event": {
      const patch: Record<string, unknown> = {};
      if (args.title      !== undefined) patch.title    = (args.title as string).trim();
      if (args.event_type !== undefined) {
        patch.type  = args.event_type;
        patch.color = EVENT_COLORS[args.event_type as string] ?? "#06b6d4";
      }
      if (args.date     !== undefined) patch.date     = args.date;
      if (args.time     !== undefined) patch.time     = (args.time as string) || null;
      if (args.end_time !== undefined) patch.end_time = (args.end_time as string) || null;
      if (args.notes    !== undefined) patch.notes    = (args.notes as string)?.trim() || null;
      if (args.location !== undefined) patch.location = (args.location as string)?.trim() || null;
      const { data, error } = await supabaseAdmin
        .from("calendar_events")
        .update(patch)
        .eq("id", args.id as string)
        .select()
        .single();
      if (error) return { error: error.message };
      return { success: true, event: data };
    }

    case "delete_event": {
      const { error } = await supabaseAdmin
        .from("calendar_events")
        .delete()
        .eq("id", args.id as string);
      if (error) return { error: error.message };
      return { success: true, deleted_id: args.id };
    }

    case "delete_events_bulk": {
      const ids = args.ids as string[];
      if (!ids?.length) return { success: true, deleted_count: 0 };
      const { error } = await supabaseAdmin
        .from("calendar_events")
        .delete()
        .in("id", ids);
      if (error) return { error: error.message };
      return { success: true, deleted_count: ids.length };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildSystemPrompt(tab: string): string {
  const tabCtx = TAB_CONTEXT[tab] || "The user is navigating the ops dashboard.";
  return `You are Panchi — the AI executive assistant for waevpoint's ops dashboard. Warm, direct, concise.

TODAY'S DATE: ${todayStr()}
Convert relative dates (tomorrow, next Monday, this week, this month) to YYYY-MM-DD before calling tools.

CURRENT TAB: ${tabCtx}

CALENDAR TOOLS — use when user asks about scheduling or events:
- list_events(start_date, end_date): get events in a range. ALWAYS call this first before deleting or updating.
- create_event(title, event_type, date, ...): add a new event.
- update_event(id, ...fields): modify an existing event.
- delete_events_bulk(ids): delete MULTIPLE events at once — use this when deleting 2+ events.
- delete_event(id): delete a single event.

IMPORTANT: When deleting multiple events, always use delete_events_bulk with ALL IDs in one call.
Event types: activity, appointment, reminder, meeting
Times: 24h — "14:00" = 2pm, "09:30" = 9:30am

After actions, confirm what was done (names, dates, times).
If ambiguous, list options and ask which one.
Keep responses under 150 words. No emojis unless the user uses them first.
FORMATTING: For checklists and step-by-step lists, output each item on its own line as "✓ Item — detail". For plain answers, use short sentences — no asterisks or markdown.

ABOUT WAEVPOINT: drone videography/photography business in the Philippines.
TERMS: GSD, AGL, CAAP, ODM, Orthomosaic, DSM, SRT.

DJI MINI 5 PRO KNOWLEDGE BASE:
Aircraft: model MT5MFND, C0 weight 249.9g (sub-250g, no CAAP reg recreational), C1 355g. Battery BWXNN5-2788-7.0 (71.2g standard), Plus BWXNN5-4680-7.16 (117g, C1 only). Propellers 6028F color-coded A/B. Flight modes: Normal (full sensors), Cine (smooth slow), Sport (max speed, NO obstacle avoidance — always warn user), ATTI (auto-fallback — instruct to land immediately). RTH: hold RTH button, or auto on low battery / 6s signal loss — always remind to set RTH altitude before flying. Intelligent modes: FocusTrack (Spotlight/POI/ActiveTrack), MasterShots, QuickShots (Dronie/Rocket/Circle/Helix/Boomerang/Asteroid), Hyperlapse, Waypoint Flight, Cruise Control. RC-N3 has no screen — uses phone via DJI Fly app. Battery care: charge 5–40°C, ideal 22–28°C, discharge to 30% for transport, 200 cycle limit. Vision/sensing: disabled in Sport, limited at night, near water/glass/monochrome, best 0.5–30m altitude. Status LEDs: green slow = GNSS ready, yellow slow = ATTI mode, red blink = error/low battery, red+yellow = compass calibration needed.`;
}

// Primary: Groq (fast, free tier)
const GROQ_API    = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

// Fallback: OpenRouter — text-only (free models don't support tool calling)
const OR_API     = "https://openrouter.ai/api/v1/chat/completions";
const OR_MODELS  = ["meta-llama/llama-3.3-70b-instruct:free", "mistralai/mistral-small-3.1-24b-instruct:free"];
const OR_HEADERS = { "HTTP-Referer": "https://waevpoint.quest", "X-Title": "Waevpoint Ops" };

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

function fetchCompletion(
  apiUrl: string,
  apiKey: string,
  model: string,
  messages: unknown[],
  stream: boolean,
  tools?: unknown[],
  extra: Record<string, string> = {},
): Promise<Response> {
  return fetch(apiUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", ...extra },
    body: JSON.stringify({
      model,
      messages,
      stream,
      temperature: 0.4,
      max_tokens: 1024,
      ...(tools?.length ? { tools, tool_choice: "auto" } : {}),
    }),
  });
}

type CallResult =
  | { ok: true; res: Response; model: string }
  | { ok: false; status: number; errText: string };

async function callAI(
  groqKey: string,
  orKey: string | undefined,
  messages: unknown[],
  stream: boolean,
  tools?: unknown[],
): Promise<CallResult> {
  // 1. Try Groq
  for (const model of GROQ_MODELS) {
    try {
      const res = await fetchCompletion(GROQ_API, groqKey, model, messages, stream, tools);
      if (res.ok) return { ok: true, res, model };
      console.warn(`Groq ${res.status} on ${model}`);
    } catch (e) {
      console.error(`Groq fetch error (${model}):`, e);
    }
  }

  // 2. Fallback to OpenRouter — send without tools (free models don't support tool calling)
  if (orKey) {
    for (const model of OR_MODELS) {
      try {
        const res = await fetchCompletion(OR_API, orKey, model, messages, stream, undefined, OR_HEADERS);
        if (res.ok) return { ok: true, res, model };
        console.warn(`OpenRouter ${res.status} on ${model}`);
      } catch (e) {
        console.error(`OpenRouter fetch error (${model}):`, e);
      }
    }
  }

  return { ok: false, status: 503, errText: "AI service unavailable — please try again." };
}

function streamFromHF(hfRes: Response): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = hfRes.body!.getReader();
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
            const t = line.trim();
            if (!t.startsWith("data: ")) continue;
            const data = t.slice(6);
            if (data === "[DONE]") { controller.enqueue(encoder.encode("data: [DONE]\n\n")); continue; }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            } catch { /* skip */ }
          }
        }
      } catch (err) { console.error("Stream error:", err); }
      controller.close();
    },
  });
  return new Response(stream, { headers: SSE_HEADERS });
}

function streamText(text: string, calendarChanged = false): Response {
  const encoder = new TextEncoder();
  const s = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
      if (calendarChanged) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ action: "calendar_changed" })}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(s, { headers: SSE_HEADERS });
}

const CALENDAR_RE = /\b(schedul|event|appointment|meeting|reminder|activit|calendar|delete|remov|creat|add\s|move|reschedul|what.{0,20}(today|tomorrow|week|month)|my\s+(day|week|schedule)|at \d|\bam\b|\bpm\b|block\s*time|clear\s+my|cancel\b)/i;

function isCalendarRequest(tab: string, msgs: unknown[]): boolean {
  if (tab === "calendar") return true;
  const last = msgs[msgs.length - 1];
  const content = last && typeof last === "object" && "content" in last
    ? String((last as { content: string }).content) : "";
  return CALENDAR_RE.test(content);
}

const MUTATION_TOOLS = new Set(["create_event", "update_event", "delete_event", "delete_events_bulk"]);

async function runToolLoop(
  groqKey: string,
  orKey: string | undefined,
  messages: unknown[],
): Promise<{ content: string; mutated: boolean } | { error: string; status: number }> {
  let allMsgs = [...messages];
  let mutated = false;

  for (let round = 0; round < 5; round++) {
    // Tool calling requires Groq — OR free models don't support it
    const result = await callAI(groqKey, undefined, allMsgs, false, CALENDAR_TOOLS);
    if (!result.ok) return { error: result.errText, status: result.status };

    const json  = await result.res.json();
    const msg   = json.choices?.[0]?.message;
    const tcs   = msg?.tool_calls;

    allMsgs = [...allMsgs, msg];

    if (!tcs?.length) return { content: msg?.content ?? "", mutated };

    for (const tc of tcs) {
      if (MUTATION_TOOLS.has(tc.function.name)) mutated = true;
      let toolResult: unknown;
      try {
        toolResult = await executeTool(tc.function.name, JSON.parse(tc.function.arguments));
      } catch (e) {
        toolResult = { error: String(e) };
      }
      allMsgs.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(toolResult) });
    }
  }

  // Exceeded rounds — force plain text
  const result = await callAI(groqKey, orKey, allMsgs, false);
  if (!result.ok) return { error: result.errText, status: result.status };
  const json = await result.res.json();
  return { content: json.choices?.[0]?.message?.content ?? "", mutated };
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return new Response("Unauthorized", { status: 401 });

  const groqKey = process.env.GROQ_API_KEY;
  const orKey   = process.env.OPENROUTER_API_KEY;
  if (!groqKey && !orKey) return new Response("AI assistant not configured", { status: 503 });

  const { messages, tab } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }

  const systemMsg = { role: "system", content: buildSystemPrompt(tab || "") + SECURITY_DIRECTIVE };
  const userMsgs  = sanitizeMessages(messages, 20, 1000);
  const allMsgs   = [systemMsg, ...userMsgs];

  if (!isCalendarRequest(tab || "", userMsgs)) {
    const result = await callAI(groqKey ?? "", orKey, allMsgs, true);
    if (!result.ok) return new Response(result.errText, { status: result.status });
    return streamFromHF(result.res);
  }

  const outcome = await runToolLoop(groqKey ?? "", orKey, allMsgs);
  if ("error" in outcome) return new Response(outcome.error, { status: outcome.status });
  return streamText(outcome.content, outcome.mutated);
}
