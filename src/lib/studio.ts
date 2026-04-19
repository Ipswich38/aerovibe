export interface GradeDefinition {
  label: string;
  description: string;
  saturation_adjust: number;
  contrast_adjust: number;
  brightness_adjust: number;
  shadows_lift: number;
  highlights_pull: number;
  color_temp?: string;
  lut_file: string | null;
}

export interface GradeAnalysis {
  recommended: string;
  reasoning: string;
  characteristics: {
    lighting: string;
    colorTemp: string;
    timeOfDay: string;
    subjectType: string;
    mood: string;
  };
  gradeRankings: Array<{ grade: string; score: number; note: string }>;
  customSuggestion?: {
    name: string;
    settings: GradeDefinition;
    reasoning: string;
  };
}

export const GRADES: Record<string, GradeDefinition> = {
  "warm-golden": {
    label: "Warm Golden",
    description: "Warm skin tones, golden shadows — luxury real estate",
    saturation_adjust: -8,
    contrast_adjust: 1.1,
    brightness_adjust: 2,
    shadows_lift: 8,
    highlights_pull: -15,
    color_temp: "warm",
    lut_file: "warm-golden.cube",
  },
  "cool-crisp": {
    label: "Cool Crisp",
    description: "Clean blue-white corporate look",
    saturation_adjust: -5,
    contrast_adjust: 1.12,
    brightness_adjust: 3,
    shadows_lift: 5,
    highlights_pull: -10,
    color_temp: "cool",
    lut_file: "cool-crisp.cube",
  },
  natural: {
    label: "Natural",
    description: "Minimal grade — fixes DJI oversaturation",
    saturation_adjust: -10,
    contrast_adjust: 1.05,
    brightness_adjust: 0,
    shadows_lift: 3,
    highlights_pull: -8,
    color_temp: "neutral",
    lut_file: null,
  },
  cinematic: {
    label: "Cinematic Teal-Orange",
    description: "Hollywood teal shadows, orange highlights",
    saturation_adjust: -5,
    contrast_adjust: 1.15,
    brightness_adjust: 0,
    shadows_lift: 5,
    highlights_pull: -20,
    color_temp: "teal_orange",
    lut_file: "cinematic.cube",
  },
  "warm-soft": {
    label: "Warm Soft",
    description: "Gentle warm tones, soft contrast — weddings",
    saturation_adjust: -3,
    contrast_adjust: 1.05,
    brightness_adjust: 5,
    shadows_lift: 12,
    highlights_pull: -18,
    color_temp: "warm",
    lut_file: "warm-soft.cube",
  },
  vibrant: {
    label: "Vibrant",
    description: "Punchy, social-media-ready — events",
    saturation_adjust: 10,
    contrast_adjust: 1.2,
    brightness_adjust: 0,
    shadows_lift: 0,
    highlights_pull: -10,
    color_temp: "warm",
    lut_file: null,
  },
  documentary: {
    label: "Documentary",
    description: "Desaturated, real — construction and corporate",
    saturation_adjust: -15,
    contrast_adjust: 1.08,
    brightness_adjust: 2,
    shadows_lift: 5,
    highlights_pull: -12,
    color_temp: "neutral",
    lut_file: null,
  },
};

export function gradeToCSS(grade: GradeDefinition): React.CSSProperties {
  const sat = 100 + grade.saturation_adjust;
  const con = Math.round(grade.contrast_adjust * 100);
  const bri = 100 + grade.brightness_adjust * 5;
  return {
    filter: `saturate(${sat}%) contrast(${con}%) brightness(${bri}%)`,
  };
}

export function gradeTempColor(temp?: string): string {
  switch (temp) {
    case "warm":
      return "#f59e0b";
    case "cool":
      return "#3b82f6";
    case "teal_orange":
      return "#14b8a6";
    default:
      return "#a1a1aa";
  }
}
