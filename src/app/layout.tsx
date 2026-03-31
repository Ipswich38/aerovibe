import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroVibe — Cinematic Drone Visuals",
  description:
    "Premium drone videography and aerial photography. Cinematic edits for real estate, events, commercial, and lifestyle — powered by AI.",
  openGraph: {
    title: "AeroVibe — Cinematic Drone Visuals",
    description:
      "Premium drone videography and aerial photography. Cinematic edits for real estate, events, commercial, and lifestyle.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
