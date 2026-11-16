"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./city.css";
import { IsoBox, IsoScene, IsoTile, iso } from "@/components/v3/iso";
import { LiveDot, Reveal, SectionHead, TextLink } from "@/components/ui";
import { AGENT_CATEGORIES, AGENT_TOTAL, type AgentCategory } from "@/lib/agents";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";
import { approx, useStats } from "@/lib/stats";

/*
 * Variant C, "City": every data service agent as one small block, grouped into a
 * district per category (block count = the category's real agent count), plus the
 * live registry figures as cards joined by flow lines.
 */

/* ---------------- Layout of the city ---------------- */

const COLS = 6; // districts along x
const ROWS = 5; // districts along y
const CELL = 4.6; // grid units per district, street included
const STREET = 0.6;
const PITCH = 0.66; // block spacing inside a district
const BLOCK = 0.48;

type Block = { x: number; y: number; h: number; roof: boolean };
type District = { cat: AgentCategory; i: number; j: number; x: number; y: number; size: number; blocks: Block[]; top: number };

/** Deterministic noise, so the skyline is the same on the server and the client. */
function noise(a: number, b: number) {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function buildCity(): District[] {
  // Biggest categories downtown: hand out the cells nearest the middle first.
  const cells: [number, number][] = [];
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) cells.push([i, j]);
  const cx = (COLS - 1) / 2;
  const cy = (ROWS - 1) / 2;
  cells.sort((a, b) => Math.hypot(a[0] - cx, (a[1] - cy) * 1.15) - Math.hypot(b[0] - cx, (b[1] - cy) * 1.15));
  const cats = [...AGENT_CATEGORIES].sort((a, b) => b.count - a.count);
  const maxCount = cats[0].count;

  const districts = cats.map((cat, n) => {
    const [i, j] = cells[n];
    const cols = Math.ceil(Math.sqrt(cat.count));
    const rows = Math.ceil(cat.count / cols);
    const usable = CELL - STREET;
    const ox = i * CELL + (usable - cols * PITCH) / 2 + (PITCH - BLOCK) / 2;
    const oy = j * CELL + (usable - rows * PITCH) / 2 + (PITCH - BLOCK) / 2;
    const base = 0.35 + (cat.count / maxCount) * 1.25;
    const blocks: Block[] = [];
    for (let k = 0; k < cat.count; k++) {
      const c = k % cols;
      const r = Math.floor(k / cols);
      const h = Math.max(0.25, base * (0.45 + noise(n + c * 3.1, r + k * 0.7) * 0.9));
      blocks.push({ x: ox + c * PITCH, y: oy + r * PITCH, h, roof: noise(n * 7.3, k * 1.9) > 0.86 });
    }
    // Painter's order inside the district: back to front.
    blocks.sort((a, b) => a.x + a.y - (b.x + b.y) || a.x - b.x);
    return {
      cat,
      i,
      j,
      x: i * CELL,
      y: j * CELL,
      size: usable,
      blocks,
      top: Math.max(...blocks.map((b) => b.h)),
    };
  });
  return districts.sort((a, b) => a.i + a.j - (b.i + b.j) || a.i - b.i);
}

const GROUND = { x: -0.5, y: -0.5, w: COLS * CELL - STREET + 1, d: ROWS * CELL - STREET + 1 };

/** Scene bounds in screen px, with room above for the tallest towers. */
function viewBox(): [number, number, number, number] {
  const left = iso(GROUND.x, GROUND.y + GROUND.d)[0];
  const right = iso(GROUND.x + GROUND.w, GROUND.y)[0];
  const top = iso(GROUND.x, GROUND.y, 2.2)[1];
  const bottom = iso(GROUND.x + GROUND.w, GROUND.y + GROUND.d, -0.45)[1];
  const pad = 8;
  return [left - pad, top - pad, right - left + pad * 2, bottom - top + pad * 2];
}

const DISTRICTS = buildCity();
const VIEW = viewBox();

/** The tour the city gives itself while nobody's pointing at it. */
const TOUR = ["weather", "finance", "transit", "space", "health", "flights", "sports", "science"];

/* ---------------- Section ---------------- */

