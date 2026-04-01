#!/usr/bin/env npx tsx
/**
 * AeroVibe Image Generator — Mistral FLUX (Primary) + Gemini (Fallback)
 *
 * Generates cinematic drone/aerial imagery for the marketing site.
 * Style reference: DJI.com product photography — clean, dramatic, cinematic.
 *
 * Usage:
 *   MISTRAL_API_KEY=xxx npx tsx scripts/generate-images.ts
 *   MISTRAL_API_KEY=xxx npx tsx scripts/generate-images.ts --force
 */

import fs from "fs";
import path from "path";

const HERO_DIR = path.resolve(__dirname, "../public/images/hero");
const WORK_DIR = path.resolve(__dirname, "../public/images/work");

fs.mkdirSync(HERO_DIR, { recursive: true });
fs.mkdirSync(WORK_DIR, { recursive: true });

const force = process.argv.includes("--force");

// ─── Image Prompts ──────────────────────────────────────────────

const heroImages = [
  {
    file: "hero-1.png",
    prompt:
      "Cinematic aerial photograph from a DJI drone, sweeping coastal landscape at golden hour, turquoise ocean meets white sand beach, dramatic clouds lit from below, shot from 120m altitude looking down at 45 degrees, warm golden light casting long shadows, ultra-sharp 4K quality, no people, professional drone photography, DJI Neo 2 style footage",
  },
  {
    file: "hero-2.png",
    prompt:
      "Dramatic aerial photograph of a luxury beachfront villa at sunset, drone perspective from above showing the entire property with pool and gardens, warm amber and pink sky reflecting in the pool, palm trees casting shadows, cinematic color grading with lifted blacks, professional real estate drone photography, ultra-sharp, no text",
  },
  {
    file: "hero-3.png",
    prompt:
      "Breathtaking aerial photograph of a tropical island from drone, bird's eye view showing crystal clear water with visible coral reefs, small boats, lush green vegetation, dramatic wide angle, vibrant saturated colors, travel photography style, golden hour lighting, DJI drone perspective, ultra-sharp 4K",
  },
  {
    file: "hero-4.png",
    prompt:
      "Cinematic aerial photograph of a modern city skyline at blue hour/twilight, drone hovering at 200m altitude, city lights beginning to glow, dramatic clouds with purple and blue tones, cool crisp color grading, professional commercial drone photography, ultra-wide perspective, DJI Neo 2 quality, no text",
  },
];

const workImages = [
  {
    file: "real-estate.png",
    prompt:
      "Aerial drone photograph of a luxury villa with infinity pool overlooking the ocean, sunset golden hour, warm golden color grading, professional real estate photography from DJI drone, 45 degree angle from 50m altitude, palm trees and manicured gardens, cinematic look, ultra-sharp, 16:10 aspect ratio",
  },
  {
    file: "wedding.png",
    prompt:
      "Aerial drone photograph of a beautiful outdoor beach wedding ceremony at golden hour, viewed from above at gentle angle, white chairs arranged in rows on the sand, flower arch, warm soft dreamy color grading, romantic atmosphere, gentle waves in background, professional event drone photography, cinematic, ultra-sharp",
  },
  {
    file: "commercial.png",
    prompt:
      "Aerial drone photograph of a modern resort complex with multiple pools and landscaped gardens, corporate commercial style, cool crisp professional color grading, shot from 100m altitude bird's eye view, architectural symmetry, blue water contrasting with green gardens, professional commercial drone photography, ultra-sharp",
  },
  {
    file: "travel.png",
    prompt:
      "Vibrant aerial drone photograph of a tropical island hopping scene, multiple small islands with white sand in turquoise sea, boats leaving white trails in water, vivid saturated travel photography style, shot from high altitude showing the vastness, DJI drone perspective, Instagram-worthy colors, ultra-sharp 4K quality",
  },
];

// ─── Mistral FLUX Generation ────────────────────────────────────

let mistralAgentId: string | null = null;

