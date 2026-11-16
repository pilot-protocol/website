import type { Metadata } from "next";
import { Board } from "@/components/v2/board";
import { CloudB } from "@/components/v2/cloud";
import { Compare } from "@/components/v2/compare";
import { Field } from "@/components/v2/field";
import { Handshake } from "@/components/v2/handshake";
import { HeroB } from "@/components/v2/hero";
import { Live } from "@/components/v2/live";
import { Start } from "@/components/v2/start";
import { Store } from "@/components/v2/store";

// Design variant B of the home page, for comparison. Not indexed.
export const metadata: Metadata = {
  title: "Home, variant B",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

export default function HomeVariantB() {
  return (
    <>
      <HeroB />
      <Board />
      <Compare />
      <Field />
      <Live />
      <Store />
      <Handshake />
      <CloudB />
      <Start />
    </>
  );
}
