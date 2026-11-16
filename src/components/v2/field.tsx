"use client";

import { useEffect, useRef } from "react";
import { LOGO_MARK_PATH } from "@/components/logo";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { useStats } from "@/lib/stats";

/*
 * One square for about every 1,000 daemons online. They drift; scroll through the pinned stretch
 * and they gather into the Pilot mark on a pixel grid, then let go again.
 */

const MARK_W = 113;
const MARK_H = 72;

type Particle = {
  sx: number;
  sy: number;
  ph: number;
  sp: number;
  amp: number;
  size: number;
  rot: number;
  delay: number;
  tone: number;
};

/** Grid points inside the mark, spaced so there are about `n` of them (in mark units). */
function sampleMark(n: number): { pts: [number, number][]; cell: number } {
  const k = 4;
  const c = document.createElement("canvas");
  c.width = MARK_W * k;
  c.height = MARK_H * k;
  const ctx = c.getContext("2d");
  if (!ctx) return { pts: [], cell: 4 };
  ctx.scale(k, k);
  ctx.fill(new Path2D(LOGO_MARK_PATH));
  const data = ctx.getImageData(0, 0, c.width, c.height).data;
  const inside = (x: number, y: number) => {
    const px = Math.floor(x * k);
    const py = Math.floor(y * k);
    if (px < 0 || py < 0 || px >= c.width || py >= c.height) return false;
    return data[(py * c.width + px) * 4 + 3] > 128;
  };
  const grid = (s: number) => {
    const pts: [number, number][] = [];
    for (let y = s / 2; y < MARK_H; y += s) for (let x = s / 2; x < MARK_W; x += s) if (inside(x, y)) pts.push([x, y]);
    return pts;
  };
  let lo = 0.8;
  let hi = 14;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (grid(mid).length > n) lo = mid;
    else hi = mid;
  }
  let pts = grid(lo);
  if (pts.length > n) {
    const keep: [number, number][] = [];
    const step = pts.length / n;
    for (let i = 0; i < n; i++) keep.push(pts[Math.floor(i * step)]);
    pts = keep;
  }
  return { pts, cell: lo };
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Scroll progress → how formed the mark is: drift, gather, hold, let go. */
function formation(p: number) {
  if (p < 0.16) return 0;
  if (p < 0.5) return (p - 0.16) / 0.34;
  if (p < 0.78) return 1;
  return 1 - (p - 0.78) / 0.22;
}

function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function Field() {
  const stats = useStats();
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const count = Math.max(60, Math.min(600, Math.round(stats.activeNodes / 1000)));
  const rounded = (Math.round(stats.activeNodes / 1000) * 1000).toLocaleString("en-US");

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { pts, cell } = sampleMark(count);
    const particles: Particle[] = pts.map((_, i) => {
      const r = (k: number) => seeded(i * 7 + k);
      return {
        sx: 0.06 + r(1) * 0.88,
        sy: 0.04 + r(2) * 0.92,
        ph: r(3) * Math.PI * 2,
        sp: 0.15 + r(4) * 0.35,
        amp: 10 + r(5) * 26,
        size: 5 + r(6) * 7,
        rot: (r(7) - 0.5) * 1.1,
        delay: r(8),
        tone: r(9),
      };
    });

    let colors = { lime: "#c6f24e", ink: "#c6f24e", fg: "#f2f2ec", faint: "#5d5d57" };
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
      colors = {
        lime: v("--color-packet", colors.lime),
        ink: v("--color-lime-ink", colors.ink),
        fg: v("--color-fg", colors.fg),
        faint: v("--color-faint", colors.faint),
      };
    };
    readColors();

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const toneColor = (t: number) => (t < 0.64 ? colors.lime : t < 0.88 ? colors.ink : t < 0.94 ? colors.fg : colors.faint);

    const draw = (time: number, formed: number) => {
      ctx.clearRect(0, 0, w, h);
      const markW = Math.min(w * (w < 640 ? 0.86 : 0.58), 680, h * 0.7 * (MARK_W / MARK_H));
      const scale = markW / MARK_W;
      const ox = (w - markW) / 2;
      const oy = (h - MARK_H * scale) / 2;
      const formedSize = cell * scale * 0.78;
      const t = time / 1000;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const [tx, ty] = pts[i];
        const f = ease(clamp01((formed - p.delay * 0.35) / 0.65));
        const sx = p.sx * w + Math.sin(t * p.sp + p.ph) * p.amp;
        const sy = p.sy * h + Math.cos(t * p.sp * 0.8 + p.ph) * p.amp;
        const x = sx + (ox + tx * scale - sx) * f;
        const y = sy + (oy + ty * scale - sy) * f;
        const size = p.size + (formedSize - p.size) * f;
        const rot = p.rot * (1 - f) + Math.sin(t * p.sp + p.ph) * 0.15 * (1 - f);
        ctx.globalAlpha = 0.72 + 0.28 * f;
        ctx.fillStyle = toneColor(p.tone);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.roundRect(-size / 2, -size / 2, size, size, Math.max(1, size * 0.22));
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    const progress = () => {
      const rect = section.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      return span > 0 ? clamp01(-rect.top / span) : 1;
    };

    let raf = 0;
    let running = false;
    const frame = (time: number) => {
      draw(time, formation(progress()));
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const still = () => draw(0, 1);

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: "100px 0px" });
    io.observe(section);
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) still();
    });
    ro.observe(canvas);
    const mo = new MutationObserver(() => {
      readColors();
      if (reduced) still();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    if (reduced) still();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
    };
  }, [count, reduced]);

  return (
    <section
      ref={sectionRef}
      id="daemons"
      aria-labelledby="daemons-title"
      className={reduced ? "relative py-24 sm:py-32" : "relative h-[230vh] sm:h-[260vh]"}
    >
      <div className={reduced ? "flex flex-col" : "sticky top-0 flex h-dvh flex-col overflow-hidden"}>
        <div className="wrap pt-24 text-center sm:pt-28 short:pt-20">
          <h2
            id="daemons-title"
            className="mx-auto max-w-[820px] text-[clamp(30px,4.4vw,54px)] leading-[1.04] font-medium tracking-[-0.04em] text-balance text-fg short:text-[26px]"
          >
            About {rounded} daemons checked in during the last 30 minutes.
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[16px] leading-[1.5] text-pretty text-mute sm:text-[17px] short:hidden">
            Each square is about 1,000 of them, counted from the public registry.
          </p>
        </div>
        <canvas
          ref={canvasRef}
          aria-hidden
          className={reduced ? "mt-6 h-[60vh] w-full" : "min-h-0 w-full flex-1"}
        />
      </div>
    </section>
  );
}
