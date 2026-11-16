"use client";

import { useEffect, useRef } from "react";
import { SKY_CARD } from "@/components/sky/kit";
import { LiveDot, Reveal } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { useStats } from "@/lib/stats";
import "./numbers.css";

/*
 * Live from the registry: a compact strip at the foot of the overview. The two figures that say how big the network
 * is, and the request rate on a deep-blue board whose lights flash at the live rate (one light ≈ 1,000 requests).
 */

/* ---------------- Odometer ---------------- */

/** One wheel. clip-path instead of overflow keeps the baseline where text expects it. */
function Digit({ value, delay }: { value: number; delay: number }) {
  return (
    <span className="relative inline-block h-[1em] [clip-path:inset(0_-0.25em)]">
      <span className="invisible">0</span>
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-[1400ms] ease-(--ease-out) motion-reduce:transition-none"
        style={{ transform: `translateY(${-value * 10}%)`, transitionDelay: `${delay}ms` }}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} className="h-[1em] leading-none">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

function Odometer({ value, on }: { value: number; on: boolean }) {
  const text = value.toLocaleString("en-US");
  let k = 0;
  return (
    <span className="inline-flex leading-none tabular-nums" aria-hidden>
      {text.split("").map((ch, i) =>
        /\d/.test(ch) ? <Digit key={i} value={on ? Number(ch) : 0} delay={k++ * 60} /> : <span key={i}>{ch}</span>,
      )}
    </span>
  );
}

function Figure({
  value,
  on,
  approx,
  unit,
  className,
}: {
  value: number;
  on: boolean;
  approx?: boolean;
  unit?: string;
  className: string;
}) {
  return (
    <p className={`flex items-baseline leading-[0.9] font-medium ${className}`}>
      {approx && <span className="mr-[0.04em] self-center text-[0.6em] tracking-normal opacity-45">~</span>}
      <Odometer value={value} on={on} />
      {unit && <span className="ml-[0.1em] text-[0.4em] tracking-[-0.02em] opacity-80">{unit}</span>}
    </p>
  );
}

/* ---------------- The board: lights at the live request rate ---------------- */

/** Each light stands for about this many registry requests. */
const PER_FLASH = 1000;
const PITCH = 14;
const DOT = 5;
const FADE_MS = 1200;

/**
 * A field of small lights that flash at the registry's live request rate (one flash ≈ 1,000 requests).
 * Canvas, because a few hundred dots fading every frame is too much for the DOM. Paused off-screen; with
 * reduced motion it holds one still frame.
 */
function Lights({ rate, className = "h-[150px] sm:h-[190px]" }: { rate: number; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const rateRef = useRef(rate);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    let cols = 0;
    let rows = 0;
    let heat = new Float32Array(0);
    let frame = 0;
    let last = performance.now();
    let owed = 0;

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor((width - DOT) / PITCH) + 1);
      rows = Math.max(1, Math.floor((height - DOT) / PITCH) + 1);
      heat = new Float32Array(cols * rows);
      if (reduced) for (let i = 0; i < heat.length; i += 6) heat[(i * 13) % heat.length] = 0.3 + ((i * 29) % 10) / 14;
    };

    const draw = () => {
      const { width, height } = el.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      // Centre the field in whatever slack the whole number of dots leaves.
      const ox = (width - ((cols - 1) * PITCH + DOT)) / 2 + DOT / 2;
      const oy = (height - ((rows - 1) * PITCH + DOT)) / 2 + DOT / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const h = heat[r * cols + c];
          ctx.beginPath();
          ctx.arc(ox + c * PITCH, oy + r * PITCH, DOT / 2, 0, Math.PI * 2);
          ctx.fillStyle = h > 0.01 ? `rgba(207, 230, 255, ${0.12 + Math.min(1, h) * 0.88})` : "rgba(255, 255, 255, 0.12)";
          ctx.fill();
        }
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const decay = Math.exp(-dt / (FADE_MS / 3));
      for (let i = 0; i < heat.length; i++) heat[i] *= decay;
      owed += (dt / 1000) * (rateRef.current / PER_FLASH);
      while (owed >= 1) {
        owed -= 1;
        heat[Math.floor(Math.random() * heat.length)] = 1;
      }
      draw();
      frame = requestAnimationFrame(tick);
    };

    resize();
    draw();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(el);

    if (inView && !reduced) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [inView, reduced]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />
    </div>
  );
}

/* ---------------- Figures ---------------- */

/** Shown only while the figures really are coming from the live endpoint. */
function LiveTag() {
  return (
    <span className="numd-tag inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] leading-4 font-medium">
      <LiveDot />
      Live
    </span>
  );
}

/** One registry figure in the strip: the number, then what it counts. */
function Stat({ value, label, on, className = "" }: { value: number; label: string; on: boolean; className?: string }) {
  return (
    <div className={`flex flex-col justify-end px-6 py-5 ${className}`}>
      <span className="sr-only">About {value.toLocaleString("en-US")} </span>
      <Figure value={value} approx on={on} className="text-[clamp(34px,3.2vw,44px)] tracking-[-0.06em] text-fg" />
      <p className="mt-2.5 text-[14.5px] leading-5 tracking-[-0.01em] text-mute">{label}</p>
    </div>
  );
}

/**
 * The registry's live figures as the overview grid's last row (they used to be a section of their own): how many
 * daemons are online, how many addresses exist, and the request rate on its deep-blue board of lights. The data
 * agent and app counts aren't repeated here; their overview tiles carry them.
 */
export function NumbersStrip() {
  const stats = useStats();
  const [ref, on] = useInView<HTMLDivElement>({ margin: "0px 0px -10% 0px" });
  const round = (n: number) => Math.round(n / 1000) * 1000;

  return (
    <Reveal className="mt-4 lg:mt-5">
      <div id="numbers" ref={ref} aria-labelledby="numbers-d-title" role="region" className={`scroll-mt-28 overflow-hidden ${SKY_CARD}`}>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 pt-6">
          <h3 id="numbers-d-title" className="flex items-center gap-2.5 text-[16px] leading-7 font-medium tracking-[-0.03em] text-fg">
            <span className="grid size-[15px] place-items-center">
              <LiveDot />
            </span>
            Live from the registry
          </h3>
          <p className="text-[14.5px] leading-7 tracking-[-0.013em] text-mute">Refreshed every minute</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.35fr)]">
          <Stat value={round(stats.activeNodes)} label="Daemons online in the last 30 minutes" on={on} />
          <Stat value={round(stats.totalNodes)} label="Addresses issued since launch" on={on} className="border-l border-(--sky-card-line)" />
          <div className="col-span-2 p-2 pt-0 lg:col-span-1 lg:pt-2">
            <div className="numd-board relative flex h-full min-h-[132px] flex-col justify-end overflow-hidden rounded-[8px] px-5 py-4">
              <div aria-hidden className="absolute inset-0 opacity-70">
                <Lights rate={stats.requestsPerSec} className="h-full" />
              </div>
              <div className="relative">
                <span className="sr-only">{stats.requestsPerSec.toLocaleString("en-US")} </span>
                <Figure
                  value={stats.requestsPerSec}
                  unit="/sec"
                  on={on}
                  className="text-[clamp(34px,3.2vw,44px)] tracking-[-0.06em] text-white"
                />
                <p className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14.5px] leading-5 tracking-[-0.01em] text-white/80">
                  Registry requests per second
                  {stats.live && <LiveTag />}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
