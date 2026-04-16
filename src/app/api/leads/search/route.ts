import { NextRequest, NextResponse } from "next/server";
import { SearchResult } from "@/lib/leads";

export const maxDuration = 60;

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

interface PlacesResponse {
  places?: {
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    internationalPhoneNumber?: string;
    websiteUri?: string;
    rating?: number;
    userRatingCount?: number;
  }[];
  nextPageToken?: string;
}

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "nextPageToken",
].join(",");

async function placesTextSearch(query: string, pageToken?: string): Promise<PlacesResponse> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY not configured");

  const body: Record<string, unknown> = {
    textQuery: query,
    pageSize: 20,
    regionCode: "PH",
  };
  if (pageToken) body.pageToken = pageToken;

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Places API error: ${res.status} ${err}`);
  }
  return res.json();
}

const EMAIL_RE = /[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const BAD_EMAIL_SUFFIX = /\.(png|jpg|jpeg|gif|webp|svg|css|js)$/i;

async function scrapeEmail(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; waevpoint-lead-bot/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();
    const matches = html.match(EMAIL_RE) || [];
    for (const m of matches) {
      if (BAD_EMAIL_SUFFIX.test(m)) continue;
      if (/sentry|wixpress|example\.com|noreply|no-reply/i.test(m)) continue;
      return m.toLowerCase();
    }
    // Try /contact page if homepage had no email
    if (!url.includes("/contact")) {
      const contactUrl = new URL("/contact", url).toString();
      try {
        const c = await fetch(contactUrl, {
          signal: AbortSignal.timeout(5000),
          headers: { "User-Agent": "Mozilla/5.0 (compatible; waevpoint-lead-bot/1.0)" },
        });
        if (c.ok) {
          const ch = await c.text();
          const cm = ch.match(EMAIL_RE) || [];
          for (const m of cm) {
            if (BAD_EMAIL_SUFFIX.test(m)) continue;
            if (/sentry|wixpress|example\.com|noreply|no-reply/i.test(m)) continue;
            return m.toLowerCase();
          }
        }
      } catch {
        /* ignore */
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const industry = String(body.industry_label || body.industry || "").trim();
  const industryQuery = String(body.industry_query || body.industry || "").trim();
  const location = String(body.location || "").trim();
  const pages = Math.min(Math.max(Number(body.pages) || 1, 1), 3);
  const enrichEmails = body.enrich_emails !== false;

  if (!industryQuery) return NextResponse.json({ error: "industry required" }, { status: 400 });

  const query = location ? `${industryQuery} in ${location} Philippines` : `${industryQuery} Philippines`;

  try {
    // Paginate up to N pages (20 results/page, Google limits ~60 total)
    const allPlaces: PlacesResponse["places"] = [];
    let nextToken: string | undefined;
    for (let i = 0; i < pages; i++) {
      const data = await placesTextSearch(query, nextToken);
      allPlaces.push(...(data.places || []));
      if (!data.nextPageToken) break;
      nextToken = data.nextPageToken;
      // next_page_token needs a short delay server-side to become valid
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Dedupe by place id
    const seen = new Set<string>();
    const unique = allPlaces.filter((p) => {
      if (!p.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    // First pass: enrich emails for places with website but no phone, in parallel (cap 8)
    const needsEmail = enrichEmails
      ? unique.filter((p) => p.websiteUri && !p.nationalPhoneNumber && !p.internationalPhoneNumber)
      : [];
    const emailMap = new Map<string, string>();
    if (needsEmail.length) {
      const chunks: typeof needsEmail[] = [];
      for (let i = 0; i < needsEmail.length; i += 8) chunks.push(needsEmail.slice(i, i + 8));
      for (const chunk of chunks) {
        const results = await Promise.all(
          chunk.map(async (p) => ({ id: p.id, email: await scrapeEmail(p.websiteUri!) })),
        );
        for (const r of results) if (r.email) emailMap.set(r.id, r.email);
      }
    }

    // Also try to enrich emails for places that HAVE phone + website (bonus signal)
    const phoneAndSite = enrichEmails
      ? unique.filter(
          (p) =>
            p.websiteUri && (p.nationalPhoneNumber || p.internationalPhoneNumber) && !emailMap.has(p.id),
        )
      : [];
    if (phoneAndSite.length) {
      const chunks: typeof phoneAndSite[] = [];
      for (let i = 0; i < phoneAndSite.length; i += 8) chunks.push(phoneAndSite.slice(i, i + 8));
      for (const chunk of chunks) {
        const results = await Promise.all(
          chunk.map(async (p) => ({ id: p.id, email: await scrapeEmail(p.websiteUri!) })),
        );
        for (const r of results) if (r.email) emailMap.set(r.id, r.email);
      }
    }

    const leads: SearchResult[] = unique
      .map((p) => {
        const phone = p.nationalPhoneNumber || p.internationalPhoneNumber || null;
        const email = emailMap.get(p.id) || null;
        return {
          name: p.displayName?.text || "(unnamed)",
          industry,
          location,
          address: p.formattedAddress || null,
          phone,
          email,
          website: p.websiteUri || null,
          rating: p.rating ?? null,
          rating_count: p.userRatingCount ?? null,
          google_place_id: p.id,
        };
      })
      .filter((l) => l.phone || l.email);

    return NextResponse.json({ query, count: leads.length, leads });
  } catch (err) {
    console.error("Lead search error:", err);
    const msg = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
