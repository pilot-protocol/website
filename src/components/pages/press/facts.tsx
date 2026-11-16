"use client";

/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { bySite, isSky } from "@/components/page/sky";
import { Glyph, OBJECT_TILE } from "@/components/pages/about/glyphs";
import { LiveDot, Reveal } from "@/components/ui";
import { BrandMark, type Brand } from "@/components/v4/logos";
import { APPS } from "@/lib/apps";
import { approx, useStats } from "@/lib/stats";

/*
 * Sky: each figure with the thing it counts, at the top of its cell: an address (the passport-style badge the home
 * page uses for identity), a running daemon, the sources the data agents answer from, the apps in the store, the
 * announcement, the open repositories.
 */
const TILE = `grid size-9 shrink-0 place-items-center rounded-[9px] ${OBJECT_TILE}`;
const SOURCES: Brand[] = ["openmeteo", "nasa", "wikipedia", "github", "hackernews"];
const SHELF = ["io.pilot.postgres", "io.pilot.redis", "io.pilot.docker", "io.pilot.duckdb", "io.pilot.otto"]
  .map((id) => APPS.find((a) => a.id === id))
  .filter((a) => a !== undefined);

/** A short stack of tiles that overlap a little, for "many of these". */
function Stack({ children }: { children: ReactNode[] }) {
  return (
    <span className="flex">
      {children.map((c, i) => (
        <span key={i} className={`relative rounded-[9px] ring-2 ring-card ${i ? "-ml-2" : ""}`} style={{ zIndex: children.length - i }}>
          {c}
        </span>
      ))}
    </span>
  );
}

const OBJECTS: ReactNode[] = [
  <span key="addr" className={TILE}>
    <Glyph name="badge" />
  </span>,
  <span key="daemon" className={TILE}>
    <Glyph name="server" />
  </span>,
  <Stack key="sources">
    {SOURCES.map((b) => (
      <span key={b} className={TILE}>
        <BrandMark brand={b} className="size-[17px]" />
      </span>
    ))}
  </Stack>,
  <Stack key="apps">
    {SHELF.map((a) => (
      <img key={a.id} src={a.icon} alt="" width={36} height={36} loading="lazy" className="size-9 rounded-[9px]" />
    ))}
  </Stack>,
  <span key="seed" className={TILE}>
    <Glyph name="newspaper" />
  </span>,
  <span key="oss" className={TILE}>
    <BrandMark brand="github" className="size-[18px]" />
  </span>,
];

/** The figures a story usually needs, live where the registry publishes them. */
export function Facts() {
  const s = useStats();
  const items: { value: string; label: string; note: string; live?: boolean }[] = [
    {
      value: approx(s.totalNodes),
      label: "Registered addresses",
      // The sky site keeps the honesty in the card rather than in a footnote under the grid.
      note: isSky ? "Every address issued since launch, not unique agents" : "Issued by the public registry since launch",
      live: true,
    },
    { value: approx(s.activeNodes), label: "Daemons seen in 30 minutes", note: "Running Pilot nodes that sent a heartbeat", live: true },
    { value: `~${s.dataAgents}`, label: "Data service agents", note: "Live data, one agent per source" },
    { value: String(s.apps), label: "Apps in the App Store", note: "Installed by an agent with one command" },
    { value: "$4.5M", label: "Seed round", note: "Announced July 2026" },
    { value: "AGPL-3.0", label: "Open source", note: "Daemon, pilotctl, registry and beacon" },
  ];
  return (
    <ul
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${bySite(
        "gap-px overflow-hidden rounded-[20px] border border-edge bg-edge",
        // Sky: one flat bordered card, the figures in cells split by hairlines.
        "sky-card gap-px overflow-hidden bg-(--sky-card-line)!",
      )}`}
    >
      {items.map((it, i) => (
        <Reveal as="li" key={it.label} delay={(i % 3) * 60} className={`flex flex-col p-6 sm:p-7 ${bySite("bg-bg", "bg-card")}`}>
          {isSky && (
            <span aria-hidden className="mb-6 flex h-9 items-center">
              {OBJECTS[i]}
            </span>
          )}
          <span className="text-[clamp(32px,3.4vw,44px)] leading-none font-medium tracking-[-0.04em] text-fg tabular-nums">{it.value}</span>
          <span className="mt-4 flex items-center gap-2 text-[15px] font-medium text-fg">
            {it.label}
            {it.live && <LiveDot className="ml-0.5" />}
          </span>
          <span className="mt-1 text-[13.5px] leading-[1.45] text-mute">{it.note}</span>
        </Reveal>
      ))}
    </ul>
  );
}
