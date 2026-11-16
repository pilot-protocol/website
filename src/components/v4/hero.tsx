"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import "./hero.css";
import { DownloadIcon } from "@/components/icons";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { approx, useStats } from "@/lib/stats";

/*
 * Variant D hero (Figma 180:37, with the alternatives in 180:521). The copy and the passport stamps sit on
 * the sky; below the buttons one of three scenes from the design is drawn on the design's own 1680×1050
 * canvas, scaled to the width, and a small switch flips between them (remembered per visitor):
 *   Orbit  (160:1134 / 180:37)  arcs rising out of the glow, six agents, two live toast stacks.
 *   Radar  (160:947)            a sweep turning over the agents; contacts approve as it passes.
 *   Routes (166:3261)           agents joined by tunnels on a dotted grid, packets running along them.
 * All three share one event feed (the toasts), pause off-screen, and hold still with reduced motion.
 */

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;
const mod = (n: number, m: number) => ((n % m) + m) % m;
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/** A packet riding an SVG path inside `layer` (offset-path). Returns its duration. */
function sendPacket(
  layer: HTMLElement | null | undefined,
  d: string,
  from: string,
  to: string,
  { length, strong = true, fade = "both" }: { length: number; strong?: boolean; fade?: "both" | "in" | "out" },
) {
  if (!layer) return 0;
  const el = document.createElement("span");
  el.className = "hero-d-packet";
  el.style.offsetPath = `path("${d}")`;
  layer.appendChild(el);
  const peak = strong ? 1 : 0.5;
  const duration = 520 + length * 1.25;
  const frames: Keyframe[] =
    fade === "in"
      ? // Arriving out of the haze: invisible at the far end, bright at the agent.
        [
          { offsetDistance: from, opacity: 0 },
          { opacity: peak, offset: 0.35 },
          { opacity: peak, offset: 0.9 },
          { offsetDistance: to, opacity: 0 },
        ]
      : fade === "out"
        ? [
            { offsetDistance: from, opacity: 0 },
            { opacity: peak, offset: 0.1 },
            { opacity: peak * 0.8, offset: 0.6 },
            { offsetDistance: to, opacity: 0 },
          ]
        : [
            { offsetDistance: from, opacity: 0 },
            { opacity: peak, offset: 0.12 },
            { opacity: peak, offset: 0.88 },
            { offsetDistance: to, opacity: 0 },
          ];
  const anim = el.animate(frames, {
    duration,
    easing: fade === "out" ? "cubic-bezier(0.5, 0, 0.75, 0)" : "cubic-bezier(0.45, 0, 0.2, 1)",
    fill: "both",
  });
  anim.onfinish = () => el.remove();
  return duration;
}

/** The ring around an agent flashes and the tile gives a small bump. */
function ping(ring: HTMLElement | null | undefined, tile: HTMLElement | null | undefined, reach = 2.3) {
  ring?.animate(
    [
      { opacity: 0.9, scale: 1 },
      { opacity: 0, scale: reach },
    ],
    { duration: 1000, easing: EASE },
  );
  tile?.animate([{ scale: 1 }, { scale: 1.07, offset: 0.3 }, { scale: 1 }], { duration: 560, easing: EASE });
}

// ---------- Passport stamps (Figma 180:103) ----------
// Five white cards fanned after "agents."; positions in em of the 72px headline, centred on each card.
const STAMPS = [
  { src: "/v4/stamp-hermes.png", className: "border-[0.926px] border-white object-contain" },
  { src: "/v4/stamp-muse.png", className: "object-contain" },
  { src: "/v4/stamp-claude.svg", className: "" },
  { src: "/v4/stamp-dark.svg", className: "" },
  { src: "/v4/stamp-orange.png", className: "rounded-[0.0707em] object-contain" },
];
/** Slot 0 is the bottom of the pile, slot 4 the top. x from the end of "agents.", y from the top of the line. */
const STAMP_SLOTS = [
  { x: 0.478, y: 0.501, r: -13.07 },
  { x: 0.517, y: 0.494, r: -7.54 },
  { x: 0.556, y: 0.487, r: 4.11 },
  { x: 0.595, y: 0.48, r: -4.79 },
  { x: 0.635, y: 0.473, r: -9.9 },
];

// ---------- The event feed (toasts) ----------
type TileId = "cursor" | "hermes" | "openclaw" | "claude" | "gemini" | "codex" | "opencode";
type Kind = "auto" | "mutual";
type Ev = { host: string; kind: Kind; tile: TileId; wait?: string; done?: string };

// Real data agents (src/lib/agents.ts) approve handshakes on their own; agents ask, and both sides approve.
const LEFT: Ev[] = [
  { host: "coingecko-markets-simple", kind: "auto", tile: "cursor" },
  { host: "hermes", kind: "mutual", tile: "hermes" },
  { host: "iss-position", kind: "auto", tile: "codex" },
  { host: "bvg-berlin-departures", kind: "auto", tile: "hermes" },
  { host: "codex", kind: "mutual", tile: "codex" },
  { host: "hn-top", kind: "auto", tile: "cursor" },
];
const RIGHT: Ev[] = [
  { host: "open-meteo-forecast", kind: "auto", tile: "claude" },
  { host: "openclaw", kind: "mutual", tile: "openclaw" },
  { host: "usgs-earthquakes", kind: "auto", tile: "gemini" },
  { host: "claude-code", kind: "mutual", tile: "claude" },
  { host: "ecb-exchange-rates", kind: "auto", tile: "gemini" },
  { host: "wikipedia-summary", kind: "auto", tile: "openclaw" },
];
/** Every event in the order they happen: right, left, right, left… */
const ALL: Ev[] = RIGHT.flatMap((r, i) => [r, LEFT[i]]);

const COPY: Record<Kind, { wait: string; done: string }> = {
  auto: { wait: "Handshake sent", done: "Approved automatically" },
  mutual: { wait: "Wants to connect", done: "Trusted, both sides approved" },
};

type Phase = "wait" | "press" | "done";
type Feed = {
  /** Starts the next event: it lands at the front of the stacks, waiting. */
  next: () => { k: number; ev: Ev };
  press: (k: number) => void;
  done: (k: number) => void;
  /** Resolves whatever was in flight (a scene stopped half way). */
  settle: () => void;
};
type FeedState = { k: number; phase: Phase };

// ---------- Views ----------
const VIEWS = [
  { id: "orbit", label: "Orbit" },
  { id: "radar", label: "Radar" },
  { id: "routes", label: "Routes" },
  { id: "flights", label: "Flights" },
] as const;
type View = (typeof VIEWS)[number]["id"];

