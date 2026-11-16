import type { Metadata } from "next";
import { HomeSky } from "@/components/v4/home";

// Design variant D of the home page ("Sky", the flight design), for comparison. Not indexed.
export const metadata: Metadata = {
  title: "Home, variant D",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

export default function HomeVariantD() {
  return <HomeSky />;
}
