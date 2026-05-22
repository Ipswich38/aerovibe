import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";

export function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
