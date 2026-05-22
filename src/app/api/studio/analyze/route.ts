import { NextRequest, NextResponse } from "next/server";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const OR_API   = "https://openrouter.ai/api/v1/chat/completions";
const OR_EXTRA = { "HTTP-Referer": "https://waevpoint.quest", "X-Title": "Waevpoint Ops" };

const GROQ_VISION = "llama-3.2-90b-vision-preview";
const GROQ_TEXT   = "llama-3.3-70b-versatile";
const OR_VISION   = "meta-llama/llama-3.2-90b-vision-instruct:free";
const OR_TEXT     = "qwen/qwen-2.5-72b-instruct:free";

async function aiChat(
  groqKey: string | undefined,
  orKey: string | undefined,
  groqModel: string,
  orModel: string,
  messages: Array<{ role: string; content: string | Array<Record<string, unknown>> }>,
  maxTokens = 1024,
): Promise<string | null> {
  const attempts = [
    ...(groqKey ? [{ url: GROQ_API, key: groqKey, model: groqModel, extra: {} }] : []),
    ...(orKey   ? [{ url: OR_API,   key: orKey,   model: orModel,   extra: OR_EXTRA }] : []),
  ];
  for (const { url, key, model, extra } of attempts) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...extra },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
      });
      if (!res.ok) { console.warn(`Studio analyze ${res.status} on ${model}`); continue; }
      const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
      return data.choices[0]?.message?.content ?? null;
    } catch (e) { console.error(`Studio analyze error (${model}):`, e); }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY;
  const orKey   = process.env.OPENROUTER_API_KEY;
  if (!groqKey && !orKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  const authHeader = req.headers.get("x-ops-token");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let imageB64: string;
  try {
    const body = (await req.json()) as { image: string };
    imageB64 = body.image;
    if (!imageB64) throw new Error("missing");
  } catch {
    return NextResponse.json({ error: "Send { image: base64 }" }, { status: 400 });
  }

  // Step 1: Vision — describe the frame
  const visionDesc = await aiChat(groqKey, orKey, GROQ_VISION, OR_VISION, [
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${imageB64}` },
        },
        {
          type: "text",
          text: "Analyze this drone footage frame as a professional colorist. Describe: lighting quality (harsh/soft/golden/flat), color temperature (warm/cool/neutral), estimated time of day, subject matter, overall mood, any color cast or exposure issues. Be specific and technical. 3-4 sentences max.",
        },
      ],
    },
  ], 250);

  if (!visionDesc) {
    return NextResponse.json({ error: "Vision analysis failed" }, { status: 502 });
  }

  // Step 2: Reasoning — recommend grade
  const prompt = `You are a professional drone footage colorist. Based on this frame description, recommend the best color grade.

FRAME DESCRIPTION:
${visionDesc}

AVAILABLE GRADES:
- warm-golden: saturation:-8, contrast:1.1, brightness:+2, shadows:+8, highlights:-15 (luxury real estate)
- cool-crisp: saturation:-5, contrast:1.12, brightness:+3, shadows:+5, highlights:-10 (corporate)
- natural: saturation:-10, contrast:1.05, brightness:0, shadows:+3, highlights:-8 (minimal correction)
- cinematic: saturation:-5, contrast:1.15, brightness:0, shadows:+5, highlights:-20 (teal-orange Hollywood)
- warm-soft: saturation:-3, contrast:1.05, brightness:+5, shadows:+12, highlights:-18 (weddings)
- vibrant: saturation:+10, contrast:1.2, brightness:0, shadows:0, highlights:-10 (social media)
- documentary: saturation:-15, contrast:1.08, brightness:+2, shadows:+5, highlights:-12 (desaturated real)

RESPOND ONLY with valid JSON, no markdown fences:
{
  "recommended": "grade-name",
  "reasoning": "why this grade fits best",
  "characteristics": {
    "lighting": "harsh|soft|golden|flat|mixed",
    "colorTemp": "warm|cool|neutral",
    "timeOfDay": "golden hour|midday|blue hour|overcast|sunset|night",
    "subjectType": "landscape|architecture|water|people|urban|nature|event",
    "mood": "cinematic|documentary|energetic|peaceful|dramatic|romantic"
  },
  "gradeRankings": [
    { "grade": "name", "score": 9, "note": "brief reason" }
  ],
  "customSuggestion": {
    "name": "suggested-name",
    "settings": {
      "label": "Custom Label",
      "description": "What this grade does",
      "saturation_adjust": 0,
      "contrast_adjust": 1.1,
      "brightness_adjust": 0,
      "shadows_lift": 5,
      "highlights_pull": -10,
      "color_temp": "warm",
      "lut_file": null
    },
    "reasoning": "why a custom grade would work better"
  }
}`;

  const result = await aiChat(groqKey, orKey, GROQ_TEXT, OR_TEXT, [
    { role: "user", content: prompt },
  ], 1500);

  if (!result) {
    return NextResponse.json({ error: "Grade reasoning failed" }, { status: 502 });
  }

  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Could not parse response", raw: result.slice(0, 300) }, { status: 502 });
  }

  try {
    const cleaned = jsonMatch[0]
      .replace(/:\s*\+(\d)/g, ": $1")
      .replace(/,\s*([}\]])/g, "$1");
    const analysis = JSON.parse(cleaned);
    return NextResponse.json({ analysis, visionDescription: visionDesc });
  } catch {
    return NextResponse.json({ error: "JSON parse failed", raw: jsonMatch[0].slice(0, 200) }, { status: 502 });
  }
}
