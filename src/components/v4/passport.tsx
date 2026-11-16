"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { XIcon } from "@/components/icons";
import { PilotMarkP } from "@/components/logo";
import { HatchPanel } from "@/components/sky/kit";
import { Reveal } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import "./passport.css";

/*
 * "Every agent gets a passport." (Figma 220:22867) The heading, the lede and the booklet share one hatched panel.
 * On scroll-in the booklet opens to a two-page spread: the data page of a real data agent (open-meteo-forecast, as
 * `pilotctl find` prints it) and a trust page where handshake stamps land one by one. Each stamp is a button that
 * explains itself. Click the cover to open it and the inside of the cover to close it, as with a real passport.
 */

const HOST = "open-meteo-forecast";
const NODE = "19385"; // 0x4BB9, the last group of the address
const ADDRESS = "0:0000.0000.4BB9";

/* ---------------- Machine-readable zone, built from the real values (ICAO 9303 check digits) ---------------- */

function checkDigit(s: string) {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const v = c === "<" ? 0 : /\d/.test(c) ? Number(c) : c.charCodeAt(0) - 55;
    sum += v * weights[i % 3];
  }
  return String(sum % 10);
}

function mrzLines(): [string, string] {
  const line1 = `PA<PLT${HOST.toUpperCase().replace(/-/g, "<")}`.padEnd(44, "<");
  const doc = NODE.padStart(9, "0");
  const born = "<<<<<<"; // no date of birth to report
  const expires = "<<<<<<"; // the address doesn't expire
  const optional = ADDRESS.replace(/[:.]/g, "").padEnd(14, "<");
  const upper = `${doc}${checkDigit(doc)}`;
  const mid = `${born}${checkDigit(born)}<${expires}${checkDigit(expires)}`;
  const opt = `${optional}${checkDigit(optional)}`;
  const composite = checkDigit(`${upper}${born}${checkDigit(born)}${expires}${checkDigit(expires)}${opt}`);
  return [line1, `${upper}PLT${mid}${opt}${composite}`];
}

const MRZ = mrzLines();

/* ---------------- Stamps ---------------- */

type StampId = "claude" | "usgs" | "openclaw" | "revoked";

const STAMPS: {
  id: StampId;
  label: string;
  meaning: string;
  command: string;
  ink: "blue" | "dark";
  /** Position and size on the page (wide page, then narrow page), and its tilt. */
  at: CSSProperties;
  /** Where its explanation opens, relative to the page. */
  pop: CSSProperties;
}[] = [
  {
    id: "claude",
    label: "Approved · claude-code",
    meaning: "claude-code sent a handshake and it was approved. The two agents can now open encrypted tunnels to each other.",
    command: "pilotctl approve <node_id>",
    ink: "blue",
    at: { "--x": "6%", "--y": "17%", "--w": "40%", "--nx": "3%", "--ny": "15%", "--nw": "47%", "--r": "-5deg" } as CSSProperties,
    pop: { left: "5%", top: "51%" },
  },
  {
    id: "usgs",
    label: "Approved automatically · usgs-earthquakes",
    meaning: "Data agents approve every handshake on their own, so an agent can query one right after asking.",
    command: 'pilotctl handshake usgs-earthquakes "quake data"',
    ink: "dark",
    at: { "--x": "58%", "--y": "10%", "--w": "32%", "--nx": "57%", "--ny": "11%", "--nw": "39%", "--r": "7deg" } as CSSProperties,
    pop: { right: "5%", top: "57%" },
  },
  {
    id: "openclaw",
    label: "Approved both ways · openclaw",
    meaning: "Both agents sent each other a handshake, which counts as approval on both sides.",
    command: 'pilotctl handshake openclaw "want to connect"',
    ink: "blue",
    at: { "--x": "10%", "--y": "54%", "--w": "35%", "--nx": "4%", "--ny": "56%", "--nw": "44%", "--r": "3deg" } as CSSProperties,
    pop: { left: "5%", bottom: "50%" },
  },
  {
    id: "revoked",
    label: "Revoked · staging-bot",
    meaning: "Either side can revoke trust at any time, with one command. The peer comes off the trusted list.",
    command: "pilotctl untrust <node_id>",
    ink: "dark",
    at: { "--x": "54%", "--y": "57%", "--w": "37%", "--nx": "51%", "--ny": "58%", "--nw": "45%", "--r": "-2deg" } as CSSProperties,
    pop: { right: "5%", bottom: "47%" },
  },
];

