"use client";

import { useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { PilotMarkP } from "@/components/logo";
import { FLAT_CARD } from "@/components/pages/security/kit";
import { HatchPanel } from "@/components/sky/kit";
import { Tile } from "@/components/pages/compatibility/marks";
import { BrandMark } from "@/components/v4/logos";
import { Beam } from "@/components/sky/beam";
import { AppIcon, Reveal } from "@/components/ui";
import { DataGlyph } from "@/components/v4/glyphs";
import { LEG_MS, PEERS, useCall } from "./cross";
import "./mcp.css";

/*
 * The sky site's version of the cross: the vertical stack on your machine (client → pilot-mcp → daemon) as one
 * flat card, the horizontal network as three peer cards, both on a hatch panel (Figma 233:1195) under the section's
 * heading. One call at a time runs down the stack and out over a tunnel to a different peer, the rows lighting as it
 * passes.
 */

type Geometry = { w: number; h: number; from: number; to: number[] };

/** Where the wires start (the daemon row) and end (each peer card), measured so they follow the layout. */
function useWires() {
  const box = useRef<HTMLDivElement>(null);
  const from = useRef<HTMLDivElement>(null);
  const to = useRef<(HTMLDivElement | null)[]>([]);
  const [geo, setGeo] = useState<Geometry | null>(null);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const b = el.getBoundingClientRect();
      const f = from.current?.getBoundingClientRect();
      if (!f || b.width === 0) return setGeo(null);
      const mid = (r: DOMRect) => r.top + r.height / 2 - b.top;
      setGeo({
        w: b.width,
        h: b.height,
        from: mid(f),
        to: to.current.map((p) => (p ? mid(p.getBoundingClientRect()) : 0)),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (from.current) ro.observe(from.current);
    return () => ro.disconnect();
  }, []);

  return { box, from, to, geo };
}

function WindowGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2.75" y="3.75" width="14.5" height="12.5" rx="3" />
      <path d="M2.75 7.5h14.5" />
      <circle cx="5.5" cy="5.6" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="7.6" cy="5.6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PlugGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 2.75v3.5M13 2.75v3.5M4.75 6.25h10.5v3.5a5.25 5.25 0 0 1-10.5 0v-3.5ZM10 15v2.25" />
    </svg>
  );
}

function Row({
  icon,
  title,
  sub,
  active,
  trailing,
  rowRef,
}: {
  icon: ReactNode;
  title: ReactNode;
  sub: ReactNode;
  active: boolean;
  trailing?: ReactNode;
  rowRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      data-active={active}
      className="flex items-center gap-3.5 rounded-[8px] px-3 py-3 transition-colors duration-300 ease-out data-[active=true]:bg-(--sky-tint)"
    >
      <div ref={rowRef} className="shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-5 font-medium tracking-[-0.01em] text-fg">{title}</p>
        <p className="mt-0.5 text-[13px] leading-[18px] text-mute">{sub}</p>
      </div>
      {trailing}
    </div>
  );
}

/** The short vertical link between two rows, with the hop's name; a beam runs down it as a call passes. */
function Link({ label, fill, ms, id }: { label: string; fill: boolean; ms: number; id: string }) {
  return (
    <div className="relative h-7">
      <svg aria-hidden viewBox="0 0 4 28" className="absolute top-0 left-[30px] h-7 w-1 overflow-visible">
        <path d="M2 0V28" fill="none" strokeWidth={2} strokeLinecap="round" className={`transition-[stroke] duration-300 ${fill ? "stroke-(--sky-fill)/45" : "stroke-fg/10"}`} />
        <Beam d="M2 0V28" run={fill ? id : null} duration={ms} tail={18} width={2} />
      </svg>
      <span className="absolute top-1/2 left-[46px] -translate-y-1/2 font-mono text-[11.5px] text-dim">{label}</span>
    </div>
  );
}

const TILE = "grid size-10 place-items-center rounded-[11px]";

