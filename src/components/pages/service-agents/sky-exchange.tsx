"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CheckIcon, LockIcon } from "@/components/icons";
import { Beam } from "@/components/sky/beam";
import type { Brand } from "@/components/v4/logos";
import { Glyph } from "./glyphs";
import { AgentTile, MarkTile, SourceChip, SourceTile } from "./marks";

/*
 * The query on the sky site, drawn as the path it takes (Figma 218:22895's split, the visual half): your agent,
 * the service agent and the upstream source as real tiles (your agent's own mark, the Pilot node, NHTSA's mark),
 * the shared beam running the wire for each message, and under them the messages so far as a short log. The exchange
 * is the real one behind the nhtsa-recalls example on this page.
 */

type End = "you" | "agent" | "api";
/** `short` stands in for `body` on narrow cards: below the md container size if `md`, else below lg. */
type Msg = { from: End; to: End; body: ReactNode; short?: ReactNode; md?: boolean };

const mono = "font-mono text-[11.5px] leading-5 tracking-normal @md:text-[12px]";
/** A literal from the exchange, as a small tag. */
const Tag = ({ children, on = false }: { children: ReactNode; on?: boolean }) => (
  <span
    className={`inline-flex h-[22px] shrink-0 items-center rounded-[6px] px-1.5 font-mono text-[11.5px] leading-none ${
      on ? "bg-(--sky-tint) text-(--sky-accent)" : "bg-fg/[0.05] text-soft"
    }`}
  >
    {children}
  </span>
);

// Phases 1–8, as on the green site's sequence diagram.
const MSGS: Msg[] = [
  { from: "you", to: "agent", body: <span className={`${mono} text-fg`}>handshake</span> },
  { from: "agent", to: "you", body: <span className="text-[13px] text-fg">Approved automatically</span>, short: <span className="text-[13px] text-fg">Approved</span>, md: true },
  { from: "you", to: "agent", body: <span className={`${mono} text-fg`}>/help</span> },
  {
    from: "agent",
    to: "you",
    body: (
      <span className="flex items-center gap-1">
        <Tag>make</Tag>
        <Tag>model</Tag>
        <Tag>year</Tag>
        <span className="ml-1 text-[12.5px] text-mute max-[420px]:hidden">required</span>
      </span>
    ),
  },
  {
    from: "you",
    to: "agent",
    body: <span className={`${mono} text-fg`}>/data {'{"make":"Honda","model":"Accord","year":2020}'}</span>,
    short: <span className={`${mono} text-fg`}>/data {'{"make":"Honda",…}'}</span>,
  },
  {
    from: "agent",
    to: "api",
    body: <span className={`${mono} text-fg`}>GET /recalls/recallsByVehicle</span>,
    short: <span className={`${mono} text-fg`}>GET recallsByVehicle</span>,
  },
  { from: "api", to: "agent", body: <span className="text-[13px] text-fg">5 recall campaigns</span> },
  {
    from: "agent",
    to: "you",
    body: (
      <span className="flex items-center gap-1.5">
        <span className="text-[13px] text-fg">Envelope</span>
        <Tag on>count 5</Tag>
        <Tag on>truncated false</Tag>
      </span>
    ),
    short: (
      <span className="flex items-center gap-1.5">
        <span className="text-[13px] text-fg">Envelope</span>
        <Tag on>count 5</Tag>
      </span>
    ),
  },
];

/** The step of the list on the left each phase belongs to (phase 0 is finding the agent). */
const STEP_OF_PHASE = [0, 1, 1, 2, 2, 3, 3, 3, 3];

/** Where the three tiles stand, as % of the card's width. */
const X: Record<End, number> = { you: 14, agent: 50, api: 85 };

/** Your agent is whichever agent runs pilotctl: the mark changes on every pass through the exchange. */
const YOURS: Brand[] = ["claude", "codex", "openclaw", "cursor"];

const TILE = 48;

function Node({ end, lit, brand }: { end: End; lit: boolean; brand: Brand }) {
  const ring = `transition-[box-shadow] duration-300 ${lit ? "sa-lit" : ""}`;
  const tile =
    end === "you" ? (
      <MarkTile key={brand} brand={brand} size={TILE} className={`${ring} motion-safe:animate-[sa-pop_420ms_var(--ease-out)_both]`} />
    ) : end === "agent" ? (
      <AgentTile size={TILE} className={ring} />
    ) : (
      <SourceTile brand="nhtsa" size={TILE} className={ring} />
    );
  const [name, role] =
    end === "you" ? ["Your agent", "pilotctl"] : end === "agent" ? ["nhtsa-recalls", "Service agent"] : ["api.nhtsa.gov", "Upstream source"];
  const nameMono = end !== "you";
  return (
    <div className="absolute top-0 flex w-[34%] -translate-x-1/2 flex-col items-center text-center" style={{ left: `${X[end]}%` }}>
      {tile}
      <p
        className={`mt-2.5 max-w-full truncate leading-5 text-fg ${
          nameMono ? "font-mono text-[11px] @md:text-[12.5px]" : "text-[12.5px] font-medium tracking-[-0.01em] @md:text-[13.5px]"
        }`}
      >
        {name}
      </p>
      <p className={`max-w-full truncate text-[11px] leading-4 text-mute @md:text-[12px] ${nameMono ? "" : "font-mono"}`}>{role}</p>
    </div>
  );
}

/**
 * The two wires, drawn in px across the path's own width (measured), so the beam keeps its shape at any size. The
 * wire under the message in flight turns blue, and the shared beam runs along it once per message: towards the
 * receiver, so replies run back. With reduced motion there is no beam; the blue wire, the ringed tiles and the
 * log carry the message.
 */
