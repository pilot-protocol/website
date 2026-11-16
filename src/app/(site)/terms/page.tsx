import type { Metadata } from "next";
import { LegalPage } from "@/components/page/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of the Pilot Protocol website, rendezvous service, and Pilot-operated specialist agents. Peer-to-peer traffic is explicitly excluded.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <LegalPage slug="terms" />;
}
