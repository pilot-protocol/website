"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import "./hero.css";
import { CheckIcon } from "@/components/icons";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

/*
 * The hero's living network: agents (real harness logos) and data service agents (real hostnames)
 * on one plane. Every few seconds a connection is asked for and approved, the link lights up and
 * packets start moving along it. Drawn on a fixed canvas that's scaled to fit: a wide 1200×460 one,
 * and a compact one with fewer nodes for phones.
 */

type Node = {
  id: string;
  label: string;
  /** Agents get a logo tile; data agents a hostname chip. */
  logo?: string;
  mono?: boolean;
  host?: string;
  far?: boolean;
};

const NODES: Node[] = [
  { id: "claude", label: "Claude Code", logo: "/harness/claude-color.svg" },
  { id: "codex", label: "Codex", logo: "/harness/codex.svg" },
  { id: "openclaw", label: "OpenClaw", logo: "/harness/openclaw.png" },
  { id: "cursor", label: "Cursor", logo: "/harness/cursor.svg", mono: true },
  { id: "hermes", label: "Hermes", logo: "/harness/hermes.png" },
  { id: "gemini", label: "Gemini", logo: "/harness/gemini.svg" },
  { id: "opencode", label: "OpenCode", logo: "/harness/opencode.svg", mono: true },
  { id: "meteo", label: "Weather", host: "open-meteo-forecast" },
  { id: "quakes", label: "News", host: "usgs-earthquakes" },
  { id: "coins", label: "Finance", host: "coingecko-markets-simple" },
  { id: "iss", label: "Space", host: "iss-position" },
  { id: "transit", label: "Transit", host: "bvg-berlin-departures" },
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

type Episode = { from: string; to: string; auto: boolean };
type Layout = {
  w: number;
  h: number;
  pos: Record<string, [number, number]>;
  edges: [string, string][];
  episodes: Episode[];
  start: string[];
};

const edgeKey = (a: string, b: string) => [a, b].sort().join("~");

const WIDE: Layout = {
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
};

const COMPACT: Layout = {
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
};

const MAX_LIVE = 6;

/** A gentle curve between two points; alternating bend so parallel links don't stack. */
function edgePath([ax, ay]: [number, number], [bx, by]: [number, number], i: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const bend = (i % 2 ? 1 : -1) * Math.min(46, len * 0.16);
  const cx = (ax + bx) / 2 + (-dy / len) * bend;
  const cy = (ay + by) / 2 + (dx / len) * bend;
  return `M ${ax} ${ay} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${bx} ${by}`;
}

type Toast = { id: number; ep: Episode; phase: "ask" | "ok" | "out" };

export function HeroNetwork() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [visRef, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const reduced = usePrefersReducedMotion();
  const [live, setLive] = useState<string[]>(WIDE.start);
  const [toast, setToast] = useState<Toast | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const packetLayer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const layout = width && width < 640 ? COMPACT : WIDE;
  const { w: W, h: H } = layout;
  const scale = width ? Math.min(1.18, layout === COMPACT ? width / W : Math.max(0.7, width / W)) : 1;
  // Which part of the canvas is on screen when it's cropped.
  const visibleHalf = width ? width / scale / 2 : W / 2;

  const paths = useMemo(
    () => layout.edges.map(([a, b], i) => ({ key: edgeKey(a, b), d: edgePath(layout.pos[a], layout.pos[b], i) })),
    [layout],
  );

  // The connection script: ask → approve → link lights up → next. Only links fully on screen.
  const reach = Math.round(visibleHalf / 50) * 50;
  const episodes = useMemo(
    () =>
      layout.episodes.filter((e) =>
        [e.from, e.to].every((id) => Math.abs(layout.pos[id][0] - layout.w / 2) < reach - 50),
      ),
    [layout, reach],
  );

  // Switching layouts starts the lit links over.
  const [shown, setShown] = useState(layout);
  if (shown !== layout) {
    setShown(layout);
    setLive(layout.start);
    setToast(null);
  }

  useEffect(() => {
    if (!inView || reduced || episodes.length === 0) return;
    let i = 0;
    let id = 0;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    function run() {
      const ep = episodes[i % episodes.length];
      i += 1;
      const tid = ++id;
      setToast({ id: tid, ep, phase: "ask" });
      const ask = ep.auto ? 900 : 1500;
      at(ask, () => setToast((t) => (t?.id === tid ? { ...t, phase: "ok" } : t)));
      at(ask + 350, () =>
        setLive((l) => {
          const k = edgeKey(ep.from, ep.to);
          const next = [...l.filter((x) => x !== k), k];
          return next.slice(-MAX_LIVE);
        }),
      );
      at(ask + 1700, () => setToast((t) => (t?.id === tid ? { ...t, phase: "out" } : t)));
      at(ask + 2300, run);
    }
    at(700, run);
    return () => timers.forEach(clearTimeout);
  }, [inView, reduced, episodes]);

  const liveRef = useRef(live);
  useEffect(() => {
    liveRef.current = live;
  }, [live]);

  // Packets: small lime squares riding the live links, in both directions.
  useEffect(() => {
    const layer = packetLayer.current;
    if (!layer || !inView || reduced) return;
    let alive = true;
    const timers: number[] = [];

    function send(key: string) {
      const path = pathRefs.current[key];
      if (!alive || !path || !layer) return;
      const el = document.createElement("span");
      el.className = "hero-packet";
      el.style.offsetPath = `path("${path.getAttribute("d")}")`;
      layer.appendChild(el);
      const back = Math.random() < 0.5;
      const length = path.getTotalLength();
      const anim = el.animate(
        [
          { offsetDistance: back ? "100%" : "0%", opacity: 0 },
          { opacity: 1, offset: 0.12 },
          { opacity: 1, offset: 0.88 },
          { offsetDistance: back ? "0%" : "100%", opacity: 0 },
        ],
        { duration: 700 + length * 2.6, easing: "cubic-bezier(0.65, 0, 0.35, 1)" },
      );
      anim.onfinish = () => el.remove();
    }

    function loop() {
      if (!alive) return;
      const keys = liveRef.current;
      if (keys.length) send(keys[Math.floor(Math.random() * keys.length)]);
      timers.push(window.setTimeout(loop, 380 + Math.random() * 420));
    }
    loop();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      layer.replaceChildren();
    };
  }, [inView, reduced]);

  const lit = (key: string) => live.includes(key);
  const touches = (key: string) => hover !== null && key.split("~").includes(hover);

  return (
    <div ref={visRef} className="relative">
      <div
        ref={frameRef}
        className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent),linear-gradient(to_bottom,black_78%,transparent)] [mask-composite:intersect]"
        style={{ height: H * scale }}
      >
        <div
          className="absolute top-0 left-1/2 origin-top"
          style={{ width: W, height: H, transform: `translateX(-50%) scale(${scale})` }}
        >
          {/* Dot grid: the plane the network sits on. */}
          <div
            aria-hidden
            className="absolute -inset-x-40 inset-y-0 opacity-70 [background-image:radial-gradient(var(--color-edge-3)_1px,transparent_1.2px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_72%)]"
          />

          <svg aria-hidden viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" fill="none">
            {paths.map(({ key, d }) => (
              <g key={key}>
                <path
                  ref={(el) => {
                    pathRefs.current[key] = el;
                  }}
                  d={d}
                  stroke="var(--color-edge-2)"
                  strokeWidth={1}
                  strokeDasharray="3 5"
                />
                <path
                  d={d}
                  pathLength={1}
                  stroke="var(--color-lime-ink)"
                  strokeWidth={touches(key) ? 2 : 1.5}
                  strokeLinecap="round"
                  className="transition-[stroke-dashoffset,opacity,stroke-width] duration-700 ease-(--ease-out)"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: lit(key) || touches(key) ? 0 : 1,
                    opacity: lit(key) || touches(key) ? 0.9 : 0,
                  }}
                />
              </g>
            ))}
          </svg>

          <div ref={packetLayer} aria-hidden className="absolute inset-0" />

          {NODES.filter((n) => layout.pos[n.id]).map((n) => (
            <NodeView key={n.id} node={n} at={layout.pos[n.id]} active={hover === n.id} onHover={setHover} />
          ))}

          {toast && <ToastView key={toast.id} toast={toast} layout={layout} half={visibleHalf} />}
          {reduced && <ToastView toast={{ id: 0, ep: layout.episodes[0], phase: "ok" }} layout={layout} half={visibleHalf} />}
        </div>
      </div>
    </div>
  );
}