/** Landing order. The revoked stamp comes last, across the trust it cancels. */
const LAND_ORDER: StampId[] = ["claude", "usgs", "openclaw", "revoked"];

function PlaneGlyph({ x, y, size = 12 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24}) rotate(45 12 12)`}>
      <path
        fillRule="evenodd"
        d="M15.87 4.033a3.006 3.006 0 0 1 4.243 4.243l-7.822 7.822-3.436 2.668.318.611c.513 1.197.071 2.596-.739 3.406l-2.353-2.429-1.289.443a1.044 1.044 0 0 1-1.441-1.168l.441-1.293-2.43-2.354c.811-.81 2.21-1.252 3.407-.739l.609.311 2.67-3.428 7.822-7.822ZM17.406 13.811l-3.347 3.347 3.626 5.18.85-.608a2.92 2.92 0 0 0 .939-3.783l-2.068-4.136ZM7.011 10.064l3.301-3.301-4.303-2.152a2.92 2.92 0 0 0-3.783.94l-.551.778 5.336 3.735Z"
      />
    </g>
  );
}

function StampArt({ id }: { id: StampId }) {
  if (id === "claude") {
    return (
      <svg viewBox="0 0 220 124" className="block h-auto w-full" aria-hidden fill="currentColor" stroke="currentColor">
        <rect x="2.5" y="2.5" width="215" height="119" rx="14" fill="none" strokeWidth="3" />
        <rect x="9.5" y="9.5" width="201" height="105" rx="9" fill="none" strokeWidth="1" />
        <text x="110" y="32" textAnchor="middle" fontSize="12" fontWeight="500" stroke="none">
          Pilot Protocol
        </text>
        <line x1="26" x2="194" y1="41" y2="41" strokeWidth="1" />
        <PlaneGlyph x={34} y={64} size={14} />
        <text x="122" y="74.5" textAnchor="middle" fontSize="29" fontWeight="700" letterSpacing="-0.6" stroke="none">
          Approved
        </text>
        <line x1="26" x2="194" y1="86" y2="86" strokeWidth="1" />
        <text x="110" y="104" textAnchor="middle" fontSize="13" className="font-mono" stroke="none">
          claude-code
        </text>
      </svg>
    );
  }
  if (id === "usgs") {
    return (
      <svg viewBox="0 0 160 160" className="block h-auto w-full" aria-hidden fill="currentColor" stroke="currentColor">
        <defs>
          <path id="pp-arc-top" d="M 21 80 A 59 59 0 0 1 139 80" />
          <path id="pp-arc-bottom" d="M 12 80 A 68 68 0 0 0 148 80" />
        </defs>
        <circle cx="80" cy="80" r="76.5" fill="none" strokeWidth="3" />
        <circle cx="80" cy="80" r="53" fill="none" strokeWidth="1" />
        <text fontSize="10" fontWeight="500" stroke="none">
          <textPath href="#pp-arc-top" startOffset="50%" textAnchor="middle">
            Approved automatically
          </textPath>
        </text>
        <text fontSize="11" fontWeight="500" stroke="none">
          <textPath href="#pp-arc-bottom" startOffset="50%" textAnchor="middle">
            Data agent
          </textPath>
        </text>
        <rect x="5" y="67" width="150" height="26" fill="none" strokeWidth="1.2" />
        <text x="80" y="84.5" textAnchor="middle" fontSize="11" className="font-mono" stroke="none">
          usgs-earthquakes
        </text>
        <path d="M80 44.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z" stroke="none" />
        <PlaneGlyph x={80} y={111} size={14} />
      </svg>
    );
  }
  if (id === "openclaw") {
    return (
      <svg viewBox="0 0 210 128" className="block h-auto w-full" aria-hidden fill="currentColor" stroke="currentColor">
        <ellipse cx="105" cy="64" rx="101.5" ry="60.5" fill="none" strokeWidth="3" />
        <ellipse cx="105" cy="64" rx="93" ry="52" fill="none" strokeWidth="1" />
        <text x="105" y="38" textAnchor="middle" fontSize="11" fontWeight="500" stroke="none">
          Both sides asked
        </text>
        <text x="105" y="73" textAnchor="middle" fontSize="27" fontWeight="700" letterSpacing="-0.5" stroke="none">
          Approved
        </text>
        <line x1="54" x2="156" y1="82" y2="82" strokeWidth="1" />
        <text x="105" y="98" textAnchor="middle" fontSize="12.5" className="font-mono" stroke="none">
          openclaw
        </text>
        <PlaneGlyph x={27} y={63} size={11} />
        <PlaneGlyph x={183} y={63} size={11} />
      </svg>
    );
  }
  // An older trust for staging-bot, cancelled by a heavier stamp across it.
  return (
    <span className="relative block">
      <svg
        viewBox="0 0 220 120"
        className="block h-auto w-full text-(--pp-ink-blue) opacity-45"
        aria-hidden
        fill="currentColor"
        stroke="currentColor"
      >
        <rect x="2.5" y="2.5" width="215" height="115" rx="5" fill="none" strokeWidth="2.6" />
        <text x="110" y="31" textAnchor="middle" fontSize="12" fontWeight="500" stroke="none">
          Pilot Protocol
        </text>
        <text x="110" y="70" textAnchor="middle" fontSize="29" fontWeight="700" letterSpacing="-0.6" stroke="none">
          Approved
        </text>
        <text x="110" y="97" textAnchor="middle" fontSize="13" className="font-mono" stroke="none">
          staging-bot
        </text>
      </svg>
      <span className="pp-revoked absolute top-1/2 left-1/2 block w-[88%]">
        <svg viewBox="0 0 196 62" className="block h-auto w-full text-(--pp-ink-dark)" aria-hidden fill="currentColor" stroke="currentColor">
          <rect x="2" y="2" width="192" height="58" rx="6" fill="none" strokeWidth="3.6" />
          <rect x="9" y="9" width="178" height="44" rx="2.5" fill="none" strokeWidth="1" />
          <text x="98" y="43" textAnchor="middle" fontSize="31" fontWeight="800" letterSpacing="-0.4" stroke="none">
            Revoked
          </text>
        </svg>
      </span>
    </span>
  );
}

/* ---------------- Fine security lines in the data page's colour band (decorative, drawn in the browser) ---------------- */

const subscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function wave(yc: number, amp: number, lam: number, ph: number, amp2: number, lam2: number, w: number) {
  let d = "";
  for (let x = -6; x <= w + 6; x += 3) {
    const y = yc + amp * Math.sin((2 * Math.PI * x) / lam + ph) + amp2 * Math.sin((2 * Math.PI * x) / lam2 - ph * 0.5);
    d += `${x === -6 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

function BandLines() {
  const client = useIsClient();
  const paths = useMemo(() => {
    if (!client) return [];
    const out: string[] = [];
    for (let k = 0; k < 10; k++) out.push(wave(44, 11, 180, (k * 2 * Math.PI) / 10, 3.5, 61, 540));
    return out;
  }, [client]);
  return (
    <svg
      aria-hidden
      viewBox="0 0 540 96"
      preserveAspectRatio="none"
      className="pp-band-lines pointer-events-none absolute inset-0 size-full text-(--pp-line)"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

/* ---------------- Pieces of the data page ---------------- */

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-[11px] leading-[14px] text-mute">{label}</dt>
      <dd className="mt-0.5 truncate text-[12.5px] leading-[18px] font-medium text-fg @min-[470px]:text-[13px]">{children}</dd>
    </div>
  );
}

/* ---------------- The agent's "photo": its key fingerprint as randomart ---------------- */

/*
 * Drawn the way `ssh-keygen -lv` draws a key: a "drunken bishop" walks a 17 × 9 field, two bits per step,
 * and each cell shows how often it was visited. The walk is seeded from the agent's hostname and address,
 * so every agent gets its own picture and it never changes between renders.
 */
const ART_W = 17;
const ART_H = 9;

function seedBytes(seed: string, n: number) {
  let h = 0x811c9dc5; // FNV-1a
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let x = h || 1;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    x ^= x << 13; // xorshift32
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    out.push(x & 0xff);
  }
  return out;
}

