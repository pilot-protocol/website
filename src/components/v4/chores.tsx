"use client";

import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { DataAgentGlyph, DataGlyph, type DataKind } from "./glyphs";
import { BrandMark, type Brand } from "./logos";
import "./chores.css";
import { LockIcon } from "@/components/icons";
import { PilotMarkP } from "@/components/logo";
import { Beam } from "@/components/sky/beam";
import { SkyRule } from "@/components/sky/kit";
import { Reveal } from "@/components/ui";
import { useFitHeight, useFitScale, useInView, usePrefersReducedMotion } from "@/lib/hooks";

/*
 * Four chores (Figma 210:13040): built for people vs built for agents. A centred two-tone heading, the kit's
 * segmented tabs (numbered, one per chore), then the comparison between two full-width rules: the people side on
 * the left, the agent side on the right, a dashed centre line with "Vs" in the middle. Each side is a flat card
 * scene over a big figure and its caption; the people side's figure is grey words, the agent side's a true number.
 * Pinned while you scroll through it (like PilotLink's "Built for People / Built for Agents"): the section is tall,
 * a sticky one-screen stage holds the heading, tabs and comparison, and each chore owns an equal stretch of the
 * scroll. The chosen tab follows the scroll with a line along it for how far through the chore you are; picking a
 * tab (or the arrow keys) scrolls to the middle of that chore's stretch. Short screens scale the stage down to fit.
 * Phones get the plain tabs instead (two stacked sides don't fit one phone screen at a readable size).
 * Reduced motion: no smooth scrolling, steps switch instantly, and every scene shows its end state.
 */

type Figure = { word?: string; num?: number; prefix?: string; unit?: string; caption: string };
type Step = { label: string; ms: number; people: Figure; agents: Figure; People: () => ReactNode; Agents: () => ReactNode };

const i = (n: number) => ({ "--i": n }) as CSSProperties;

/** True while the comparison is on screen and has been seen; scenes' timed beats run only then. */
const LiveContext = createContext(false);

/** A counter that ticks every `every` ms after `start` ms, while the scene is live (null before the first). */
function useBeat(start: number, every: number) {
  const live = useContext(LiveContext);
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    if (!live) return;
    let id: number | undefined;
    const tick = () => setN((v) => (v ?? 0) + 1);
    const t = window.setTimeout(() => {
      tick();
      id = window.setInterval(tick, every);
    }, start);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(id);
    };
  }, [live, start, every]);
  return n;
}

/* ---------------------------------------------------------------- small parts */

/** Figma's 12px check (the "Same address" pill). */
function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeLinecap="square" aria-hidden className={className}>
      <path d="M2 6.25L4.5 8.75L10 3.25" />
    </svg>
  );
}

function WifiGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden className={className}>
      <path d="M1.75 6.25C3.42772 4.63081 5.66836 3.72592 8 3.72592C10.3316 3.72592 12.5723 4.63081 14.25 6.25M4 8.75C5.07254 7.71139 6.507 7.13068 8 7.13068C9.493 7.13068 10.9275 7.71139 12 8.75M6.25 11.1C6.71732 10.6419 7.34562 10.3854 8 10.3854C8.65438 10.3854 9.28268 10.6419 9.75 11.1" />
      <path
        d="M8.00039 13.8499C8.33176 13.8499 8.60039 13.5813 8.60039 13.2499C8.60039 12.9185 8.33176 12.6499 8.00039 12.6499C7.66902 12.6499 7.40039 12.9185 7.40039 13.2499C7.40039 13.5813 7.66902 13.8499 8.00039 13.8499Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MachineGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" aria-hidden className={className}>
      <path d="M3.75 3H12.25C12.9404 3 13.5 3.55964 13.5 4.25V9.25C13.5 9.94036 12.9404 10.5 12.25 10.5H3.75C3.05964 10.5 2.5 9.94036 2.5 9.25V4.25C2.5 3.55964 3.05964 3 3.75 3Z" />
      <path d="M1 13H15" strokeLinecap="round" />
    </svg>
  );
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M4.5 3L7.5 6L4.5 9" />
    </svg>
  );
}

