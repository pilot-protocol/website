"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import "./board.css";
import { LiveDot } from "@/components/ui";
import { AGENT_CATEGORIES } from "@/lib/agents";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { useStats } from "@/lib/stats";

/* ---------------- One split-flap module ---------------- */

const DIGITS = " 0123456789,".split("");

/**
 * A module flips forward through its reel, one flap at a time, until it shows `value`.
 * Character modules carry digits; word modules carry whole words, like the
 * destination reels on an old Solari board.
 */
function Module({
  value,
  reel,
  word = false,
  active,
  delay,
  reduced,
  className = "",
}: {
  value: string;
  reel: string[];
  word?: boolean;
  active: boolean;
  delay: number;
  reduced: boolean;
  className?: string;
}) {
  const [s, setS] = useState({ prev: word ? "" : " ", cur: word ? "" : " ", n: 0 });
  const queue = useRef<string[]>([]);
  const moving = useRef(false);
  const step = word ? 150 : 72;

  useEffect(() => {
    if (!active) return;
    if (s.cur === value) {
      moving.current = false;
      queue.current = [];
      return;
    }
    if (reduced) {
      const t = window.setTimeout(() => setS((p) => ({ prev: value, cur: value, n: p.n + 1 })), 0);
      return () => window.clearTimeout(t);
    }
    if (queue.current.at(-1) !== value) {
      if (word) {
        // Two other words on the reel go past before the right one lands.
        const others = reel.filter((w) => w !== value && w !== s.cur);
        const pick = (k: number) => others[(value.length * 7 + k * 13 + s.n) % Math.max(1, others.length)] ?? "";
        queue.current = [pick(1), pick(2), value];
      } else {
        const from = Math.max(0, reel.indexOf(s.cur));
        const to = reel.indexOf(value);
        const path: string[] = [];
        if (to < 0) path.push(value);
        else for (let i = (from + 1) % reel.length; ; i = (i + 1) % reel.length) {
          path.push(reel[i]);
          if (i === to) break;
        }
        queue.current = path;
      }
    }
    const wait = moving.current ? step : delay;
    moving.current = true;
    const t = window.setTimeout(() => {
      const next = queue.current.shift() ?? value;
      setS((p) => ({ prev: p.cur, cur: next, n: p.n + 1 }));
    }, wait);
    return () => window.clearTimeout(t);
  }, [s, value, active, reduced, word, reel, delay, step]);

  const align = word ? "text-left pl-[0.55em] pr-[0.3em] tracking-[0.04em] uppercase" : "text-center";
  return (
    <span
      className={`board-module block ${word ? "[--fs:calc(var(--fh)*0.5)]" : "w-[calc(var(--fh)*0.7)] shrink-0"} ${className}`}
      style={{ "--step": `${step}ms` } as CSSProperties}
    >
      <span className="board-half top">
        <span className={`board-face ${align}`}>{s.cur}</span>
      </span>
      <span className="board-half bottom">
        <span className={`board-face ${align}`}>{s.prev}</span>
      </span>
      {s.prev !== s.cur && (
        <>
          <span key={`f${s.n}`} className="board-half top board-fold">
            <span className={`board-face ${align}`}>{s.prev}</span>
          </span>
          <span key={`u${s.n}`} className="board-half bottom board-unfold">
            <span className={`board-face ${align}`}>{s.cur}</span>
          </span>
        </>
      )}
    </span>
  );
}

/** A right-aligned number across a fixed row of character modules. */
function Digits({
  value,
  width,
  active,
  delay,
  reduced,
  mobileWidth = width,
}: {
  value: string;
  width: number;
  active: boolean;
  delay: number;
  reduced: boolean;
  mobileWidth?: number;
}) {
  const padded = value.padStart(width, " ");
  return (
    <span className="flex gap-[3px]">
      {padded.split("").map((ch, i) => (
        <Module
          key={i}
          value={ch}
          reel={DIGITS}
          active={active}
          reduced={reduced}
          delay={delay + i * 55}
          className={i < width - Math.max(mobileWidth, value.length) ? "max-sm:hidden" : ""}
        />
      ))}
    </span>
  );
}

/* ---------------- Media query without a hydration mismatch ---------------- */