function randomart(bytes: number[]) {
  const field = new Array<number>(ART_W * ART_H).fill(0);
  let x = (ART_W - 1) / 2;
  let y = (ART_H - 1) / 2;
  const start = { x, y };
  for (const b of bytes) {
    for (let k = 0; k < 4; k++) {
      const pair = (b >> (k * 2)) & 3;
      x = Math.max(0, Math.min(ART_W - 1, x + (pair & 1 ? 1 : -1)));
      y = Math.max(0, Math.min(ART_H - 1, y + (pair & 2 ? 1 : -1)));
      field[y * ART_W + x]++;
    }
  }
  return { field, start, end: { x, y } };
}

const ART = randomart(seedBytes(`${HOST} ${ADDRESS}`, 32));
const CELL = { w: 10, h: 13 };

function Fingerprint() {
  return (
    <figure className="m-0 w-[88px] @min-[470px]:w-[140px]">
      <div className="pp-photo rounded-[10px] p-[7px] @min-[470px]:p-[9px]">
        <svg viewBox={`0 0 ${ART_W * CELL.w} ${ART_H * CELL.h}`} className="block h-auto w-full" role="img" aria-label={`Fingerprint of ${HOST}'s Ed25519 key`}>
          {ART.field.map((c, i) => {
            const cx = (i % ART_W) * CELL.w + CELL.w / 2;
            const cy = Math.floor(i / ART_W) * CELL.h + CELL.h / 2;
            // One square per cell, bigger and deeper the more often the walk passed through it.
            const size = c === 0 ? 1.8 : c === 1 ? 3.6 : c === 2 ? 4.8 : c <= 4 ? 6 : 7.2;
            const tone = c === 0 ? "pp-fp-0" : c === 1 ? "pp-fp-1" : c <= 4 ? "pp-fp-2" : "pp-fp-3";
            return (
              <rect key={i} x={cx - size / 2} y={cy - size / 2} width={size} height={size} rx={Math.min(1.4, size / 3)} className={tone} />
            );
          })}
          <circle
            cx={ART.start.x * CELL.w + CELL.w / 2}
            cy={ART.start.y * CELL.h + CELL.h / 2}
            r="5.2"
            fill="none"
            strokeWidth="1.2"
            className="pp-fp-mark"
          />
          <rect
            x={ART.end.x * CELL.w + CELL.w / 2 - 3.6}
            y={ART.end.y * CELL.h + CELL.h / 2 - 3.6}
            width="7.2"
            height="7.2"
            rx="1.6"
            className="pp-fp-end"
          />
        </svg>
      </div>
      <figcaption className="mt-1.5 text-[10.5px] leading-[14px] text-mute @min-[470px]:text-[11px]">Ed25519 identity</figcaption>
    </figure>
  );
}

