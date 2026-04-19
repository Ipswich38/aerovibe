import { NextRequest, NextResponse } from "next/server";
import {
  processImageBuffer,
  PROCESSING_PRESETS,
  SOCIAL_CROPS,
  type SocialCropKey,
} from "@/lib/lightroom";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("x-ops-token");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const preset = formData.get("preset") as string | null;
  const crop = formData.get("crop") as string | null;
  const format = (formData.get("format") as string) ?? "jpg";
  const quality = parseInt((formData.get("quality") as string) ?? "92", 10);

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!preset || !PROCESSING_PRESETS[preset]) {
    return NextResponse.json(
      {
        error: `Invalid preset. Available: ${Object.keys(PROCESSING_PRESETS).join(", ")}`,
      },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let width: number | undefined;
  let height: number | undefined;

  if (crop && crop in SOCIAL_CROPS) {
    const cropDef = SOCIAL_CROPS[crop as SocialCropKey];
    width = cropDef.width;
    height = cropDef.height;
  }

  try {
    const { outputBuffer, result } = await processImageBuffer(
      buffer,
      file.name,
      {
        preset,
        outputFormat: format as "jpg" | "png" | "tiff",
        quality,
        width,
        height,
      },
    );

    const contentType =
      format === "png"
        ? "image/png"
        : format === "tiff"
          ? "image/tiff"
          : "image/jpeg";

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^.]+$/, "")}_${preset}.${format}"`,
        "X-Processing-Time": String(result.processingTimeMs),
        "X-Output-Size": String(result.outputSize),
        "X-Preset": preset,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    presets: Object.entries(PROCESSING_PRESETS).map(([key, p]) => ({
      key,
      label: p.label,
      description: p.description,
      category: p.category,
    })),
    crops: Object.entries(SOCIAL_CROPS).map(([key, c]) => ({
      key,
      ...c,
    })),
    formats: ["jpg", "png", "tiff"],
  });
}
