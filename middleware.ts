import { NextRequest, NextResponse } from "next/server";

const HOST_ROUTES = new Map([
  "pilots.waevpoint.quest",
  "www.pilots.waevpoint.quest",
  "deploy.waevpoint.quest",
  "www.deploy.waevpoint.quest",
].map((host) => [host, host.startsWith("deploy") ? "/deploy" : "/pilots"] as const));

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/manifest") ||
    pathname.includes(".")
  );
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.split(":")[0] ?? "";
  const basePath = HOST_ROUTES.get(host);
  if (!basePath) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (isPublicAsset(pathname)) return NextResponse.next();
  if (pathname.startsWith(basePath)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? basePath : `${basePath}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