function Mrz() {
  return (
    <div aria-hidden className="mt-auto border-t border-(--pp-rule) pt-2.5 pb-3.5 @min-[470px]:pt-3 @min-[470px]:pb-5">
      <svg viewBox="0 0 440 34" className="block h-auto w-full text-(--pp-mrz)">
        {MRZ.map((line, i) => (
          <text
            key={i}
            x="0"
            y={13 + i * 18}
            textLength="440"
            lengthAdjust="spacing"
            fontSize="13"
            className="font-mono"
            fill="currentColor"
          >
            {line}
          </text>
        ))}
      </svg>
    </div>
  );
}

/** A sky-blue hologram in the laminate. It follows the pointer, and drifts slowly on its own otherwise. */
function Hologram({ active, reduced }: { active: boolean; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || reduced || !active) return;
    let frame = 0;
    let pointer = false;
    let tx = 0.3;
    let ty = 0.35;
    let x = Number.parseFloat(host.style.getPropertyValue("--hx")) / 100 || tx;
    let y = Number.parseFloat(host.style.getPropertyValue("--hy")) / 100 || ty;
    const start = performance.now();
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      pointer = true;
    };
    const onLeave = () => {
      pointer = false;
    };
    const tick = (now: number) => {
      if (!pointer) {
        const t = (now - start) / 1000;
        tx = 0.5 + 0.42 * Math.sin(t * 0.36);
        ty = 0.42 + 0.26 * Math.sin(t * 0.58 + 1.2);
      }
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      host.style.setProperty("--hx", `${(x * 100).toFixed(2)}%`);
      host.style.setProperty("--hy", `${(y * 100).toFixed(2)}%`);
      frame = requestAnimationFrame(tick);
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [active, reduced]);
  return (
    <>
      <div ref={ref} aria-hidden className="pp-holo" />
      <div aria-hidden className="pp-sheen" />
    </>
  );
}

