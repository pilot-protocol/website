import type { Metadata } from "next";
import { DisclosurePage } from "@/components/pages/security/disclosure-page";

export const metadata: Metadata = {
  title: "Report a security vulnerability or bug",
  description:
    "Privately report a Pilot Protocol security issue, privacy concern, reliability defect, or product bug to the founding team.",
  alternates: { canonical: "/security/disclosure" },
};

export default function Page() {
  return <DisclosurePage />;
}
