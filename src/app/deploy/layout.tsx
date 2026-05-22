import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deploy · Waevpoint",
  description: "A full-stack pilot and client platform for matching licensed pilots with clients on a live map.",
};

export default function DeployLayout({ children }: { children: React.ReactNode }) {
  return children;
}