async function createMistralAgent(): Promise<string> {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error("MISTRAL_API_KEY not set");

  const res = await fetch("https://api.mistral.ai/v1/agents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-medium-latest",
      name: `aerovibe-images-${Date.now()}`,
      instructions:
        "You are a professional drone photography image generator for AeroVibe, a cinematic drone videography company. Generate exactly what is described. Use the image_generation tool immediately with high quality. No text explanation needed.",
      tools: [{ type: "image_generation" }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Agent creation failed: ${res.status} — ${text}`);
  }
  const agent = await res.json();
  return agent.id;
}

async function generateWithMistral(
  prompt: string,
  outputPath: string
): Promise<boolean> {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) return false;

  try {
    if (!mistralAgentId) {
      console.log("  Creating Mistral agent...");
      mistralAgentId = await createMistralAgent();
      console.log(`  Agent ready: ${mistralAgentId}`);
    }

    const convRes = await fetch("https://api.mistral.ai/v1/conversations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: mistralAgentId,
        inputs: prompt,
      }),
    });

    if (!convRes.ok) {
      const text = await convRes.text();
      throw new Error(`Conversation failed: ${convRes.status} — ${text}`);
    }

    const conv = await convRes.json();

    // Find image file in response
    for (const output of conv.outputs || []) {
      if (output.content) {
        for (const c of output.content) {
          if (c.type === "tool_file" && c.file_id) {
            const fileRes = await fetch(
              `https://api.mistral.ai/v1/files/${c.file_id}/content`,
              { headers: { Authorization: `Bearer ${key}` } }
            );
            if (!fileRes.ok)
              throw new Error(`File download failed: ${fileRes.status}`);
            const buf = Buffer.from(await fileRes.arrayBuffer());
            fs.writeFileSync(outputPath, buf);
            return true;
          }
        }
      }
    }

    console.log(`    ⚠ No image in Mistral response`);
    return false;
  } catch (err: any) {
    console.log(`    ✗ Mistral error: ${err.message?.slice(0, 120)}`);
    return false;
  }
}

// ─── Gemini Image Generation (Fallback) ─────────────────────────

async function generateWithGemini(
  prompt: string,
  outputPath: string
): Promise<boolean> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("    ⚠ GEMINI_API_KEY not set, skipping fallback");
    return false;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate this image: ${prompt}` }] }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
            responseMimeType: "text/plain",
          },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini API failed: ${res.status} — ${text.slice(0, 120)}`);
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const buf = Buffer.from(part.inlineData.data, "base64");
        fs.writeFileSync(outputPath, buf);
        return true;
      }
    }

    console.log("    ⚠ No image in Gemini response");
    return false;
  } catch (err: any) {
    console.log(`    ✗ Gemini error: ${err.message?.slice(0, 120)}`);
    return false;
  }
}

// ─── Main ───────────────────────────────────────────────────────

async function generateAll() {
  console.log("\n🚁 AeroVibe Image Generator\n");
  console.log(`  Providers: Mistral FLUX (primary) → Gemini (fallback)\n`);

  const allImages = [
    ...heroImages.map((i) => ({ ...i, dir: HERO_DIR, category: "Hero" })),
    ...workImages.map((i) => ({ ...i, dir: WORK_DIR, category: "Work" })),
  ];

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const img of allImages) {
    const outputPath = path.join(img.dir, img.file);

    if (fs.existsSync(outputPath) && !force) {
      console.log(`  ⏭ ${img.category}/${img.file} — exists (use --force)`);
      skipped++;
      continue;
    }

    console.log(`  🎨 Generating ${img.category}/${img.file}...`);

    // Try Mistral first, then Gemini fallback
    let ok = await generateWithMistral(img.prompt, outputPath);
    if (!ok) {
      console.log(`    ↳ Trying Gemini fallback...`);
      ok = await generateWithGemini(img.prompt, outputPath);
    }

    if (ok) {
      const size = (fs.statSync(outputPath).size / 1024).toFixed(0);
      console.log(`    ✓ ${size}KB saved`);
      generated++;
    } else {
      failed++;
    }

    // Delay between requests — respect rate limits
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(
    `\n✅ Done: ${generated} generated, ${skipped} skipped, ${failed} failed\n`
  );
}

generateAll().catch(console.error);
