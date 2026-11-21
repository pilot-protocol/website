"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import "./hero.css";
import { DownloadIcon } from "@/components/icons";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { approx, useStats } from "@/lib/stats";

/*
 * Variant D hero (Figma 180:37). The copy and the passport stamps sit on the sky; below the buttons the Orbit
 * scene (160:1134 / 180:37) is drawn on the design's own 1680×1050 canvas, scaled to the width: arcs rising out
 * of the glow, six agents, two live toast stacks. It pauses off-screen and holds still with reduced motion.
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

const SCENE_LABEL =
  "Cursor, Hermes, OpenClaw, Claude, Gemini and Codex agents on the network, with handshakes being approved";

export function HeroD() {
  const stats = useStats();
  const reduced = usePrefersReducedMotion();
  const [sectionRef, inView] = useInView<HTMLElement>({ once: false, margin: "0px" });
  const live = inView && !reduced;

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

        {/* Phones and tablets: one stack, centred, between the buttons and the scene. */}
        <div
          aria-hidden
          className="rise-in relative mt-5 h-[190px] w-[340px] max-w-[calc(100vw-24px)] lg:hidden"
          style={delay(380)}
        >
          <ToastStack
            events={ALL}
            front={{ c: feed.k, current: true }}
            phase={feed.phase}
            slots={SLOTS_COMPACT}
            className="inset-y-0 left-1/2 w-[340px] -translate-x-1/2"
            toast="sm"
            toastClass="w-[320px]"
          />
        </div>
      </div>

      <div role="img" aria-label={SCENE_LABEL} className="hero-d-scene rise-in relative" style={delay(380)}>
        <div aria-hidden className="absolute inset-0">
          <OrbitScene run={live} feed={api} state={feed} />
        </div>
        <div aria-hidden className="hero-d-night-fade pointer-events-none absolute inset-x-0 bottom-0 h-[30%] max-lg:h-[16%]" />
      </div>
    </section>
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
 * Toasts
 * ===================================================================================================== */

function ToastStack({
  events,
  front,
  phase,
  slots,
  side,
  className,
  toast,
  toastClass,
}: {
  events: Ev[];
  front: { c: number; current: boolean };
  phase: Phase;
  slots: Slot[];
  side?: "left" | "right";
  className: string;
  toast: "lg" | "sm";
  toastClass: string;
}) {
  const { c, current } = front;
  // Slot 3 is the front. Render from the one leaving at the back to the one queued below.
  const items = [-3, -2, -1, 0, 1, 2].map((offset) => c + offset);

  return (
    <div aria-hidden data-side={side} className={`hero-d-stack absolute ${className}`}>
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

/** A feed event as an approval card, for the stacks (Orbit's sides and the phone stack). */
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
 * The approval card: who's asking, what they want, and the answer.
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
