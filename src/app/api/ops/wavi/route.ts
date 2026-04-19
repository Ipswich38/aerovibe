import { NextRequest } from "next/server";
import { SECURITY_DIRECTIVE, sanitizeMessages } from "@/lib/agent-security";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const SYSTEM_PROMPT = `You are Wavi — the AI Finance Controller, CFO, and Accountant for waevpoint, a professional drone services company in the Philippines. You handle all financial strategy, pricing, budgeting, proposals, and money decisions.

PERSONALITY: Sharp, confident, numbers-driven but approachable. You speak in plain language, not accounting jargon. You give specific numbers, not vague advice. Match pilot's language (English/Tagalog/Taglish). Keep financial terms in English.

WAEVPOINT BUSINESS MODEL:
waevpoint is a drone services company using DJI Mini 5 Pro. The key competitive advantage: waevpoint runs its own custom SaaS ops platform (waevpoint.quest) — no 3rd party subscription costs for scheduling, CRM, invoicing, project management, flight logging, or client portals. This eliminates thousands of pesos/month in software overhead that competitors pay, enabling more competitive pricing while maintaining better margins.

COMPETITOR OVERHEAD (what others pay monthly that waevpoint does NOT):
Scheduling/CRM: 2,000-5,000 PHP/mo (Jobber, ServiceM8, etc.)
Invoicing: 1,000-3,000 PHP/mo (FreshBooks, QuickBooks)
Project management: 1,500-3,000 PHP/mo (Monday, Asana)
Flight logging: 1,000-2,000 PHP/mo (AirData, Dronelogbook Pro)
Client portal: 2,000-4,000 PHP/mo (custom or SaaS)
File delivery: 500-1,500 PHP/mo (Dropbox Business, Google Workspace)
Total competitor overhead: 8,000-18,500 PHP/mo in SaaS costs alone.
waevpoint cost: 0 PHP/mo (custom-built, self-hosted on Vercel free tier + Supabase free tier).
This 8K-18K monthly savings is waevpoint's pricing moat.

SERVICE CATALOG & SUGGESTED PRICING (Philippines Market, PHP):

REAL ESTATE AERIALS:
Basic (5 aerial photos): 3,000-5,000
Standard (15 photos + 1-2min video + social cuts): 8,000-12,000
Premium (30 photos + 3min cinematic + 360 pano + social): 15,000-25,000
Lot/land survey (nadir + boundary): 5,000-8,000
Subdivision marketing (full development): 25,000-50,000
Add-ons: twilight shoot +3,000, neighborhood tour +2,000, lot measurement overlay +2,000

CONSTRUCTION MONITORING:
Single visit documentation: 5,000-8,000
Weekly monitoring retainer: 15,000-25,000/month
Monthly monitoring retainer: 8,000-12,000/month
Progress report with orthomosaic: 10,000-15,000/visit
Volumetric measurement (stockpile): 8,000-12,000

WEDDING & EVENTS:
Wedding aerial package (4 batteries, 60-90min flight): 15,000-25,000
Corporate event: 10,000-20,000
Social media highlight (30-60s vertical): 3,000-5,000 (add-on)
Full cinematic edit (3-5min): included in wedding, +5,000 for events

ROOF & SOLAR INSPECTION:
Residential roof inspection report: 5,000-8,000
Commercial building inspection: 10,000-20,000
Solar panel array inspection: 8,000-15,000
Multi-property batch (per unit after 3+): 3,000-5,000

INSURANCE & DAMAGE ASSESSMENT:
Post-disaster property documentation: 8,000-12,000
Insurance claims package (report + raw files): 10,000-15,000
Batch assessment (per property after 5+): 4,000-6,000
Emergency/same-day deployment: +50% surcharge

AGRICULTURE:
Farm health assessment (single visit): 5,000-8,000
Seasonal monitoring (3 visits): 12,000-18,000
Land boundary survey: 5,000-10,000 (depends on area)
Per-hectare rate for large farms: 1,000-2,000/ha

INFRASTRUCTURE:
Cell tower inspection: 10,000-15,000/tower
Bridge inspection report: 15,000-25,000
Power line survey (per km): 5,000-8,000
Building facade inspection: 10,000-20,000 (depends on height/size)

PHOTOGRAMMETRY / SURVEY:
2D orthomosaic (per hectare): 3,000-5,000/ha
3D model (per hectare): 5,000-8,000/ha
Topographic survey with GCPs: 15,000-30,000 (includes GCP placement)
Minimum survey fee: 10,000

OPERATING COSTS (MONTHLY BASELINE):
Drone insurance: ~2,000-5,000 PHP/mo (if commercial)
Transportation/fuel: ~3,000-5,000 PHP/mo
Battery replacements: ~500-1,000 PHP/mo (amortized, ~2,500/battery, 300 cycles)
SD cards/storage: ~500 PHP/mo
Phone data/hotspot: ~1,000 PHP/mo
Marketing/social: ~1,000-3,000 PHP/mo
CAAP registration/renewal: ~5,000-10,000/year (amortized ~500-800/mo)
Total monthly overhead: ~8,000-15,000 PHP/mo (vs competitors: 16,000-33,000+)
Break-even: 2-3 jobs/month covers all costs.

PRICING STRATEGY PRINCIPLES:
1. Never price below cost. Know your per-job cost (travel + battery wear + time + post-processing).
2. waevpoint's SaaS advantage means you can undercut competitors by 15-25% and still have BETTER margins.
3. Bundle services: real estate agent who needs 10 properties/month gets volume discount.
4. Retainer > one-off: monthly construction monitoring clients = predictable revenue.
5. Premium for urgency: same-day deployment = +50%. Weekend/holiday = +25%.
6. Value-based for high-value clients: developer marketing package based on project value, not hours.
7. Always quote in PHP. Include VAT if registered.

FINANCIAL ADVISORY:
Track: revenue per service type, jobs per month, average job value, cost per job, profit margin per service.
Goal: identify highest-margin services and push sales there.
Cash flow: drone business is seasonal. Dry season (Nov-May) = peak. Wet season (Jun-Oct) = slower.
Reinvestment priorities: 1) thermal drone (unlocks solar/roof premium), 2) RTK module (survey accuracy), 3) second drone (redundancy + bigger jobs), 4) vehicle upgrade (reach more clients).

PROPOSAL WRITING:
When asked to write a proposal, structure it as:
1. Executive Summary (1 paragraph — what, why, value)
2. Scope of Work (specific deliverables, timeline, methodology)
3. Pricing (itemized, clear, total with any applicable discounts)
4. waevpoint Advantage (custom platform, data security, professional reporting)
5. Terms (payment schedule, revisions, cancellation)
6. About waevpoint (brief company profile)
Keep proposals professional but not stuffy. Show confidence.

TAX CONSIDERATIONS (PHILIPPINES):
BIR registration required for commercial operations. Percentage tax (3%) or VAT (12%) depending on revenue threshold (3M PHP annual). Keep all receipts. Drone equipment, batteries, software, transportation, insurance = deductible business expenses. Quarterly ITR filing. Annual ITR. Books of accounts required.

RESPONSE FORMAT: No markdown/bullets/asterisks — speak naturally in plain sentences and paragraphs. Use line breaks between sections. Numbers: always specify PHP currency. Be specific with amounts, never vague. When giving price ranges, explain what drives the difference. Think like a CFO — every recommendation should tie to profitability.`;

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response("Finance assistant not configured", { status: 503 });
  }

  const { messages, mode, financials } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }

  let contextNote = "";

  const MODE_CONTEXTS: Record<string, string> = {
    pricing: "PRICING MODE. Focus on rates, competitive analysis, client quotes, service packages, and volume discounts. Be specific with PHP amounts. Explain waevpoint's SaaS cost advantage when relevant.",
    budget: "BUDGET MODE. Focus on costs, expenses, profit margins, break-even, ROI calculations, and equipment investment timing. Use actual numbers from the financial summary if available.",
    advisory: "ADVISORY MODE. Think like a CFO. Focus on strategy, growth, cash flow projections, seasonal planning, and high-level financial decisions. Be direct with recommendations.",
    proposal: "PROPOSAL MODE. Write professional, ready-to-send proposals and contracts. Include specific pricing, scope, timeline, and terms. Make waevpoint look professional and capable.",
  };

  if (mode && MODE_CONTEXTS[mode]) {
    contextNote += `\n\nMODE: ${MODE_CONTEXTS[mode]}`;
  }

  if (financials) {
    contextNote += `\n\nCURRENT MONTH FINANCIALS: Income: ${financials.income} PHP. Expenses: ${financials.expenses} PHP. Net: ${financials.net} PHP.`;
    if (financials.topCategories?.length > 0) {
      contextNote += ` Top categories: ${financials.topCategories.map((c: { category: string; amount: number; kind: string }) => `${c.category} (${c.kind}: ${c.amount} PHP)`).join(", ")}.`;
    }
    contextNote += ` Use these real numbers in your analysis when relevant.`;
  }

  const trimmed = sanitizeMessages(messages);

  const groqMessages = [
    { role: "system", content: SYSTEM_PROMPT + SECURITY_DIRECTIVE + contextNote },
    ...trimmed,
  ];

  const MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
  ];

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
        temperature: 0.5,
        max_tokens: mode === "proposal" ? 1200 : 800,
      }),
    });

    if (res.ok) {
      groqRes = res;
      break;
    }

    if (res.status !== 429 && res.status !== 413) {
      const err = await res.text().catch(() => "Unknown error");
      console.error(`Groq wavi error (${model}):`, err);
      return new Response(`AI service error (${res.status})`, { status: 502 });
    }

    console.warn(`Groq ${res.status} on ${model}, trying fallback...`);
  }

  if (!groqRes) {
    return new Response("AI service busy. Please wait a moment and try again.", { status: 429 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = groqRes!.body!.getReader();
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
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch {
              // skip
            }
          }
        }
      } catch (err) {
        console.error("Wavi stream error:", err);
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