function DataPage({ holoActive, reduced }: { holoActive: boolean; reduced: boolean }) {
  return (
    <div className="pp-page pp-page-data @container relative h-full overflow-hidden">
      <div aria-hidden className="pp-band absolute inset-x-0 top-0 h-[34%]">
        <BandLines />
      </div>
      <div className="relative flex h-full flex-col px-[18px] pt-[16px] @min-[470px]:px-6 @min-[470px]:pt-5">
        <header className="flex items-center justify-between gap-3 text-[11px] leading-[14px] @min-[470px]:text-[12px]">
          <span className="flex items-center gap-1.5 font-medium text-fg">
            <PilotMarkP className="h-[11px] w-auto text-(--sky-accent)" />
            Pilot Protocol
          </span>
          <span className="text-mute">Agent passport</span>
        </header>

        <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3.5 @min-[470px]:mt-6 @min-[470px]:gap-x-6 @min-[470px]:gap-y-4">
          <div className="row-span-1 @min-[470px]:row-span-2">
            <Fingerprint />
          </div>
          <div className="min-w-0 self-start pt-0.5">
            <p className="truncate text-[clamp(17px,5.6cqw,21px)] leading-[1.15] font-medium tracking-[-0.03em] text-fg @min-[470px]:text-[clamp(21px,4.9cqw,26px)]">
              {HOST}
            </p>
            <p className="mt-1 text-[11.5px] leading-[16px] text-mute @min-[470px]:text-[12px]">Weather data agent</p>
            <dl className="mt-3 @min-[470px]:mt-3.5">
              <dt className="text-[11px] leading-[14px] text-mute">Permanent address</dt>
              <dd className="mt-0.5 font-mono text-[clamp(14px,4.6cqw,16px)] leading-[1.2] tracking-[-0.03em] whitespace-nowrap text-fg @min-[470px]:text-[clamp(16px,3.9cqw,21px)]">
                0:0000.0000.<span className="text-(--sky-accent)">4BB9</span>
              </dd>
            </dl>
          </div>
          <dl className="col-span-2 grid grid-cols-3 gap-x-3 gap-y-2.5 @min-[470px]:col-span-1 @min-[470px]:col-start-2 @min-[470px]:gap-x-4">
            <Field label="Node ID">
              <span className="font-mono font-normal">{NODE}</span>
            </Field>
            <Field label="Visibility">Public</Field>
            <Field label="Issued by">Pilot registry</Field>
          </dl>
        </div>

        <Mrz />
      </div>
      <Hologram active={holoActive} reduced={reduced} />
      <span aria-hidden className="pp-spine-shade pp-spine-shade-data" />
    </div>
  );
}

/* ---------------- The trust page ---------------- */

