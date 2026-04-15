#!/usr/bin/env npx tsx
/**
 * waevpoint2740 brand asset generator (FLUX.1-schnell via HF)
 * Outputs: favicon.ico, icon.png (512), apple-icon.png (180), og-image.jpg (1200x630)
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HF_MODEL = "black-forest-labs/FLUX.1-schnell";
const HF_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;
const PUBLIC = path.resolve(__dirname, "../public");

const ICON_PROMPT =
  "Minimalist geometric logo mark for an aerial drone brand called waevpoint. A stylized top-down drone silhouette or abstract compass-like wave mark, centered on deep charcoal black background with a subtle cyan-to-teal radial gradient glow. Flat vector aesthetic, clean negative space, premium tech brand, symmetrical, high contrast. No text, no letters, no watermarks, no words.";

const OG_PROMPT =
  "Cinematic aerial drone shot over a tropical Philippine coastline at golden hour. Dramatic sunset light, dark teal ocean, soft cyan haze, film-grade color grade, moody cinematic atmosphere, ultra-wide composition with empty space on left for branding overlay. No text, no letters, no watermarks.";

async function hfImage(prompt: string, width = 1024, height = 1024): Promise<Buffer> {
  const token = process.env.HF_TOKEN;
  if (!token) throw new Error("HF_TOKEN not set");
  const res = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "image/png",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { width, height, num_inference_steps: 4 },
    }),
  });
  if (!res.ok) throw new Error(`HF ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  console.log("🎨 Generating waevpoint brand assets via FLUX.1-schnell\n");

  console.log("  [1/2] icon base (1024x1024)...");
  const iconBase = await hfImage(ICON_PROMPT, 1024, 1024);

  console.log("  [2/2] og-image (1200x640 → crop 1200x630)...");
  const ogBase = await hfImage(OG_PROMPT, 1216, 640);

  console.log("\n📦 Writing files...");

  // icon.png 512
  await sharp(iconBase).resize(512, 512).png().toFile(path.join(PUBLIC, "icon.png"));
  console.log("  ✓ public/icon.png (512x512)");

  // apple-icon.png 180
  await sharp(iconBase).resize(180, 180).png().toFile(path.join(PUBLIC, "apple-icon.png"));
  console.log("  ✓ public/apple-icon.png (180x180)");

  // favicon.ico — 32x32 PNG saved as .ico (browsers accept PNG in .ico)
  await sharp(iconBase).resize(32, 32).png().toFile(path.join(PUBLIC, "favicon.ico"));
  console.log("  ✓ public/favicon.ico (32x32)");

  // og-image.jpg 1200x630
  await sharp(ogBase).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 88 }).toFile(path.join(PUBLIC, "og-image.jpg"));
  console.log("  ✓ public/og-image.jpg (1200x630)");

  console.log("\n✅ Done. Review files in public/ and redeploy if satisfied.");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
