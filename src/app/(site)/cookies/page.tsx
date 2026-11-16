import type { Metadata } from "next";
import { LegalPage } from "@/components/page/legal-page";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Pilot Protocol uses cookies and similar technologies. Transparent inventory of the cookies, localStorage entries, and the analytics and advertising tools.",
  alternates: { canonical: "/cookies" },
};

export default function Page() {
  return <LegalPage slug="cookies" />;
}
