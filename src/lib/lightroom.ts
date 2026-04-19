import sharp from "sharp";
import { mkdir } from "fs/promises";
import { join, basename, extname } from "path";

const STUDIO_OUTPUT = join(
  process.env.HOME ?? "~",
  "drone-jobs/waevpoint2740/studio",
);

// ── Processing Presets ──────────────────────────────────────────────────────

export interface PresetSettings {
  brightness: number;     // multiplier: 1.0 = no change, 1.3 = +30%
  contrast: number;       // multiplier: 1.0 = no change
  saturation: number;     // multiplier: 1.0 = no change, 0.8 = -20%
  sharpness: number;      // sigma for sharpen: 0 = none, 1-3 = light to heavy
  denoise: number;        // median filter radius: 0 = none, 3-5 = light to heavy
  gamma: number;          // gamma correction: 1.0 = none, <1 = brighter shadows
  tint?: { r: number; g: number; b: number; a: number }; // color tint overlay
}

export interface ProcessingPreset {
  label: string;
  description: string;
  category: "drone" | "portrait" | "landscape" | "architectural" | "custom";
  settings: PresetSettings;
}

export const PROCESSING_PRESETS: Record<string, ProcessingPreset> = {
  "drone-auto": {
    label: "Drone Auto",
    description:
      "Balanced auto-correction for DJI footage — fixes oversaturation, boosts shadows, light denoise",
    category: "drone",
    settings: {
      brightness: 1.15,
      contrast: 1.1,
      saturation: 0.9,
      sharpness: 1.0,
      denoise: 3,
      gamma: 0.95,
    },
  },
  "drone-golden": {
    label: "Golden Hour Drone",
    description: "Enhances warm tones from golden hour flights — rich shadows, warm highlights",
    category: "drone",
    settings: {
      brightness: 1.1,
      contrast: 1.15,
      saturation: 1.05,
      sharpness: 0.8,
      denoise: 3,
      gamma: 0.9,
      tint: { r: 255, g: 200, b: 120, a: 0.06 },
    },
  },
  "drone-midday": {
    label: "Midday Harsh Light",
    description: "Tames blown highlights and harsh shadows from noon flights",
    category: "drone",
    settings: {
      brightness: 0.95,
      contrast: 1.05,
      saturation: 0.85,
      sharpness: 0.8,
      denoise: 3,
      gamma: 0.85,
    },
  },
  "drone-overcast": {
    label: "Overcast / Cloudy",
    description: "Adds warmth and contrast to flat cloudy footage",
    category: "drone",
    settings: {
      brightness: 1.2,
      contrast: 1.2,
      saturation: 1.1,
      sharpness: 1.0,
      denoise: 3,
      gamma: 0.9,
      tint: { r: 255, g: 220, b: 170, a: 0.04 },
    },
  },
  "drone-cinematic": {
    label: "Cinematic Drone",
    description: "High contrast, desaturated, crushed blacks — film look",
    category: "drone",
    settings: {
      brightness: 1.05,
      contrast: 1.3,
      saturation: 0.75,
      sharpness: 0.6,
      denoise: 3,
      gamma: 1.1,
    },
  },
  "landscape-vivid": {
    label: "Landscape Vivid",
    description: "Punchy colors for landscape and nature shots",
    category: "landscape",
    settings: {
      brightness: 1.1,
      contrast: 1.15,
      saturation: 1.25,
      sharpness: 1.2,
      denoise: 3,
      gamma: 0.92,
    },
  },
  "architectural-clean": {
    label: "Architectural Clean",
    description: "Neutral tones, sharp details — real estate and commercial",
    category: "architectural",
    settings: {
      brightness: 1.15,
      contrast: 1.1,
      saturation: 0.9,
      sharpness: 1.5,
      denoise: 3,
      gamma: 0.95,
    },
  },
  "raw-clean": {
    label: "RAW Clean",
    description: "Minimal correction — light denoise, slight exposure lift",
    category: "custom",
    settings: {
      brightness: 1.08,
      contrast: 1.02,
      saturation: 1.0,
      sharpness: 0.5,
      denoise: 3,
      gamma: 1.0,
    },
  },
};

// ── Processing Engine (sharp) ───────────────────────────────────────────────

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

function applyPreset(
  pipeline: sharp.Sharp,
  settings: PresetSettings,
): sharp.Sharp {
  let p = pipeline;

  // sharp gamma must be 1.0-3.0; values <1 handled via brightness
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

  const processingTimeMs = Date.now() - start;

  return {
    outputBuffer,
    result: {
      preset: options.preset,
      processingTimeMs,
      outputSize: outputBuffer.length,
    },
  };
}

export async function processImageToFile(
  inputBuffer: Buffer,
  filename: string,
  options: ProcessOptions,
): Promise<ProcessResult> {
  const { outputBuffer, result } = await processImageBuffer(
    inputBuffer,
    filename,
    options,
  );

  const format = options.outputFormat ?? "jpg";
  const sessionDir = join(STUDIO_OUTPUT, `lr_${Date.now()}`);
  await mkdir(sessionDir, { recursive: true });

  const inputName = basename(filename, extname(filename));
  const outputPath = join(sessionDir, `${inputName}_${options.preset}.${format}`);

  await sharp(outputBuffer).toFile(outputPath);

  return { ...result, outputPath };
}

// ── Social Crop Sizes ───────────────────────────────────────────────────────

export const SOCIAL_CROPS = {
  "instagram-square": { width: 1080, height: 1080, label: "IG Square" },
  "instagram-portrait": { width: 1080, height: 1350, label: "IG Portrait" },
  "instagram-story": { width: 1080, height: 1920, label: "IG Story" },
  "facebook-post": { width: 1200, height: 630, label: "FB Post" },
  "facebook-cover": { width: 1640, height: 624, label: "FB Cover" },
  "tiktok": { width: 1080, height: 1920, label: "TikTok" },
  "youtube-thumb": { width: 1280, height: 720, label: "YT Thumbnail" },
  "twitter-post": { width: 1200, height: 675, label: "X Post" },
  "client-4k": { width: 3840, height: 2160, label: "4K Delivery" },
  "client-hd": { width: 1920, height: 1080, label: "HD Delivery" },
  "print-a4": { width: 3508, height: 2480, label: "A4 Print (300dpi)" },
} as const;

export type SocialCropKey = keyof typeof SOCIAL_CROPS;
