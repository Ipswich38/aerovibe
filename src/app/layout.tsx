import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroVibe — Drone Shots That Hit Different",
  description:
    "Drone videography, aerial photography, and photo prints. We fly, we edit, you get clean content — delivered to your device.",
  openGraph: {
    title: "AeroVibe — Drone Shots That Hit Different",
    description:
      "Drone videography, aerial photography, and photo prints.",
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