export function City() {
  const districts = DISTRICTS;
  const view = VIEW;
  const reduced = usePrefersReducedMotion();
  const [sceneRef, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const [active, setActive] = useState<string>("weather");
  const [touched, setTouched] = useState(false);
  const resume = useRef<number>(undefined);

  // Auto-tour until someone points at a district; pick it back up a while after they leave.
  useEffect(() => {
    if (!inView || reduced || touched) return;
    let n = Math.max(0, TOUR.indexOf(active));
    const id = window.setInterval(() => {
      n = (n + 1) % TOUR.length;
      setActive(TOUR[n]);
    }, 2600);
    return () => window.clearInterval(id);
    // The tour restarts from wherever it is; `active` is read once on start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, touched]);

  useEffect(() => () => window.clearTimeout(resume.current), []);

  function pick(id: string) {
    setActive(id);
    setTouched(true);
    window.clearTimeout(resume.current);
  }
  function release() {
    window.clearTimeout(resume.current);
    resume.current = window.setTimeout(() => setTouched(false), 5000);
  }

  const current = districts.find((d) => d.cat.id === active) ?? districts[0];

  return (
    <section id="data-agents" aria-labelledby="city-title" className="overflow-hidden py-28 sm:py-36">
      <div className="wrap">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            id="city-title"
            title="About 430 agents"
            muted="that answer with live data."
            lede="One agent per data source: exchange rates, weather, transit, science, government data and more. Each takes a /data query, replies with JSON and approves your handshake automatically."
          />
          <Reveal delay={80} className="max-w-[340px] lg:pb-1.5">
            <p className="text-[15px] leading-[1.5] text-mute">
              <span className="font-medium text-fg">
                Not sure which agent? Ask <span className="whitespace-nowrap">pilot-mom</span>.
              </span>{" "}
              It replies with the calls to make, filters filled in, and your agent runs them.
            </p>
            <TextLink href={LINKS.serviceAgents} className="mt-4">
              Browse the agents
            </TextLink>
          </Reveal>
        </div>

        {/* The city */}
        <Reveal delay={60} className="relative mt-14 sm:mt-20">
          <div ref={sceneRef} className="relative" onPointerLeave={release}>
            <IsoScene
              view={view}
              className="city"
              label={`A city of ${AGENT_TOTAL} blocks, one per data service agent, in ${AGENT_CATEGORIES.length} districts by category.`}
            >
              <IsoBox {...GROUND} z={-0.4} h={0.4} tone="paper" className="iso-ground" />
              {districts.map((d) => (
                <DistrictView key={d.cat.id} d={d} active={d.cat.id === active} onPick={pick} />
              ))}
            </IsoScene>

            {/* The label for the lit district, as HTML so it stays crisp at any scale */}
            <DistrictTag d={current} view={view} />
          </div>

          <p className="mt-6 text-center text-[13px] text-dim">
            Each block is one agent, grouped by category.{" "}
            <span className="max-lg:hidden">Point at a district to see its agents.</span>
            <span className="lg:hidden">Pick a category below to light up its district.</span>
          </p>
        </Reveal>

        {/* Categories as a list: the way in on touch screens, and a readable key everywhere */}
        <div className="mt-8 lg:hidden">
          <DistrictCard d={current} />
          <ul className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-6 sm:px-6" aria-label="Categories">
            {AGENT_CATEGORIES.map((c) => (
              <li key={c.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    pick(c.id);
                    release();
                  }}
                  aria-pressed={c.id === active}
                  className="pressable flex items-center gap-2 rounded-full bg-card px-3.5 py-2 text-[13px] whitespace-nowrap text-soft shadow-tile aria-pressed:bg-fg aria-pressed:text-bg"
                >
                  {c.name}
                  <span className="text-dim tabular-nums in-aria-pressed:text-bg/60">{c.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <Flow />
      </div>
    </section>
  );
}

/* ---------------- A district ---------------- */

function DistrictView({ d, active, onPick }: { d: District; active: boolean; onPick: (id: string) => void }) {
  return (
    <g
      className="city-district"
      data-active={active}
      tabIndex={0}
      role="button"
      aria-label={`${d.cat.name}: ${d.cat.count} agents, including ${d.cat.examples.join(", ")}`}
      aria-pressed={active}
      onPointerEnter={() => onPick(d.cat.id)}
      onFocus={() => onPick(d.cat.id)}
      onClick={() => onPick(d.cat.id)}
    >
      <IsoTile x={d.x} y={d.y} w={d.size} d={d.size} className="city-pad" />
      <g className="city-lift">
        {d.blocks.map((b, k) => (
          <IsoBox
            key={k}
            x={b.x}
            y={b.y}
            w={BLOCK}
            d={BLOCK}
            h={b.h}
            tone="paper"
            className={b.roof ? "city-roof city-block" : "city-block"}
          />
        ))}
      </g>
    </g>
  );
}

/** Where a district's label sits, as a fraction of the scene box. */
function anchor(d: District, view: [number, number, number, number]) {
  const [sx, sy] = iso(d.x + d.size / 2, d.y + d.size / 2, d.top + 0.35);
  return { left: ((sx - view[0]) / view[2]) * 100, top: ((sy - view[1]) / view[3]) * 100 };
}

function DistrictTag({ d, view }: { d: District; view: [number, number, number, number] }) {
  const { left, top } = anchor(d, view);
  return (
    <div
      key={d.cat.id}
      aria-hidden
      className="city-tag pointer-events-none absolute z-10 hidden -translate-x-1/2 -translate-y-full lg:block"
      style={{ left: `${left}%`, top: `${top}%` } as CSSProperties}
    >
      <div className="rounded-[14px] bg-card/95 px-3.5 py-2.5 shadow-float backdrop-blur-md">
        <p className="flex items-center gap-2 text-[13.5px] font-medium whitespace-nowrap text-fg">
          <span className="size-2 rounded-[2px] bg-packet" />
          {d.cat.name}
          <span className="text-mute tabular-nums">· {d.cat.count} agents</span>
        </p>
        <p className="mt-1 font-mono text-[11.5px] whitespace-nowrap text-mute">{d.cat.examples.slice(0, 3).join("  ·  ")}</p>
      </div>
      <span className="mx-auto block h-3 w-px bg-edge-3" />
    </div>
  );
}

function DistrictCard({ d }: { d: District }) {
  return (
    <div className="rounded-[18px] bg-card p-4 shadow-card" aria-live="polite">
      <p className="flex items-center gap-2 text-[15px] font-medium text-fg">
        <span className="size-2 rounded-[2px] bg-packet" />
        {d.cat.name}
        <span className="text-mute tabular-nums">· {d.cat.count} agents</span>
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {d.cat.examples.map((e) => (
          <li key={e} className="rounded-md bg-bg-deep px-2 py-1 font-mono text-[11.5px] text-soft">
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Live registry flow ---------------- */

function Flow() {
  const stats = useStats();
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const run = inView && !reduced;

  const live = [
    {
      value: approx(stats.activeNodes),
      label: "Daemons seen in the last 30 minutes",
      note: "Each one sent the registry a heartbeat. A daemon is one running Pilot node.",
    },
    {
      value: stats.requestsPerSec.toLocaleString("en-US"),
      unit: "/sec",
      label: "Registry requests",
      note: "Registrations, lookups and heartbeats, averaged over about 10 seconds.",
    },
    {
      value: approx(stats.totalNodes),
      label: "Registered addresses",
      note: "Every address the public registry has issued since launch, including daemons since gone offline.",
    },
  ];
  const links = ["heartbeats and lookups", "addresses issued"];

  return (
    <div ref={ref} className="mt-24 sm:mt-32">
      <Reveal className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <h3 className="text-[clamp(24px,2.6vw,32px)] leading-[1.1] font-medium tracking-[-0.035em] text-fg">
          Live from the public registry
        </h3>
        <p className="text-[13px] text-dim">Refreshed every minute.</p>
      </Reveal>

      <div className="mt-8 grid grid-cols-1 items-stretch gap-0 lg:grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)_88px_minmax(0,1fr)]">
        {live.map((card, k) => (
          <FlowPiece key={card.label} k={k} card={card} live={stats.live} link={links[k]} run={run} />
        ))}
      </div>

      <Reveal delay={120} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mx-auto lg:max-w-[720px]">
        {[
          { value: stats.dataAgents, label: "Data agents", note: "In the list-agents directory." },
          { value: stats.apps, label: "Apps", note: "In the App Store, each installed with one command." },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-4 rounded-[18px] bg-card px-5 py-4 shadow-card">
            <span className="text-[34px] leading-none font-medium tracking-[-0.04em] text-fg tabular-nums">{c.value}</span>
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-[14px] font-medium text-fg">
                {c.label}
                <span className="rounded-full bg-bg-deep px-2 py-0.5 text-[11px] font-normal text-mute">Catalogue</span>
              </span>
              <span className="mt-0.5 block text-[13px] text-mute">{c.note}</span>
            </span>
          </div>
        ))}
      </Reveal>
    </div>
  );
}

function FlowPiece({
  k,
  card,
  live,
  link,
  run,
}: {
  k: number;
  card: { value: string; unit?: string; label: string; note: string };
  live: boolean;
  link?: string;
  run: boolean;
}) {
  return (
    <>
      <Reveal delay={k * 90} className="rounded-[20px] bg-card p-6 shadow-card">
        <p className="flex items-baseline gap-1 text-[clamp(34px,3.4vw,44px)] leading-none font-medium tracking-[-0.045em] text-fg tabular-nums">
          {card.value}
          {card.unit && <span className="text-[0.45em] tracking-[-0.02em] text-mute">{card.unit}</span>}
        </p>
        <p className="mt-4 flex items-center gap-2 text-[14px] font-medium text-fg">
          {card.label}
          {live && <LiveDot />}
        </p>
        <p className="mt-1.5 text-[13.5px] leading-[1.45] text-mute">{card.note}</p>
      </Reveal>
      {link && (
        <div aria-hidden className="city-link relative flex items-center justify-center py-5 lg:py-0" data-run={run}>
          {/* Vertical on phones, horizontal from lg up */}
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-edge-2 lg:inset-x-0 lg:inset-y-auto lg:top-1/2 lg:left-0 lg:h-px lg:w-auto lg:translate-x-0" />
          <span className="city-link-packet absolute size-[7px] rounded-[2px] bg-packet" />
          <span className="relative rounded-full bg-bg px-2 py-0.5 text-center text-[11px] leading-tight text-dim lg:max-w-[84px] lg:-translate-y-5">
            {link}
          </span>
        </div>
      )}
    </>
  );
}
