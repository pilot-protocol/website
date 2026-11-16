import type { Metadata } from "next";
import { Apps } from "@/components/v3/apps";
import { City } from "@/components/v3/city";
import { CloudC } from "@/components/v3/cloud";
import { HeroC } from "@/components/v3/hero";
import { Island } from "@/components/v3/island";
import { Manifesto } from "@/components/v3/manifesto";
import { StartC } from "@/components/v3/start";
import { Story } from "@/components/v3/story";

// Design variant C of the home page, for comparison. Not indexed.
export const metadata: Metadata = {
  title: "Home, variant C",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

export default function HomeVariantC() {
  return (
    <>
      <HeroC />
      <Manifesto />
      <Story />
      <City />
      <Apps />
      <CloudC />
      <Island />
      <StartC />
    </>
  );
}
