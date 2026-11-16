"use client";

import { NetworkCanvas } from "@/components/hero/network-canvas";
import { ArrowUpRightIcon, DownloadIcon } from "@/components/icons";
import { Reveal, SmartLink } from "@/components/ui";
import { LINKS } from "@/lib/site";

const button =
  "pressable inline-flex h-12 items-center justify-center gap-2.5 rounded-[12px] px-5 text-[15px] font-medium whitespace-nowrap";

/** The closing lime panel. Lime is a fill in both themes, so everything on it is ink. */
export function Cta() {
  return (
    <section aria-labelledby="cta-title" className="pb-20 sm:pb-28">
      <div className="wrap">
        <Reveal className="relative isolate overflow-hidden rounded-[28px] bg-lime text-ink sm:rounded-[36px]">
          {/* The network band keeps to the top of the panel, clear of the type. */}
          <div aria-hidden className="absolute inset-x-0 top-6 h-[170px] sm:top-8 sm:h-[230px]">
            <NetworkCanvas packet="11, 11, 10" line="11, 11, 10" lineAlpha={0.13} />
          </div>

          <div className="relative flex flex-col px-6 pt-[230px] pb-8 sm:px-12 sm:pt-[310px] sm:pb-12 lg:px-16 lg:pb-16">
            <h2
              id="cta-title"
              className="text-[clamp(56px,10vw,144px)] leading-[0.9] font-medium tracking-[-0.055em] text-balance"
            >
              The internet
              <br />
              for agents.
            </h2>
            <div className="mt-10 flex flex-col-reverse gap-7 sm:mt-12 md:flex-row md:items-end md:justify-between">
              <p className="max-w-[360px] text-[16px] leading-[1.45] text-ink/70">
                Open source, AGPL-3.0. Free on the public backbone, or run your own.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <SmartLink
                  href="#get-started"
                  className={`${button} bg-ink text-paper shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_10px_24px_-12px_rgb(11_11_10/0.6)] hover:bg-ink/85`}
                >
                  Install Pilot
                  <DownloadIcon className="size-[14px]" />
                </SmartLink>
                <SmartLink
                  href={LINKS.cloud}
                  className={`${button} bg-ink/[0.07] text-ink shadow-[inset_0_0_0_1px_rgb(11_11_10/0.18)] hover:bg-ink/[0.12]`}
                >
                  Use Pilot Cloud
                  <ArrowUpRightIcon className="size-3" />
                </SmartLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
