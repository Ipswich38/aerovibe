import sharp from "sharp";
import { mkdir } from "fs/promises";
import { join, basename, extname } from "path";

export type { PresetSettings, ProcessingPreset, SocialCropKey } from "./presets";
export { PROCESSING_PRESETS, SOCIAL_CROPS } from "./presets";

import type { PresetSettings } from "./presets";
import { PROCESSING_PRESETS, SOCIAL_CROPS } from "./presets";

const STUDIO_OUTPUT = join(
  process.env.HOME ?? "~",
  "drone-jobs/waevpoint2740/studio",
);

export interface ProcessOptions {
  preset: string;
  outputFormat?: "jpg" | "png" | "tiff";
  quality?: number;
  width?: number;
  height?: number;
}

export interface ProcessResult {
  preset: string;
  processingTimeMs: number;
  outputSize: number;
  outputPath?: string;
}

function applyPreset(pipeline: sharp.Sharp, settings: PresetSettings): sharp.Sharp {
  let p = pipeline;

  if (settings.gamma >= 1.0) {
    p = p.gamma(settings.gamma);
  }

  p = p.modulate({
    brightness: settings.gamma < 1.0
      ? settings.brightness * (1 + (1 - settings.gamma))
      : settings.brightness,
    saturation: settings.saturation,
  });

  if (settings.contrast !== 1.0) {
    const a = settings.contrast;
    const b = Math.round(128 * (1 - a));
    p = p.linear(a, b);
  }

  if (settings.denoise > 0) {
    p = p.median(settings.denoise);
  }

  if (settings.sharpness > 0) {
    p = p.sharpen({ sigma: settings.sharpness });
  }

  return p;
}

function applyTint(
  pipeline: sharp.Sharp,
  tint: { r: number; g: number; b: number; a: number },
  width: number,
  height: number,
): sharp.Sharp {
  const overlay = Buffer.from(
    `<svg width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="rgba(${tint.r},${tint.g},${tint.b},${tint.a})"/>
    </svg>`,
  );
  return pipeline.composite([{ input: overlay, blend: "over" }]);
}

export async function processImageBuffer(
  buffer: Buffer,
  filename: string,
  options: ProcessOptions,
): Promise<{ outputBuffer: Buffer; result: ProcessResult }> {
  const preset = PROCESSING_PRESETS[options.preset];
  if (!preset) throw new Error(`Unknown preset: ${options.preset}`);

  const format = options.outputFormat ?? "jpg";
  const quality = options.quality ?? 92;
  const start = Date.now();

  let pipeline = sharp(buffer);
  const metadata = await sharp(buffer).metadata();
  const imgW = metadata.width ?? 1920;
  const imgH = metadata.height ?? 1080;

  pipeline = applyPreset(pipeline, preset.settings);

  if (preset.settings.tint) {
    pipeline = applyTint(pipeline, preset.settings.tint, imgW, imgH);
  }

  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: "cover",
      position: "attention",
    });
  }

  let outputBuffer: Buffer;
  if (format === "png") {
    outputBuffer = await pipeline.png({ quality }).toBuffer();
  } else if (format === "tiff") {
    outputBuffer = await pipeline.tiff({ quality }).toBuffer();
  } else {
    outputBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
  }

  return {
    outputBuffer,
    result: {
      preset: options.preset,
      processingTimeMs: Date.now() - start,
      outputSize: outputBuffer.length,
    },
  };
}

export async function processImageToFile(
  inputBuffer: Buffer,
  filename: string,
  options: ProcessOptions,
): Promise<ProcessResult> {
  const { outputBuffer, result } = await processImageBuffer(inputBuffer, filename, options);

  const format = options.outputFormat ?? "jpg";
  const sessionDir = join(STUDIO_OUTPUT, `lr_${Date.now()}`);
  await mkdir(sessionDir, { recursive: true });

  const inputName = basename(filename, extname(filename));
  const outputPath = join(sessionDir, `${inputName}_${options.preset}.${format}`);

  await sharp(outputBuffer).toFile(outputPath);

  return { ...result, outputPath };
}
