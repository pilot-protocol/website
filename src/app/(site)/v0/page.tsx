import type { Metadata } from "next";
import { Bento } from "@/components/v0/bento";
import { Hero } from "@/components/v0/hero";
import { AppStore } from "@/components/v0/sections/app-store";
import { Backers } from "@/components/v0/sections/backers";
import { Capabilities } from "@/components/v0/sections/capabilities";
import { Cloud } from "@/components/v0/sections/cloud";
import { Cta } from "@/components/v0/sections/cta";
import { DataAgents, PilotMom } from "@/components/v0/sections/data-agents";
import { GetStarted } from "@/components/v0/sections/get-started";
import { HowItFits } from "@/components/v0/sections/how-it-fits";
import { Numbers } from "@/components/v0/sections/numbers";
import { OpenSource } from "@/components/v0/sections/open-source";
import { Protocol } from "@/components/v0/sections/protocol";
import { Security } from "@/components/v0/sections/security";

// The first home page, built from the original Figma (V0), restored for reference. Not indexed.
export const metadata: Metadata = {
  title: "Home, V0 (original Figma)",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

export default function HomeV0() {
  return (
    <>
      <Hero />
      <Bento />
      <Backers />
      <Numbers />
      <Capabilities />
      <HowItFits />
      <Protocol />
      <DataAgents />
      <PilotMom />
      <AppStore />
      <Cloud />
      <Security />
      <OpenSource />
      <GetStarted />
      <Cta />
    </>
  );
}