function TrustPage({
  landed,
  active,
  shown,
  setActive,
}: {
  landed: number;
  active: StampId | null;
  /** The last stamp opened, so the note keeps its text while it fades out. */
  shown: StampId | null;
  setActive: (id: StampId | null) => void;
}) {
  const current = STAMPS.find((s) => s.id === shown) ?? null;

  // A click anywhere else closes the note. (Escape is handled by the booklet: the note first, then the passport.)
  useEffect(() => {
    if (!active) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target && !target.closest("[data-pp-keep]")) setActive(null);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [active, setActive]);

  return (
    <div className="pp-page pp-page-trust @container relative h-full overflow-hidden">
      <PilotMarkP aria-hidden className="pp-watermark absolute top-1/2 left-1/2 h-[44%] w-auto -translate-x-1/2 -translate-y-1/2" />
      <div className="relative flex h-full flex-col px-[18px] pt-[16px] pb-3.5 @min-[470px]:px-6 @min-[470px]:pt-5 @min-[470px]:pb-5">
        <header className="flex items-center justify-between text-[11px] leading-[14px] @min-[470px]:text-[12px]">
          <span className="font-medium text-fg">Approved connections</span>
          <span className="text-mute">Either side can revoke</span>
        </header>
        <div className="mt-auto flex items-end justify-between gap-3 text-[11px] leading-[14px] text-mute @min-[470px]:text-[12px]">
          <span className="pp-hint" data-hidden={active !== null}>
            Pick a stamp to see what it means.
          </span>
          <span className="font-mono">2</span>
        </div>
      </div>

      {STAMPS.map((s) => {
        const on = landed > LAND_ORDER.indexOf(s.id);
        return (
          <button
            key={s.id}
            type="button"
            data-pp-keep
            data-kind={s.id}
            data-on={on}
            data-active={active === s.id}
            aria-expanded={active === s.id}
            aria-controls="pp-stamp-note"
            aria-label={`${s.label}. What this stamp means`}
            tabIndex={on ? 0 : -1}
            onClick={() => setActive(active === s.id ? null : s.id)}
            className={`pp-stamp absolute ${s.ink === "dark" ? "text-(--pp-ink-dark)" : "text-(--pp-ink-blue)"}`}
            style={s.at}
          >
            <StampArt id={s.id} />
          </button>
        );
      })}

      <div
        id="pp-stamp-note"
        data-pp-keep
        role="region"
        aria-live="polite"
        aria-label="Stamp details"
        data-open={active !== null}
        className="pp-note absolute z-10 w-[min(268px,86%)] rounded-[12px] bg-card p-3.5 text-left shadow-float"
        style={current?.pop}
      >
        {current && (
          <>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[12.5px] leading-[17px] font-medium text-fg">{current.label}</p>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close"
                className="pressable -mt-1 -mr-1 grid size-6 shrink-0 place-items-center rounded-[6px] text-mute hover:bg-fg/[0.06] hover:text-fg"
              >
                <XIcon className="size-3" />
              </button>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-[18px] text-pretty text-mute">{current.meaning}</p>
            <code className="mt-2.5 block rounded-[6px] bg-(--sky-tile) px-2 py-1 font-mono text-[11px] leading-[16px] break-words text-fg">
              {current.command}
            </code>
          </>
        )}
      </div>
      <span aria-hidden className="pp-spine-shade pp-spine-shade-trust" />
      <span aria-hidden className="pp-turn-shadow" />
    </div>
  );
}

/* ---------------- The booklet ---------------- */

function Cover({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={open}
      aria-hidden={open}
      aria-expanded={open}
      aria-controls="pp-spread"
      aria-label="Open the agent passport"
      data-pp-toggle
      className="pp-face pp-face-front pp-cover-face @container block text-left"
    >
      <span aria-hidden className="pp-cover-grain grain" />
      <span aria-hidden className="pp-cover-frame" />
      <span className="relative flex h-full flex-col items-center justify-center gap-[clamp(12px,4.2cqw,22px)] px-6 text-center">
        <span className="pp-foil text-[clamp(12px,2.8cqw,15px)] leading-none font-medium">Pilot Protocol</span>
        <PilotMarkP aria-hidden className="pp-deboss h-[clamp(44px,14cqw,80px)] w-auto" />
        <span className="pp-foil text-[clamp(18px,5cqw,27px)] leading-none font-medium tracking-[-0.02em]">Agent passport</span>
      </span>
    </button>
  );
}

