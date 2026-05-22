// Pure preset data — no server-only imports. Safe to use in client components.

export interface PresetSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  denoise: number;
  gamma: number;
  tint?: { r: number; g: number; b: number; a: number };
}

export interface ProcessingPreset {
  label: string;
  description: string;
  category: "drone" | "portrait" | "landscape" | "architectural" | "film" | "custom";
  settings: PresetSettings;
}

export const PROCESSING_PRESETS: Record<string, ProcessingPreset> = {
  "drone-auto": {
    label: "Drone Auto",
    description: "Balanced auto-correction for DJI footage — fixes oversaturation, boosts shadows, light denoise",
    category: "drone",
    settings: { brightness: 1.15, contrast: 1.1, saturation: 0.9, sharpness: 1.0, denoise: 3, gamma: 0.95 },
  },
  "drone-golden": {
    label: "Golden Hour Drone",
    description: "Enhances warm tones from golden hour flights — rich shadows, warm highlights",
    category: "drone",
    settings: { brightness: 1.1, contrast: 1.15, saturation: 1.05, sharpness: 0.8, denoise: 3, gamma: 0.9, tint: { r: 255, g: 200, b: 120, a: 0.06 } },
  },
  "drone-midday": {
    label: "Midday Harsh Light",
    description: "Tames blown highlights and harsh shadows from noon flights",
    category: "drone",
    settings: { brightness: 0.95, contrast: 1.05, saturation: 0.85, sharpness: 0.8, denoise: 3, gamma: 0.85 },
  },
  "drone-overcast": {
    label: "Overcast / Cloudy",
    description: "Adds warmth and contrast to flat cloudy footage",
    category: "drone",
    settings: { brightness: 1.2, contrast: 1.2, saturation: 1.1, sharpness: 1.0, denoise: 3, gamma: 0.9, tint: { r: 255, g: 220, b: 170, a: 0.04 } },
  },
  "drone-cinematic": {
    label: "Cinematic Drone",
    description: "High contrast, desaturated, crushed blacks — film look",
    category: "drone",
    settings: { brightness: 1.05, contrast: 1.3, saturation: 0.75, sharpness: 0.6, denoise: 3, gamma: 1.1 },
  },
  "landscape-vivid": {
    label: "Landscape Vivid",
    description: "Punchy colors for landscape and nature shots",
    category: "landscape",
    settings: { brightness: 1.1, contrast: 1.15, saturation: 1.25, sharpness: 1.2, denoise: 3, gamma: 0.92 },
  },
  "architectural-clean": {
    label: "Architectural Clean",
    description: "Neutral tones, sharp details — real estate and commercial",
    category: "architectural",
    settings: { brightness: 1.15, contrast: 1.1, saturation: 0.9, sharpness: 1.5, denoise: 3, gamma: 0.95 },
  },
  "raw-clean": {
    label: "RAW Clean",
    description: "Minimal correction — light denoise, slight exposure lift",
    category: "custom",
    settings: { brightness: 1.08, contrast: 1.02, saturation: 1.0, sharpness: 0.5, denoise: 3, gamma: 1.0 },
  },
  "drone-gold-blue": {
    label: "Gold & Blue",
    description: "Split-toned aerial look — warm shadows, cool highlights, desaturated for drama",
    category: "drone",
    settings: { brightness: 1.05, contrast: 1.10, saturation: 0.72, sharpness: 0, denoise: 3, gamma: 0.95, tint: { r: 255, g: 200, b: 80, a: 0.05 } },
  },
  "drone-blue-sky": {
    label: "Blue Sky",
    description: "Boosts sky blues and overall saturation — ideal for clear-sky aerial shots",
    category: "drone",
    settings: { brightness: 1.0, contrast: 1.10, saturation: 1.10, sharpness: 0.2, denoise: 3, gamma: 0.97, tint: { r: 100, g: 180, b: 255, a: 0.04 } },
  },
  "landscape-nv": {
    label: "NV Landscape",
    description: "Punchy contrast with vivid saturation — community NV preset, great for nature",
    category: "landscape",
    settings: { brightness: 1.03, contrast: 1.20, saturation: 1.25, sharpness: 0, denoise: 3, gamma: 0.95 },
  },
  "landscape-drama": {
    label: "NV Drama",
    description: "High contrast, slightly warm, bold tones — cinematic landscape feel",
    category: "landscape",
    settings: { brightness: 1.09, contrast: 1.18, saturation: 1.04, sharpness: 0, denoise: 3, gamma: 0.94 },
  },
  "landscape-pop": {
    label: "NV Pop",
    description: "Bright, poppy landscape tones with punchy contrast — social media ready",
    category: "landscape",
    settings: { brightness: 1.09, contrast: 1.20, saturation: 1.04, sharpness: 0, denoise: 3, gamma: 0.95 },
  },
  "landscape-ocean": {
    label: "Ocean Power",
    description: "Deep blues, vivid saturation, light clarity — perfect for Philippines coastline",
    category: "landscape",
    settings: { brightness: 1.03, contrast: 1.10, saturation: 1.35, sharpness: 0.4, denoise: 3, gamma: 0.97, tint: { r: 100, g: 180, b: 220, a: 0.04 } },
  },
  "landscape-beach-hdr": {
    label: "Beach HDR",
    description: "HDR-style beach look with high clarity and natural tones — coastal events",
    category: "landscape",
    settings: { brightness: 1.06, contrast: 0.96, saturation: 1.0, sharpness: 1.0, denoise: 0, gamma: 0.95 },
  },
  "custom-fade-film": {
    label: "Fade Film",
    description: "Heavily desaturated faded film look — artistic editorial style",
    category: "custom",
    settings: { brightness: 1.12, contrast: 1.28, saturation: 0.20, sharpness: 0, denoise: 0, gamma: 0.97 },
  },
  "custom-soft-dreamy": {
    label: "Soft & Dreamy",
    description: "Bright and soft — no sharpening, gentle contrast boost, events and weddings",
    category: "custom",
    settings: { brightness: 1.07, contrast: 1.14, saturation: 1.0, sharpness: 0, denoise: 3, gamma: 0.97 },
  },

  // Film simulations — translated from community LR preset aesthetics
  "film-portra-400": {
    label: "Portra 400",
    description: "Kodak Portra 400 — warm skin tones, lifted shadows, gentle low-contrast look",
    category: "film",
    settings: { brightness: 1.08, contrast: 0.94, saturation: 0.88, sharpness: 0.3, denoise: 3, gamma: 0.92, tint: { r: 255, g: 210, b: 170, a: 0.05 } },
  },
  "film-velvia-50": {
    label: "Fuji Velvia 50",
    description: "Hyper-vivid reversal film — punchy saturation, deep blacks, maximum color impact",
    category: "film",
    settings: { brightness: 0.97, contrast: 1.22, saturation: 1.45, sharpness: 0.5, denoise: 0, gamma: 1.02 },
  },
  "film-cinestill-800t": {
    label: "Cinestill 800T",
    description: "Tungsten-balanced cinema film — cool blue cast, lifted shadows, cinematic grain feel",
    category: "film",
    settings: { brightness: 1.05, contrast: 1.08, saturation: 0.82, sharpness: 0, denoise: 3, gamma: 0.93, tint: { r: 80, g: 130, b: 220, a: 0.07 } },
  },
  "film-ektar-100": {
    label: "Kodak Ektar 100",
    description: "Ultra-vivid landscape film — rich reds and deep blues, fine grain, high sharpness",
    category: "film",
    settings: { brightness: 1.02, contrast: 1.12, saturation: 1.30, sharpness: 0.8, denoise: 0, gamma: 0.97, tint: { r: 100, g: 150, b: 255, a: 0.03 } },
  },
  "film-hp5-bw": {
    label: "Ilford HP5 B&W",
    description: "Classic black & white — full desaturation, punchy contrast, silver tone",
    category: "film",
    settings: { brightness: 1.05, contrast: 1.22, saturation: 0.0, sharpness: 0.5, denoise: 0, gamma: 0.95 },
  },
  "film-provia-100f": {
    label: "Fuji Provia 100F",
    description: "Natural balanced reversal film — faithful colors, moderate contrast, fine grain",
    category: "film",
    settings: { brightness: 1.03, contrast: 1.08, saturation: 1.10, sharpness: 0.5, denoise: 2, gamma: 0.97 },
  },
};

