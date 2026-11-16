import type { Metadata } from "next";
import { LegalPage } from "@/components/page/legal-page";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "Rules governing acceptable use of the Pilot Protocol rendezvous service and Pilot-operated specialist agents. Prohibited conduct, rate limits, and enforcement.",
  alternates: { canonical: "/aup" },
};

export default function Page() {
  return <LegalPage slug="aup" />;
}