const VIEW_KEY = "pp-v4-hero-view";
const viewListeners = new Set<() => void>();
function readView(): View {
  try {
    const v = window.localStorage.getItem(VIEW_KEY);
    return VIEWS.some((x) => x.id === v) ? (v as View) : "orbit";
  } catch {
    return "orbit";
  }
}
function writeView(v: View) {
  try {
    window.localStorage.setItem(VIEW_KEY, v);
  } catch {
    // Private mode: the choice just isn't remembered.
  }
  viewListeners.forEach((l) => l());
}
function subscribeView(listener: () => void) {
  viewListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    viewListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

const SCENE_LABEL: Record<View, string> = {
  orbit: "Cursor, Hermes, OpenClaw, Claude, Gemini and Codex agents on the network, with handshakes being approved",
  radar: "A radar sweeping over agents on the network, picking up data agents that approve handshakes automatically",
  routes: "Claude Code, Codex, OpenClaw, Cursor, Hermes, OpenCode and Gemini joined by encrypted tunnels",
  flights: "Agents and data agents joined by flight routes; each connection is approved before it lights up",
};

const COMPACT_QUERY = "(max-width: 1023.98px)";
function subscribeCompact(listener: () => void) {
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
/** True below 1024px, where the scenes switch to their compact crop. */
function useCompact() {
  return useSyncExternalStore(subscribeCompact, () => window.matchMedia(COMPACT_QUERY).matches, () => false);
}

export function HeroD() {
  const stats = useStats();
  const reduced = usePrefersReducedMotion();
  const [sectionRef, inView] = useInView<HTMLElement>({ once: false, margin: "0px" });
  const live = inView && !reduced;
  const view = useSyncExternalStore(subscribeView, readView, () => "orbit" as View);

  // ---- Stamps: land one by one, then the bottom one is stamped back on top every few seconds.
  const [order, setOrder] = useState([0, 1, 2, 3, 4]);
  const stampRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cycled = useRef(false);

  useEffect(() => {
    if (!live) return;
    let timer = 0;
    const next = () => {
      cycled.current = true;
      setOrder((o) => [...o.slice(1), o[0]]);
      timer = window.setTimeout(next, 3200);
    };
    timer = window.setTimeout(next, 3400);
    return () => window.clearTimeout(timer);
  }, [live]);

  useEffect(() => {
    if (!cycled.current) return;
    stampRefs.current[order[4]]?.animate(
      [
        { opacity: 0, scale: 1.6, transform: "translateY(-0.12em) rotate(9deg)" },
        { opacity: 1, scale: 0.94, transform: "none", offset: 0.55 },
        { opacity: 1, scale: 1, transform: "none" },
      ],
      { duration: 560, easing: EASE },
    );
  }, [order]);

  // ---- The feed every scene drives: k counts events, phase is the state of the newest one.
  const [feed, setFeed] = useState<FeedState>({ k: 0, phase: "done" });
  const kRef = useRef(0);
  const api = useMemo<Feed>(
    () => ({
      next() {
        const k = kRef.current + 1;
        kRef.current = k;
        setFeed({ k, phase: "wait" });
        return { k, ev: ALL[mod(k, ALL.length)] };
      },
      press: (k) => setFeed((f) => (f.k === k ? { ...f, phase: "press" } : f)),
      done: (k) => setFeed((f) => (f.k === k ? { ...f, phase: "done" } : f)),
      settle: () => setFeed((f) => (f.phase === "done" ? f : { ...f, phase: "done" })),
    }),
    [],
  );

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-labelledby="hero-d-title"
      data-live={live}
      className="hero-d v4-under-header relative isolate overflow-hidden"
    >
      <Clouds />

      <div className="wrap relative z-10 flex flex-col items-center pt-9 text-center sm:pt-[60px] short:pt-6">
        <a
          href="#numbers"
          className="hero-d-pill rise-in inline-flex items-center gap-2.5 rounded-[8px] bg-white/10 py-1.5 pr-3 pl-2 text-[13px] leading-[1.2] tracking-[-0.0762px] text-white/75 focus-visible:outline-white"
          style={delay(0)}
        >
          <span>
            <span className="font-semibold text-white tabular-nums">{approx(stats.activeNodes)}</span> daemons online
            <span className="max-[379px]:hidden"> in the last 30 minutes</span>
          </span>
          <span aria-hidden className="w-px self-stretch bg-white/10" />
          <svg
            aria-hidden
            viewBox="0 0 12 12"
            fill="none"
            className="hero-d-pill-arrow size-3"
          >
            <path d="M1.5 6H10M7 9L10 6L7 3" stroke="currentColor" strokeLinecap="square" />
          </svg>
        </a>

        <h1
          id="hero-d-title"
          className="mt-4 text-[clamp(46px,12.6vw,72px)] leading-[0.9] font-medium tracking-[-0.0556em] text-white short:text-[56px]"
        >
          {/* The trailing space is part of the line in the design, so it centres a touch to the left. */}
          <span className="rise-in block" style={delay(60)}>
            The internet{" "}
          </span>
          <span className="rise-in block whitespace-nowrap" style={delay(140)}>
            for{" "}
            <span className="relative inline-block">
              agents.
              <StampStack order={order} refs={stampRefs} animate={!reduced} />
            </span>
          </span>
        </h1>

        <p
          className="rise-in mt-4 max-w-[566px] text-[17px] leading-[1.45] tracking-[-0.3px] text-pretty text-white/80 sm:text-[19px] sm:leading-[1.4] sm:tracking-[-0.5px]"
          style={delay(220)}
        >
          Every agent gets a permanent address and encrypted tunnels to other agents. Nobody can reach yours until both
          sides approve.
        </p>

        <div className="rise-in mt-7 flex flex-wrap justify-center gap-3 sm:mt-8" style={delay(300)}>
          <a
            href="#get-started"
            className="pressable inline-flex items-center gap-1 rounded-[8px] bg-white p-3 text-[15px] leading-[19.5px] font-semibold tracking-[-0.15px] text-ink shadow-[0_0_0_1px_rgb(13_17_23/0.08),inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-1px_0_rgb(13_17_23/0.14)] hero-d-solid focus-visible:outline-white"
          >
            Install Pilot
            <span className="grid size-4 place-items-center">
              <DownloadIcon className="size-[11px]" />
            </span>
          </a>
          <a
            href="#cloud"
            className="pressable inline-flex items-center rounded-[8px] bg-white/10 p-3 text-[15px] leading-[19.5px] font-semibold tracking-[-0.15px] text-white shadow-[inset_0_-1px_0_rgb(13_17_23/0.14)] hero-d-ghost focus-visible:outline-white"
          >
            Use it from Claude or ChatGPT
          </a>
        </div>

        {/* In the gap between the buttons and the scene; in the flow on phones. */}
        <div
          className="rise-in mt-6 lg:absolute lg:top-full lg:left-1/2 lg:mt-[15px] lg:-translate-x-1/2"
          style={delay(340)}
        >
          <ViewSwitch view={view} />
        </div>

        {/* Phones and tablets: one stack, centred, between the buttons and the scene. */}
        <div
          aria-hidden
          className="rise-in relative mt-5 h-[190px] w-[340px] max-w-[calc(100vw-24px)] lg:hidden"
          style={delay(380)}
        >
          <ToastStack
            events={view === "flights" ? FLIGHT_EVENTS : ALL}
            front={{ c: feed.k, current: true }}
            phase={feed.phase}
            slots={SLOTS_COMPACT}
            className="inset-y-0 left-1/2 w-[340px] -translate-x-1/2"
            toast="sm"
            toastClass="w-[320px]"
          />
        </div>
      </div>

      <div role="img" aria-label={SCENE_LABEL[view]} className="hero-d-scene rise-in relative" style={delay(380)}>
        <ViewLayer active={view === "orbit"}>
          <OrbitScene run={live && view === "orbit"} feed={api} state={feed} />
        </ViewLayer>
        <ViewLayer active={view === "radar"}>
          <RadarScene run={live && view === "radar"} feed={api} />
        </ViewLayer>
        <ViewLayer active={view === "routes"}>
          <RoutesScene run={live && view === "routes"} feed={api} state={feed} />
        </ViewLayer>
        <ViewLayer active={view === "flights"}>
          <FlightsScene run={live && view === "flights"} still={reduced} feed={api} />
        </ViewLayer>
        <div aria-hidden className="hero-d-night-fade pointer-events-none absolute inset-x-0 bottom-0 h-[30%] max-lg:h-[16%]" />
      </div>
    </section>
  );
}

function ViewLayer({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div aria-hidden className="hero-d-view absolute inset-0" data-active={active}>
      {children}
    </div>
  );
}

/** Segmented switch between the four scenes. Arrow keys move the choice, as in any radio group. */
function ViewSwitch({ view }: { view: View }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = VIEWS.findIndex((v) => v.id === view);

  function onKeyDown(e: KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    let next = step === undefined ? -1 : mod(index + step, VIEWS.length);
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = VIEWS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    writeView(VIEWS[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label="Picture under the headline"
      onKeyDown={onKeyDown}
      className="relative inline-flex rounded-[8px] bg-white/10 p-[3px] shadow-[inset_0_-1px_0_rgb(13_17_23/0.14)]"
    >
      <span
        aria-hidden
        className="absolute top-[3px] bottom-[3px] left-[3px] w-[66px] rounded-[6px] bg-white/[0.16] shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] transition-[translate] duration-[250ms] ease-(--ease-out) motion-reduce:transition-none"
        style={{ translate: `${index * 66}px 0` }}
      />
      {VIEWS.map((v, i) => (
        <button
          key={v.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={view === v.id}
          tabIndex={view === v.id ? 0 : -1}
          onClick={() => writeView(v.id)}
          className="hero-d-seg relative h-[26px] w-[66px] rounded-[6px] text-[12.5px] leading-none font-medium tracking-[-0.1px] text-white/65 focus-visible:outline-white aria-checked:text-white"
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

function Clouds() {
  return (
    <div aria-hidden className="hero-d-clouds">
      <div className="hero-d-cloud top-[-27px] left-[1017px] h-[889px] w-[1333px]" style={{ "--blur": "7.5px" } as CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v4/clouds-b.webp" alt="" width={1333} height={889} />
      </div>
      <div className="hero-d-cloud top-[640px] left-[-389px] h-[666px] w-[999px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v4/clouds-a.webp" alt="" width={999} height={666} />
      </div>
      <div className="hero-d-cloud top-[-36px] left-[-670px] h-[666px] w-[999px] [animation-direction:alternate-reverse]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v4/clouds-a.webp" alt="" width={999} height={666} className="rotate-180" />
      </div>
    </div>
  );
}

function StampStack({
  order,
  refs,
  animate,
}: {
  order: number[];
  refs: RefObject<(HTMLSpanElement | null)[]>;
  animate: boolean;
}) {
  return (
    <span aria-hidden className="absolute top-0 left-full h-full w-[0.95em]">
      {/* Fixed DOM order (moving nodes would restart their landing); the pile order is z-index. */}
      {STAMPS.map((stamp, card) => {
        const slot = order.indexOf(card);
        const s = STAMP_SLOTS[slot];
        return (
          <span
            key={card}
            ref={(el) => {
              refs.current[card] = el;
            }}
            data-enter={animate}
            className="hero-d-stamp absolute top-0 left-0 flex size-[0.5976em] items-center justify-center rounded-[0.0811em] border border-black/10 bg-white"
            style={
              {
                "--x": `${s.x}em`,
                "--y": `${s.y}em`,
                "--r": `${s.r}deg`,
                "--delay": `${640 + card * 120}ms`,
                zIndex: slot,
              } as CSSProperties
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stamp.src}
              alt=""
              width={23.305}
              height={23.305}
              className={`size-[0.3237em] max-w-none ${stamp.className}`}
            />
          </span>
        );
      })}
    </span>
  );
}

/* =====================================================================================================
 * Orbit (Figma 180:37): the glow, six arcs, six agents with their ring, two masked toast stacks.
 * ===================================================================================================== */

const PATH_155 =
  "M17.0003 331.852C43.5519 257.846 86.791 190.949 143.365 136.348C199.939 81.7471 268.328 40.9091 343.23 17.0003";
const PATH_156 =
  "M17.5391 528.238C12.3747 415.761 44.4308 304.719 108.745 212.3C173.059 119.881 266.045 51.2389 373.308 17.0003";
const PATH_157 =
  "M17.4675 528.258C12.9888 415.749 40.7899 304.684 96.5519 212.259C152.313 119.836 232.915 51.2201 325.857 17.0003";
const PATH_158 = "M17 147.66C67.8198 87.4174 130.705 42.5487 200.096 17.0003";

type Arc = {
  src: string;
  /** Figma's rotated frame: its bounding box on the canvas, the box it rotates, rotation, mirror. */
  box: [number, number, number, number];
  inner: [number, number];
  rot: number;
  flip: boolean;
  /** Where the SVG sits inside the rotated box (left, top), and its own size. */
  at: [number, number];
  size: [number, number];
  d: string;
  length: number;
  /** The agent this arc leads to, and which end of the path it's at. */
  tile: TileId;
  tileAtEnd: boolean;
};

const ARCS: Arc[] = [
  {
    src: "/v4/arc-157.svg",
    box: [482, 566, 978.378, 1102.007],
    inner: [889.512, 1026],
    rot: 174.83,
    flip: true,
    at: [-16.011, 8.208],
    size: [342.858, 545.258],
    d: PATH_157,
    length: 637,
    tile: "claude",
    tileAtEnd: true,
  },
  {
    src: "/v4/arc-158.svg",
    box: [389, 557, 1221.263, 1124.751],
    inner: [889.512, 1026],
    rot: 105,
    flip: true,
    at: [109.766, 8.208],
    size: [217.097, 164.66],
    d: PATH_158,
    length: 227,
    tile: "hermes",
    tileAtEnd: false,
  },
  {
    src: "/v4/arc-160.svg",
    box: [-306, 665, 1126.236, 1007.295],
    inner: [889.512, 1026],
    rot: 96.96,
    flip: false,
    at: [109.766, 8.208],
    size: [217.097, 164.66],
    d: PATH_158,
    length: 227,
    tile: "codex",
    tileAtEnd: false,
  },
  {
    src: "/v4/arc-155.svg",
    box: [231, 473, 1232.663, 1232.663],
    inner: [1026, 1026],
    rot: -13.16,
    flip: false,
    at: [14.056, 8.208],
    size: [360.23, 348.852],
    d: PATH_155,
    length: 470,
    tile: "cursor",
    tileAtEnd: true,
  },
  {
    src: "/v4/arc-156.svg",
    box: [96, 577, 1294.539, 1294.539],
    inner: [1026, 1026],
    rot: -161.85,
    flip: true,
    at: [-16.006, 8.208],
    size: [390.308, 545.238],
    d: PATH_156,
    length: 670,
    tile: "gemini",
    tileAtEnd: true,
  },
  {
    src: "/v4/arc-159.svg",
    box: [-158, 586, 1363.287, 1363.287],
    inner: [1026, 1026],
    rot: -155.02,
    flip: true,
    at: [-16.006, 8.208],
    size: [390.308, 545.238],
    d: PATH_156,
    length: 670,
    tile: "openclaw",
    tileAtEnd: true,
  },
];

type OrbitTile = { id: TileId; x: number; y: number; src: string; size: number; className?: string; float: number };

/* Each agent's dot sits 24 canvas px past the bright tip of its arc, on the arc's line, so every agent reads as the
   end of its own orbit (measured from the rendered arcs; move an arc and its tile moves with it). */

const ORBIT_TILES: OrbitTile[] = [
  { id: "cursor", x: 580, y: 564.9, src: "/v4/agent-cursor.svg", size: 39.793, float: 0 },
  { id: "hermes", x: 733.4, y: 637, src: "/v4/agent-hermes.png", size: 31.615, className: "object-cover", float: -2.1 },
  {
    id: "openclaw",
    x: 828.1,
    y: 802.4,
    src: "/v4/agent-openclaw.png",
    size: 31.62,
    className: "rounded-[11.192px] object-contain",
    float: -4.3,
  },
  { id: "claude", x: 1013.3, y: 540.2, src: "/v4/agent-claude.svg", size: 39.793, float: -1.2 },
  { id: "gemini", x: 998.7, y: 722.6, src: "/v4/agent-gemini.svg", size: 31.615, float: -3.4 },
  { id: "codex", x: 608.8, y: 806.2, src: "/v4/agent-codex.svg", size: 39.793, float: -5 },
];

type Slot = { x: number; y: number; o: number; z: number };

/*
 * Slots from the back of the stack (leaving) to the front of the queue (arriving). The design's
 * four are 1–4, at the design's positions and opacities. The front toast is fully opaque (the
 * design has 90%) so the toast behind it can't show through its text.
 */
const SLOTS_LEFT: Slot[] = [
  { x: 124, y: -70, o: 0, z: 0 },
  { x: 114, y: -12, o: 0.2, z: 1 },
  { x: 88, y: 45, o: 0.7, z: 2 },
  { x: 1, y: 89, o: 1, z: 4 },
  { x: 80, y: 146, o: 0.2, z: 3 },
  { x: 72, y: 204, o: 0, z: 0 },
];
const SLOTS_RIGHT: Slot[] = [
  { x: 124, y: -70, o: 0, z: 0 },
  { x: 114, y: -12, o: 0.2, z: 1 },
  { x: 62, y: 45, o: 0.7, z: 2 },
  { x: 90, y: 89, o: 1, z: 4 },
  { x: 54, y: 146, o: 0.2, z: 3 },
  { x: 46, y: 204, o: 0, z: 0 },
];
/** Phones and tablets: three in view, the front (320px) one centred in a 340px column. */
const SLOTS_COMPACT: Slot[] = [
  { x: 26, y: -60, o: 0, z: 0 },
  { x: 24, y: -14, o: 0, z: 1 },
  { x: 22, y: 22, o: 0.65, z: 2 },
  { x: 10, y: 64, o: 1, z: 4 },
  { x: 24, y: 114, o: 0.25, z: 3 },
  { x: 26, y: 166, o: 0, z: 0 },
];

/** Which event a side stack shows at the front after `k` events, and whether it's the one in flight. */
function sideFront(side: "left" | "right", k: number) {
  if (side === "right") return { c: Math.floor(k / 2), current: mod(k, 2) === 0 };
  return { c: Math.floor((k - 1) / 2), current: mod(k, 2) === 1 };
}

function OrbitScene({ run, feed, state }: { run: boolean; feed: Feed; state: FeedState }) {
  const packetLayers = useRef<(HTMLDivElement | null)[]>([]);
  const tileRefs = useRef<Partial<Record<TileId, HTMLSpanElement | null>>>({});
  const ringRefs = useRef<Partial<Record<TileId, HTMLSpanElement | null>>>({});

  useEffect(() => {
    if (!run) return;
    let alive = true;
    let busy: TileId | null = null;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(() => alive && fn(), ms));

    function send(index: number, inbound: boolean, strong = true) {
      const arc = ARCS[index];
      // The agent's end of the arc is bright; the far end fades into the glow, and so does the packet.
      const atTile = arc.tileAtEnd ? "100%" : "0%";
      const far = arc.tileAtEnd ? "0%" : "100%";
      return sendPacket(packetLayers.current[index], arc.d, inbound ? far : atTile, inbound ? atTile : far, {
        length: arc.length,
        strong,
        fade: inbound ? "in" : "out",
      });
    }

    at(0, feed.settle);

    // Each event: a packet goes out along the agent's arc, the answer comes back, the toast resolves.
    function tick() {
      const { k, ev } = feed.next();
      busy = ev.tile;
      const index = ARCS.findIndex((a) => a.tile === ev.tile);
      const out = send(index, false);
      at(out + 140, () => {
        const back = send(index, true);
        if (ev.kind === "mutual") at(Math.max(0, back - 700), () => feed.press(k));
        at(back - 60, () => {
          ping(ringRefs.current[ev.tile], tileRefs.current[ev.tile]);
          feed.done(k);
        });
      });
      at(3600, tick);
    }
    at(1500, tick);

    // Background traffic on the other arcs, fainter than the event's own packets.
    function ambient() {
      const options = ARCS.map((a, i) => (a.tile === busy ? -1 : i)).filter((i) => i >= 0);
      send(options[Math.floor(Math.random() * options.length)], Math.random() < 0.5, false);
      at(900 + Math.random() * 900, ambient);
    }
    at(700, ambient);

    const layers = packetLayers.current;
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      layers.forEach((l) => l?.replaceChildren());
    };
  }, [run, feed]);

  return (
    <div className="hero-d-stage">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/v4/orbit-glow.svg"
        alt=""
        width={1210}
        height={1210}
        className="hero-d-glow absolute top-[506px] left-[248px] max-w-none"
      />

      {ARCS.map((arc, i) => {
        const [left, top, w, h] = arc.box;
        const [iw, ih] = arc.inner;
        return (
          <div key={arc.src + i} className="absolute" style={{ left, top, width: w, height: h }}>
            <div
              className="absolute"
              style={{
                left: (w - iw) / 2,
                top: (h - ih) / 2,
                width: iw,
                height: ih,
                transform: `rotate(${arc.rot}deg)${arc.flip ? " scaleY(-1)" : ""}`,
              }}
            >
              <div className="absolute" style={{ left: arc.at[0], top: arc.at[1], width: arc.size[0], height: arc.size[1] }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={arc.src}
                  alt=""
                  width={arc.size[0]}
                  height={arc.size[1]}
                  className="hero-d-arc absolute inset-0 block max-w-none"
                />
                <ArcLine arc={arc} id={`hero-d-arc-${i}`} />
                <div
                  ref={(el) => {
                    packetLayers.current[i] = el;
                  }}
                  className="absolute inset-0"
                />
              </div>
            </div>
          </div>
        );
      })}

      {ORBIT_TILES.map((t) => (
        <div key={t.id} className="absolute flex w-[50.332px] flex-col items-center gap-2.5" style={{ left: t.x, top: t.y }}>
          <span className="hero-d-float block" style={{ "--float-delay": `${t.float}s` } as CSSProperties}>
            <span
              ref={(el) => {
                tileRefs.current[t.id] = el;
              }}
              className="hero-d-tile flex size-[50.332px] items-center justify-center overflow-hidden rounded-[8px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.src}
                alt=""
                width={t.size}
                height={t.size}
                draggable={false}
                className={`block max-w-none ${t.className ?? ""}`}
                style={{ width: t.size, height: t.size }}
              />
            </span>
          </span>
          <span className="relative block size-[24.207px]">
            <span
              ref={(el) => {
                ringRefs.current[t.id] = el;
              }}
              className="hero-d-ring absolute inset-0 rounded-full"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v4/orbit-dot.svg" alt="" width={24.207} height={24.207} className="block max-w-none" />
          </span>
        </div>
      ))}

      <ToastStack
        events={LEFT}
        front={sideFront("left", state.k)}
        phase={state.phase}
        slots={SLOTS_LEFT}
        side="left"
        className="top-[427px] left-[85px] h-[222px] w-[455px] max-lg:hidden"
        toast="lg"
        toastClass="w-[340px]"
      />
      <ToastStack
        events={RIGHT}
        front={sideFront("right", state.k)}
        phase={state.phase}
        slots={SLOTS_RIGHT}
        side="right"
        className="top-[423px] left-[1155px] h-[222px] w-[455px] max-lg:hidden"
        toast="lg"
        toastClass="w-[340px]"
      />
    </div>
  );
}

/**
 * The design blurs each arc progressively: sharp at its bright end (the agent's), soft towards the other. The exported
 * SVG (above) carries the soft part as one even blur; this draws the same path sharp, fading out early.
 */
function ArcLine({ arc, id }: { arc: Arc; id: string }) {
  const n = arc.d.match(/-?[\d.]+/g)!.map(Number);
  const [w, h] = arc.size;
  return (
    <svg
      aria-hidden
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      className="hero-d-arc absolute inset-0 block overflow-visible"
    >
      <defs>
        {/* Bright at the agent's end of the arc, whichever end of the path that is. */}
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1={arc.tileAtEnd ? n.at(-2) : n[0]}
          y1={arc.tileAtEnd ? n.at(-1) : n[1]}
          x2={arc.tileAtEnd ? n[0] : n.at(-2)}
          y2={arc.tileAtEnd ? n[1] : n.at(-1)}
        >
          <stop className="hero-d-arc-stop" />
          <stop className="hero-d-arc-stop" offset="0.35" stopOpacity="0.55" />
          <stop className="hero-d-arc-stop" offset="0.75" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={arc.d} stroke={`url(#${id})`} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

/* =====================================================================================================
 * Radar (Figma 160:947): rings and axes under a half-circle mask, a turning sweep with its glass wedge,
 * seven agents joined by routes, and three contacts that approve as the sweep passes them.
 * Coordinates are the radar frame's (its 1369×684.5 radar at 156,454), drawn 0.9× a little higher so the
 * whole radar sits inside this hero's height.
 * ===================================================================================================== */

const RADAR_ORIGIN: [number, number] = [156, 454];
/** The radar's centre inside its 1369 box, and the angle (clockwise from up) of the sweep's leading edge. */
const RADAR_CENTRE: [number, number] = [684.5, 686.5];
const SWEEP_LEAD = (Math.atan2(972.804 - 684.5, 684.5 - 63.6777) * 180) / Math.PI;
const SWEEP_PERIOD = 6400;

/** Clockwise angle from straight up, seen from the radar's centre, of a point on the frame. */
function radarAngle(x: number, y: number) {
  const dx = x - RADAR_ORIGIN[0] - RADAR_CENTRE[0];
  const dy = y - RADAR_ORIGIN[1] - RADAR_CENTRE[1];
  return mod((Math.atan2(dx, -dy) * 180) / Math.PI, 360);
}

type RadarTile = { id: TileId; x: number; y: number; src: string; size: number; className?: string };
const RADAR_TILES: RadarTile[] = [
  { id: "hermes", x: 642.86, y: 602.99, src: "/v4/agent-hermes.png", size: 31.615, className: "object-cover" },
  { id: "gemini", x: 815.69, y: 564, src: "/v4/agent-gemini.svg", size: 31.615 },
  {
    id: "openclaw",
    x: 797.78,
    y: 932.85,
    src: "/v4/agent-openclaw.png",
    size: 31.62,
    className: "rounded-[11.192px] object-contain",
  },
  { id: "opencode", x: 555.39, y: 906.5, src: "/v4/agent-opencode.svg", size: 39.793 },
  { id: "claude", x: 932.67, y: 601.94, src: "/v4/agent-claude.svg", size: 39.793 },
  { id: "codex", x: 693.45, y: 760.02, src: "/v4/agent-codex.svg", size: 39.793 },
  { id: "cursor", x: 421.55, y: 709.43, src: "/v4/agent-cursor.svg", size: 39.793 },
];

/** The routes between them, as placed in the design (box, rotated inner box, SVG inset). */
type Route = {
  src: string;
  box: [number, number, number, number];
  inner?: [number, number];
  transform?: string;
  at: [number, number, number, number];
  lit?: boolean;
};
const RADAR_ROUTES: Route[] = [
  { src: "/v4/radar-route-142.svg", box: [605.98, 931.79, 191.8, 26.873], at: [0, -0.527, 191.8, 27.927] },
  { src: "/v4/radar-route-149.svg", box: [605.98, 931.79, 191.8, 26.873], at: [0, -0.527, 191.8, 27.927], lit: true },
  {
    src: "/v4/radar-route-143.svg",
    box: [823.07, 652, 133.312, 280.85],
    inner: [280.85, 133.312],
    transform: "rotate(90deg)",
    at: [0, -0.527, 280.85, 134.366],
  },
  { src: "/v4/radar-route-146.svg", box: [471.61, 734.2, 221.308, 51.639], at: [0, -0.527, 221.308, 52.693] },
  {
    src: "/v4/radar-route-144.svg",
    box: [668.15, 652, 154.915, 280.85],
    inner: [280.85, 154.915],
    transform: "rotate(90deg) scaleY(-1)",
    at: [0, -0.527, 280.85, 155.969],
  },
  {
    src: "/v4/radar-route-147.svg",
    box: [446.85, 756.85, 110.127, 175.465],
    inner: [175.465, 110.127],
    transform: "rotate(90deg)",
    at: [0, 0, 175.992, 110.654],
  },
  {
    src: "/v4/radar-route-148.svg",
    box: [823.07, 613, 17.915, 319.842],
    inner: [319.842, 17.915],
    transform: "rotate(90deg) scaleY(-1)",
    at: [0, -0.527, 319.842, 18.969],
  },
  {
    src: "/v4/radar-route-145.svg",
    box: [668.15, 652, 154.915, 280.85],
    inner: [280.85, 154.915],
    transform: "rotate(90deg) scaleY(-1)",
    at: [0, -0.527, 280.85, 155.969],
    lit: true,
  },
];

/** Contacts: real data agents in three categories (src/lib/agents.ts). Each approves when the sweep reaches it. */
const RADAR_CHIPS = [
  { x: 300, y: 812, label: "Finance", hosts: ["coingecko-markets-simple", "ecb-exchange-rates", "sec-edgar-tickers"] },
  { x: 722.95, y: 678.87, label: "Transit", hosts: ["bvg-berlin-departures", "mbta-routes", "swiss-transport-connections"] },
  { x: 575, y: 990, label: "Weather", hosts: ["open-meteo-forecast", "open-meteo-air-quality", "sunrise-sunset"] },
];
const CHIP_ANGLES = RADAR_CHIPS.map((c) => radarAngle(c.x + 70, c.y + 20));
const TILE_ANGLES = RADAR_TILES.map((t) => radarAngle(t.x + 25.17, t.y + 25.17));

function RadarScene({ run, feed }: { run: boolean; feed: Feed }) {
  const sweepRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ringRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const elapsed = useRef(0);
  // The design's state: the first contact approved, the other two still waiting.
  const [chips, setChips] = useState(() => RADAR_CHIPS.map((_, i) => ({ n: 0, done: i === 0 })));

  useEffect(() => {
    const sweep = sweepRef.current;
    const glass = glassRef.current;
    if (!run || !sweep || !glass) return;
    let alive = true;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(() => alive && fn(), ms));

    const turn = [{ rotate: "0deg" }, { rotate: "360deg" }];
    const timing = { duration: SWEEP_PERIOD, iterations: Infinity };
    const anims = [sweep.animate(turn, timing), glass.animate(turn, timing)];
    anims.forEach((a) => (a.currentTime = elapsed.current));
    const angle = () => mod(SWEEP_LEAD + ((Number(anims[0].currentTime) || 0) / SWEEP_PERIOD) * 360, 360);
    const crossed = (from: number, to: number, a: number) => (from <= to ? a > from && a <= to : a > from || a <= to);

    at(0, feed.settle);
    let last = angle();
    const poll = window.setInterval(() => {
      const now = angle();
      TILE_ANGLES.forEach((a, i) => {
        if (crossed(last, now, a)) ping(ringRefs.current[i], tileRefs.current[i], 1.5);
      });
      CHIP_ANGLES.forEach((a, i) => {
        if (!crossed(last, now, a)) return;
        // Picked up: the handshake goes through, then a new contact shows up before the sweep comes back.
        const { k } = feed.next();
        at(380, () => feed.done(k));
        setChips((c) => c.map((chip, j) => (j === i ? { ...chip, done: true } : chip)));
        at(SWEEP_PERIOD * 0.55, () =>
          setChips((c) => c.map((chip, j) => (j === i ? { n: chip.n + 1, done: false } : chip))),
        );
      });
      last = now;
    }, 40);

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      window.clearInterval(poll);
      elapsed.current = Number(anims[0].currentTime) || 0;
      anims.forEach((a) => a.cancel());
    };
  }, [run, feed]);

  const [ox, oy] = RADAR_ORIGIN;
  return (
    <div className="hero-d-stage">
      <div className="hero-d-radar absolute inset-0">
        <div className="absolute" style={{ left: ox, top: oy, width: 1369, height: 684.5 }}>
          {/* Rings, axes and the sweep, faded out towards the horizon by the design's mask. */}
          <div className="hero-d-radar-mask absolute inset-0">
            <RadarImg src="/v4/radar-ring-outer.svg" x={0} y={2} w={1369} h={1369} />
            <RadarImg src="/v4/radar-ring-glint.svg" x={0} y={2} w={1369} h={1369} />
            <RadarImg src="/v4/radar-ring-dashed-lg.png" x={132} y={134} w={1105} h={1105} className="opacity-40" />
            <RadarImg src="/v4/radar-ring-dashed-md.png" x={397} y={398} w={576} h={576} className="opacity-40" />
            <RadarImg src="/v4/radar-ring-inner.svg" x={529} y={530} w={312} h={312} />
            <RadarImg src="/v4/radar-axis.svg" x={684.5} y={2} w={1} h={1369} />
            <RadarImg src="/v4/radar-axis.svg" x={684.5} y={2} w={1} h={1369} rotate={45} />
            <RadarImg src="/v4/radar-axis.svg" x={684.5} y={2} w={1} h={1369} rotate={-45} />
            <div ref={sweepRef} className="absolute origin-center" style={{ left: 0, top: 2, width: 1369, height: 1369 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v4/radar-sweep.svg" alt="" width={1369} height={1369} className="block max-w-none" />
            </div>
          </div>
          {/* The frosted wedge that trails the sweep (a background blur in the design), clipped at the horizon. */}
          <div className="absolute inset-x-0 top-0 h-[686.5px] overflow-hidden">
            <div
              ref={glassRef}
              className="hero-d-glass absolute"
              style={{ left: 200.72, top: 2, width: 772.081, height: 684.501, transformOrigin: "483.776px 684.501px" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v4/radar-sweep-glass.svg" alt="" width={772.081} height={684.501} className="block max-w-none" />
            </div>
          </div>
        </div>

        {RADAR_ROUTES.map((r, i) => (
          <RouteImg key={i} route={r} />
        ))}

        {RADAR_TILES.map((t, i) => (
          <span key={t.id} className="absolute size-[50.332px]" style={{ left: t.x, top: t.y }}>
            <span
              ref={(el) => {
                ringRefs.current[i] = el;
              }}
              className="hero-d-ring absolute -inset-[3px] rounded-[3px]"
            />
            <span
              ref={(el) => {
                tileRefs.current[i] = el;
              }}
              className="hero-d-tile hero-d-radar-tile absolute inset-0 flex items-center justify-center overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.src}
                alt=""
                width={t.size}
                height={t.size}
                draggable={false}
                className={`block max-w-none ${t.className ?? ""}`}
                style={{ width: t.size, height: t.size }}
              />
            </span>
          </span>
        ))}

        {RADAR_CHIPS.map((c, i) => {
          const host = c.hosts[chips[i].n % c.hosts.length];
          return (
            <div key={c.label} className="absolute" style={{ left: c.x, top: c.y }}>
              <SceneCard key={host} host={host} done={chips[i].done} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RadarImg({
  src,
  x,
  y,
  w,
  h,
  rotate,
  className = "",
}: {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={w}
      height={h}
      className={`absolute block max-w-none ${className}`}
      style={{ left: x, top: y, width: w, height: h, rotate: rotate ? `${rotate}deg` : undefined }}
    />
  );
}

function RouteImg({ route }: { route: Route }) {
  const [left, top, w, h] = route.box;
  const [ax, ay, aw, ah] = route.at;
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={route.src}
      alt=""
      width={aw}
      height={ah}
      className={`absolute block max-w-none ${route.lit ? "hero-d-lit" : ""}`}
      style={{ left: ax, top: ay, width: aw, height: ah }}
    />
  );
  if (!route.inner) return <div className="absolute" style={{ left, top, width: w, height: h }}>{img}</div>;
  const [iw, ih] = route.inner;
  return (
    <div className="absolute" style={{ left, top, width: w, height: h }}>
      <div
        className="absolute"
        style={{ left: (w - iw) / 2, top: (h - ih) / 2, width: iw, height: ih, transform: route.transform }}
      >
        {img}
      </div>
    </div>
  );
}

/**
 * A data agent approving in a scene (the radar's contacts, the chips on the routes): Orbit's approval card, drawn at
 * the size Orbit's stacks show it however the scene itself is scaled (see .hero-d-scard). A new agent pops in.
 */
function SceneCard({ host, done }: { host: string; done: boolean }) {
  return (
    <ApprovalCard
      auto
      title={host}
      ask={COPY.auto.wait}
      done={COPY.auto.done}
      state={done ? "done" : "wait"}
      size="lg"
      className="hero-d-scard w-max min-w-[272px]"
    />
  );
}

/* =====================================================================================================
 * Routes (Figma 166:3261): agents in framed tiles joined by rounded right-angle tunnels on a dotted grid,
 * two approval chips on the lines and a toast stack on the right. Packets run the tunnels.
 * Coordinates are the design's (its 1200×510 container at 241,466), 22px lower to keep the same gap
 * under the buttons as there.
 * ===================================================================================================== */

type RoutesTile = { id: TileId; name: string; x: number; y: number; src: string; className?: string; pad: number };
const ROUTES_TILES: RoutesTile[] = [
  { id: "claude", name: "Claude Code", x: 248.1, y: 103.44, src: "/v4/routes-claude.svg", pad: 8 },
  { id: "codex", name: "Codex", x: 549, y: 59, src: "/v4/routes-codex.svg", pad: 9 },
  {
    id: "openclaw",
    name: "OpenClaw",
    x: 790.4,
    y: 124.68,
    src: "/v4/agent-openclaw.png",
    className: "rounded-[10.62px] object-contain",
    pad: 9,
  },
  { id: "cursor", name: "Cursor", x: 74, y: 289.88, src: "/v4/routes-cursor.svg", pad: 9 },
  {
    id: "hermes",
    name: "Hermes",
    x: 560.8,
    y: 298.92,
    src: "/v4/stamp-hermes.png",
    className: "rounded-[10.62px] object-contain",
    pad: 9,
  },
  { id: "gemini", name: "Gemini", x: 990.72, y: 263.92, src: "/v4/routes-gemini.svg", pad: 9 },
  { id: "opencode", name: "OpenCode", x: 298.25, y: 354.24, src: "/v4/routes-opencode.svg", pad: 9 },
];

/** The tunnels: where each line sits, its path (start → end), and the agents at either end. */
type Tunnel = {
  src: string;
  box: [number, number, number, number];
  d: string;
  length: number;
  from: TileId;
  to: TileId;
  extra?: string;
};
const TUNNELS: Tunnel[] = [
  {
    src: "/v4/routes-line-380.svg",
    box: [118.5, 145, 130, 145.5],
    d: "M130 0.5H20.5C9.45431 0.5 0.5 9.45431 0.5 20.5V145.5",
    length: 250,
    from: "claude",
    to: "cursor",
  },
  {
    src: "/v4/routes-line-352.svg",
    box: [163, 333.5, 135, 67],
    d: "M0 0.5H48.5C59.5457 0.5 68.5 9.45431 68.5 20.5V46.5C68.5 57.5457 77.4543 66.5 88.5 66.5H135",
    length: 196,
    from: "cursor",
    to: "opencode",
  },
  {
    src: "/v4/routes-line-385.svg",
    box: [342.5, 103, 207, 252],
    d: "M0.5 252V191.5C0.5 180.454 9.45431 171.5 20.5 171.5H80.5C91.5457 171.5 100.5 162.546 100.5 151.5V20.5C100.5 9.4543 109.454 0.5 120.5 0.5H207",
    length: 440,
    from: "opencode",
    to: "codex",
  },
  {
    src: "/v4/routes-line-392.svg",
    box: [336.5, 145, 7, 210.5],
    d: "M6.49993 210.5L6.5 7C6.5 3.41015 3.58985 0.5 0 0.5",
    length: 213,
    from: "opencode",
    to: "claude",
  },
  {
    src: "/v4/routes-line-358.svg",
    box: [387, 341.5, 174.5, 60],
    d: "M0 59.5H99.5C110.546 59.5 119.5 50.5457 119.5 39.5V20.5C119.5 9.45431 128.454 0.5 139.5 0.5H174.5",
    length: 224,
    from: "opencode",
    to: "hermes",
  },
  {
    src: "/v4/routes-line-401.svg",
    box: [637, 102.49, 88.5, 244],
    d: "M0 0.5H68C79.0457 0.5 88 9.4543 88 20.5V223.5C88 234.546 79.0457 243.5 68 243.5H0",
    length: 360,
    from: "codex",
    to: "hermes",
  },
  {
    src: "/v4/routes-line-403.svg",
    box: [650, 170.01, 141, 176.5],
    d: "M0 176H55.5C66.5457 176 75.5 167.046 75.5 156V20.5C75.5 9.4543 84.4543 0.5 95.5 0.5H141",
    length: 310,
    from: "hermes",
    to: "openclaw",
  },
  {
    src: "/v4/routes-line-399.svg",
    box: [879, 170.51, 114, 146],
    d: "M114 145.5H60.5C49.4543 145.5 40.5 136.546 40.5 125.5V20.5C40.5 9.45431 31.5457 0.5 20.5 0.5H0",
    length: 250,
    from: "gemini",
    to: "openclaw",
    extra: "/v4/routes-line-405.svg",
  },
];

/** The right-hand stack (Figma 180:445): four in a straight column, front one in the middle. */
const SLOTS_ROUTES: Slot[] = [
  { x: 5, y: -136, o: 0, z: 0 },
  { x: 5, y: -64, o: 0.2, z: 1 },
  { x: 5, y: 8, o: 0.4, z: 2 },
  { x: 5, y: 80, o: 1, z: 4 },
  { x: 5, y: 152, o: 0.2, z: 3 },
  { x: 5, y: 224, o: 0, z: 0 },
];

function RoutesScene({ run, feed, state }: { run: boolean; feed: Feed; state: FeedState }) {
  const packetLayers = useRef<(HTMLDivElement | null)[]>([]);
  const tileRefs = useRef<Partial<Record<TileId, HTMLSpanElement | null>>>({});
  const ringRefs = useRef<Partial<Record<TileId, HTMLSpanElement | null>>>({});
  // The two chips on the lines show the latest data agents approved on each side of the graph.
  const [chips, setChips] = useState(["open-meteo-forecast", "coingecko-markets-simple"]);
  const nextChip = useRef(0);

  useEffect(() => {
    if (!run) return;
    let alive = true;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(() => alive && fn(), ms));

    function travel(index: number, towards: TileId | null, strong = true) {
      const t = TUNNELS[index];
      const forward = towards ? t.to === towards : Math.random() < 0.5;
      return sendPacket(packetLayers.current[index], t.d, forward ? "0%" : "100%", forward ? "100%" : "0%", {
        length: t.length,
        strong,
      });
    }

    at(0, feed.settle);

    // Each event: a packet runs one of the agent's tunnels to it, then the toast resolves.
    function tick() {
      const { k, ev } = feed.next();
      const options = TUNNELS.map((t, i) => (t.from === ev.tile || t.to === ev.tile ? i : -1)).filter((i) => i >= 0);
      const index = options[Math.floor(Math.random() * options.length)];
      const time = travel(index, ev.tile);
      if (ev.kind === "mutual") at(Math.max(0, time - 600), () => feed.press(k));
      at(time - 60, () => {
        ping(ringRefs.current[ev.tile], tileRefs.current[ev.tile], 1.25);
        feed.done(k);
        if (ev.kind === "auto") {
          // Newest approval replaces the older of the two chips.
          const chip = nextChip.current;
          nextChip.current = 1 - chip;
          setChips((c) => (c.includes(ev.host) ? c : c.map((h, i) => (i === chip ? ev.host : h))));
        }
      });
      at(3400, tick);
    }
    at(1200, tick);

    function ambient() {
      travel(Math.floor(Math.random() * TUNNELS.length), null, false);
      at(700 + Math.random() * 700, ambient);
    }
    at(400, ambient);

    const layers = packetLayers.current;
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      layers.forEach((l) => l?.replaceChildren());
    };
  }, [run, feed]);

  return (
    <div className="hero-d-stage">
      <div className="hero-d-routes absolute inset-0">
        {/* Dotted ground: the design's radial glow seen through a dot grid. */}
        <div className="hero-d-dots absolute top-[429px] left-[263px] h-[655px] w-[1126px] opacity-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v4/routes-glow.svg" alt="" width={1126} height={655} className="block size-full max-w-none" />
        </div>

        <div className="absolute top-[466px] left-[241px] h-[510px] w-[1200px] overflow-clip">
          {TUNNELS.map((t, i) => {
            const [left, top, w, h] = t.box;
            return (
              <div key={t.src} className="absolute" style={{ left, top, width: w, height: h }}>
                {t.extra && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.extra} alt="" width={w} height={h} className="absolute inset-0 block max-w-none" />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.src} alt="" width={w} height={h} className="absolute inset-0 block max-w-none" />
                <div
                  ref={(el) => {
                    packetLayers.current[i] = el;
                  }}
                  className="absolute inset-0"
                />
              </div>
            );
          })}

          {ROUTES_TILES.map((t) => (
            <div key={t.id} className="absolute flex flex-col items-center" style={{ left: t.x, top: t.y }}>
              <span className="hero-d-float relative block" style={{ "--float-delay": `${-t.x / 300}s` } as CSSProperties}>
                <span
                  ref={(el) => {
                    ringRefs.current[t.id] = el;
                  }}
                  className="hero-d-ring absolute inset-0 rounded-[16px]"
                />
                <span
                  ref={(el) => {
                    tileRefs.current[t.id] = el;
                  }}
                  className="hero-d-frame flex items-center rounded-[16px]"
                  style={{ padding: t.pad }}
                >
                  <span className="hero-d-tile hero-d-routes-tile flex size-[70.8px] items-center justify-center rounded-[8px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.src}
                      alt=""
                      width={37.76}
                      height={37.76}
                      draggable={false}
                      className={`block size-[37.76px] max-w-none ${t.className ?? ""}`}
                    />
                  </span>
                </span>
              </span>
              <span className="hero-d-label pt-[9.44px] leading-[1.2] font-medium whitespace-nowrap text-white">{t.name}</span>
            </div>
          ))}

          <div className="absolute top-[195px] left-[377px]">
            <SceneCard key={chips[0]} host={chips[0]} done />
          </div>
          {/* Top left, above the line into Claude Code (the phone crop cuts this corner off). */}
          <div className="absolute top-[18px] left-[26px] max-lg:hidden">
            <SceneCard key={chips[1]} host={chips[1]} done />
          </div>
        </div>

        <ToastStack
          events={ALL}
          front={{ c: state.k, current: true }}
          phase={state.phase}
          slots={SLOTS_ROUTES}
          side="right"
          mask="routes"
          className="top-[501px] left-[1268px] h-[224px] w-[350px] max-lg:hidden"
          toast="lg"
          toastClass="w-[340px]"
        />
      </div>
    </div>
  );
}

/* =====================================================================================================
 * Flights: variant A's hero network (src/components/home/hero-network.tsx) flown over the sky. Agents
 * (white tiles over their ring) and data agents (glass chips) are airports; links are curved flight
 * routes, dotted until a connection is approved, then solid and glowing; planes fly the lit routes.
 * Same layouts (a wide one, a compact one for phones), same connection script.
 * ===================================================================================================== */

type FNode = { id: string; label: string; logo?: string; size?: number; className?: string; host?: string };

const F_NODES: FNode[] = [
  { id: "claude", label: "Claude Code", logo: "/v4/agent-claude.svg", size: 39.793 },
  { id: "codex", label: "Codex", logo: "/v4/agent-codex.svg", size: 39.793 },
  { id: "openclaw", label: "OpenClaw", logo: "/v4/agent-openclaw.png", size: 31.62, className: "rounded-[11.192px] object-contain" },
  { id: "cursor", label: "Cursor", logo: "/v4/agent-cursor.svg", size: 39.793 },
  { id: "hermes", label: "Hermes", logo: "/v4/agent-hermes.png", size: 31.615, className: "object-cover" },
  { id: "gemini", label: "Gemini", logo: "/v4/agent-gemini.svg", size: 31.615 },
  { id: "opencode", label: "OpenCode", logo: "/v4/agent-opencode.svg", size: 39.793 },
  { id: "meteo", label: "Weather", host: "open-meteo-forecast" },
  { id: "quakes", label: "News", host: "usgs-earthquakes" },
  { id: "coins", label: "Finance", host: "coingecko-markets-simple" },
  { id: "iss", label: "Space", host: "iss-position" },
  { id: "transit", label: "Transit", host: "bvg-berlin-departures" },
];
const F_BY_ID = Object.fromEntries(F_NODES.map((n) => [n.id, n]));

type Episode = { from: string; to: string; auto: boolean };
type FLayout = {
  w: number;
  h: number;
  pos: Record<string, [number, number]>;
  edges: [string, string][];
  episodes: Episode[];
  start: string[];
  /** Where the canvas sits on the 1680×1050 stage, and its scale there. */
  at: [number, number];
  scale: number;
};

const edgeKey = (a: string, b: string) => [a, b].sort().join("~");

const F_WIDE: FLayout = {
  w: 1200,
  h: 460,
  pos: {
    claude: [352, 132],
    codex: [600, 74],
    openclaw: [838, 150],
    cursor: [150, 290],
    hermes: [610, 318],
    gemini: [1062, 268],
    opencode: [388, 392],
    meteo: [128, 120],
    quakes: [1052, 98],
    coins: [842, 392],
    iss: [1098, 410],
    transit: [120, 420],
  },
  edges: [
    ["claude", "codex"],
    ["codex", "openclaw"],
    ["claude", "meteo"],
    ["claude", "hermes"],
    ["claude", "cursor"],
    ["cursor", "meteo"],
    ["cursor", "transit"],
    ["cursor", "opencode"],
    ["opencode", "hermes"],
    ["hermes", "openclaw"],
    ["hermes", "coins"],
    ["openclaw", "quakes"],
    ["openclaw", "gemini"],
    ["gemini", "quakes"],
    ["gemini", "iss"],
    ["gemini", "coins"],
    ["opencode", "transit"],
  ],
  // The order connections get made in. Data agents approve their handshakes automatically.
  episodes: [
    { from: "openclaw", to: "hermes", auto: false },
    { from: "claude", to: "meteo", auto: true },
    { from: "codex", to: "claude", auto: false },
    { from: "gemini", to: "iss", auto: true },
    { from: "cursor", to: "opencode", auto: false },
    { from: "hermes", to: "coins", auto: true },
    { from: "claude", to: "hermes", auto: false },
    { from: "openclaw", to: "quakes", auto: true },
    { from: "gemini", to: "openclaw", auto: false },
    { from: "cursor", to: "transit", auto: true },
  ],
  start: [edgeKey("claude", "codex"), edgeKey("cursor", "meteo"), edgeKey("gemini", "coins")],
  at: [240, 512],
  scale: 1,
};

const F_COMPACT: FLayout = {
  w: 480,
  h: 480,
  pos: {
    codex: [250, 64],
    claude: [84, 150],
    openclaw: [398, 168],
    meteo: [150, 270],
    gemini: [392, 300],
    hermes: [214, 372],
    coins: [300, 452],
  },
  edges: [
    ["claude", "codex"],
    ["codex", "openclaw"],
    ["claude", "meteo"],
    ["claude", "hermes"],
    ["meteo", "hermes"],
    ["hermes", "openclaw"],
    ["openclaw", "gemini"],
    ["gemini", "coins"],
    ["hermes", "coins"],
  ],
  episodes: [
    { from: "openclaw", to: "hermes", auto: false },
    { from: "claude", to: "meteo", auto: true },
    { from: "codex", to: "openclaw", auto: false },
    { from: "hermes", to: "coins", auto: true },
    { from: "claude", to: "hermes", auto: false },
  ],
  start: [edgeKey("claude", "codex"), edgeKey("gemini", "coins")],
  at: [576, 506],
  scale: 1.1,
};

const MAX_LIVE = 6;
const ASK_MS = { auto: 1100, mutual: 1700 };

/** Toast copy for a connection, as in variant A. */
function flightCopy(ep: Episode) {
  const from = F_BY_ID[ep.from];
  const to = F_BY_ID[ep.to];
  return ep.auto
    ? { title: to.host!, ask: `Handshake from ${from.label}`, done: "Approved automatically" }
    : { title: from.label, ask: `Wants to reach ${to.label}`, done: "Trusted, both sides approved" };
}
/** The same connections as feed events, for the stack phones show above the scene. */
const FLIGHT_EVENTS: Ev[] = F_COMPACT.episodes.map((ep) => {
  const c = flightCopy(ep);
  return { host: c.title, kind: ep.auto ? "auto" : "mutual", tile: ep.from as TileId, wait: c.ask, done: c.done };
});

/** A gentle arc between two airports, always bowing upwards like a great-circle route on a map. */
function flightPath([ax, ay]: [number, number], [bx, by]: [number, number]) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const bend = Math.min(90, len * 0.24);
  const cx = (ax + bx) / 2 + nx * bend;
  const cy = (ay + by) / 2 + ny * bend;
  return `M ${ax} ${ay} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${bx} ${by}`;
}

/** The site's airliner (the CTA's and the footer's), top down, nose to the right; offset-rotate turns it along the route. */
const PLANE_IMG = '<img src="/v4/plane-small.webp" alt="" width="192" height="212" draggable="false">';

type FToast = { id: number; ep: Episode; phase: "ask" | "press" | "ok" | "out" };

function FlightsScene({ run, still, feed }: { run: boolean; still: boolean; feed: Feed }) {
  const compact = useCompact();
  const layout = compact ? F_COMPACT : F_WIDE;
  const [live, setLive] = useState<string[]>(layout.start);
  const [toast, setToast] = useState<FToast | null>(null);
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const planeLayer = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const ringRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  // Switching layouts starts the lit routes over.
  const [shown, setShown] = useState(layout);
  if (shown !== layout) {
    setShown(layout);
    setLive(layout.start);
    setToast(null);
  }

  const paths = useMemo(
    () => layout.edges.map(([a, b]) => ({ key: edgeKey(a, b), d: flightPath(layout.pos[a], layout.pos[b]) })),
    [layout],
  );

  // The connection script: ask → approve → the route lights up → next.
  useEffect(() => {
    if (!run) return;
    let alive = true;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(() => alive && fn(), ms));
    at(0, feed.settle);

    function step() {
      const { k } = feed.next();
      const ep = layout.episodes[mod(k, layout.episodes.length)];
      setToast({ id: k, ep, phase: "ask" });
      const ask = ep.auto ? ASK_MS.auto : ASK_MS.mutual;
      if (!ep.auto)
        at(ask - 280, () => {
          feed.press(k);
          setToast((t) => (t?.id === k ? { ...t, phase: "press" } : t));
        });
      at(ask, () => {
        setToast((t) => (t?.id === k ? { ...t, phase: "ok" } : t));
        feed.done(k);
      });
      at(ask + 350, () => {
        const key = edgeKey(ep.from, ep.to);
        setLive((l) => [...l.filter((x) => x !== key), key].slice(-MAX_LIVE));
        ping(ringRefs.current[ep.to], tileRefs.current[ep.to]);
      });
      at(ask + 1900, () => setToast((t) => (t?.id === k ? { ...t, phase: "out" } : t)));
      at(ask + 2500, step);
    }
    at(700, step);
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [run, layout, feed]);

  const liveRef = useRef(live);
  useEffect(() => {
    liveRef.current = live;
  }, [live]);

  // Planes fly the lit routes, both ways.
  useEffect(() => {
    const layer = planeLayer.current;
    if (!layer || !run) return;
    let alive = true;
    const timers: number[] = [];

    function fly(key: string) {
      const path = pathRefs.current[key];
      if (!alive || !path || !layer) return;
      const el = document.createElement("span");
      el.className = "hero-d-plane";
      el.innerHTML = PLANE_IMG;
      el.style.offsetPath = `path("${path.getAttribute("d")}")`;
      // Flying a route from its far end: turn the plane round so it still flies nose first.
      const back = Math.random() < 0.5;
      el.style.offsetRotate = back ? "reverse" : "auto";
      layer.appendChild(el);
      const anim = el.animate(
        [
          { offsetDistance: back ? "100%" : "0%", opacity: 0 },
          { opacity: 1, offset: 0.14 },
          { opacity: 1, offset: 0.86 },
          { offsetDistance: back ? "0%" : "100%", opacity: 0 },
        ],
        { duration: 1100 + path.getTotalLength() * 3.4, easing: "cubic-bezier(0.45, 0, 0.25, 1)" },
      );
      anim.onfinish = () => el.remove();
    }

    function loop() {
      if (!alive) return;
      const keys = liveRef.current;
      if (keys.length) fly(keys[Math.floor(Math.random() * keys.length)]);
      timers.push(window.setTimeout(loop, 520 + Math.random() * 620));
    }
    loop();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      layer.replaceChildren();
    };
  }, [run, layout]);

  const { w: W, h: H } = layout;
  const shownToast = toast ?? (still ? { id: 0, ep: layout.episodes[0], phase: "ok" as const } : null);

  return (
    <div className="hero-d-stage">
      <div
        className="absolute origin-top-left"
        style={{ left: layout.at[0], top: layout.at[1], width: W, height: H, scale: layout.scale }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" fill="none">
          <defs>
            <filter id="hero-d-route-glow" filterUnits="userSpaceOnUse" x={-60} y={-160} width={W + 120} height={H + 220}>
              <feGaussianBlur stdDeviation="2.6" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {paths.map(({ key, d }) => {
            const lit = live.includes(key);
            return (
              <g key={key}>
                <path
                  ref={(el) => {
                    pathRefs.current[key] = el;
                  }}
                  d={d}
                  className="hero-d-fdash"
                  strokeWidth={1.3}
                  strokeDasharray="1.5 6"
                  strokeLinecap="round"
                />
                <path
                  d={d}
                  pathLength={1}
                  filter="url(#hero-d-route-glow)"
                  className="hero-d-froute"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  style={{ strokeDasharray: 1, strokeDashoffset: lit ? 0 : 1, opacity: lit ? 1 : 0 }}
                />
              </g>
            );
          })}
        </svg>

        <div ref={planeLayer} className="absolute inset-0" />

        {F_NODES.filter((n) => layout.pos[n.id]).map((n) => {
          const [x, y] = layout.pos[n.id];
          if (n.host) {
            return (
              <div
                key={n.id}
                className="hero-d-fchip absolute flex w-max -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-[12px] py-2 pr-4 pl-2"
                style={{ left: x, top: y }}
              >
                <span className="hero-d-fchip-dot grid size-8 place-items-center rounded-[8px]">
                  <span className="size-[7px] rounded-[2px] bg-(--sky-fill)" />
                </span>
                <span className="flex flex-col text-left leading-tight">
                  <span className="hero-d-ink font-mono text-[13.5px] font-semibold tracking-[-0.02em]">{n.host}</span>
                  <span className="hero-d-chip-label text-[12px]">{n.label}</span>
                </span>
              </div>
            );
          }
          return (
            <div
              key={n.id}
              className="absolute flex w-[50.332px] -translate-x-1/2 flex-col items-center gap-2.5"
              style={{ left: x, top: y - 72.4 }}
            >
              <span className="hero-d-float block" style={{ "--float-delay": `${-x / 260}s` } as CSSProperties}>
                <span
                  ref={(el) => {
                    tileRefs.current[n.id] = el;
                  }}
                  className="hero-d-tile flex size-[50.332px] items-center justify-center overflow-hidden rounded-[8px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={n.logo}
                    alt=""
                    width={n.size}
                    height={n.size}
                    draggable={false}
                    className={`block max-w-none ${n.className ?? ""}`}
                    style={{ width: n.size, height: n.size }}
                  />
                </span>
              </span>
              <span className="relative block size-[24.207px]">
                <span
                  ref={(el) => {
                    ringRefs.current[n.id] = el;
                  }}
                  className="hero-d-ring absolute inset-0 rounded-full"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/v4/orbit-dot.svg" alt="" width={24.207} height={24.207} className="block max-w-none" />
              </span>
            </div>
          );
        })}

        {/* Phones get these in the stack above the scene instead. */}
        {shownToast && (
          <FlightToast key={shownToast.id} toast={shownToast} layout={layout} className="max-lg:hidden" />
        )}
      </div>
    </div>
  );
}

function FlightToast({ toast, layout, className }: { toast: FToast; layout: FLayout; className: string }) {
  const { ep, phase } = toast;
  const asker = F_BY_ID[ep.from];
  const target = F_BY_ID[ep.to];
  const copy = flightCopy(ep);
  const [tx, ty] = layout.pos[ep.to];
  // Above the airport being asked; below it near the top edge. Kept inside the canvas.
  const below = ty < 150;
  const style = {
    left: Math.min(layout.w - 180, Math.max(180, tx)),
    top: below ? ty + (target.host ? 34 : 22) : ty - (target.host ? 34 : 84),
  } as CSSProperties;

  return (
    <div
      className={`pointer-events-none absolute z-10 w-max -translate-x-1/2 ${below ? "" : "-translate-y-full"} ${className}`}
      style={style}
    >
      <div className={`hero-d-ftoast ${below ? "origin-top" : "origin-bottom"}`} data-phase={phase}>
        <ApprovalCard
          auto={ep.auto}
          icon={ep.auto ? undefined : { logo: asker.logo!, className: asker.className }}
          title={copy.title}
          ask={copy.ask}
          done={copy.done}
          state={phase === "ask" ? "wait" : phase === "press" ? "press" : "done"}
          size="lg"
          className="w-[340px]"
        />
      </div>
    </div>
  );
}

/* =====================================================================================================
 * Toasts
 * ===================================================================================================== */

function ToastStack({
  events,
  front,
  phase,
  slots,
  side,
  mask = "orbit",
  className,
  toast,
  toastClass,
}: {
  events: Ev[];
  front: { c: number; current: boolean };
  phase: Phase;
  slots: Slot[];
  side?: "left" | "right";
  mask?: "orbit" | "routes";
  className: string;
  toast: "lg" | "sm";
  toastClass: string;
}) {
  const { c, current } = front;
  // Slot 3 is the front. Render from the one leaving at the back to the one queued below.
  const items = [-3, -2, -1, 0, 1, 2].map((offset) => c + offset);

  return (
    <div aria-hidden data-side={side} data-mask={mask} className={`hero-d-stack absolute ${className}`}>
      {items.map((index, slot) => {
        const pos = slots[slot];
        const ev = events[mod(index, events.length)];
        const state: Phase = index < c ? "done" : index > c ? "wait" : current ? phase : "done";
        return (
          <div
            key={index}
            className="hero-d-slot"
            style={{ "--x": `${pos.x}px`, "--y": `${pos.y}px`, "--o": pos.o, zIndex: pos.z } as CSSProperties}
          >
            <Toast ev={ev} state={state} size={toast} className={toastClass} />
          </div>
        );
      })}
    </div>
  );
}

/** The agents' names and logos, for the approval cards. */
const AGENT_META: Record<TileId, { label: string; logo: string; className?: string }> = {
  cursor: { label: "Cursor", logo: "/v4/agent-cursor.svg" },
  hermes: { label: "Hermes", logo: "/v4/agent-hermes.png", className: "rounded-[4px] object-cover" },
  openclaw: { label: "OpenClaw", logo: "/v4/agent-openclaw.png", className: "object-contain" },
  claude: { label: "Claude Code", logo: "/v4/agent-claude.svg" },
  gemini: { label: "Gemini", logo: "/v4/agent-gemini.svg" },
  codex: { label: "Codex", logo: "/v4/agent-codex.svg" },
  opencode: { label: "OpenCode", logo: "/v4/agent-opencode.svg" },
};

/** A feed event as an approval card, for the stacks (Orbit's sides, Routes' column, the phone stack). */
function Toast({ ev, state, size, className }: { ev: Ev; state: Phase; size: "lg" | "sm"; className: string }) {
  const auto = ev.kind === "auto";
  const agent = AGENT_META[ev.tile];
  return (
    <ApprovalCard
      auto={auto}
      icon={auto ? undefined : agent}
      title={auto ? ev.host : (agent?.label ?? ev.host)}
      ask={ev.wait ?? COPY[ev.kind].wait}
      done={ev.done ?? COPY[ev.kind].done}
      state={state}
      size={size === "lg" ? "lg" : "md"}
      className={className}
    />
  );
}

/*
 * The approval card (first drawn for Flights, now every view's): who's asking, what they want, and the answer.
 * An agent's request shows its logo and Reject / Approve (Approve is pressed just before it flips); a data
 * agent approves on its own, so it shows a spinner. Both settle on the green check.
 */
function ApprovalCard({
  auto,
  icon,
  title,
  ask,
  done: doneText,
  state,
  size,
  className = "",
}: {
  auto: boolean;
  icon?: { logo: string; className?: string };
  title: string;
  ask: string;
  done: string;
  state: Phase;
  size: "md" | "lg";
  className?: string;
}) {
  const done = state === "done";
  const lg = size === "lg";
  return (
    <div
      className={`hero-d-toast hero-d-acard flex items-center gap-2.5 ${lg ? "rounded-[12px] py-2.5 pr-2.5 pl-2.5" : "rounded-[10px] p-2"} ${className}`}
    >
      <span className={`hero-d-ftoast-icon grid shrink-0 place-items-center ${lg ? "size-10 rounded-[9px]" : "size-8 rounded-[8px]"}`}>
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={icon.logo}
            alt=""
            width={24}
            height={24}
            draggable={false}
            className={`max-w-none ${lg ? "size-6" : "size-5"} ${icon.className ?? ""}`}
          />
        ) : (
          <span className={`rounded-[2px] bg-(--sky-fill) ${lg ? "size-2" : "size-[7px]"}`} />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col pr-1 text-left leading-tight">
        <span
          className={`truncate font-semibold ${auto ? "font-mono tracking-[-0.02em]" : "tracking-[-0.01em]"} ${lg ? (auto ? "text-[14px]" : "text-[15px]") : auto ? "text-[12.5px]" : "text-[13px]"}`}
        >
          {title}
        </span>
        <span className={`mt-0.5 grid whitespace-nowrap ${lg ? "text-[13px]" : "text-[12px]"}`}>
          <span className="hero-d-swap-text hero-d-sub col-start-1 row-start-1 truncate" data-on={!done}>
            {ask}
          </span>
          <span className="hero-d-swap-text hero-d-ok-text col-start-1 row-start-1 truncate" data-on={done}>
            {doneText}
          </span>
        </span>
      </span>
      <span className="relative grid shrink-0 items-center justify-items-end">
        {auto ? (
          <span className={`hero-d-swap col-start-1 row-start-1 grid place-items-center ${lg ? "size-7" : "size-6"}`} data-on={!done}>
            <span className={`hero-d-spin block rounded-full border-[1.5px] ${lg ? "size-4" : "size-3.5"}`} />
          </span>
        ) : (
          <span
            className={`hero-d-swap col-start-1 row-start-1 flex gap-1 font-medium data-[on=false]:absolute data-[on=false]:right-0 ${lg ? "text-[12.5px] leading-[18px]" : "text-[11.5px] leading-[16px]"}`}
            data-on={!done}
          >
            <span className={`hero-d-reject rounded-[6px] ${lg ? "px-2.5 py-1" : "px-2 py-1"}`}>Reject</span>
            <span className={`hero-d-fapprove rounded-[6px] ${lg ? "px-2.5 py-1" : "px-2 py-1"}`} data-press={state === "press"}>
              Approve
            </span>
          </span>
        )}
        <span className="hero-d-swap col-start-1 row-start-1 grid place-items-center" data-on={done}>
          <StatusDisc done className={lg ? "size-7" : "size-6"} icon={lg ? "size-4" : "size-[14px]"} />
        </span>
      </span>
    </div>
  );
}

/** Grey while the handshake is out (a packet blinking inside), the design's green check once approved. */
function StatusDisc({ done, className, icon }: { done: boolean; className: string; icon: string }) {
  return (
    <span className={`relative grid shrink-0 ${className}`}>
      <span className="hero-d-swap hero-d-wait col-start-1 row-start-1 grid place-items-center rounded-full" data-on={!done}>
        <span className="hero-d-blink size-[17%] rounded-[2px] bg-(--sky-fill)" />
      </span>
      <span className="hero-d-swap hero-d-ok col-start-1 row-start-1 grid place-items-center rounded-full" data-on={done}>
        <svg viewBox="0 0 20 20" className={icon}>
          <circle cx="10" cy="10" r="10" fill="currentColor" />
          <path d="M5.9 10.2 8.7 13l5.5-5.7" fill="none" stroke="var(--toast-bg)" strokeWidth="1.9" strokeLinecap="square" />
        </svg>
      </span>
    </span>
  );
}
