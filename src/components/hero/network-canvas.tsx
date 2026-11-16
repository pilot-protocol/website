"use client";

import { useEffect, useRef } from "react";

/*
 * The hero's network: the five hairlines from the Figma frame, with lime packets
 * running along them. Every so often a packet drops onto another line through a
 * short vertical link (a lookup, then a direct tunnel), and lands with a ping.
 * Clicking a line sends a pair of packets out from the pointer.
 */

const LINES = [4, 76, 260, 444, 484].map((y) => y / 488);
// Where the packets sit in the Figma frame (x as a share of 1680px), so the first frame matches the design.
const SEED: [number, number, number][] = [
  [4, 58 / 1680, 1],
  [3, 1407 / 1680, -1],
  [2, 364 / 1680, 1],
  [1, 245 / 1680, 1],
  [1, 25 / 1680, 1],
  [0, 1167 / 1680, -1],
];

const SIZE = 8;

/** "r, g, b" of a CSS colour (hex or rgb()), as the canvas needs it. */
function toRgb(value: string) {
  const v = value.trim();
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(", ");
  }
  const rgb = v.match(/rgba?\(([^)]+)\)/);
  return rgb ? rgb[1].split(/[\s,/]+/).slice(0, 3).join(", ") : "";
}

/** Halfway between two "r, g, b" colours. */
function mix(a: string, b: string) {
  const x = a.split(",").map(Number);
  const y = b.split(",").map(Number);
  return x.map((n, i) => Math.round((n + y[i]) / 2)).join(", ");
}

