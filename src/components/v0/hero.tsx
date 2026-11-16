"use client";

import type { CSSProperties } from "react";
import { NetworkCanvas } from "@/components/hero/network-canvas";
import { DownloadIcon } from "@/components/icons";
import { Button, Command, GhostButton, LiveDot } from "@/components/ui";
import { INSTALL_CMD } from "@/lib/site";
import { approx, useStats } from "@/lib/stats";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export function Hero() {
  const stats = useStats();

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[max(600px,calc(100svh-103px))] flex-col overflow-hidden in-data-[banner=closed]:min-h-[max(600px,calc(100svh-64px))] short:min-h-0! short:in-data-[banner=closed]:min-h-0!"
    >
      {/* The network band: fills whatever height the viewport leaves above the copy. */}
      <div className="relative mt-6 min-h-[180px] flex-1 sm:mt-9 short:min-h-[150px]">
        <div className="rise-in absolute inset-0" style={delay(150)}>
          <NetworkCanvas />
        </div>
      </div>

      <div className="wrap relative grid grid-cols-1 gap-10 pt-12 pb-12 sm:pt-16 sm:pb-16 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16 lg:pb-[clamp(56px,9vh,96px)]">
        <div>
          <h1
            id="hero-title"
            className="text-[clamp(44px,6.6vw,76px)] leading-none font-medium tracking-[-0.035em] text-fg"
          >
            <span className="rise-in block" style={delay(0)}>
              The open network
            </span>
            <span className="rise-in block text-lime" style={delay(90)}>
              for agents.
            </span>
          </h1>
          <div className="rise-in mt-8 flex flex-wrap gap-2 sm:mt-10" style={delay(220)}>
            <Button href="#get-started">
              Install Pilot
              <DownloadIcon className="size-[13px]" />
            </Button>
            <GhostButton href="#cloud">Use it from Claude or ChatGPT</GhostButton>
          </div>
        </div>

        <div className="rise-in w-full max-w-[468px]" style={delay(320)}>
          <p className="text-[15px] leading-[1.45] text-mute sm:text-[16px]">
            Pilot Protocol is an open-source AI agent network with permanent addresses, encrypted tunnels, explicit
            trust, live data agents, and an App Store.
          </p>
          <Command value={INSTALL_CMD} prefix="curl" className="mt-4 w-fit" label="Copy install command">
            {INSTALL_CMD.replace(/^curl/, "")}
          </Command>
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] leading-[22px] text-mute">
            <span>
              <span className="text-fg tabular-nums">{approx(stats.activeNodes)}</span> daemons seen in the last 30
              minutes
            </span>
            <a href="#numbers" className="flex items-center gap-2 font-mono text-[12px] tracking-[0.06em] text-lime">
              <LiveDot />
              LIVE
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
