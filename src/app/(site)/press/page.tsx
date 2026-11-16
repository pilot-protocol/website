import type { Metadata } from "next";
import { PressPage } from "@/components/pages/press/press-page";

export const metadata: Metadata = {
  title: "Press kit, company facts and brand assets",
  description:
    "Logos, company facts, research papers and usage rules for writing about Pilot Protocol. Download the brand assets or contact press@pilotprotocol.network.",
  alternates: { canonical: "/press" },
};

export default function Page() {
  return <PressPage />;
}
