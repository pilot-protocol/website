import type { Metadata } from "next";
import Link from "next/link";
import { bySite, isSky } from "@/components/page/sky";
import { SkyNotFound } from "@/components/page/sky-not-found";

export const metadata: Metadata = { title: "Not found — Pilot Protocol" };

export default function NotFound() {
  if (isSky) return <SkyNotFound />;
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="relative h-[38vh] min-h-[200px]" aria-hidden>
        {[18, 46, 78].map((y, i) => (
          <div key={y} className="absolute inset-x-0 h-px bg-fg/15" style={{ top: `${y}%` }}>
            <span
              className={`absolute -top-1 size-2 ${bySite("bg-lime", "rounded-full bg-(--sky-400)")}`}
              style={{ left: `${[22, 61, 38][i]}%` }}
            />
          </div>
        ))}
      </div>
      <div className="wrap pb-16">
        <p className={bySite("font-mono text-[13px] text-dim", "text-[14px] text-mute")}>404 · no route to host</p>
        <h1 className="mt-4 text-[clamp(44px,7vw,76px)] leading-none font-medium tracking-[-0.035em] text-fg">
          This address <span className={bySite("text-lime-ink", "text-mute")}>isn&apos;t on the network.</span>
        </h1>
        <Link
          href="/"
          className="pressable mt-10 inline-flex h-10 items-center rounded-[10px] bg-fg px-[13px] text-[14px] font-medium text-bg hover:bg-fg/88"
        >
          Back to Pilot Protocol
        </Link>
      </div>
    </main>
  );
}
