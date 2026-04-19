import { NextRequest, NextResponse } from "next/server";

const HF_VISION_MODEL = "Qwen/Qwen2.5-VL-72B-Instruct";
const HF_TEXT_MODEL = "meta-llama/Llama-3.3-70B-Instruct";
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";

async function hfChat(
  key: string,
  model: string,
  messages: Array<{ role: string; content: string | Array<Record<string, unknown>> }>,
  maxTokens: number = 1024
): Promise<string | null> {
  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? null;
}

export async function POST(req: NextRequest) {
  const hfKey = process.env.HF_TOKEN;
  if (!hfKey) {
    return NextResponse.json({ error: "HF_TOKEN not configured" }, { status: 500 });
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
  const visionDesc = await hfChat(hfKey, HF_VISION_MODEL, [
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

  const result = await hfChat(hfKey, HF_TEXT_MODEL, [
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
