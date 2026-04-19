export interface FlightWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  precipitation: number;
  cloudCover: number;
  visibility: number;
  weatherCode: number;
  isDay: boolean;
  summary: string;
  flyability: "good" | "caution" | "no_fly";
  warnings: string[];
}

const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export async function fetchFlightWeather(lat: number, lng: number): Promise<FlightWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day&wind_speed_unit=kmh&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error (${res.status})`);
  const data = await res.json();
  const c = data.current;

  const windSpeed = c.wind_speed_10m;
  const windGusts = c.wind_gusts_10m;
  const precipitation = c.precipitation;
  const visibility = 10000; // Open-Meteo free tier doesn't provide visibility; assume good
  const weatherCode = c.weather_code;

  const warnings: string[] = [];
  let flyability: "good" | "caution" | "no_fly" = "good";

  // DJI Mini 5 Pro max wind resistance: Level 5 = 10.7 m/s = 38.5 km/h
  if (windSpeed > 38) {
    warnings.push(`Wind ${windSpeed} km/h exceeds DJI Mini 5 Pro Level 5 limit (38 km/h). DO NOT FLY.`);
    flyability = "no_fly";
  } else if (windSpeed > 29) {
    warnings.push(`Wind ${windSpeed} km/h is at Level 5 threshold. Fly with extreme caution, expect drift.`);
    flyability = "caution";
  } else if (windSpeed > 20) {
    warnings.push(`Moderate wind ${windSpeed} km/h. Keep altitude low, expect some drift.`);
    if (flyability === "good") flyability = "caution";
  }

  if (windGusts > 45) {
    warnings.push(`Wind gusts ${windGusts} km/h — dangerous. Risk of losing control.`);
    flyability = "no_fly";
  } else if (windGusts > 35) {
    warnings.push(`Wind gusts ${windGusts} km/h — could destabilize the drone during maneuvers.`);
    if (flyability === "good") flyability = "caution";
  }

  if (precipitation > 0) {
    warnings.push(`Precipitation detected (${precipitation}mm). DJI Mini 5 Pro is NOT waterproof. Do not fly in rain.`);
    flyability = "no_fly";
  }

  if ([45, 48].includes(weatherCode)) {
    warnings.push("Fog detected. Visibility severely reduced. VLOS impossible — do not fly.");
    flyability = "no_fly";
  }

  if ([95, 96, 99].includes(weatherCode)) {
    warnings.push("Thunderstorm active. Absolutely do not fly.");
    flyability = "no_fly";
  }

  if (c.temperature_2m > 40) {
    warnings.push(`Temperature ${c.temperature_2m}°C exceeds operating max (40°C). Battery may overheat.`);
    flyability = "no_fly";
  } else if (c.temperature_2m > 35) {
    warnings.push(`High temperature ${c.temperature_2m}°C. Monitor battery temp, keep flights shorter.`);
    if (flyability === "good") flyability = "caution";
  }

  if (c.temperature_2m < -10) {
    warnings.push(`Temperature ${c.temperature_2m}°C below operating minimum (-10°C).`);
    flyability = "no_fly";
  } else if (c.temperature_2m < 0) {
    warnings.push(`Cold temperature ${c.temperature_2m}°C. Battery capacity reduced, shorter flight time.`);
    if (flyability === "good") flyability = "caution";
  }

  const summary = WEATHER_CODES[weatherCode] || "Unknown";

  return {
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    windSpeed,
    windGusts,
    windDirection: c.wind_direction_10m,
    precipitation,
    cloudCover: c.cloud_cover,
    visibility,
    weatherCode,
    isDay: c.is_day === 1,
    summary,
    flyability,
    warnings,
  };
}

export function windDirectionLabel(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

export function formatWeatherForAI(w: FlightWeather): string {
  const dir = windDirectionLabel(w.windDirection);
  let text = `CURRENT WEATHER CONDITIONS:
- Weather: ${w.summary}
- Temperature: ${w.temperature}°C (feels like ${w.feelsLike}°C)
- Humidity: ${w.humidity}%
- Wind: ${w.windSpeed} km/h from ${dir} (gusts up to ${w.windGusts} km/h)
- Cloud cover: ${w.cloudCover}%
- Precipitation: ${w.precipitation}mm
- Daylight: ${w.isDay ? "Yes" : "No"}
- Flyability: ${w.flyability.toUpperCase()}`;

  if (w.warnings.length > 0) {
    text += `\n\nWEATHER WARNINGS:\n${w.warnings.map((w) => `- ${w}`).join("\n")}`;
  }

  return text;
}
