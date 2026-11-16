import { AppStoreD } from "@/components/v4/apps";
import { BackersD } from "@/components/v4/backers";
import { CapabilitiesD } from "@/components/v4/capabilities";
import { Chores } from "@/components/v4/chores";
import { CloudD } from "@/components/v4/cloud";
import { CtaD } from "@/components/v4/cta";
import { FitsD } from "@/components/v4/fits";
import { FooterD } from "@/components/v4/footer";
import { HeroD } from "@/components/v4/hero";
import { NumbersStrip } from "@/components/v4/numbers";
import { OpenSourceD } from "@/components/v4/oss";
import { OverviewD } from "@/components/v4/overview";
import { Passport } from "@/components/v4/passport";
import { Tower } from "@/components/v4/tower";
import "./v4.css";

/** The sky home page: /v4 on the green site, and the home page of the sky site. */
export function HomeSky() {
  return (
    <div className="v4-page">
      <HeroD />
      <BackersD />
      <OverviewD>
        <NumbersStrip />
      </OverviewD>
      <Passport />
      <Chores />
      <FitsD />
      <CapabilitiesD />
      <Tower />
      <AppStoreD />
      <CloudD />
      <OpenSourceD />
      <CtaD />
      <FooterD />
    </div>
  );
}
