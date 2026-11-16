"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { LiveDot, Reveal, SectionHead, SmartLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";
import { useStats } from "@/lib/stats";

/* ---------------- Odometer ---------------- */

/** One wheel. clip-path instead of overflow keeps the baseline where text expects it. */
function Digit({ value, delay }: { value: number; delay: number }) {
  return (
    <span className="relative inline-block h-[1em] [clip-path:inset(0)]">
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
        /\d/.test(ch) ? <Digit key={i} value={on ? Number(ch) : 0} delay={k++ * 70} /> : <span key={i}>{ch}</span>,
      )}
    </span>
  );
}

/* ---------------- The registry pulse ---------------- */

/** Each flash stands for this many registry requests. */
const PER_FLASH = 1000;
const PITCH = 16;
const CELL = 9;
const FADE_MS = 1100;

function readRgb(el: Element, name: string): [number, number, number] {
  const hex = getComputedStyle(el).getPropertyValue(name).trim().replace("#", "");
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex.slice(0, 6);
  const n = parseInt(full, 16);
  return Number.isNaN(n) ? [128, 128, 128] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v * (1 - t) + b[i] * t));
const rgba = ([r, g, b]: number[], alpha = 1) => `rgba(${r},${g},${b},${alpha})`;

/**
 * A field of cells that flash at the registry's live request rate (one flash ≈ 1,000 requests).
 * Canvas, because a few hundred cells fading every frame is too much for the DOM.
 */
function Pulse({ rate }: { rate: number }) {
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
    let colors = { base: "", lime: "" };
    let frame = 0;
    let last = performance.now();
    let owed = 0;

    const theme = () => {
      const dark = document.documentElement.classList.contains("dark");
      const lime = readRgb(el, "--color-lime");
      colors = {
        base: rgba(readRgb(el, "--color-fg"), dark ? 0.09 : 0.08),
        lime: rgba(dark ? lime : mix(lime, readRgb(el, "--color-lime-ink"), 0.35)),
      };
    };

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor((width + PITCH - CELL) / PITCH));
      rows = Math.max(1, Math.floor((height + PITCH - CELL) / PITCH));
      heat = new Float32Array(cols * rows);
      if (reduced) for (let i = 0; i < heat.length; i += 7) heat[(i * 13) % heat.length] = 0.35 + ((i * 29) % 10) / 16;
    };

    const draw = () => {
      const { width, height } = el.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      // Centre the grid in whatever slack the integer cell count leaves.
      const ox = (width - ((cols - 1) * PITCH + CELL)) / 2;
      const oy = (height - ((rows - 1) * PITCH + CELL)) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const h = heat[r * cols + c];
          const x = ox + c * PITCH;
          const y = oy + r * PITCH;
          ctx.globalAlpha = 1;
          ctx.fillStyle = colors.base;
          ctx.beginPath();
          ctx.roundRect(x, y, CELL, CELL, 2.5);
          ctx.fill();
          if (h > 0.01) {
            ctx.globalAlpha = Math.min(1, h * 1.15);
            ctx.fillStyle = colors.lime;
            ctx.beginPath();
            ctx.roundRect(x, y, CELL, CELL, 2.5);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
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

    theme();
    resize();
    draw();

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(el);
    const mo = new MutationObserver(() => {
      theme();
      draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    if (inView && !reduced) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      mo.disconnect();
    };
  }, [inView, reduced]);

  return (
    <div ref={ref} className="relative h-[168px] sm:h-[200px]">
      <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />
    </div>
  );
}

/* ---------------- Figures ---------------- */

function Figure({
  value,
  on,
  unit,
  approx = false,
  size = "lg",
}: {
  value: number;
  on: boolean;
  unit?: string;
  approx?: boolean;
  size?: "lg" | "md";
}) {
  const big = size === "lg" ? "text-[clamp(64px,7.4vw,108px)]" : "text-[clamp(52px,5.6vw,76px)]";
  return (
    <p className={`flex items-baseline font-medium tracking-[-0.055em] text-fg ${big} leading-[0.86]`}>
      {approx && <span className="mr-[0.04em] text-[0.5em] tracking-normal text-mute">~</span>}
      <Odometer value={value} on={on} />
      {unit && <span className="ml-[0.12em] text-[0.42em] tracking-[-0.03em]">{unit}</span>}
    </p>
  );
}

