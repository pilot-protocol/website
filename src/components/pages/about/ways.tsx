"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/logo";
import { bySite, isSky, LABEL } from "@/components/page/sky";
import { SKY_PILL } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { Reveal, TextLink } from "@/components/ui";
import { BrandMark, type Brand } from "@/components/v4/logos";
import { APPS } from "@/lib/apps";
import { useInView } from "@/lib/hooks";
import { Tile } from "./glyphs";
import { sCurve, useAnchors } from "./use-anchors";

/*
 * "One network, four ways in": the four products as four wires that run into
 * the same node. Packets keep arriving from each of them.
 */

const WAYS = [
  {
    tag: "Open source · AGPL-3.0",
    title: "Pilot Protocol",
    body: (
      <>
        The daemon and <code className="font-mono text-[0.9em] text-fg">pilotctl</code>: addresses, encrypted tunnels,
        NAT traversal and explicit trust. Vulture Labs runs the public backbone at no charge.
      </>
    ),
    link: { label: "Get started", href: "/docs/getting-started" },
  },
  {
    tag: "About 430 agents",
    title: "Data service agents",
    body: (
      <>
        Specialist agents that answer with live data, with the{" "}
        <code className="font-mono text-[0.9em] text-fg">list-agents</code> directory and{" "}
        <code className="font-mono text-[0.9em] text-fg">pilot-mom</code>, which turns a task into a plan.
      </>
    ),
    link: { label: "Browse the data agents", href: "/service-agents" },
  },
  {
    tag: "30 apps",
    title: "App Store",
    body: <>Apps from their publishers that an agent installs with one command and calls over local IPC.</>,
    link: { label: "Browse the App Store", href: "/app-store" },
  },
  {
    tag: "Hosted",
    title: "Pilot Cloud",
    body: <>A hosted, always-on Pilot node for Claude, ChatGPT and other MCP clients. Free; sign-ups are capped by capacity.</>,
    link: { label: "About Pilot Cloud", href: "/cloud" },
  },
];

/* Sky: the rows sit in a flat card on the hatched panel, a little tighter. */
const ROW = isSky ? 140 : 156;
const H = ROW * WAYS.length;
const NODE = { x: 236, w: 104, cy: H / 2 };
const wire = (i: number) => {
  const y = ROW * i + ROW / 2;
  return `M0 ${y}C${NODE.x * 0.62} ${y} ${NODE.x * 0.4} ${NODE.cy} ${NODE.x} ${NODE.cy}`;
};

