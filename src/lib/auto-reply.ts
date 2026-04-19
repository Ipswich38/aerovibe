const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const CLASSIFY_PROMPT = `You are waevpoint's inbox classifier. Analyze the incoming inquiry and respond with EXACTLY one JSON object — no markdown, no explanation, no extra text.

WAEVPOINT SERVICES (knowledge base):
- Real Estate Aerials: property photos, listing videos, 360 panoramas, twilight shoots, subdivision marketing
- Construction Monitoring: site documentation, weekly/monthly retainers, progress reports, orthomosaics, volumetric measurement
- Wedding & Events: aerial wedding coverage, corporate events, social media highlights
- Roof & Solar Inspection: residential/commercial roof inspection, solar panel array inspection
- Insurance & Damage Assessment: post-disaster documentation, insurance claims packages
- Agriculture: farm health assessment, seasonal monitoring, land boundary surveys
- Infrastructure: cell tower inspection, bridge inspection, power line survey, building facade inspection
- Photogrammetry/Survey: 2D orthomosaic, 3D models, topographic surveys

CLASSIFICATION RULES:
1. "personal_attention" = TRUE if the message is about: pricing, quotations, rates, cost estimates, budget, payment terms, setting appointments, scheduling meetings, booking a date, negotiating contracts, requesting proposals, or any money-related discussion
2. "personal_attention" = TRUE if the inquiry is complex, ambiguous, or involves multiple services that need custom scoping
3. "can_auto_reply" = TRUE if the inquiry is a general question about services, capabilities, coverage areas, equipment, turnaround time, or anything answerable from the knowledge base above
4. "can_auto_reply" = FALSE if the inquiry doesn't match any service above (spam, unrelated, personal)

Respond ONLY with this JSON:
{
  "category": "real-estate" | "construction" | "wedding-events" | "inspection" | "insurance" | "agriculture" | "infrastructure" | "survey" | "general" | "unrelated",
  "personal_attention": true/false,
  "can_auto_reply": true/false,
  "reply_draft": "the auto-reply message to send (plain text, warm professional tone, 3-5 sentences max)"
}

REPLY DRAFTING RULES:
- If personal_attention is true: draft a warm acknowledgment thanking them, confirm you received their inquiry about [topic], and tell them the waevpoint team will personally follow up within 24 hours with details/pricing/scheduling
- If can_auto_reply is true: answer their question helpfully using the knowledge base, mention relevant services, and invite them to reply or book
- If can_auto_reply is false (unrelated): draft a brief thank you, say you focus on professional drone services, and invite them to check waevpoint.quest for more info
- Sign off as "waevpoint team" — never as an AI or bot
- Keep it natural, warm, professional. No emojis. No markdown.`;

interface ClassifyResult {
  category: string;
  personal_attention: boolean;
  can_auto_reply: boolean;
  reply_draft: string;
}

export async function classifyAndDraft(inquiry: {
  name: string;
  contact: string;
  service_type: string | null;
  message: string;
}): Promise<ClassifyResult | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const userMsg = `From: ${inquiry.name}
Contact: ${inquiry.contact}
Service type selected: ${inquiry.service_type || "none"}
Message: ${inquiry.message}`;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: CLASSIFY_PROMPT },
          { role: "user", content: userMsg },
        ],
        temperature: 0.2,
        max_tokens: 400,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as ClassifyResult;
  } catch (err) {
    console.error("Auto-reply classify error:", err);
    return null;
  }
}

export async function sendAutoReply(to: string, name: string, body: string): Promise<boolean> {
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (!apiKey || !to.includes("@")) return false;

  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937;">
  <div style="border-left:3px solid #06b6d4;padding-left:14px;margin-bottom:20px;">
    <div style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">waevpoint</div>
    <h2 style="margin:0;font-size:18px;color:#111827;">Thank you, ${escape(name)}</h2>
  </div>
  <div style="font-size:14px;line-height:1.7;color:#374151;white-space:pre-wrap;">${escape(body)}</div>
  <div style="margin-top:28px;padding-top:16px;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:11px;margin:0;">
      waevpoint · Professional Drone Services · <a href="https://waevpoint.quest" style="color:#06b6d4;">waevpoint.quest</a>
    </p>
  </div>
</div>`;

  try {
    const res = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: "hello@waevpoint.quest", name: "waevpoint" },
        to: [{ email: to, name }],
        subject: `Thanks for reaching out, ${name}`,
        text: body + "\n\n— waevpoint · waevpoint.quest",
        html,
      }),
    });

    if (!res.ok) {
      console.error("Auto-reply send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Auto-reply send error:", err);
    return false;
  }
}

export async function sendIMessage(phone: string, message: string): Promise<boolean> {
  if (typeof window !== "undefined") return false;

  try {
    const { execSync } = await import("child_process");
    const escaped = message
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n");

    const script = `tell application "Messages"
  set targetService to 1st account whose service type = iMessage
  set targetBuddy to participant "${phone}" of targetService
  send "${escaped}" to targetBuddy
end tell`;

    execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, { timeout: 15000 });
    return true;
  } catch (err) {
    console.error("iMessage send error:", err);
    return false;
  }
}