type Hop = { to: number; x: number; t: number; dur: number };
type Packet = {
  line: number;
  x: number;
  dir: 1 | -1;
  speed: number;
  len: number;
  hop: Hop | null;
  y: number;
  born: number;
};
type Link = { x: number; y0: number; y1: number; t: number; grow: number };
type Ping = { x: number; y: number; t: number };

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function NetworkCanvas({
  className = "",
  packet,
  line,
  lineAlpha = 0.2,
}: {
  className?: string;
  /** "r, g, b" of the packets and their trails. Defaults to the theme's lime. */
  packet?: string;
  /** "r, g, b" of the hairlines. Defaults to the theme's foreground. */
  line?: string;
  lineAlpha?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Colours follow the theme (and any .pp-invert band) unless the caller pins them.
    let LIME = "";
    let LINE = "";
    function readColors() {
      const css = getComputedStyle(canvas!);
      const lime = toRgb(css.getPropertyValue("--color-lime")) || "198, 242, 78";
      const limeInk = toRgb(css.getPropertyValue("--color-lime-ink")) || lime;
      // On the light theme pure lime is too pale for an 8px square; meet the text lime halfway.
      LIME = packet ?? (lime === limeInk ? lime : mix(lime, limeInk));
      LINE = line ?? (toRgb(css.getPropertyValue("--color-fg")) || "242, 242, 236");
    }
    readColors();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let visible = true;
    let last = 0;
    let nextHop = 1800;
    const pointer = { x: -1, y: -1, active: false };

    const lineY = (i: number) => Math.round(LINES[i] * (h - 1)) + 0.5;
    const narrow = () => w < 640;

    let packets: Packet[] = [];
    const links: Link[] = [];
    const pings: Ping[] = [];

    function makePacket(line: number, x: number, dir: 1 | -1, len = SIZE): Packet {
      return { line, x, dir, len, speed: rand(46, 120) * (narrow() ? 0.7 : 1), hop: null, y: lineY(line), born: 0 };
    }

    function seed() {
      packets = SEED.filter((_, i) => !narrow() || i % 2 === 0).map(([line, fx, dir]) => makePacket(line, fx * w, dir as 1 | -1));
      // One long "stream" packet, like the 48px dash in the Figma bento hero.
      if (!narrow()) packets.push({ ...makePacket(2, w * 0.69, -1, 48), speed: 150 });
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const prevW = w;
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!prevW) seed();
      else for (const p of packets) {
        p.x = (p.x / prevW) * w;
        p.y = lineY(p.line);
      }
      if (!running) draw(0);
    }

    function startHop(now: number) {
      const candidates = packets.filter((p) => !p.hop && p.len === SIZE && p.x > w * 0.12 && p.x < w * 0.88);
      if (!candidates.length) return;
      const p = candidates[Math.floor(Math.random() * candidates.length)];
      const options = LINES.map((_, i) => i).filter((i) => i !== p.line && Math.abs(i - p.line) <= 2);
      const to = options[Math.floor(Math.random() * options.length)];
      const x = Math.round(p.x);
      const dist = Math.abs(lineY(to) - lineY(p.line));
      p.hop = { to, x, t: now, dur: 260 + dist * 2.4 };
      p.x = x;
      links.push({ x, y0: lineY(p.line), y1: lineY(to), t: now, grow: 220 });
    }

    function step(dt: number, now: number) {
      nextHop -= dt;
      if (nextHop <= 0) {
        startHop(now);
        nextHop = rand(1400, 2600);
      }

      for (const p of packets) {
        if (p.hop) {
          const k = Math.min(1, (now - p.hop.t - 160) / p.hop.dur);
          const from = lineY(p.line);
          const to = lineY(p.hop.to);
          p.y = k <= 0 ? from : from + (to - from) * easeInOut(k);
          if (k >= 1) {
            p.line = p.hop.to;
            p.y = to;
            p.hop = null;
            pings.push({ x: p.x, y: to, t: now });
            if (Math.random() < 0.5) p.dir = (p.dir * -1) as 1 | -1;
          }
          continue;
        }
        p.x += (p.dir * p.speed * dt) / 1000;
        const margin = p.len + 180;
        if (p.x > w + margin || p.x < -margin) {
          // Packets the visitor sent just leave; the ambient ones come back.
          if (p.born) {
            p.born = -1;
            continue;
          }
          // Leave one side, come back on another line from the other side.
          p.line = Math.floor(Math.random() * LINES.length);
          p.y = lineY(p.line);
          p.dir = Math.random() < 0.5 ? 1 : -1;
          p.x = p.dir === 1 ? -p.len - rand(0, 120) : w + rand(0, 120);
          p.speed = rand(46, 120) * (narrow() ? 0.7 : 1);
        }
      }

      for (let i = links.length - 1; i >= 0; i--) if (now - links[i].t > 2200) links.splice(i, 1);
      for (let i = pings.length - 1; i >= 0; i--) if (now - pings[i].t > 900) pings.splice(i, 1);
      packets = packets.filter((p) => p.born !== -1);
    }

    function draw(now: number) {
      ctx!.clearRect(0, 0, w, h);

      // Lines, with a soft light where the pointer is.
      for (let i = 0; i < LINES.length; i++) {
        const y = lineY(i);
        ctx!.fillStyle = `rgba(${LINE},${lineAlpha})`;
        ctx!.fillRect(0, y - 0.5, w, 1);
        if (pointer.active && Math.abs(pointer.y - y) < 60) {
          const strength = 1 - Math.abs(pointer.y - y) / 60;
          const g = ctx!.createLinearGradient(pointer.x - 220, 0, pointer.x + 220, 0);
          g.addColorStop(0, `rgba(${LINE},0)`);
          g.addColorStop(0.5, `rgba(${LINE},${Math.min(1, lineAlpha * 2.25) * strength})`);
          g.addColorStop(1, `rgba(${LINE},0)`);
          ctx!.fillStyle = g;
          ctx!.fillRect(pointer.x - 220, y - 0.5, 440, 1);
        }
      }

      // Vertical links: grow from the source line, hold, then fade.
      for (const l of links) {
        const age = now - l.t;
        const k = easeOut(Math.min(1, age / l.grow));
        const fade = age > 1300 ? Math.max(0, 1 - (age - 1300) / 900) : 1;
        const yEnd = l.y0 + (l.y1 - l.y0) * k;
        const g = ctx!.createLinearGradient(0, l.y0, 0, yEnd);
        g.addColorStop(0, `rgba(${LIME},${0.15 * fade})`);
        g.addColorStop(1, `rgba(${LIME},${0.7 * fade})`);
        ctx!.fillStyle = g;
        ctx!.fillRect(Math.round(l.x) + SIZE / 2 - 0.5, Math.min(l.y0, yEnd), 1, Math.abs(yEnd - l.y0));
      }

      // Trails behind packets, lighting up the line they've just crossed.
      for (const p of packets) {
        if (p.hop) continue;
        const trail = Math.min(200, 40 + p.speed * 1.3);
        const tail = p.dir === 1 ? p.x - trail : p.x + p.len + trail;
        const head = p.dir === 1 ? p.x : p.x + p.len;
        const g = ctx!.createLinearGradient(tail, 0, head, 0);
        g.addColorStop(0, `rgba(${LIME},0)`);
        g.addColorStop(1, `rgba(${LIME},0.55)`);
        ctx!.fillStyle = g;
        ctx!.fillRect(Math.min(tail, head), p.y - 0.5, trail, 1);
      }

      // Landing pings.
      for (const pg of pings) {
        const k = (now - pg.t) / 900;
        const s = SIZE + easeOut(k) * 18;
        ctx!.strokeStyle = `rgba(${LIME},${0.6 * (1 - k)})`;
        ctx!.lineWidth = 1;
        ctx!.strokeRect(Math.round(pg.x + SIZE / 2 - s / 2) + 0.5, Math.round(pg.y - s / 2) + 0.5, Math.round(s) - 1, Math.round(s) - 1);
      }

      // Packets.
      ctx!.fillStyle = `rgb(${LIME})`;
      for (const p of packets) {
        ctx!.fillRect(Math.round(p.x), Math.round(p.y - SIZE / 2), p.len, SIZE);
      }
    }

    function frame(t: number) {
      const dt = last ? Math.min(48, t - last) : 16;
      last = t;
      step(dt, t);
      draw(t);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduced || !visible || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    const themeObserver = new MutationObserver(() => {
      readColors();
      if (!running) draw(performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const host = canvas.parentElement!;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = e.pointerType === "mouse" && pointer.y >= -20 && pointer.y <= h + 20;
    };
    const onLeave = () => (pointer.active = false);
    const onDown = (e: PointerEvent) => {
      if (reduced) return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (y < -20 || y > h + 20 || (e.target as HTMLElement).closest("a,button,code")) return;
      let line = 0;
      for (let i = 1; i < LINES.length; i++) if (Math.abs(lineY(i) - y) < Math.abs(lineY(line) - y)) line = i;
      const now = performance.now();
      const px = Math.round(x - SIZE / 2);
      packets.push({ ...makePacket(line, px, 1), speed: 170, born: now }, { ...makePacket(line, px, -1), speed: 170, born: now });
      pings.push({ x: px, y: lineY(line), t: now });
      if (packets.length > 24) packets.splice(0, packets.length - 24);
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
    };
  }, [packet, line, lineAlpha]);

  return <canvas ref={canvasRef} aria-hidden className={`block size-full ${className}`} />;
}
