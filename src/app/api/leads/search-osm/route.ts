import { NextRequest, NextResponse } from "next/server";
import { SearchResult } from "@/lib/leads";
import {
  INDUSTRY_OSM_TAGS,
  PH_LOCATIONS,
  buildOverpassQuery,
  extractAddress,
  extractCoords,
  extractEmail,
  extractName,
  extractPhone,
  extractWebsite,
  fetchOverpass,
  scrapeEmailViaJina,
} from "@/lib/overpass";

export const maxDuration = 60;

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const industryKey = String(body.industry_key || "").trim();
  const industryLabel = String(body.industry_label || body.industry_key || "").trim();
  const locationKey = String(body.location_key || "").trim();
  const locationLabel = String(body.location_label || "").trim();
  const enrichEmails = body.enrich_emails !== false;
  const limit = Math.min(Math.max(Number(body.limit) || 120, 20), 300);

  const filters = INDUSTRY_OSM_TAGS[industryKey];
  if (!filters) {
    return NextResponse.json(
      { error: `Unsupported industry for OSM: ${industryKey}. Use the Places source instead.` },
      { status: 400 },
    );
  }

  const loc = locationKey ? PH_LOCATIONS.find((l) => l.key === locationKey) || null : null;

  const query = buildOverpassQuery(filters, loc, limit);

  try {
    const data = await fetchOverpass(query);
    const elements = data.elements || [];

    // Dedupe by (name + rough coords). Some POIs have way + relation duplicates.
    const seen = new Set<string>();
    const candidates: {
      id: string;
      name: string;
      tags: NonNullable<(typeof elements)[number]["tags"]>;
      coords: [number, number] | null;
    }[] = [];

    for (const el of elements) {
      const name = extractName(el.tags);
      if (!name || !el.tags) continue;
      const coords = extractCoords(el);
      const dedupKey = `${name.toLowerCase()}|${coords ? coords[0].toFixed(3) + "," + coords[1].toFixed(3) : el.type + el.id}`;
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);
      candidates.push({
        id: `osm:${el.type}:${el.id}`,
        name,
        tags: el.tags,
        coords,
      });
    }

    const rawLeads = candidates.map((c) => ({
      id: c.id,
      name: c.name,
      phone: extractPhone(c.tags),
      email: extractEmail(c.tags),
      website: extractWebsite(c.tags),
      address: extractAddress(c.tags),
      coords: c.coords,
    }));

    // Enrich: websites that have no email (either no phone or just want the email too).
    // Jina has a polite rate (we cap at 8 in parallel, 20 total max per search to stay friendly).
    const enrichTargets = enrichEmails
      ? rawLeads.filter((l) => l.website && !l.email).slice(0, 20)
      : [];

    const emailMap = new Map<string, string>();
    if (enrichTargets.length) {
      const chunks: typeof enrichTargets[] = [];
      for (let i = 0; i < enrichTargets.length; i += 8) chunks.push(enrichTargets.slice(i, i + 8));
      for (const chunk of chunks) {
        const results = await Promise.all(
          chunk.map(async (l) => ({ id: l.id, email: await scrapeEmailViaJina(l.website!) })),
        );
        for (const r of results) if (r.email) emailMap.set(r.id, r.email);
      }
    }

    const leads: SearchResult[] = rawLeads
      .map((l) => ({
        name: l.name,
        industry: industryLabel || industryKey,
        location: locationLabel || loc?.label || "",
        address: l.address,
        phone: l.phone,
        email: l.email || emailMap.get(l.id) || null,
        website: l.website,
        rating: null,
        rating_count: null,
        google_place_id: l.id,
      }))
      .filter((l) => l.phone || l.email);

    return NextResponse.json({
      source: "osm",
      query: `${industryLabel || industryKey} · ${locationLabel || loc?.label || "Nationwide"}`,
      found: rawLeads.length,
      count: leads.length,
      leads,
    });
  } catch (err) {
    console.error("OSM lead search error:", err);
    const msg = err instanceof Error ? err.message : "Overpass search failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