export const SOCIAL_CROPS = {
  "instagram-square":   { width: 1080, height: 1080,  label: "IG Square" },
  "instagram-portrait": { width: 1080, height: 1350,  label: "IG Portrait" },
  "instagram-story":    { width: 1080, height: 1920,  label: "IG Story" },
  "facebook-post":      { width: 1200, height: 630,   label: "FB Post" },
  "facebook-cover":     { width: 1640, height: 624,   label: "FB Cover" },
  "tiktok":             { width: 1080, height: 1920,  label: "TikTok" },
  "youtube-thumb":      { width: 1280, height: 720,   label: "YT Thumbnail" },
  "twitter-post":       { width: 1200, height: 675,   label: "X Post" },
  "client-4k":          { width: 3840, height: 2160,  label: "4K Delivery" },
  "client-hd":          { width: 1920, height: 1080,  label: "HD Delivery" },
  "print-a4":           { width: 3508, height: 2480,  label: "A4 Print (300dpi)" },
} as const;

export type SocialCropKey = keyof typeof SOCIAL_CROPS;

// Translates PresetSettings → ffmpeg -vf filter string for video processing
export function buildVideoFilterChain(
  settings: PresetSettings,
  cropW?: number,
  cropH?: number,
): string {
  const parts: string[] = [];

  // eq filter: brightness (-1..1, 0=neutral), contrast (0..2, 1=neutral),
  //            saturation (0..3, 1=neutral), gamma (0.1..10, 1=neutral)
  const bright = Math.max(-1, Math.min(1, settings.brightness - 1));
  const contrast = Math.max(0, Math.min(2, settings.contrast));
  const sat = Math.max(0, Math.min(3, settings.saturation));
  // ffmpeg gamma is inverted vs Lightroom convention; <1 = brighter shadows
  const gamma = Math.max(0.1, Math.min(10, settings.gamma < 1 ? 1 / settings.gamma : settings.gamma));
  parts.push(
    `eq=brightness=${bright.toFixed(3)}:contrast=${contrast.toFixed(3)}:saturation=${sat.toFixed(3)}:gamma=${gamma.toFixed(3)}`,
  );

  // Sharpening
  if (settings.sharpness > 0) {
    const la = Math.min(1.5, settings.sharpness * 0.35).toFixed(2);
    parts.push(`unsharp=lx=5:ly=5:la=${la}`);
  }

  // Denoise
  if (settings.denoise > 0) {
    parts.push("hqdn3d=4:4:3:3");
  }

  // Color tint via colorbalance (shadows channel)
  if (settings.tint) {
    const { r, g, b, a } = settings.tint;
    const rs = (((r / 128) - 1) * a).toFixed(3);
    const gs = (((g / 128) - 1) * a).toFixed(3);
    const bs = (((b / 128) - 1) * a).toFixed(3);
    parts.push(`colorbalance=rs=${rs}:gs=${gs}:bs=${bs}`);
  }

  // Resize + crop for social formats
  if (cropW && cropH) {
    parts.push(
      `scale=${cropW}:${cropH}:force_original_aspect_ratio=increase,crop=${cropW}:${cropH}`,
    );
  }

  return parts.join(",");
}
