import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroVibe — Drone Shots That Hit Different",
  description:
    "Aerial videography, photography, and event coverage. We fly, we edit, we deliver — clean content straight to your device.",
  openGraph: {
    title: "AeroVibe — Drone Shots That Hit Different",
    description:
      "Aerial videography, photography, and event coverage.",
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
