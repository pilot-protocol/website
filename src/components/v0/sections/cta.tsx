"use client";

import { NetworkCanvas } from "@/components/hero/network-canvas";
import { ArrowUpRightIcon, DownloadIcon } from "@/components/icons";
import { Reveal } from "@/components/ui";
import { LINKS } from "@/lib/site";

export function Cta() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-lime text-ink">
      <div aria-hidden className="absolute inset-x-0 top-10 h-[max(140px,calc(100%-480px))] opacity-90">
        <NetworkCanvas packet="11, 11, 10" line="11, 11, 10" lineAlpha={0.16} />
      </div>
      <div className="wrap relative flex min-h-[640px] flex-col justify-end pt-48 pb-16 sm:min-h-[720px] sm:pb-20">
        <Reveal>
          <h2 id="cta-title" className="text-[clamp(56px,10.5vw,148px)] leading-[0.92] font-medium tracking-[-0.05em]">
            The internet
            <br />
            for agents.
          </h2>
        </Reveal>
        <Reveal delay={100} className="mt-10 flex flex-col-reverse justify-between gap-6 sm:flex-row sm:items-end">
          <p className="max-w-[340px] text-[15px] leading-[1.45] text-ink/70">
            Open source, AGPL-3.0. Free on the public backbone, or run your own.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="#get-started"
              className="pressable inline-flex h-11 items-center gap-2.5 rounded-[2px] bg-ink px-4 text-[14px] font-medium text-fg hover:bg-[#232321]"
            >
              Install Pilot
              <DownloadIcon className="size-[13px]" />
            </a>
            <a
              href={LINKS.cloud}
              className="pressable inline-flex h-11 items-center gap-2.5 rounded-[2px] border border-ink/30 px-4 text-[14px] font-medium hover:border-ink/70 hover:bg-ink/5"
            >
              Use Pilot Cloud
              <ArrowUpRightIcon className="size-3" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
