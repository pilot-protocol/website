import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/about/about-page";

// Counts come from Payload and the docs source at request time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Pilot Protocol: company, team and engineering",
  description:
    "Meet the company and people behind Pilot Protocol, review our open-source and technical evidence, and learn how product content is published and corrected.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <AboutPage />;
}
