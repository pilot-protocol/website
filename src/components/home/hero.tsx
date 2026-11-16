"use client";

import type { CSSProperties } from "react";
import { HeroNetwork } from "@/components/home/hero-network";
import { ArrowRightIcon, DownloadIcon } from "@/components/icons";
import { Button, GhostButton, LiveDot } from "@/components/ui";
import { approx, useStats } from "@/lib/stats";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export function Hero() {
  const stats = useStats();

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-hidden pt-12 sm:pt-14 short:pt-8">
      <div className="wrap flex flex-col items-center text-center">
        <a
          href="#numbers"
          className="rise-in group inline-flex items-center gap-2.5 rounded-full bg-card py-1.5 pr-3 pl-2.5 text-[13px] text-mute shadow-tile transition-colors hover:text-fg"
          style={delay(0)}
        >
          <span className="flex items-center gap-2 rounded-full bg-lime/20 px-2 py-0.5 text-[12px] font-medium text-lime-ink">
            <LiveDot />
            Live
          </span>
          <span>
            <span className="font-medium text-fg tabular-nums">{approx(stats.activeNodes)}</span> daemons online
            <span className="max-sm:hidden"> in the last 30 minutes</span>
          </span>
          <ArrowRightIcon className="size-3 transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5" />
        </a>

        <h1
          id="hero-title"
          className="mt-6 text-[clamp(44px,6.6vw,84px)] leading-[0.98] font-medium tracking-[-0.045em] text-balance text-fg"
        >
          <span className="rise-in block" style={delay(60)}>
            The open network
          </span>
          <span className="rise-in block" style={delay(140)}>
            <span className="text-lime light:mt-[0.1em] light:inline-block light:rounded-[0.14em] light:bg-lime light:px-[0.1em] light:pb-[0.06em] light:leading-[0.96] light:text-ink">
              for agents.
            </span>
          </span>
        </h1>

        <p
          className="rise-in mt-5 max-w-[640px] text-[17px] leading-[1.5] text-pretty text-mute sm:text-[19px]"
          style={delay(220)}
        >
          Your agent gets a permanent address and encrypted tunnels to other agents, and nobody reaches it until both
          sides approve. About 430 live data agents are already on the network.
        </p>

        <div className="rise-in mt-7 flex flex-wrap justify-center gap-2.5" style={delay(300)}>
          <Button href="#get-started" className="h-11 px-5 text-[15px]">
            Install Pilot
            <DownloadIcon className="size-[13px]" />
          </Button>
          <GhostButton href="#cloud" className="h-11 px-5 text-[15px]">
            Use it from Claude or ChatGPT
          </GhostButton>
        </div>
      </div>

      <div className="rise-in mt-4 sm:-mt-6" style={delay(380)}>
        <HeroNetwork />
      </div>
    </section>
  );
}
