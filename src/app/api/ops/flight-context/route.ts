import { NextRequest } from "next/server";
import { fetchFlightWeather } from "@/lib/weather";
import { checkLocation } from "@/lib/geofence";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get("lat") || "");
  const lng = parseFloat(url.searchParams.get("lng") || "");

  if (isNaN(lat) || isNaN(lng)) {
    return Response.json({ error: "lat and lng required" }, { status: 400 });
  }

  const [weather, geo] = await Promise.all([
    fetchFlightWeather(lat, lng).catch(() => null),
    Promise.resolve(checkLocation(lat, lng)),
  ]);

  return Response.json({
    weather: weather
      ? {
          temperature: weather.temperature,
          windSpeed: weather.windSpeed,
          windGusts: weather.windGusts,
          windDirection: weather.windDirection,
          summary: weather.summary,
          flyability: weather.flyability,
          warnings: weather.warnings,
        }
      : null,
    geo: {
      status: geo.status,
      nearest: geo.nearest.name,
      distanceKm: Math.round(geo.distanceKm * 10) / 10,
      message: geo.message,
    },
  });
}