function Wires({ shown, msg }: { shown: number; msg: Msg | null }) {
  const ref = useRef<SVGSVGElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const y = TILE / 2;
  const x = (e: End) => (X[e] / 100) * w;
  const legs: [End, End][] = [
    ["you", "agent"],
    ["agent", "api"],
  ];
  return (
    <svg ref={ref} aria-hidden className="absolute inset-x-0 top-0 h-[48px] w-full overflow-visible">
      {w > 0 &&
        legs.map(([a, b]) => {
          const d = `M ${x(a)} ${y} H ${x(b)}`;
          const active = !!msg && ((msg.from === a && msg.to === b) || (msg.from === b && msg.to === a));
          return (
            <g key={a + b}>
              <path
                d={d}
                fill="none"
                strokeWidth={1.5}
                strokeLinecap="round"
                className={`transition-[stroke] duration-300 ${active ? "stroke-(--sky-fill)/30" : "stroke-fg/12"}`}
              />
              <Beam d={d} run={active ? shown : null} reverse={active && msg?.to === a} duration={1100} width={2} tail={80} />
            </g>
          );
        })}
    </svg>
  );
}

/** One tile in a log row, small. */
function Mini({ end, brand }: { end: End; brand: Brand }) {
  if (end === "you") return <MarkTile brand={brand} size={20} />;
  if (end === "agent") return <AgentTile size={20} />;
  return <SourceChip brand="nhtsa" />;
}

function Arrow() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className="size-3 shrink-0 text-dim" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6h8M7 3l3 3-3 3" />
    </svg>
  );
}

/** One message in the log. Messages from earlier steps step back a little. */
function Row({ children, lead, state, dim = false }: { children: ReactNode; lead: ReactNode; state: "now" | "past"; dim?: boolean }) {
  return (
    <li
      className={`flex h-10 min-w-0 items-center gap-2.5 rounded-[10px] @md:gap-3 bg-card-2 pr-2.5 pl-2 ring-1 ring-(--sky-card-line) transition-opacity duration-500 ring-inset motion-safe:animate-[sa-row_380ms_var(--ease-out)_both] ${
        dim ? "opacity-60" : ""
      }`}
    >
      <span className="flex w-[78px] shrink-0 items-center gap-1 @md:w-[88px] @md:gap-1.5">{lead}</span>
      <span className="flex min-w-0 flex-1 items-center overflow-hidden whitespace-nowrap">{children}</span>
      {state === "past" ? (
        <CheckIcon className="size-3.5 shrink-0 text-(--sky-accent)" />
      ) : (
        <span aria-hidden className="sa-pulse size-2 shrink-0 rounded-full bg-(--sky-fill)" />
      )}
    </li>
  );
}

export function SkyExchange({ shown, lap }: { shown: number; lap: number }) {
  const brand = YOURS[lap % YOURS.length];
  const msg = shown > 0 ? MSGS[shown - 1] : null;
  const step = STEP_OF_PHASE[shown];
  const lit = (e: End) => (msg ? msg.from === e || msg.to === e : e === "agent");

  return (
    <div className="@container">
      {/* The path: three tiles, two wires; the first runs over Pilot's encrypted tunnel. */}
      <div aria-hidden className="relative h-[104px] @md:h-[108px]">
        <Wires shown={shown} msg={msg} />
        {/* The tunnel's lock, on the first wire. */}
        <span
          className="absolute grid size-[22px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card text-(--sky-accent) ring-1 ring-(--sky-card-line)"
          style={{ top: TILE / 2, left: `${(X.you + X.agent) / 2}%` }}
        >
          <LockIcon className="size-[11px]" />
        </span>
        <Node end="you" lit={lit("you")} brand={brand} />
        <Node end="agent" lit={lit("agent")} brand={brand} />
        <Node end="api" lit={lit("api")} brand={brand} />
      </div>

      {/* The exchange so far, as a log: what went where, the message, and whether it has landed. */}
      <ol key={lap} className="mt-5 flex flex-col gap-1.5 border-t border-(--sky-card-line) pt-4" aria-label="Messages so far">
        <Row
          state={shown > 0 ? "past" : "now"}
          dim={step > 0}
          lead={
            <>
              <span className="grid size-5 place-items-center rounded-[5px] bg-fg/[0.06] text-soft">
                <Glyph name="magnifier" className="size-3" />
              </span>
              <span className="font-mono text-[11.5px] text-soft @max-md:hidden">search</span>
            </>
          }
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className={`${mono} text-fg`}>list-agents</span>
            <Arrow />
            <span className={`${mono} truncate text-(--sky-accent)`}>nhtsa-recalls</span>
          </span>
        </Row>
        {MSGS.slice(0, shown).map((m, i) => {
          const p = i + 1;
          return (
            <Row
              key={p}
              state={p < shown ? "past" : "now"}
              dim={STEP_OF_PHASE[p] < step}
              lead={
                <>
                  <Mini end={m.from} brand={brand} />
                  <Arrow />
                  <Mini end={m.to} brand={brand} />
                </>
              }
            >
              {m.short ? (
                <>
                  <span className={`flex min-w-0 items-center ${m.md ? "@md:hidden" : "@lg:hidden"}`}>{m.short}</span>
                  <span className={`flex min-w-0 items-center ${m.md ? "@max-md:hidden" : "@max-lg:hidden"}`}>{m.body}</span>
                </>
              ) : (
                m.body
              )}
            </Row>
          );
        })}
      </ol>
    </div>
  );
}

