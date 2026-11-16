import type { Metadata } from "next";
import { RoadmapPage } from "@/components/pages/roadmap/roadmap-page";

export const metadata: Metadata = {
  title: "Product roadmap",
  description:
    "What Pilot Protocol shipped in October 2026 and is working on now, across the protocol, the data service agents, the App Store and Pilot Cloud.",
  alternates: { canonical: "/roadmap" },
};

export default function Page() {
  return <RoadmapPage />;
}
