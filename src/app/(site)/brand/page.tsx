import type { Metadata } from "next";
import { BrandPage } from "@/components/pages/brand/brand-page";

export const metadata: Metadata = {
  title: "Brand guidelines, logos and media kit",
  description:
    "Official Pilot Protocol brand guidelines: the mark, logo files, colour, typography, interface parts and usage rules, with downloadable assets.",
  alternates: { canonical: "/brand" },
};

export default function Page() {
  return <BrandPage />;
}