function NodeView({
  node: n,
  at,
  active,
  onHover,
}: {
  node: Node;
  at: [number, number];
  active: boolean;
  onHover: (id: string | null) => void;
}) {
  const style = { left: at[0], top: at[1] } as CSSProperties;
  const common = {
    onPointerEnter: () => onHover(n.id),
    onPointerLeave: () => onHover(null),
    "data-active": active,
  };

  if (n.host) {
    return (
      <div
        {...common}
        className="group absolute flex w-max -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-card py-[7px] pr-3.5 pl-2.5 shadow-tile transition-transform duration-300 ease-(--ease-out) data-[active=true]:-translate-y-[calc(50%+2px)]"
        style={style}
      >
        <span className="relative grid size-[18px] place-items-center rounded-full bg-lime/25">
          <span className="size-[7px] rounded-[2px] bg-packet" />
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-[10.5px] font-medium tracking-[0.01em] text-dim">{n.label}</span>
          <span className="mt-[3px] font-mono text-[12px] tracking-[-0.01em] text-soft">{n.host}</span>
        </span>
      </div>
    );
  }

  return (
    <div
      {...common}
      className="group absolute flex w-max -translate-x-1/2 -translate-y-[30px] flex-col items-center transition-transform duration-300 ease-(--ease-out) data-[active=true]:-translate-y-[32px]"
      style={style}
    >
      <span className="grid size-[60px] place-items-center rounded-[17px] bg-card shadow-tile">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={n.logo}
          alt=""
          width={32}
          height={32}
          draggable={false}
          className={`size-[32px] object-contain ${n.mono ? "dark:invert" : ""} ${n.logo?.endsWith(".png") ? "rounded-[9px]" : ""}`}
        />
      </span>
      <span className="mt-2 text-[12.5px] font-medium tracking-[-0.01em] whitespace-nowrap text-soft">{n.label}</span>
    </div>
  );
}