function useWide() {
  return useSyncExternalStore(
    (cb) => {
      const q = window.matchMedia("(min-width: 1024px)");
      q.addEventListener("change", cb);
      return () => q.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true,
  );
}

/* ---------------- The boards ---------------- */

const fmt = (n: number) => n.toLocaleString("en-US");

const STATUS_WORDS = ["LIVE", "LAST SEEN", "CATALOGUE"];

function FiguresBoard({ active, reduced }: { active: boolean; reduced: boolean }) {
  const stats = useStats();
  const status = stats.live ? "LIVE" : "LAST SEEN";
  const rows = [
    { label: "Daemons seen · last 30 min", value: fmt(stats.activeNodes), status, live: true },
    { label: "Addresses issued", value: fmt(stats.totalNodes), status, live: true },
    { label: "Registry requests / sec", value: fmt(stats.requestsPerSec), status, live: true },
    { label: "Data agents", value: fmt(stats.dataAgents), status: "CATALOGUE", live: false },
    { label: "Apps in the App Store", value: fmt(stats.apps), status: "CATALOGUE", live: false },
  ];
  const labels = rows.map((r) => r.label);

  return (
    <div className="rounded-[22px] bg-[#121211] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_30px_80px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/[0.06] [--dw:calc(var(--fh)*6.3+24px)] [--fh:36px] sm:p-6 sm:[--fh:34px] md:[--fh:38px] lg:p-8 lg:[--fh:46px]">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-4 font-mono text-[11px] tracking-[0.08em] text-paper/45 uppercase">
        <span>Public registry</span>
        <span className="flex items-center gap-2">
          {stats.live ? (
            <>
              <LiveDot />
              <span className="text-paper/70">Live</span>
              <span className="max-sm:hidden">· refreshes every minute</span>
            </>
          ) : (
            <span>Connecting…</span>
          )}
        </span>
      </div>

      <div className="mt-3 hidden grid-cols-[minmax(0,1fr)_var(--dw)_calc(var(--fh)*3.7)] gap-x-4 font-mono text-[10.5px] tracking-[0.08em] text-paper/30 uppercase sm:grid lg:gap-x-6">
        <span>Figure</span>
        <span className="text-right">Now</span>
        <span>Status</span>
      </div>

      <ul className="mt-2 flex flex-col">
        {rows.map((r, row) => (
          <li
            key={r.label}
            className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-white/[0.05] py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_var(--dw)_calc(var(--fh)*3.7)] sm:gap-x-4 lg:gap-x-6"
          >
            <span className="col-span-2 text-[13px] text-paper/55 sm:hidden">{r.label}</span>
            <Module
              value={r.label.toUpperCase()}
              reel={labels.map((l) => l.toUpperCase())}
              word
              active={active}
              reduced={reduced}
              delay={row * 120}
              className="max-sm:hidden"
            />
            <Digits value={r.value} width={9} mobileWidth={7} active={active} reduced={reduced} delay={180 + row * 120} />
            <span className="flex min-w-0 items-center gap-2">
              <Module
                value={r.status}
                reel={STATUS_WORDS}
                word
                active={active}
                reduced={reduced}
                delay={700 + row * 120}
                className="min-w-0 flex-1"
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DestinationsBoard({ active, reduced }: { active: boolean; reduced: boolean }) {
  const wide = useWide();
  const perPage = wide ? 8 : 5;
  const pages = Math.ceil(AGENT_CATEGORIES.length / perPage);
  const [page, setPage] = useState(0);
  const shown = page % pages;

  useEffect(() => {
    if (!active || reduced) return;
    const id = window.setInterval(() => setPage((p) => p + 1), 5200);
    return () => window.clearInterval(id);
  }, [active, reduced]);

  const names = AGENT_CATEGORIES.map((c) => c.name.toUpperCase());
  const slots = Array.from({ length: perPage }, (_, i) => AGENT_CATEGORIES[shown * perPage + i]);

  return (
    <div className="rounded-[22px] bg-[#121211] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_30px_80px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/[0.06] [--fh:30px] sm:p-6 lg:p-8 lg:[--fh:34px]">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-4 font-mono text-[11px] tracking-[0.08em] text-paper/45 uppercase">
        <span>Data agents by category</span>
        <span className="flex items-center gap-1.5" aria-hidden>
          {Array.from({ length: pages }, (_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ease-(--ease-out) ${i === shown ? "w-4 bg-lime" : "w-1 bg-paper/25"}`}
            />
          ))}
        </span>
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-x-8 lg:grid-cols-2">
        {slots.map((c, i) => (
          <li key={i} className="flex items-center gap-3 border-b border-white/[0.05] py-2.5 lg:[&:nth-last-child(-n+2)]:border-0 max-lg:last:border-0">
            <Module
              value={c ? c.name.toUpperCase() : ""}
              reel={names}
              word
              active={active}
              reduced={reduced}
              delay={i * 90}
              className="min-w-0 flex-1"
            />
            <Digits value={c ? String(c.count) : ""} width={2} active={active} reduced={reduced} delay={260 + i * 90} />
            <span className="w-[3.4rem] font-mono text-[11px] tracking-[0.06em] text-paper/40 uppercase">
              {c ? (c.count === 1 ? "agent" : "agents") : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Section ---------------- */

export function Board() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px 0px -15% 0px" });
  const [seen, setSeen] = useState(false);
  const reduced = usePrefersReducedMotion();
  const stats = useStats();
  if (inView && !seen) setSeen(true);

  return (
    <section
      id="live-board"
      aria-labelledby="board-title"
      className="relative overflow-hidden bg-ink py-24 text-paper [color-scheme:dark] sm:py-32"
    >
      <div className="wrap">
        <div className="max-w-[640px]">
          <h2 id="board-title" className="text-[clamp(32px,4.2vw,52px)] leading-[1.02] font-medium tracking-[-0.04em] text-balance">
            Live from the public registry
          </h2>
          <p className="mt-4 text-[16px] leading-[1.55] text-pretty text-paper/60 sm:text-[17px]">
            Daemons are Pilot nodes that sent the registry a heartbeat in the last 30 minutes. Addresses count every one
            issued since launch, including nodes that have gone offline.
          </p>
        </div>

        <div ref={ref} aria-hidden className="mt-12 flex flex-col gap-5 sm:mt-14">
          <FiguresBoard active={seen} reduced={reduced} />
          <DestinationsBoard active={seen && inView} reduced={reduced} />
        </div>

        <dl className="sr-only">
          <dt>Daemons seen in the last 30 minutes</dt>
          <dd>{fmt(stats.activeNodes)}</dd>
          <dt>Addresses issued</dt>
          <dd>{fmt(stats.totalNodes)}</dd>
          <dt>Registry requests per second</dt>
          <dd>{fmt(stats.requestsPerSec)}</dd>
          <dt>Data agents</dt>
          <dd>{fmt(stats.dataAgents)}</dd>
          <dt>Apps in the App Store</dt>
          <dd>{fmt(stats.apps)}</dd>
        </dl>
      </div>
    </section>
  );
}
