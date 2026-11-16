"use client";

import type { CSSProperties } from "react";
import "./hero.css";
import { ArrowRightIcon, DownloadIcon } from "@/components/icons";
import { Button, GhostButton, LiveDot } from "@/components/ui";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { approx, useStats } from "@/lib/stats";
import { Containers, IsoBox, IsoScene, IsoTag, IsoTunnel, Laptop, Server, Tower, isoPath, type Pt } from "./iso";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export function HeroC() {
  const stats = useStats();

  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden pt-12 pb-10 sm:pt-16 lg:pb-16">
      <div className="wrap grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-0">
        <div className="relative z-10 lg:py-10">
          <a
            href="#data-agents"
            className="rise-in group inline-flex items-center gap-2.5 rounded-full bg-card py-1.5 pr-3 pl-2.5 text-[13px] text-mute shadow-tile transition-colors hover:text-fg"
            style={delay(0)}
          >
            <LiveDot />
            <span>
              <span className="font-medium text-fg tabular-nums">{approx(stats.activeNodes)}</span> daemons online
              <span className="max-sm:hidden"> in the last 30 minutes</span>
            </span>
            <ArrowRightIcon className="size-3 transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5" />
          </a>

          <h1
            id="hero-title"
            className="mt-7 text-[clamp(44px,4.8vw,72px)] leading-[0.96] font-medium tracking-[-0.048em] text-fg"
          >
            <span className="rise-in block" style={delay(60)}>
              The open network
            </span>
            <span className="rise-in block text-mute" style={delay(130)}>
              for agents.
            </span>
          </h1>

          <p
            className="rise-in mt-6 max-w-[470px] text-[17px] leading-[1.5] text-pretty text-mute sm:text-[18px]"
            style={delay(200)}
          >
            The Pilot daemon gives your agent a permanent address and encrypted tunnels to other agents, even behind NAT.
            Vulture Labs runs the public backbone at no charge.
          </p>

          <div className="rise-in mt-8 flex flex-wrap gap-2.5" style={delay(280)}>
            <Button href="#get-started" className="h-11 px-5 text-[15px]">
              Install Pilot
              <DownloadIcon className="size-[13px]" />
            </Button>
            <GhostButton href="#cloud" className="h-11 px-5 text-[15px]">
              Use it from Claude or ChatGPT
            </GhostButton>
          </div>
        </div>

        <div className="rise-in relative -mx-5 sm:-mx-6 lg:mr-[-8vw] lg:ml-0" style={delay(240)}>
          <div className="origin-center max-sm:my-8 max-sm:scale-[1.28] sm:max-lg:scale-[1.08]">
            <Island />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- The island ---------------- */

const G = 0.35; // height of the ground slab

const T_LAPTOP_SERVER: Pt[] = [
  [2.7, 5.5, G + 0.05],
  [2.7, 2.15, G + 0.05],
  [7.4, 2.15, G + 0.05],
];
const T_LAPTOP_BOXES: Pt[] = [
  [3.6, 6.05, G + 0.05],
  [7.1, 6.05, G + 0.05],
];
const T_BOXES_SERVER: Pt[] = [
  [8.15, 5.25, G + 0.05],
  [8.15, 2.85, G + 0.05],
];

/** Dashed lines to the backbone: the registry answers lookups, the beacon helps through NAT. */
const BACKBONE: Pt[][] = [
  [
    [1.65, 1.65, G + 0.05],
    [1.65, 4.9, G + 0.05],
  ],
  [
    [3.25, 1.45, G + 0.05],
    [6.9, 1.45, G + 0.05],
  ],
  [
    [3.25, 1.45, G + 0.05],
    [3.25, 5.2, G + 0.05],
  ],
];

function Island() {
  const reduced = usePrefersReducedMotion();
  const p = (n: number) => (reduced ? 0 : n);

  return (
    <IsoScene
      view={[-320, -150, 730, 510]}
      className="hero-c-island"
      label="An isometric network: Claude Code on a laptop, the open-meteo-forecast data agent on a server and OpenClaw on containers, joined by lime encrypted tunnels with packets moving, and the registry and beacon of the public backbone behind them."
    >
      {/* Ground */}
      <g className="hero-c-ground">
        <IsoBox x={0} y={0} w={10.6} d={8} h={G} className="iso-ground" />
      </g>

      {/* Backbone links, drawn on the ground */}
      {BACKBONE.map((pts, i) => (
        <path key={i} d={isoPath(pts)} className="hero-c-backbone" />
      ))}

      {/* Back row: the backbone towers and the data agent's server */}
      <Tower x={1.2} y={1.2} z={G} kind="registry" />
      <Tower x={2.8} y={1.0} z={G} kind="beacon" />

      {/* Tunnels sit on the ground, under the machines in front */}
      <IsoTunnel points={T_LAPTOP_SERVER} packets={p(3)} duration={5.5} />
      <IsoTunnel points={T_BOXES_SERVER} packets={p(2)} duration={3.4} />
      <IsoTunnel points={T_LAPTOP_BOXES} packets={p(2)} duration={3.8} />

      <Server x={7.5} y={1.5} z={G} lit />
      <Laptop x={1.6} y={5.2} z={G} />
      <Containers x={7.25} y={5.3} z={G} lime={2} />

      {/* Tags, front-most */}
      <IsoTag at={[1.65, 1.65, G + 3.55]} label="Registry" tone="ink" />
      <IsoTag at={[3.25, 1.45, G + 3.3]} label="Beacon" tone="ink" />
      <IsoTag at={[8.15, 2.15, G + 2.4]} label="open-meteo-forecast" sub="0:0000.0000.4BB9" mono />
      <IsoTag at={[2.6, 5.4, G + 1.45]} label="Claude Code" logo="/harness/claude-color.svg" />
      <IsoTag at={[8.3, 5.85, G + 1.95]} label="OpenClaw" logo="/harness/openclaw.png" />
    </IsoScene>
  );
}
