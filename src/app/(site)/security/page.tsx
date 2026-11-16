import type { Metadata } from "next";
import { SecurityPage } from "@/components/pages/security/security-page";

export const metadata: Metadata = {
  title: "Security: controls, limits and reporting",
  description:
    "The security controls that ship in Pilot Protocol, what the public backbone can see, what your application still owns, and how to report a vulnerability.",
  alternates: { canonical: "/security" },
};

export default function Page() {
  return <SecurityPage />;
}