function Stat({
  figure,
  label,
  note,
  live,
  srValue,
}: {
  figure: ReactNode;
  label: string;
  note: string;
  live: boolean;
  srValue: string;
}) {
  return (
    <div>
      <span className="sr-only">{srValue}</span>
      {figure}
      <p className="mt-5 flex items-center gap-2.5 text-[16px] font-medium tracking-[-0.01em] text-fg">
        {label}
        {live && <LiveDot />}
      </p>
      <p className="mt-1.5 max-w-[340px] text-[14.5px] leading-[1.5] text-mute">{note}</p>
    </div>
  );
}

export function Numbers() {
  const stats = useStats();
  const [ref, on] = useInView<HTMLDivElement>({ margin: "0px 0px -15% 0px" });
  const k = (n: number) => Math.round(n / 1000);

  return (
    <section id="numbers" aria-labelledby="numbers-title" className="py-28 sm:py-36">
      <div className="wrap">
        <SectionHead id="numbers-title" title="Live from the registry," muted="refreshed every minute." />

        <div ref={ref} className="mt-14 grid grid-cols-1 gap-6 sm:mt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
          <Reveal className="flex flex-col justify-between gap-12 py-2 lg:pr-6">
            <Stat
              live={stats.live}
              srValue={`About ${(k(stats.activeNodes) * 1000).toLocaleString("en-US")}`}
              figure={<Figure value={k(stats.activeNodes)} unit="k" approx on={on} />}
              label="Daemons seen in the last 30 minutes"
              note="Daemons that sent the registry a heartbeat in the last 30 minutes. A daemon is one running Pilot node."
            />
            <Stat
              live={stats.live}
              srValue={`About ${(k(stats.totalNodes) * 1000).toLocaleString("en-US")}`}
              figure={<Figure value={k(stats.totalNodes)} unit="k" approx on={on} />}
              label="Registered addresses"
              note="Every address the public registry has issued since launch, including daemons that have since gone offline."
            />
          </Reveal>

          <Reveal delay={90} className="flex flex-col rounded-[28px] bg-bg-deep p-6 ring-1 ring-edge sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <div>
                <span className="sr-only">{stats.requestsPerSec.toLocaleString("en-US")}</span>
                <Figure value={stats.requestsPerSec} unit="/sec" size="md" on={on} />
                <p className="mt-4 flex items-center gap-2.5 text-[16px] font-medium tracking-[-0.01em] text-fg">
                  Registry requests per second
                  {stats.live && <LiveDot />}
                </p>
              </div>
              <p className="max-w-[250px] text-[13.5px] leading-[1.5] text-mute sm:text-right">
                Registrations, lookups and heartbeats, averaged over about 10 seconds.
              </p>
            </div>
            <div className="mt-8 flex-1 sm:mt-10">
              <Pulse rate={stats.requestsPerSec} />
            </div>
            <p className="mt-6 flex items-center gap-2 text-[13px] text-mute">
              <span aria-hidden className="size-[9px] rounded-[2.5px] bg-lime" />
              Each flash is about 1,000 requests, at the live rate.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120} className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-8 lg:gap-8">
          {[
            { href: LINKS.serviceAgents, value: stats.dataAgents, label: "Data service agents", note: "Agents listed in the list-agents directory." },
            { href: LINKS.appStore, value: stats.apps, label: "Apps", note: "In the App Store, each installed with one command." },
          ].map((s) => (
            <SmartLink
              key={s.label}
              href={s.href}
              className="group flex items-end justify-between gap-6 rounded-[24px] bg-card p-6 shadow-card transition-transform duration-300 ease-(--ease-out) hover:-translate-y-0.5 sm:p-7"
            >
              <span>
                <span className="sr-only">{s.value}</span>
                <Figure value={s.value} size="md" on={on} />
                <span className="mt-4 block text-[16px] font-medium tracking-[-0.01em] text-fg">{s.label}</span>
                <span className="mt-1 block text-[14px] text-mute">{s.note}</span>
              </span>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-fg/[0.06] text-fg transition-colors duration-200 group-hover:bg-fg group-hover:text-bg">
                <ArrowUpRightIcon className="size-3.5" />
              </span>
            </SmartLink>
          ))}
        </Reveal>

        <p className="mt-10 text-[13px] text-mute">
          Data agents and apps are counted from the list-agents directory and the App Store catalogue.
        </p>
      </div>
    </section>
  );
}
