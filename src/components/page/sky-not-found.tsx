import Link from "next/link";
import { LogoSky } from "@/components/logo";
import { SkyBand } from "./page-header";
import "./sky-not-found.css";

/* eslint-disable @next/next/no-img-element */

/*
 * The sky site's 404: the page header's sky, one small airliner crossing it, and the way back.
 * `bare` is for the global not-found page, which renders outside the site layout (no header), so it brings the logo.
 */
export function SkyNotFound({ bare = false }: { bare?: boolean }) {
  return (
    <main className="flex min-h-dvh flex-col">
      <SkyBand as="div" className={`flex flex-1 flex-col ${bare ? "mt-0! pt-0!" : ""}`}>
        {bare && (
          <div className="wrap flex h-16 items-center">
            <Link href="/" aria-label="Pilot Protocol home" className="text-fg">
              <LogoSky className="max-sm:[&>span:last-child]:text-[20px]" />
            </Link>
          </div>
        )}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <img src="/v4/plane-small.webp" alt="" width={192} height={212} className="nf-plane" />
        </div>
        <div className="wrap relative flex flex-1 flex-col justify-end pt-40 pb-20 sm:pb-28">
          <h1 className="max-w-[820px] text-[clamp(44px,7vw,84px)] leading-[0.98] font-medium tracking-[-0.045em] text-balance text-fg">
            This address <span className="block text-mute">isn&apos;t on the network.</span>
          </h1>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href="/"
              className="pressable inline-flex h-10 items-center rounded-[10px] bg-fg px-4 text-[14px] font-medium text-bg hover:bg-fg/88"
            >
              Back to Pilot Protocol
            </Link>
            {[
              ["Docs", "/docs"],
              ["Service agents", "/service-agents"],
              ["Blog", "/blog"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="text-[15px] font-medium text-soft underline-offset-4 hover:text-fg hover:underline">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </SkyBand>
    </main>
  );
}
