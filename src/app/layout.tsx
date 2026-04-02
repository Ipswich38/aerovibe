import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroVibe — Drone Shots That Hit Different",
  description:
    "Aerial videography, photography, 3D mapping, and site inspections. From content creation to photogrammetry — we fly, we deliver.",
  openGraph: {
    title: "AeroVibe — Drone Shots That Hit Different",
    description:
      "Aerial videography, photography, 3D mapping, and site inspections.",
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