function ToastView({ toast, layout, half }: { toast: Toast; layout: Layout; half: number }) {
  const { ep, phase } = toast;
  const from = byId[ep.from];
  const to = byId[ep.to];
  // Data agents approve on their own; between agents, the one being asked approves.
  const asker = from;
  const title = ep.auto ? to.host : from.label;
  const ask = ep.auto ? `Handshake from ${from.label}` : `wants to reach ${to.label}`;
  const done = ep.auto ? "Approved automatically" : "Trusted · both sides approved";
  const [tx, ty] = layout.pos[ep.to];
  const mid = layout.w / 2;
  // Sit above the node that's being asked, or below it near the top edge.
  const below = ty < 150;
  // Keep the whole toast inside the part of the canvas that's on screen.
  const room = Math.max(0, Math.min(mid, half) - 160);
  const style = {
    left: Math.min(mid + room, Math.max(mid - room, tx)),
    top: below ? ty + (to.host ? 30 : 50) : ty - (to.host ? 30 : 44),
  } as CSSProperties;

  return (
    <div
      className={`pointer-events-none absolute z-10 w-max -translate-x-1/2 ${below ? "" : "-translate-y-full"}`}
      style={style}
    >
      <div
        className={`hero-toast flex items-center gap-2.5 rounded-[14px] bg-card/95 py-2 pr-2 pl-2 shadow-float backdrop-blur-md ${below ? "origin-top" : "origin-bottom"}`}
        data-phase={phase}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-bg-deep">
          {asker.logo && !ep.auto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asker.logo}
              alt=""
              width={18}
              height={18}
              className={`size-[18px] object-contain ${asker.mono ? "dark:invert" : ""} ${asker.logo.endsWith(".png") ? "rounded-[5px]" : ""}`}
            />
          ) : (
            <span className="size-[7px] rounded-[2px] bg-packet" />
          )}
        </span>
        <div className="pr-1 leading-tight">
          <p className={`text-[12.5px] font-medium whitespace-nowrap text-fg ${ep.auto ? "font-mono text-[12px]" : ""}`}>{title}</p>
          <p className="mt-0.5 grid text-[11.5px] whitespace-nowrap">
            <span className="hero-swap col-start-1 row-start-1 text-mute" data-on={phase === "ask"}>
              {ask}
            </span>
            <span className="hero-swap col-start-1 row-start-1 text-lime-ink" data-on={phase !== "ask"}>
              {done}
            </span>
          </p>
        </div>
        <span className="grid shrink-0 justify-items-end">
          {!ep.auto && (
            <span className="hero-swap col-start-1 row-start-1 flex gap-1 text-[11px] font-medium" data-on={phase === "ask"}>
              <span className="rounded-[7px] bg-fg/[0.06] px-2 py-1 text-mute">Reject</span>
              <span className="hero-approve rounded-[7px] bg-fg px-2 py-1 text-bg">Approve</span>
            </span>
          )}
          {ep.auto && (
            <span className="hero-swap col-start-1 row-start-1 grid size-6 place-items-center" data-on={phase === "ask"}>
              <span className="block size-3.5 animate-spin rounded-full border-[1.5px] border-edge-3 border-t-fg" />
            </span>
          )}
          <span
            className="hero-swap col-start-1 row-start-1 grid size-6 place-items-center rounded-full bg-lime text-ink"
            data-on={phase !== "ask"}
          >
            <CheckIcon className="size-3" />
          </span>
        </span>
      </div>
    </div>
  );
}