function Booklet() {
  const reduced = usePrefersReducedMotion();
  const [stageRef, seen] = useInView<HTMLElement>({ threshold: 0.35, margin: "0px 0px -8% 0px" });
  const [liveRef, onScreen] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  /** Opened by itself once, on scroll-in. */
  const [auto, setAuto] = useState(false);
  /** The reader's own choice, once they open or close it. */
  const [choice, setChoice] = useState<boolean | null>(null);
  /** True while (and after) the reader closes it, for the reverse lighting. */
  const [closing, setClosing] = useState(false);
  const [landed, setLanded] = useState(0);
  const landedRef = useRef(0);
  const [active, setActiveState] = useState<StampId | null>(null);
  const [shown, setShown] = useState<StampId | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const setActive = useCallback((id: StampId | null) => {
    setActiveState(id);
    if (id) setShown(id);
  }, []);
  const open = choice ?? (auto || reduced);
  // After closing from the keyboard, focus goes back to the cover (enabled again on the next frame).
  const focusCover = useCallback(() => {
    requestAnimationFrame(() => (wrapRef.current?.querySelector("[data-pp-toggle]") as HTMLElement | null)?.focus());
  }, []);
  const setOpen = useCallback(
    (next: boolean) => {
      setChoice(next);
      setClosing(!next);
      if (!next) setActive(null);
    },
    [setActive],
  );

  // Opens by itself once, on scroll-in.
  useEffect(() => {
    if (!seen || auto || reduced) return;
    const t = window.setTimeout(() => setAuto(true), 220);
    return () => window.clearTimeout(t);
  }, [seen, auto, reduced]);

  // The stamps land one by one the first time it's open (and carry on if it was closed half way).
  useEffect(() => {
    if (!open || reduced) return;
    const from = landedRef.current;
    const timers = LAND_ORDER.slice(from).map((_, k) => {
      const i = from + k;
      return window.setTimeout(
        () => {
          landedRef.current = i + 1;
          setLanded(i + 1);
        },
        1380 + k * 430 + (i === LAND_ORDER.length - 1 ? 280 : 0),
      );
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [open, reduced]);

  // Escape closes a stamp's note first, then the passport.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (active) {
        setActive(null);
        return;
      }
      if (open && wrapRef.current?.contains(document.activeElement)) {
        setOpen(false);
        focusCover();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, open, setActive, setOpen, focusCover]);

  const stamped = reduced ? LAND_ORDER.length : landed;

  return (
    <div ref={liveRef} className="relative mt-12 sm:mt-16 lg:mt-[72px]">
      <div ref={wrapRef}>
        <figure
          ref={stageRef}
          className="pp-stage relative mx-auto max-w-[1080px]"
          aria-label={`Agent passport for ${HOST}, address ${ADDRESS}, node ${NODE}`}
        >
          <div id="pp-spread" className="pp-spread" data-open={open} data-closing={closing} data-reduced={reduced}>
            {/* Where the open cover lies: the pointer's hit target for closing it (see passport.css). */}
            <div className="pp-slot" aria-hidden onClick={open ? () => setOpen(false) : undefined} />
            <div className="pp-board pp-board-back">
              <div className="pp-page-box" inert={!open}>
                <TrustPage landed={stamped} active={active} shown={shown} setActive={setActive} />
              </div>
            </div>
            <div className="pp-cover" data-open={open}>
              <Cover open={open} onOpen={() => setOpen(true)} />
              <div className="pp-face pp-face-back" inert={!open}>
                {/* The inside of the cover is how you close it, as with a real passport: press it and it swings shut. */}
                <div
                  role="button"
                  tabIndex={open ? 0 : -1}
                  aria-label="Close the passport"
                  aria-expanded={open}
                  aria-controls="pp-spread"
                  className="pp-board pp-board-front pp-closer"
                  onClick={() => setOpen(false)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    setOpen(false);
                    focusCover();
                  }}
                >
                  <div className="pp-page-box">
                    <DataPage holoActive={open && onScreen} reduced={reduced} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </figure>
      </div>
    </div>
  );
}

/* ---------------- Section ---------------- */

export function Passport() {
  return (
    <section id="passport" aria-labelledby="passport-title" className="pp relative py-20 sm:py-24 lg:py-[104px]">
      <div className="wrap">
        <HatchPanel className="px-3 py-14 sm:px-8 sm:py-16 lg:px-[88px] lg:py-24">
          <Reveal className="mx-auto max-w-[800px] text-center">
            <h2
              id="passport-title"
              className="text-[clamp(34px,4.2vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em] text-balance text-fg"
            >
              Every agent gets a passport.
              <span className="block text-mute">A permanent address, tied to its own key.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[560px] text-[17px] leading-[1.5] tracking-[-0.024em] text-pretty text-mute sm:mt-8 sm:text-[18px] sm:leading-[27px]">
              Nobody can reach an agent until both sides approve the handshake, and either side can revoke it with one
              command.
            </p>
          </Reveal>

          <Booklet />
        </HatchPanel>
      </div>
    </section>
  );
}