/** The blue "done" pill from the design's address card. */
function BluePill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-(--sky-deep) px-2.5 py-1 text-[11.5px] leading-[17.25px] font-medium tracking-[0.003em] whitespace-nowrap text-white ${className}`}
    >
      <Check className="size-3" />
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- 1. getting found */

const PLACES = [
  { place: "Home Wi‑Fi", ip: "192.168.1.24" },
  { place: "Café Wi‑Fi", ip: "10.0.0.87" },
  { place: "Office network", ip: "172.16.4.12" },
];

function FoundPeople() {
  return (
    <div className="chores-pop chores-card w-[300px] rounded-[12px] p-3" style={i(0)}>
      <div className="flex h-7 items-center gap-2 px-1.5 pb-2.5 text-[12px] leading-[18px] font-medium text-mute">
        <MachineGlyph className="size-4" />
        Your laptop, over a day
      </div>
      <ul className="flex flex-col gap-1">
        {PLACES.map((p, k) => (
          <li key={p.place} className="chores-row relative flex h-10 items-center justify-between rounded-[12px] px-3" style={i(k)}>
            <span aria-hidden className="chores-row-bg absolute inset-0 rounded-[12px] bg-bg-deep" />
            <span className="relative flex items-center gap-2 text-[13px] leading-[19.5px] tracking-[-0.006em] text-fg">
              <WifiGlyph className="size-4 text-mute" />
              {p.place}
            </span>
            <span className="relative font-mono text-[12px] leading-[18px] tracking-[-0.02em] text-soft">{p.ip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FoundAgents() {
  return (
    <div className="chores-pop chores-card w-[320px] rounded-[12px] p-4" style={i(0)}>
      <div className="flex items-center gap-2.5">
        <DataAgentGlyph kind="weather" size={32} />
        <span>
          <span className="block font-mono text-[13px] leading-[16.25px] text-fg">open-meteo-forecast</span>
          <span className="block text-[11px] leading-[13.75px] tracking-[0.006em] text-dim">Weather data agent</span>
        </span>
      </div>
      <p className="mt-4 text-[11px] leading-[16.5px] tracking-[0.006em] text-dim">Address</p>
      <p className="mt-0.5 font-mono text-[25px] leading-[25px] tracking-[-0.04em] text-fg">
        0:0000.0000.<span className="text-(--sky-accent)">4BB9</span>
      </p>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-edge pt-3">
        <span className="flex items-center gap-1.5 text-[11.5px] leading-[17.25px] text-mute">
          Running on
          <span className="grid font-medium text-fg">
            {["Laptop", "Cloud VM", "Container"].map((h, k) => (
              <span key={h} className="chores-swap col-start-1 row-start-1" style={i(k)}>
                {h}
              </span>
            ))}
          </span>
        </span>
        <BluePill className="chores-pulse">Same address</BluePill>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 2. getting through */

const NOTES = [
  { text: "Forward port 8080 on the router", x: 4, y: 12, r: -5 },
  { text: "Open a port in the firewall", x: 200, y: 0, r: 4 },
  { text: "Get a static IP?", x: 26, y: 124, r: 3 },
  { text: "Ask IT for an exception", x: 206, y: 114, r: -4 },
];

function ThroughPeople() {
  return (
    <div className="relative h-[220px] w-[380px]">
      {NOTES.map((n, k) => (
        <div key={n.text} className="absolute" style={{ left: n.x, top: n.y, rotate: `${n.r}deg` }}>
          <div
            className="chores-pop chores-card w-[164px] rounded-[12px] px-3.5 py-3 text-[13.5px] leading-[1.35] font-medium text-soft"
            style={i(k)}
          >
            {n.text}
          </div>
        </div>
      ))}
    </div>
  );
}

function Peer({ host, role, side, kind = "weather" }: { host: string; role: string; side: "l" | "r"; kind?: DataKind }) {
  return (
    <div className={`chores-card flex w-[156px] items-center gap-2.5 rounded-[12px] p-3 ${side === "r" ? "flex-row-reverse text-right" : ""}`}>
      {side === "l" ? (
        <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-bg-deep text-mute">
          <MachineGlyph className="size-4" />
        </span>
      ) : (
        <DataAgentGlyph kind={kind} size={28} />
      )}
      <span className="min-w-0">
        <span className="block truncate font-mono text-[12px] leading-4 text-fg">{host}</span>
        <span className="block truncate text-[11px] leading-[14px] text-dim">{role}</span>
      </span>
    </div>
  );
}

/* STUN through the beacon, a hole punch, then the direct tunnel: each step lands as it happens. */
const LADDER = [
  { text: "STUN probe", at: 250 },
  { text: "Hole punch", at: 850 },
  { text: "Direct tunnel", at: 1700 },
];

const PROBE_L = "M78 78 C 92 44, 128 16, 166 15";
const PROBE_R = "M302 78 C 288 44, 252 16, 214 15";
const TUNNEL = "M156 105 L 224 105";
/* The tunnel beam starts and ends just under the peer cards, so it leaves one machine and enters the other. */
const TUNNEL_BEAM = "M144 105 L 236 105";

function ThroughAgents() {
  // The two STUN probes go up to the beacon as their arcs draw; once the tunnel is open (by 1.9s), a message
  // crosses it every 1.9s, alternating direction, passing under the lock.
  const probe = useBeat(250, 600000);
  const run = useBeat(2300, 1900);
  return (
    <div className="relative h-[220px] w-[380px]">
      <div className="chores-pop absolute top-0 left-1/2 z-10 -translate-x-1/2" style={i(0)}>
        <span className="chores-card flex items-center gap-1.5 rounded-full py-1.5 pr-3 pl-2.5 text-[13px] leading-4 font-medium text-soft">
          <span className="size-1.5 rounded-full bg-(--sky-accent)" />
          Beacon
        </span>
      </div>
      <svg viewBox="0 0 380 220" aria-hidden className="absolute inset-0 size-full overflow-visible" fill="none">
        <path className="chores-probe" d={PROBE_L} pathLength={1} stroke="var(--color-edge-2)" />
        <path className="chores-probe" style={i(1)} d={PROBE_R} pathLength={1} stroke="var(--color-edge-2)" />
        <Beam d={PROBE_L} run={probe} duration={760} width={1.25} tail={40} />
        <Beam d={PROBE_R} run={probe} delay={120} duration={760} width={1.25} tail={40} />
        <path className="chores-draw" d={TUNNEL} pathLength={1} stroke="var(--sky-fill)" strokeWidth={2.5} strokeLinecap="round" />
        {/* messages crossing the open tunnel, there and back: out of one machine, under the lock, into the other.
            The tunnel is solid blue, so its light is pale. */}
        <Beam
          d={TUNNEL_BEAM}
          run={run}
          reverse={run !== null && run % 2 === 0}
          duration={1200}
          width={2.5}
          tail={20}
          color="var(--sky-200)"
        />
      </svg>
      <div className="chores-pop absolute top-[78px] left-0" style={i(1)}>
        <Peer host="claude-code" role="Your laptop" side="l" />
      </div>
      <div className="chores-pop absolute top-[78px] right-0" style={i(2)}>
        <Peer host="iss-position" role="Data agent" side="r" kind="space" />
      </div>
      <span className="chores-lock absolute top-[93px] left-[178px] grid size-6 place-items-center rounded-full bg-(--sky-deep) text-white ring-4 ring-bg">
        <LockIcon className="size-3" />
      </span>
      <ol className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 text-[13px] leading-4">
        {LADDER.map((s, k) => (
          <li key={s.text} className="chores-tl flex items-center gap-2" style={{ "--d": `${s.at}ms` } as CSSProperties}>
            {k > 0 && <Chevron className="size-3 text-faint" />}
            {k === LADDER.length - 1 ? (
              <span className="flex items-center gap-1 font-medium text-(--sky-accent)">
                <Check className="size-3" />
                {s.text}
              </span>
            ) : (
              <span className="text-mute">{s.text}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------------------------------------------------------- 3. who's allowed */

function AllowedPeople() {
  return (
    <div className="relative h-[220px] w-[380px]">
      <div className="absolute top-0 left-2 flex flex-col items-start gap-1.5">
        <span className="chores-pop chores-card rounded-[16px] rounded-bl-[5px] px-3.5 py-2 text-[13px] text-soft" style={i(0)}>
          can you send me the API key?
        </span>
        <span className="chores-pop ml-10 rounded-[16px] rounded-br-[5px] bg-fg/[0.07] px-3.5 py-2 text-[13px] text-fg" style={i(1)}>
          here: <span className="font-mono text-[12px]">sk_live_••••••••</span>
        </span>
      </div>
      <div className="absolute right-2 bottom-1 rotate-[2deg]">
        <div className="chores-pop chores-card w-[232px] rounded-[12px] p-3" style={i(2)}>
          <p className="flex items-center justify-between text-[12px] text-mute">
            <span className="font-mono text-soft">.env</span>
            copied from Slack
          </p>
          <div className="mt-2 flex flex-col gap-1 border-t border-edge pt-2 font-mono text-[11.5px] text-soft">
            {["WEATHER_API_KEY", "MAPS_API_KEY", "PAYMENTS_KEY"].map((k) => (
              <span key={k} className="truncate">
                {k}=<span className="text-dim">••••••••</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A real agent's mark on the home page's white tile. */
function MarkTile({ brand, size = 30 }: { brand: Brand; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-[9px] bg-card shadow-tile" style={{ width: size, height: size }}>
      <BrandMark brand={brand} className="size-[58%]" />
    </span>
  );
}

/*
 * Your agent's requests: agents ask to connect one at a time, and each waits for an answer. Nobody gets through
 * on their own say-so; the ones you approve do, the one you turn down doesn't.
 */
const REQUESTS: { brand: Brand; name: string; ok: boolean }[] = [
  { brand: "claude", name: "claude-code", ok: true },
  { brand: "codex", name: "codex", ok: true },
  { brand: "hermes", name: "hermes", ok: false },
  { brand: "openclaw", name: "openclaw", ok: true },
];

function AllowedAgents() {
  return (
    <div className="chores-pop chores-card w-[340px] rounded-[12px] px-3 pt-2.5 pb-1" style={i(0)}>
      <p className="flex items-center justify-between px-1 pb-1.5 text-[12px] leading-4 text-mute">
        Requests to connect
        <span className="flex items-center gap-1 text-(--sky-accent)">
          <PilotMarkP className="h-[10px] w-auto" />
          Your agent
        </span>
      </p>
      <ul>
        {REQUESTS.map((r, k) => {
          const at = 250 + k * 650;
          const decided = at + (k === REQUESTS.length - 1 ? 1050 : 600);
          return (
            <li
              key={r.name}
              className="chores-req flex h-[46px] items-center gap-2.5 border-t border-edge px-1"
              style={{ "--a": `${at}ms`, "--r": `${decided}ms` } as CSSProperties}
            >
              <MarkTile brand={r.brand} />
              <span className="min-w-0 flex-1 truncate font-mono text-[13px] leading-4 text-fg">{r.name}</span>
              <span className="grid justify-items-end">
                <span className="chores-ask col-start-1 row-start-1 flex gap-1 text-[11.5px] leading-4 font-medium">
                  <span data-pick={!r.ok} className="chores-no rounded-[7px] bg-fg/[0.06] px-2 py-1 text-mute">
                    Reject
                  </span>
                  <span data-pick={r.ok} className="chores-yes rounded-[7px] bg-fg px-2 py-1 text-bg">
                    Approve
                  </span>
                </span>
                <span className="chores-done col-start-1 row-start-1 self-center">
                  {r.ok ? (
                    <BluePill>Approved</BluePill>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-fg/[0.06] px-2.5 py-1 text-[11.5px] leading-[17.25px] font-medium text-mute">
                      Rejected
                    </span>
                  )}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- 4. finding data */

/** A browser window's top bar, with one tab. */
function WindowBar({ kind, title, children }: { kind: DataKind; title: string; children?: ReactNode }) {
  return (
    <div className="flex h-[30px] items-center gap-2 border-b border-edge bg-bg-deep px-3">
      <span className="flex gap-1">
        {[0, 1, 2].map((d) => (
          <span key={d} className="size-2 rounded-full bg-fg/15" />
        ))}
      </span>
      <span className="flex min-w-0 items-center gap-1 rounded-[6px] bg-card px-2 py-0.5 text-[10.5px] text-fg">
        <DataGlyph kind={kind} className="size-3 text-(--sky-accent)" />
        {title}
      </span>
      {children}
    </div>
  );
}

/** A sign-up page for every source: three windows deep, and the front one wants an account first. */
function DataPeople() {
  return (
    <div className="relative h-[238px] w-[340px]">
      {(
        [
          { kind: "space", x: 40, y: 0 },
          { kind: "weather", x: 20, y: 20 },
        ] as const
      ).map((w, k) => (
        <div
          key={w.kind}
          className="chores-pop chores-card absolute h-[150px] w-[300px] overflow-hidden rounded-[12px]"
          style={{ left: w.x, top: w.y, ...i(k) }}
        >
          <WindowBar kind={w.kind} title="Sign up" />
        </div>
      ))}
      <div className="chores-pop chores-card absolute top-[40px] left-0 w-[300px] overflow-hidden rounded-[12px]" style={i(2)}>
        <WindowBar kind="price" title="Sign up">
          <span className="flex min-w-0 gap-1">
            {["Pricing", "API keys"].map((t) => (
              <span key={t} className="truncate px-1 text-[10.5px] text-dim">
                {t}
              </span>
            ))}
          </span>
        </WindowBar>
        <div className="px-4 pt-2.5 pb-3">
          <p className="text-[13px] font-medium text-fg">Create an account</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {["Email", "Password"].map((f, k) => (
              <span key={f} className="chores-pop rounded-[9px] px-2.5 py-1 text-[12px] text-dim ring-1 ring-edge-2 ring-inset" style={i(k + 3)}>
                {f}
              </span>
            ))}
          </div>
          <span className="chores-pop mt-2 block rounded-[9px] bg-fg py-1.5 text-center text-[12px] font-medium text-bg" style={i(5)}>
            Create account
          </span>
          <p className="chores-pop mt-1.5 text-center text-[12px] text-mute" style={i(6)}>
            Verify your email to get an API key
          </p>
        </div>
      </div>
    </div>
  );
}

const REPLY = [
  ["amount", "80832.645"],
  ["base", "BTC"],
  ["currency", "USD"],
];

/** Your agent asks the data agent in one line, and the answer comes straight back. */
function DataAgents() {
  return (
    <div className="flex w-[340px] flex-col gap-2">
      <div className="chores-pop flex items-center gap-2.5" style={i(0)}>
        <DataAgentGlyph kind="price" size={30} />
        <span>
          <span className="block font-mono text-[13px] leading-[16.25px] text-fg">coinbase-spot-price</span>
          <span className="block text-[11px] leading-[13.75px] text-dim">Finance and crypto</span>
        </span>
      </div>
      <div className="chores-pop flex items-end gap-2 self-end" style={i(1)}>
        <span className="rounded-[16px] rounded-br-[5px] bg-(--sky-deep) px-3.5 py-2 font-mono text-[12px] text-white">
          /data {"{"}&quot;currency_pair&quot;:&quot;BTC-USD&quot;{"}"}
        </span>
        <MarkTile brand="claude" size={26} />
      </div>
      <pre className="chores-reply chores-card ml-10 self-start rounded-[16px] rounded-bl-[5px] px-3.5 py-3 font-mono text-[12px] leading-[18px] text-mute">
        {"{\n"}
        {REPLY.map(([k, v], n) => (
          <span key={k}>
            {"  "}&quot;{k}&quot;: <span className={n === 0 ? "text-(--sky-accent)" : "text-fg"}>&quot;{v}&quot;</span>
            {n < REPLY.length - 1 ? "," : ""}
            {"\n"}
          </span>
        ))}
        {"}"}
      </pre>
    </div>
  );
}

/* ---------------------------------------------------------------- steps */

const STEPS: Step[] = [
  {
    label: "Getting found",
    ms: 7000,
    people: { word: "New IP", caption: "each time the network changes" },
    agents: { num: 48, unit: "bit", caption: "address that stays put" },
    People: FoundPeople,
    Agents: FoundAgents,
  },
  {
    label: "Getting through",
    ms: 7000,
    people: { word: "Open ports", caption: "before anyone can reach you" },
    agents: { num: 0, unit: "ports", caption: "to forward, even behind NAT" },
    People: ThroughPeople,
    Agents: ThroughAgents,
  },
  {
    label: "Who’s allowed",
    ms: 7000,
    people: { word: "Shared keys", caption: "pasted into files and chats" },
    agents: { num: 2, unit: "sides", caption: "approve before a peer can reach your agent" },
    People: AllowedPeople,
    Agents: AllowedAgents,
  },
  {
    label: "Finding data",
    ms: 7000,
    people: { word: "Sign-ups", caption: "often an account and a key for every source" },
    agents: { prefix: "~", num: 430, unit: "agents", caption: "serving live data, one /data query each" },
    People: DataPeople,
    Agents: DataAgents,
  },
];

/* ---------------------------------------------------------------- figures */

function Rolling({ value }: { value: number }) {
  return (
    <span className="inline-flex">
      {[...String(value)].map((d, k) => (
        <span key={k} className="relative inline-block [clip-path:inset(0_-0.25em)]">
          <span className="invisible">0</span>
          <span
            className="chores-roll absolute inset-x-0 top-0 flex flex-col"
            style={{ "--to": `${-Number(d) * 10}%`, "--d": `${k * 80}ms` } as CSSProperties}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="h-[1em] leading-none">
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

function FigureView({ f, tone }: { f: Figure; tone: "people" | "agents" }) {
  const label = f.word ?? `${f.prefix ?? ""}${f.num} ${f.unit ?? ""}`.trim();
  return (
    <div className="chores-figure flex flex-col items-center text-center">
      <p className="sr-only">
        {label} {f.caption}
      </p>
      <p
        aria-hidden
        className={`flex items-baseline leading-none font-medium tracking-[-0.01em] whitespace-nowrap ${tone === "agents" ? "text-fg" : "text-dim"}`}
      >
        {f.word ? (
          <span className="chores-big">{f.word}</span>
        ) : (
          <>
            <span className="chores-big tabular-nums">
              {f.prefix}
              {f.num !== undefined && <Rolling value={f.num} />}
            </span>
            {f.unit && <span className="chores-unit ml-[0.06em] tracking-[-0.02em]">{f.unit}</span>}
          </>
        )}
      </p>
      <p
        aria-hidden
        className="chores-caption mt-2 max-w-[300px] text-[15px] leading-[21.75px] tracking-[-0.016em] text-balance text-mute"
      >
        {f.caption}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- section */

const N = STEPS.length;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Pinned and scroll-driven where the stage fits a screen; plain tabs on phones (see chores.css, same query). */
const PIN = "(min-width: 640px) and (min-height: 560px)";

function subscribePin(onChange: () => void) {
  const query = window.matchMedia(PIN);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const pinNow = () => window.matchMedia(PIN).matches;

/** A 400×240 composition, scaled down to fit narrow columns. */
function Stage({ children }: { children: ReactNode }) {
  const [ref, scale] = useFitScale<HTMLDivElement>(400);
  return (
    <div ref={ref} className="relative w-full" style={{ height: 240 * scale }}>
      <div
        className="absolute top-0 left-1/2 flex h-[240px] w-[400px] items-center justify-center"
        style={{ transform: `translateX(-50%) scale(${scale})`, transformOrigin: "top center" }}
      >
        {children}
      </div>
    </div>
  );
}

function Side({ tone, step }: { tone: "people" | "agents"; step: number }) {
  const current = STEPS[step];
  const Scene = tone === "people" ? current.People : current.Agents;
  return (
    <div className="chores-side flex flex-col items-center">
      <h3 className="flex items-center gap-2 rounded-[8px] bg-(--sky-tile) px-2.5 py-2 text-[15px] leading-4 font-medium text-fg sm:text-[16px]">
        {tone === "agents" && <PilotMarkP className="h-[14px] w-auto" />}
        {tone === "people" ? "Built for people" : "Built for agents"}
      </h3>
      <div className="chores-stage chores-gap-scene w-full" key={`s-${step}`}>
        <Stage>
          <Scene />
        </Stage>
      </div>
      <div className="chores-gap-figure" key={`f-${step}`}>
        <FigureView f={tone === "people" ? current.people : current.agents} tone={tone} />
      </div>
    </div>
  );
}

/** The chosen tab's progress line: how far through this chore's stretch of the scroll you are. */
function TabProgress({ progress, step }: { progress: MotionValue<number>; step: number }) {
  const scaleX = useTransform(progress, (p) => clamp01(p * N - step));
  return (
    <span aria-hidden className="chores-track absolute inset-x-0 bottom-0 h-[2px] overflow-hidden rounded-b-[3px]">
      <motion.span className="chores-bar block size-full" style={{ scaleX }} />
    </span>
  );
}

export function Chores() {
  // The section is the scroll track; it also tells the ambient loops to rest while it's off screen.
  const [ref, onScreen] = useInView<HTMLElement>({ once: false, margin: "0px" });
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const pinned = useSyncExternalStore(subscribePin, pinNow, () => true);
  const [tapped, setTapped] = useState(0);
  const [scrolled, setScrolled] = useState(0);
  const [seen, setSeen] = useState(false);
  const [picked, setPicked] = useState(false);
  const [fitRef, fit] = useFitHeight<HTMLDivElement>(44);
  const step = pinned ? scrolled : tapped;

  // Each chore owns an equal stretch of the scroll; the step is simply where you are in it, so arriving is always
  // chore 1. The progress is how far the sticky stage has travelled down the section, read straight from the
  // layout. A spring smooths the progress line a little (not the step, which follows the scroll exactly).
  const progress = useMotionValue(0);
  const smooth = useSpring(progress, { stiffness: 170, damping: 30, mass: 0.35, restDelta: 0.0005 });
  const { scrollY } = useScroll();
  const measure = useCallback(() => {
    const el = ref.current;
    const s = stage.current;
    if (!pinned || !el || !s) return;
    const travel = el.offsetHeight - s.offsetHeight;
    const p = travel > 0 ? clamp01((s.getBoundingClientRect().top - el.getBoundingClientRect().top) / travel) : 0;
    progress.set(p);
    setScrolled(Math.min(N - 1, Math.floor(p * N)));
  }, [pinned, ref, progress]);
  useMotionValueEvent(scrollY, "change", measure);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // The scenes wait on their first frame until the comparison itself is on screen, then play. (The old autoplay
  // started its 7s timer as soon as the tab strip peeked in, so readers arrived on chore 2.)
  const { scrollYProgress: approach } = useScroll({ target: ref, offset: ["start end", "start start"] });
  useMotionValueEvent(approach, "change", (p) => p > 0.72 && setSeen(true));
  const [panelRef, panelSeen] = useInView<HTMLDivElement>({ margin: "0px 0px -30% 0px" });
  const live = pinned ? seen : panelSeen;

  /** Pinned: a chore is the middle of its stretch of the scroll. Otherwise the tabs just switch. */
  function goTo(n: number) {
    setPicked(true);
    if (!pinned) return setTapped(n);
    const el = ref.current;
    const s = stage.current;
    if (!el || !s) return;
    const top = el.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(s).top) || 0);
    const travel = el.offsetHeight - s.offsetHeight;
    window.scrollTo({ top: top + travel * ((n + 0.5) / N), behavior: reduced ? "auto" : "smooth" });
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const at = Math.max(0, tabs.current.indexOf(document.activeElement as HTMLButtonElement));
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next = e.key === "Home" ? 0 : e.key === "End" ? N - 1 : Math.min(N - 1, Math.max(0, at + delta));
    goTo(next);
    tabs.current[next]?.focus({ preventScroll: true });
  }

  return (
    <section
      ref={ref}
      id="chores"
      aria-labelledby="chores-title"
      data-offscreen={!onScreen}
      className="chores"
    >
      <div ref={stage} className="chores-pin">
        <div ref={fitRef} className="wrap flex flex-col items-center" style={{ transform: pinned && fit < 1 ? `scale(${fit})` : undefined }}>
          <Reveal className="max-w-[1000px] text-center">
            <h2
              id="chores-title"
              className="text-[clamp(32px,4.2vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em] text-balance text-fg"
            >
              Four chores every agent runs into,
              <span className="block text-mute">and how Pilot handles each one.</span>
            </h2>
          </Reveal>

          {/* The kit's segmented tabs (sky-seg). Pinned, the chosen tab follows the scroll, its line runs along the
              chore's stretch, and picking one scrolls there. */}
          <Reveal delay={80} className="chores-gap-tabs w-full max-w-[420px] sm:w-auto sm:max-w-full">
            <div role="tablist" aria-label="Four chores" onKeyDown={onKey} className="sky-seg chores-seg">
              {STEPS.map((s, n) => {
                const active = n === step;
                return (
                  <button
                    key={s.label}
                    ref={(el) => {
                      tabs.current[n] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`chores-tab-${n}`}
                    aria-selected={active}
                    aria-controls="chores-panel"
                    tabIndex={active ? 0 : -1}
                    data-on={active}
                    onClick={() => goTo(n)}
                    className="sky-seg-tab chores-tab"
                  >
                    {active && (
                      <motion.span
                        layoutId="chores-pill"
                        aria-hidden
                        className="sky-seg-pill"
                        transition={reduced ? { duration: 0 } : { type: "spring", duration: 0.35, bounce: 0 }}
                      />
                    )}
                    <span className="sky-seg-num relative">{n + 1}</span>
                    <span className="sky-seg-label">{s.label}</span>
                    {active && pinned && <TabProgress progress={reduced ? progress : smooth} step={n} />}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <LiveContext.Provider value={live && onScreen}>
          <div ref={panelRef} className="chores-gap-panel w-full" data-live={live}>
            <SkyRule />
            <div
              id="chores-panel"
              role="tabpanel"
              aria-labelledby={`chores-tab-${step}`}
              aria-live={picked ? "polite" : "off"}
              className="chores-grid relative w-full"
            >
              <span aria-hidden className="chores-centre absolute inset-y-0 left-1/2 w-px -translate-x-1/2" />
              <p
                aria-hidden
                className="chores-vs chores-vs-mid absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg py-1 text-[32px] leading-[33px] font-medium tracking-[-0.022em]"
              >
                Vs
              </p>

              <Side tone="people" step={step} />

              <div aria-hidden className="chores-vs-row flex items-center gap-4">
                <span className="chores-dash chores-dash-l h-px flex-1" />
                <span className="chores-vs text-[24px] leading-none font-medium tracking-[-0.022em]">Vs</span>
                <span className="chores-dash chores-dash-r h-px flex-1" />
              </div>

              <Side tone="agents" step={step} />
            </div>
            <SkyRule />
          </div>
          </LiveContext.Provider>
        </div>
      </div>
    </section>
  );
}