/** What each peer is, as a picture: a live-data service agent, someone's agent, a topic's followers. */
function PeerMark({ i }: { i: number }) {
  if (i === 0)
    return (
      <Tile size="lg" accent>
        <DataGlyph kind="weather" className="size-[22px]" />
      </Tile>
    );
  if (i === 1)
    return (
      <Tile size="lg">
        <span className="flex -space-x-1">
          <BrandMark brand="claude" className="size-[17px]" />
          <BrandMark brand="openclaw" className="size-[17px]" />
        </span>
      </Tile>
    );
  return <Tile icon="broadcast" size="lg" accent />;
}

/** `head` is the section's heading, set at the top of the panel. */
export function SkyCross({ head }: { head?: ReactNode }) {
  const { ref, step, animate } = useCall();
  const { box, from, to, geo } = useWires();
  const cycle = Math.floor(step.n / 4);
  const { leg, peer } = step;

  return (
    <div ref={ref}>
      <HatchPanel className="mcp-bleed px-4 py-12 sm:px-10 sm:py-16 lg:px-[72px] lg:py-[88px]">
        {head}
        <div className="mt-12 grid grid-cols-1 sm:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(112px,148px)_minmax(0,0.92fr)] lg:items-center">
          {/* Vertical: one agent, many tools, on your machine. */}
          <div className={`${FLAT_CARD} p-2.5 sm:p-3`}>
            <p className="px-3 pt-2 pb-2 text-[13px] text-mute">Your machine</p>
            <Row
              active={animate && leg === 0}
              icon={
                <span className={`${TILE} bg-fg/[0.06] text-soft`}>
                  <WindowGlyph />
                </span>
              }
              title="Your MCP client"
              sub="Claude Code, Cursor, Codex CLI, Cline and more"
              trailing={
                <span aria-hidden className="hidden shrink-0 gap-1.5 sm:flex">
                  <AppIcon src="/harness/claude-color.svg" size={28} pad />
                  <AppIcon src="/harness/codex.svg" size={28} />
                  <AppIcon src="/harness/cursor.svg" size={28} pad className="dark:[&_img]:invert" />
                </span>
              }
            />
            <Link label="MCP" fill={animate} ms={LEG_MS[0]} id={`a${cycle}`} />
            <Row
              active={animate && leg === 1}
              icon={
                <span className={`${TILE} bg-(--sky-tint) text-(--sky-accent)`}>
                  <PlugGlyph />
                </span>
              }
              title={<span className="font-mono text-[14.5px] font-normal">pilot-mcp</span>}
              sub="21 tools over stdio, next to your other MCP servers"
            />
            <Link label="pilotctl" fill={animate && leg >= 1} ms={LEG_MS[1]} id={`b${cycle}`} />
            <Row
              rowRef={from}
              active={animate && leg >= 2}
              icon={
                <span className={`${TILE} bg-(--sky-fill) text-white`}>
                  <PilotMarkP className="h-[18px] w-auto" />
                </span>
              }
              title="Pilot daemon"
              sub="Its address, its keys and its trust"
            />
          </div>

          {/* The wires: from the daemon out to each peer (wide screens). */}
          <div ref={box} aria-hidden className="relative hidden self-stretch lg:block">
            {geo && (
              <svg viewBox={`0 0 ${geo.w} ${geo.h}`} width={geo.w} height={geo.h} className="absolute inset-0 overflow-visible">
                {geo.to.map((y, i) => {
                  const d = `M0 ${geo.from} C${geo.w * 0.5} ${geo.from} ${geo.w * 0.5} ${y} ${geo.w} ${y}`;
                  const live = animate && peer === i && leg === 3;
                  return (
                    <g key={i}>
                      <path
                        d={d}
                        fill="none"
                        strokeWidth={1.5}
                        className={`transition-[stroke,stroke-opacity] duration-300 ${live ? "stroke-(--sky-fill)" : "stroke-fg"}`}
                        strokeOpacity={live ? 0.7 : 0.16}
                      />
                      <Beam d={d} run={animate && leg === 2 && peer === i ? step.n : null} duration={LEG_MS[2]} tail={70} width={1.5} />
                    </g>
                  );
                })}
                <circle cx={0} cy={geo.from} r={3.5} className="fill-(--sky-fill)" />
              </svg>
            )}
            {geo && (
              <span
                className="absolute left-1/2 -translate-x-1/2 text-[12px] whitespace-nowrap text-mute"
                style={{ top: Math.max(geo.from, ...geo.to) + 16 }}
              >
                Encrypted tunnels
              </span>
            )}
          </div>

          {/* Phones and tablets: the same hop, said once. */}
          <div aria-hidden className="flex flex-col items-center py-2 lg:hidden">
            <span className="h-4 w-[2px] rounded-full bg-fg/12" />
            <span className="py-1.5 text-[12.5px] text-mute">Over encrypted tunnels</span>
            <span className="h-4 w-[2px] rounded-full bg-fg/12" />
          </div>

          {/* Horizontal: many agents, one network. */}
          <ul className="flex flex-col gap-2.5 sm:gap-3">
            {PEERS.map((p, i) => {
              const target = animate && peer === i && leg >= 2;
              const lit = animate && peer === i && leg === 3;
              return (
                <li key={p.name}>
                  <div
                    ref={(el) => {
                      to.current[i] = el;
                    }}
                    data-lit={lit}
                    className="sky-card flex items-start gap-4 p-4 ring-(--sky-fill) transition-[box-shadow] duration-300 data-[lit=true]:ring-2 sm:p-5"
                  >
                    <PeerMark i={i} />
                    <div className="min-w-0 flex-1">
                    <span
                      data-on={target}
                      className="inline-block rounded-full bg-fg/[0.05] px-2.5 py-1 font-mono text-[11.5px] leading-none text-mute transition-colors duration-300 data-[on=true]:bg-(--sky-tint) data-[on=true]:text-(--sky-accent)"
                    >
                      {p.tool}
                    </span>
                    <p className={`mt-3 text-[15px] leading-5 text-fg ${p.mono ? "font-mono text-[14.5px]" : "font-medium tracking-[-0.01em]"}`}>
                      {p.name}
                    </p>
                    <p className="mt-1 text-[13px] leading-[18px] text-mute">{p.note}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </HatchPanel>

      {/* What each axis is, under its half of the picture. */}
      <div className="mt-12 grid grid-cols-1 gap-10 px-1 sm:mt-14 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(112px,148px)_minmax(0,0.92fr)] lg:gap-0 lg:px-[72px]">
        <Axis
          label="MCP · tool calling"
          title="One agent, many tools."
          lines={["Agents call tools exposed by a local server.", "Single-machine scope by default.", "No peer discovery."]}
        />
        <span aria-hidden className="hidden lg:block" />
        <Axis
          label="Pilot · peer routing"
          title="Many agents, one network."
          lines={["Agents connect to each other across machines.", "NAT-traversing encrypted tunnels.", "Directory, trust and addressing built in."]}
          pilot
          delay={60}
        />
      </div>
    </div>
  );
}

function Axis({ label, title, lines, pilot, delay = 0 }: { label: string; title: string; lines: string[]; pilot?: boolean; delay?: number }) {
  return (
    <Reveal delay={delay} className="lg:pr-6">
      <p className="text-[13px] text-mute">{label}</p>
      <h3 className="mt-2 text-[20px] leading-[1.25] font-medium tracking-[-0.02em] text-fg">{title}</h3>
      <ul className="mt-4 flex flex-col gap-2 text-[15px] leading-[1.45]">
        {lines.map((l) => (
          <li key={l} className={`flex gap-3 ${pilot ? "text-soft" : "text-mute"}`}>
            <span aria-hidden className={`mt-[8px] size-1.5 shrink-0 rounded-full ${pilot ? "bg-(--sky-fill)" : "bg-fg/25"}`} />
            {l}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
