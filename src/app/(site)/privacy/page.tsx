import type { Metadata } from "next";
import { LegalPage } from "@/components/page/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Pilot Protocol collects, uses, and protects data, including GDPR and CCPA rights across the daemon, website, and rendezvous service.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <LegalPage slug="privacy" />;
}
