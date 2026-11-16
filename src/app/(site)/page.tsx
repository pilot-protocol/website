import { AppStore } from "@/components/home/app-store";
import { Backers } from "@/components/home/backers";
import { Capabilities } from "@/components/home/capabilities";
import { Cloud } from "@/components/home/cloud";
import { Cta } from "@/components/home/cta";
import { Essentials } from "@/components/home/essentials";
import { GetStarted } from "@/components/home/get-started";
import { Hero } from "@/components/home/hero";
import { LiveData } from "@/components/home/live-data";
import { Numbers } from "@/components/home/numbers";
import { OpenSource } from "@/components/home/open-source";
import { Security } from "@/components/home/security";
import { HomeSky } from "@/components/v4/home";
import { SITE_VARIANT } from "@/lib/site";

export default function Home() {
  if (SITE_VARIANT === "sky") return <HomeSky />;
  return (
    <>
      <Hero />
      <Backers />
      <Essentials />
      <Numbers />
      <Capabilities />
      <LiveData />
      <AppStore />
      <Cloud />
      <Security />
      <OpenSource />
      <GetStarted />
      <Cta />
    </>
  );
}