export function Ways() {
  const [ref, on] = useInView<HTMLDivElement>({ once: false, margin: "0px" });

  if (isSky) return <SkyWays />;

  return (
    <div ref={ref} data-on={on} className="about-run grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
      <ol className="relative border-t border-edge">
        {/* Phones: one rail down the side, ending in the network below. */}
        <span aria-hidden className="absolute top-0 bottom-0 left-[3.5px] w-px bg-fg/20 lg:hidden" />
        {WAYS.map((w, i) => (
          <Reveal
            as="li"
            key={w.title}
            delay={i * 60}
            className="relative grid grid-cols-1 content-center gap-4 border-b border-edge py-7 pl-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-10 lg:h-[156px] lg:py-0 lg:pl-0"
          >
            <span aria-hidden className={`absolute top-[38px] left-0 size-2 lg:hidden ${bySite("bg-lime", "rounded-full bg-(--sky-400)")}`} />
            <div>
              <p className={LABEL}>{w.tag}</p>
              <h3 className="mt-1.5 text-[22px] leading-[1.2] font-medium tracking-[-0.025em] text-fg">{w.title}</h3>
              <p className="mt-2 max-w-[540px] text-[15px] leading-[1.5] text-mute">{w.body}</p>
            </div>
            <TextLink href={w.link.href} className="sm:pr-8">
              {w.link.label}
            </TextLink>
          </Reveal>
        ))}
        <li aria-hidden className="relative flex items-center gap-3 pt-6 lg:hidden">
          <span
            className={`grid size-10 place-items-center ${bySite(
              "rounded-[8px] border border-lime-ink/70 bg-card",
              "rounded-[23%] bg-(--sky-600) text-white shadow-tile",
            )}`}
          >
            <LogoMark className={bySite("h-auto w-6 text-lime-ink", "h-[18px] w-auto")} />
          </span>
          <span className={bySite("font-mono text-[12px] text-soft", "text-[14px] font-medium text-fg")}>One network</span>
        </li>
      </ol>

      <div aria-hidden className="relative hidden border-t border-edge lg:block">
        <svg viewBox={`0 0 340 ${H}`} className="absolute inset-0 h-full w-full">
          {WAYS.map((w, i) => (
            <g key={w.title}>
              <path d={wire(i)} fill="none" className="stroke-fg" strokeOpacity={0.2} strokeWidth={1} />
              <path
                d={wire(i)}
                data-anim
                pathLength={100}
                fill="none"
                className="stroke-lime-ink"
                strokeWidth={2}
                strokeLinecap="square"
                strokeDasharray="5 200"
                style={{ animation: `about-run 3.2s var(--ease-in-out) ${i * 0.8}s infinite both` }}
              />
              {isSky ? (
                <circle cx={3} cy={ROW * i + ROW / 2} r={3} className="fill-(--sky-400)" />
              ) : (
                <rect x={0} y={ROW * i + ROW / 2 - 3} width={6} height={6} className="fill-lime" />
              )}
            </g>
          ))}
        </svg>
        <div
          className={`absolute grid place-items-center ${bySite(
            "rounded-[10px] border border-lime-ink/70 bg-card",
            "rounded-[23%] bg-(--sky-600) text-white shadow-float",
          )}`}
          style={{ left: NODE.x, width: NODE.w, height: NODE.w, top: NODE.cy - NODE.w / 2 }}
        >
          <LogoMark className={bySite("h-auto w-[54%] text-lime-ink", "h-[42%] w-auto")} />
        </div>
        <p
          className={`absolute ${bySite("font-mono text-[12px] text-soft", "w-[104px] text-center text-[14px] font-medium text-fg")}`}
          style={{ left: NODE.x, top: NODE.cy + NODE.w / 2 + 14 }}
        >
          One network
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sky                                                                 */
/* ------------------------------------------------------------------ */

/** The upstreams of some of the data agents (open-meteo-forecast, nasa-apod, wikipedia-summary, github-search-repos, hn-top, nominatim-search, npm-package), by their own marks. */
const SOURCES: Brand[] = ["openmeteo", "nasa", "wikipedia", "github", "hackernews", "openstreetmap", "npm"];

/** A shelf of real apps from the catalogue. */
const SHELF = ["io.pilot.postgres", "io.pilot.redis", "io.pilot.docker", "io.pilot.duckdb", "io.pilot.agentphone", "io.pilot.otto", "io.pilot.primitive", "io.pilot.smol"]
  .map((id) => APPS.find((a) => a.id === id))
  .filter((a) => a !== undefined);

const MONO_CHIP = "rounded-[6px] bg-card px-2 py-1 font-mono text-[11.5px] leading-4 text-soft ring-1 ring-(--sky-card-line)";

/** What each product looks like when you use it: the picture at the top of its card. */
const STAGES: ReactNode[] = [
  // Pilot Protocol: the daemon and pilotctl in a terminal, on macOS and Linux.
  <div key="protocol" className="flex h-full items-center justify-between gap-4 px-4 sm:px-5">
    <div className="min-w-0 font-mono text-[12px] leading-[22px] text-fg">
      <p className="truncate">
        <span className="text-(--sky-accent) select-none">$ </span>pilotctl daemon start
      </p>
      <p className="truncate">
        <span className="text-(--sky-accent) select-none">$ </span>pilotctl info
      </p>
    </div>
    <div className="flex shrink-0 gap-1.5 max-[420px]:hidden">
      <Tile className="size-9 rounded-[9px]">
        <BrandMark brand="apple" className="size-[17px]" />
      </Tile>
      <Tile className="size-9 rounded-[9px]">
        <BrandMark brand="linux" className="size-[17px]" />
      </Tile>
    </div>
  </div>,
  // Data service agents: the sources they answer from, and the two agents the card names.
  <div key="data" className="flex h-full flex-col items-center justify-center gap-3 px-3">
    <ul className="flex items-center gap-1.5 sm:gap-2">
      {SOURCES.map((s, i) => (
        <li key={s} className={i > 5 ? "max-sm:hidden" : ""}>
          <Tile className="size-9 rounded-[9px]">
            <BrandMark brand={s} className="size-[18px]" />
          </Tile>
        </li>
      ))}
    </ul>
    <p className="flex gap-1.5">
      <span className={MONO_CHIP}>list-agents</span>
      <span className={MONO_CHIP}>pilot-mom</span>
    </p>
  </div>,
  // App Store: a shelf of real apps, and the one command that installs any of them.
  <div key="apps" className="flex h-full flex-col items-center justify-center gap-3 px-3">
    <ul className="flex items-center gap-1.5 sm:gap-2">
      {SHELF.map((a, i) => (
        <li key={a.id} className={i > 5 ? "max-sm:hidden" : ""}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.icon} alt="" width={36} height={36} loading="lazy" className="size-9 rounded-[23%] shadow-tile" />
        </li>
      ))}
    </ul>
    <p className={`max-w-full text-center ${MONO_CHIP}`}>
      pilotctl appstore install <wbr />
      io.pilot.postgres
    </p>
  </div>,
  // Pilot Cloud: the AI apps, and the one URL they're given.
  <div key="cloud" className="flex h-full items-center justify-center gap-2 px-3 max-[420px]:flex-col">
    <span className="flex shrink-0 gap-1.5">
      <Tile className="size-9 rounded-[9px]">
        <BrandMark brand="claude" className="size-[18px]" />
      </Tile>
      <Tile className="size-9 rounded-[9px]">
        <BrandMark brand="openai" className="size-[18px]" />
      </Tile>
    </span>
    <svg aria-hidden viewBox="0 0 24 8" className="w-4 shrink-0 text-fg/30 max-[420px]:hidden">
      <path d="M0 4h22M19 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="flex min-w-0 items-center gap-2 rounded-[10px] bg-card py-1.5 pr-3 pl-1.5 ring-1 ring-(--sky-card-line)">
      <span className="grid size-6 shrink-0 place-items-center rounded-[7px] bg-(--sky-fill) text-white">
        <LogoMark className="h-[11px] w-auto" />
      </span>
      <span className="truncate font-mono text-[11px] text-fg">cloud.pilotprotocol.network/mcp</span>
    </span>
  </div>,
];

/** Where each card sits on wide screens: the network's node between them. */
const PLACE = ["xl:col-start-1 xl:row-start-1", "xl:col-start-3 xl:row-start-1", "xl:col-start-1 xl:row-start-2", "xl:col-start-3 xl:row-start-2"];
const BEAT = 1000; // ms between messages arriving from one product and the next

/**
 * The sky site's version: the four products as cards, each with what using it looks like, wired into the one
 * network's node between them. A message arrives over one wire after another while it's on screen (the shared
 * beam). Below xl the node sits above the cards, without wires.
 */
function SkyWays() {
  const [viewRef, on] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const [ref, geo] = useAnchors<HTMLDivElement>();
  const [runs, setRuns] = useState<(number | null)[]>([null, null, null, null]);

  useEffect(() => {
    if (!on) return;
    let k = 0;
    const tick = () => {
      const i = k % WAYS.length;
      setRuns((r) => r.map((v, j) => (j === i ? (v ?? 0) + 1 : v)));
      k += 1;
    };
    tick();
    const id = window.setInterval(tick, BEAT);
    return () => window.clearInterval(id);
  }, [on]);

  const hub = geo?.at.hub;
  const wires =
    geo && hub
      ? WAYS.map((_, i) => {
          const c = geo.at[`way-${i}`];
          if (!c) return null;
          const left = i % 2 === 0;
          const x1 = left ? c.x + c.w : c.x;
          const y1 = c.y + c.h / 2;
          const x2 = left ? hub.x : hub.x + hub.w;
          return sCurve(x1, y1, x2, hub.y + hub.h / 2);
        })
      : [];

  const node = (
    <div className="flex flex-col items-center">
      <span data-anchor="hub" className="grid size-[88px] place-items-center rounded-[23%] bg-(--sky-fill) text-white shadow-tile">
        <LogoMark className="h-[40%] w-auto" />
      </span>
      <span className="mt-3 text-[14px] font-medium tracking-[-0.01em] text-fg">One network</span>
    </div>
  );

  return (
    <div ref={viewRef}>
      <div ref={ref} className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_200px_minmax(0,1fr)] xl:gap-x-0 xl:gap-y-5">
        {/* The wires, under the cards (wide screens only). */}
        {wires.length > 0 && (
          <svg aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-visible xl:block" width={geo!.w} height={geo!.h}>
            {wires.map((d, i) =>
              d ? (
                <g key={i}>
                  <path d={d} fill="none" className="stroke-fg/20" strokeWidth={1.25} />
                  <Beam d={d} run={runs[i]} duration={1100} width={1.5} tail={64} />
                </g>
              ) : null,
            )}
          </svg>
        )}

        {/* Phones and tablets: the network first, the four ways in under it. */}
        <div aria-hidden className="mb-4 flex justify-center sm:col-span-2 xl:hidden">
          <div className="flex flex-col items-center">
            <span className="grid size-16 place-items-center rounded-[23%] bg-(--sky-fill) text-white shadow-tile">
              <LogoMark className="h-[40%] w-auto" />
            </span>
            <span className="mt-2.5 text-[14px] font-medium text-fg">One network</span>
          </div>
        </div>

        <div aria-hidden className="hidden items-center justify-center xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:flex">
          {node}
        </div>

        {WAYS.map((w, i) => (
          <Reveal
            key={w.title}
            delay={i * 60}
            data-anchor={`way-${i}`}
            className={`sky-card relative flex flex-col p-3 sm:p-4 ${PLACE[i]}`}
          >
            <div aria-hidden className="h-[104px] overflow-hidden rounded-[8px] bg-bg">
              {STAGES[i]}
            </div>
            <div className="flex flex-1 flex-col px-2 pt-5 pb-2 sm:px-3">
              <h3 className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[20px] leading-[1.2] font-medium tracking-[-0.03em] text-fg">
                {w.title}
                <span className={SKY_PILL}>
                  {i === 0 && <BrandMark brand="github" className="size-3" />}
                  {w.tag}
                </span>
              </h3>
              <p className="mt-2 flex-1 text-[14.5px] leading-[1.5] text-pretty text-mute">{w.body}</p>
              <TextLink href={w.link.href} className="mt-4">
                {w.link.label}
              </TextLink>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
