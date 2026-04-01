import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroVibe — Drone Shots That Hit Different",
  description:
    "Cinematic drone videography + AI-powered editing. Real estate, events, travel, commercial — we fly, AI scores, you publish.",
  openGraph: {
    title: "AeroVibe — Drone Shots That Hit Different",
    description:
      "Cinematic drone videography + AI-powered editing. Real estate, events, travel, commercial.",
    url: "https://aerovibe.rootbyte.tech",
    siteName: "AeroVibe",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
