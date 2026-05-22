import type { Metadata } from "next";

const PILOTS_URL = "https://pilots.waevpoint.quest";
const DESCRIPTION =
  "WaevPilots helps aspiring and licensed drone pilots review CAAP RPAS policy, prepare for below-7kg certification, use checklists, and keep smart flight logs.";

export const metadata: Metadata = {
  metadataBase: new URL(PILOTS_URL),
  title: {
    default: "WaevPilots — CAAP RPAS Study, Checklist, and Logbook",
    template: "%s · WaevPilots",
  },
  description: DESCRIPTION,
  keywords: [
    "drone pilot Philippines",
    "drone pilot training",
    "CAAP RPAS reviewer",
    "below 7kg drone license",
    "RPA controller certificate",
    "pilot checklist",
    "drone flight logbook",
  ],
  alternates: {
    canonical: PILOTS_URL,
  },
  openGraph: {
    title: "WaevPilots — CAAP RPAS Study, Checklist, and Logbook",
    description: DESCRIPTION,
    url: PILOTS_URL,
    siteName: "WaevPilots",
    locale: "en_PH",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WaevPilots RPAS study and logbook",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WaevPilots — RPAS Study and Logbook",
    description: DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

export default function PilotsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
