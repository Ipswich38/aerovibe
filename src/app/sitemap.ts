import type { MetadataRoute } from "next";

const SITE_URL = "https://waevpoint.quest";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...["privacy", "terms", "legal"].map((p) => ({
      url: `${SITE_URL}/${p}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
