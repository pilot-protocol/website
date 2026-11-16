"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { CheckIcon, LockIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { Reveal, SectionHead, TextLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";
import "./essentials.css";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** When a timed element fires (and leaves), as a fraction of the step. */
const at = (t: number, t2?: number): Vars => (t2 === undefined ? { "--t": t } : { "--t": t, "--t2": t2 });

/** The element's size in px, so SVG paths can be drawn 1:1 (dash riders need unscaled lengths). */
function useBox<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, box] as const;
}

/** A faint line with lime segments riding it. */
function RiddenPath({ d, riders, dashed = false }: { d: string; riders: { cls: string; style: Vars }[]; dashed?: boolean }) {
  return (
    <g>
      <path d={d} fill="none" stroke="var(--color-edge-3)" strokeWidth={1.25} strokeDasharray={dashed ? "3 5" : undefined} />
      {riders.map((r, i) => (
        <path
          key={i}
          d={d}
          pathLength={100}
          fill="none"
          stroke="var(--ess-lime)"
          strokeWidth={3}
          strokeLinecap="round"
          className={r.cls}
          style={r.style}
        />
      ))}
    </g>
  );
}

/* ---------------- Shared pieces ---------------- */

/** A logo on a white tile, the way it looks on a home screen. */
function LogoTile({ src, size, full = false, className = "" }: { src: string; size: number; full?: boolean; className?: string }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-[24%] bg-white shadow-tile ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={size} height={size} draggable={false} className={full ? "size-full" : "size-[56%]"} />
    </span>
  );
}

function DaemonTile({ size }: { size: number }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-[24%] bg-ink shadow-tile ring-1 ring-white/10"
      style={{ width: size, height: size }}
    >
      <LogoMark className="h-auto w-[56%] text-lime" />
    </span>
  );
}

const GLYPHS = {
  weather: (
    <>
      <circle cx="9" cy="8.5" r="3.25" />
      <path d="M9 2.25v1.5M2.75 8.5h1.5M4.6 4.1l1.05 1.05M13.4 4.1l-1.05 1.05" />
      <path d="M8.5 20h8.25a3.5 3.5 0 0 0 .3-6.99 5 5 0 0 0-9.5 1.24A2.88 2.88 0 0 0 8.5 20Z" />
    </>
  ),
  quake: <path d="M2 12h3.5l2-5 3 10 3-13 3 11 1.75-3H22" />,
  exchange: <path d="M4 8.5h14.5l-3.5-3.5M20 15.5H5.5L9 19" />,
  beacon: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M7.76 16.24a6 6 0 0 1 0-8.48M16.24 7.76a6 6 0 0 1 0 8.48M4.93 19.07a10 10 0 0 1 0-14.14M19.07 4.93a10 10 0 0 1 0 14.14" />
    </>
  ),
  laptop: <path d="M4.5 6.5h15v9h-15zM2.5 18.5h19" />,
  cloud: <path d="M7 18.5h10a4 4 0 0 0 .35-7.98A5.5 5.5 0 0 0 6.6 11.9 3.3 3.3 0 0 0 7 18.5Z" />,
  box: <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 9 8-4.5M12 12 4 7.5M12 12v9" />,
} as const;

function Glyph({ name, className = "size-4" }: { name: keyof typeof GLYPHS; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {GLYPHS[name]}
    </svg>
  );
}

function GlyphTile({ name, size = 36 }: { name: keyof typeof GLYPHS; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[28%] bg-lime/25 text-lime-ink"
      style={{ width: size, height: size }}
    >
      <Glyph name={name} className="size-[52%]" />
    </span>
  );
}

/* ---------------- 1. Your agent ---------------- */

const AGENTS = [
  { name: "Claude Code", src: "/harness/claude-color.svg" },
  { name: "Codex", src: "/harness/codex.svg", full: true },
  { name: "OpenClaw", src: "/harness/openclaw-color.svg" },
  { name: "Cursor", src: "/harness/cursor.svg" },
];

const PEERS = [
  { host: "open-meteo-forecast", kind: "Weather", glyph: "weather" },
  { host: "usgs-earthquakes", kind: "News", glyph: "quake" },
  { host: "ecb-exchange-rates", kind: "Finance and crypto", glyph: "exchange" },
] as const;

/* Card height and gap of the peer stack, so the fan-out lines land on each card's centre. */
const PEER_H = 58;
const PEER_GAP = 12;
const STACK_H = PEERS.length * PEER_H + (PEERS.length - 1) * PEER_GAP;

function Fan() {
  const [ref, { w }] = useBox<HTMLDivElement>();
  return (
    <div ref={ref} className="relative hidden min-w-[80px] flex-1 self-center md:block lg:max-w-[190px]" style={{ height: STACK_H }}>
      <span className="absolute -top-7 left-1/2 -translate-x-1/2 font-mono text-[11px] whitespace-nowrap text-dim">
        encrypted tunnels
      </span>
      {w > 0 && (
        <svg viewBox={`0 0 ${w} ${STACK_H}`} aria-hidden className="absolute inset-0 size-full overflow-visible">
          {PEERS.map((p, i) => {
            const y = i * (PEER_H + PEER_GAP) + PEER_H / 2;
            const mid = STACK_H / 2;
            return (
              <RiddenPath
                key={p.host}
                d={`M0 ${mid} C ${w * 0.55} ${mid}, ${w * 0.45} ${y}, ${w} ${y}`}
                riders={[{ cls: "ess-dash", style: { "--pk-ms": "2600ms", "--pk-delay": `${600 + i * 380}ms` } }]}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}

function AgentScene() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-5 py-8 md:flex-row md:px-8 lg:px-12">
      {/* Your machine: the agent and its daemon, side by side. */}
      <div className="relative flex shrink-0 items-end rounded-[26px] border border-dashed border-edge-3 bg-bg/60 px-5 pt-11 pb-5 sm:px-7">
        <span className="absolute top-4 left-5 flex items-center gap-1.5 text-[12px] text-mute sm:left-7">
          <Glyph name="laptop" className="size-3.5" />
          Your machine
        </span>
        <figure className="flex w-[96px] flex-col items-center gap-3">
          <span className="grid size-[68px]">
            {AGENTS.map((a, i) => (
              <span
                key={a.name}
                data-first={i === 0}
                className="ess-turn col-start-1 row-start-1"
                style={{ "--turn-delay": `${i * 1600}ms` } as Vars}
              >
                <LogoTile src={a.src} size={68} full={a.full} />
              </span>
            ))}
          </span>
          <span className="grid h-4 w-full text-center text-[13px] font-medium text-fg">
            {AGENTS.map((a, i) => (
              <span
                key={a.name}
                data-first={i === 0}
                className="ess-turn col-start-1 row-start-1 whitespace-nowrap"
                style={{ "--turn-delay": `${i * 1600}ms` } as Vars}
              >
                {a.name}
              </span>
            ))}
          </span>
        </figure>
        <div className="mx-1 mb-[52px] flex flex-col items-center gap-2 sm:mx-2">
          <span className="font-mono text-[11px] text-dim">local IPC</span>
          <div className="ess-wire ess-wire-x relative h-px w-12 bg-edge-3 sm:w-16">
            <span className="ess-pk ess-pk-fwd" style={{ "--pk-ms": "2600ms" } as Vars} />
            <span className="ess-pk ess-pk-back" style={{ "--pk-ms": "2600ms", "--pk-delay": "1300ms" } as Vars} />
          </div>
        </div>
        <figure className="flex flex-col items-center gap-3">
          <DaemonTile size={68} />
          <figcaption className="text-[13px] font-medium whitespace-nowrap text-fg">Pilot daemon</figcaption>
        </figure>
      </div>

      {/* Encrypted tunnels out to the network: a fan on wide screens, a drop on phones. */}
      <div className="relative h-16 w-px shrink-0 md:hidden">
        <div className="ess-wire ess-wire-y absolute inset-0 bg-edge-3">
          <span className="ess-pk ess-pk-fwd" style={{ "--pk-ms": "2200ms", "--pk-delay": "600ms" } as Vars} />
        </div>
        <span className="absolute top-1/2 left-3 -translate-y-1/2 font-mono text-[11px] whitespace-nowrap text-dim">
          encrypted tunnels
        </span>
      </div>
      <Fan />

      <div className="relative w-full max-w-[290px] md:w-[262px] md:max-w-none">
        <ul className="flex flex-col" style={{ gap: PEER_GAP }}>
          {PEERS.map((p) => (
            <li
              key={p.host}
              className="flex items-center gap-3 rounded-[16px] bg-card px-3 shadow-card"
              style={{ height: PEER_H }}
            >
              <GlyphTile name={p.glyph} size={34} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[12.5px] leading-tight text-fg">{p.host}</span>
                <span className="block text-[12px] leading-tight text-mute">{p.kind}</span>
              </span>
              <LockIcon className="size-3 shrink-0 text-lime-ink" />
            </li>
          ))}
        </ul>
        <p className="mt-3 pl-1 text-[12.5px] text-mute md:absolute md:top-full md:left-0">
          and about 430 more data agents
        </p>
      </div>
    </div>
  );
}

/* ---------------- 2. Address ---------------- */

const PLACES = [
  { name: "Laptop on Wi‑Fi", short: "Laptop", ip: "192.168.1.24", glyph: "laptop" },
  { name: "Cloud VM", short: "Cloud VM", ip: "10.0.4.17", glyph: "cloud" },
  { name: "Container", short: "Container", ip: "172.17.0.3", glyph: "box" },
] as const;

const ADDRESS = "0:0000.0000.4BB9";

/** Bars derived from the address, so the pass's code is the same on every render. */
const BARS = Array.from(ADDRESS.replace(/[:.]/g, "") + "pilot19385", (c, i) => ((c.charCodeAt(0) * 7 + i * 13) % 4) + 1);

function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-3 sm:col-span-1" : ""}>
      <dt className="text-[11.5px] text-mute">{label}</dt>
      <dd className="mt-1 truncate font-mono text-[13px] text-fg">{children}</dd>
    </div>
  );
}

function AddressScene() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-5 py-8 sm:gap-8 sm:px-10">
      <div className="relative flex w-full max-w-[580px] flex-col rounded-[24px] bg-card shadow-float md:flex-row">
        <div className="min-w-0 flex-1 p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[13px] font-medium text-fg">
              <LogoMark className="h-3.5 w-auto" />
              Pilot Protocol
            </span>
            <span className="text-[12px] text-mute">Agent pass</span>
          </div>
          <p className="mt-5 text-[11.5px] text-mute sm:mt-7">Address</p>
          <p className="mt-1.5 font-mono text-[clamp(23px,3.4vw,34px)] leading-none tracking-[-0.04em] whitespace-nowrap text-fg">
            0:0000.0000.<span className="text-lime-ink">4BB9</span>
          </p>
          <p className="ess-tick mt-3.5 inline-flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2 text-[12px] font-medium text-fg">
            <CheckIcon className="size-3" />
            Same address everywhere
          </p>
          <dl className="mt-5 grid grid-cols-3 gap-x-4 gap-y-3.5 sm:mt-7 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-4">
            <Field label="Hostname" wide>
              open-meteo-forecast
            </Field>
            <Field label="Node ID">19385</Field>
            <Field label="Visible">public</Field>
            <Field label="Identity">Ed25519</Field>
          </dl>
        </div>

        {/* The tear line, with the two half-circle notches cut out of the card. */}
        <div aria-hidden className="relative h-px shrink-0 md:h-auto md:w-px">
          <span className="absolute inset-x-6 top-0 border-t-[1.5px] border-dashed border-edge-3 md:inset-x-auto md:inset-y-6 md:left-0 md:border-t-0 md:border-l-[1.5px]" />
          <span className="absolute top-0 -left-3 size-6 -translate-y-1/2 rounded-full bg-bg-deep md:-top-3 md:left-0 md:-translate-x-1/2 md:translate-y-0" />
          <span className="absolute top-0 -right-3 size-6 -translate-y-1/2 rounded-full bg-bg-deep md:top-auto md:right-auto md:-bottom-3 md:left-0 md:-translate-x-1/2 md:translate-y-0" />
        </div>

        <div className="flex items-end justify-between gap-4 p-5 sm:p-6 md:w-[178px] md:flex-col md:items-stretch">
          <div>
            <p className="text-[11.5px] text-mute">Running on</p>
            <div className="mt-1.5 grid">
              {PLACES.map((p, i) => (
                <div
                  key={p.name}
                  data-first={i === 0}
                  className="ess-third col-start-1 row-start-1"
                  style={{ "--turn-delay": `${i * 2100}ms` } as Vars}
                >
                  <p className="flex items-center gap-1.5 text-[14px] font-medium whitespace-nowrap text-fg">
                    <Glyph name={p.glyph} className="size-4 text-mute" />
                    {p.name}
                  </p>
                  <p className="mt-1 font-mono text-[12px] text-mute">IP {p.ip}</p>
                </div>
              ))}
            </div>
          </div>
          <svg viewBox={`0 0 ${BARS.reduce((s, w) => s + w + 1.4, 0)} 40`} preserveAspectRatio="none" aria-hidden className="h-11 w-24 shrink-0 text-fg/85 md:w-full">
            {BARS.reduce<{ x: number; els: ReactNode[] }>(
              (acc, w, i) => {
                acc.els.push(<rect key={i} x={acc.x} y={0} width={w * 0.9} height={40} fill="currentColor" />);
                acc.x += w + 1.4;
                return acc;
              },
              { x: 0, els: [] },
            ).els}
          </svg>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-1 rounded-full bg-fg/[0.045] p-1">
        {PLACES.map((p, i) => (
          <span
            key={p.name}
            data-first={i === 0}
            className="ess-third-on flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium whitespace-nowrap"
            style={{ "--turn-delay": `${i * 2100}ms` } as Vars}
          >
            <Glyph name={p.glyph} className="size-3.5" />
            {p.short}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 3. Trust ---------------- */

type Status = { label: string; tone: "plain" | "soft" | "lime"; icon?: "lock" | "check"; t?: number; t2?: number; kind: "out" | "inout" | "in" };

function StatusChip({ s }: { s: Status }) {
  const tone =
    s.tone === "lime" ? "bg-lime text-ink" : s.tone === "soft" ? "bg-lime/25 text-fg" : "bg-fg/[0.06] text-mute";
  const cls = s.kind === "out" ? "ess-out" : s.kind === "inout" ? "ess-inout" : "ess-in";
  return (
    <span
      className={`${cls} col-start-1 row-start-1 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${tone}`}
      style={at(s.t ?? 0, s.t2)}
    >
      {s.icon === "lock" ? <LockIcon className="size-3" /> : <CheckIcon className="size-3" />}
      {s.label}
    </span>
  );
}

const TRUSTED_AT = 0.64;

function TrustPeer({ src, host, role, statuses, children }: { src: string; host: string; role: string; statuses: Status[]; children?: ReactNode }) {
  return (
    <div className="relative w-full max-w-[250px] rounded-[22px] bg-card p-4 shadow-card md:w-[230px]">
      <div className="flex items-center gap-3">
        <LogoTile src={src} size={44} />
        <div className="min-w-0">
          <p className="truncate font-mono text-[13.5px] text-fg">{host}</p>
          <p className="text-[12px] text-mute">{role}</p>
        </div>
      </div>
      <div className="mt-4 grid h-[26px]">
        {statuses.map((s) => (
          <StatusChip key={s.label} s={s} />
        ))}
      </div>
      {children}
    </div>
  );
}

function TrustScene() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-5 py-8 md:flex-row md:px-10 lg:px-14">
      <TrustPeer
        src="/harness/claude-color.svg"
        host="claude-code"
        role="Asks to connect"
        statuses={[
          { label: "Private", tone: "plain", icon: "lock", kind: "out", t: 0.08 },
          { label: "Request signed", tone: "soft", kind: "inout", t: 0.08, t2: TRUSTED_AT },
          { label: "Trusted", tone: "lime", kind: "in", t: TRUSTED_AT },
        ]}
      />

      <div className="relative h-24 w-px shrink-0 md:h-px md:w-auto md:max-w-[280px] md:min-w-[120px] md:flex-1">
        <div className="ess-wire ess-wire-xy absolute inset-0 bg-edge-3">
          <span className="ess-in ess-lime absolute inset-0" style={at(TRUSTED_AT)} />
          {/* The request, then the approval coming back, then traffic both ways. */}
          <span className="ess-pk ess-pk-fwd ess-pk-once" style={{ ...at(0.09), "--pk-ms": "1100ms" } as Vars} />
          <span className="ess-pk ess-pk-back ess-pk-once" style={{ ...at(0.47), "--pk-ms": "1100ms" } as Vars} />
          <span className="ess-pk ess-pk-fwd" style={{ "--pk-ms": "1500ms", "--pk-delay": "calc(var(--dur) * 0.7)" } as Vars} />
          <span className="ess-pk ess-pk-back" style={{ "--pk-ms": "1500ms", "--pk-delay": "calc(var(--dur) * 0.7 + 750ms)" } as Vars} />
        </div>
        <span className="absolute top-1/2 left-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card shadow-tile">
          <LockIcon className="ess-out col-start-1 row-start-1 size-3.5 text-dim" style={at(TRUSTED_AT)} />
          <LockIcon className="ess-in col-start-1 row-start-1 size-3.5 text-lime-ink" style={at(TRUSTED_AT)} />
        </span>
        <span
          className="ess-in absolute top-1/2 left-[calc(50%+28px)] -translate-y-1/2 rounded-full bg-card px-2.5 py-1 text-[12px] font-medium whitespace-nowrap text-fg shadow-tile md:top-[calc(50%+28px)] md:left-1/2 md:-translate-x-1/2 md:translate-y-0"
          style={at(TRUSTED_AT + 0.02)}
        >
          Both sides approved
        </span>
      </div>

      <TrustPeer
        src="/harness/openclaw-color.svg"
        host="openclaw"
        role="Your agent"
        statuses={[
          { label: "Private", tone: "plain", icon: "lock", kind: "out", t: 0.42 },
          { label: "Approved", tone: "soft", kind: "inout", t: 0.42, t2: TRUSTED_AT },
          { label: "Trusted", tone: "lime", kind: "in", t: TRUSTED_AT },
        ]}
      >
        {/* The request, as a notification on your agent's side. */}
        <div
          className="ess-drop absolute bottom-[calc(100%-30px)] left-1/2 z-10 w-[min(292px,calc(100vw-64px))] -translate-x-1/2 md:bottom-[calc(100%+14px)]"
          style={at(0.15, 0.45)}
        >
          <div className="rounded-[20px] bg-card/95 p-3.5 shadow-float ring-1 ring-edge backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <LogoTile src="/harness/claude-color.svg" size={36} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center justify-between text-[11.5px] text-mute">
                  <span>Pilot</span>
                  <span>now</span>
                </p>
                <p className="mt-0.5 text-[14px] leading-snug font-medium text-fg">
                  <span className="font-mono text-[13px]">claude-code</span> wants to connect
                </p>
                <p className="mt-0.5 text-[12px] text-mute">Signed handshake · Ed25519</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] font-medium">
              <span className="grid h-8 place-items-center rounded-[10px] bg-fg/[0.06] text-fg">Reject</span>
              <span className="ess-press relative grid h-8 place-items-center overflow-hidden rounded-[10px] bg-fg text-bg" style={at(0.35)}>
                Approve
                <span className="ess-fade absolute inset-0 flex items-center justify-center gap-1 bg-lime text-ink" style={at(0.36)}>
                  <CheckIcon className="size-3" />
                  Approved
                </span>
              </span>
            </div>
          </div>
        </div>
      </TrustPeer>
    </div>
  );
}

/* ---------------- 4. Tunnels ---------------- */

const PHASES = [
  { label: "STUN", from: 0, to: 0.3 },
  { label: "Hole punch", from: 0.3, to: 0.54 },
  { label: "Direct tunnel", from: 0.54, to: 1 },
];

/** From the top of each NAT frame up to the beacon: the STUN probes, and the relay path if punching fails. */
function StunLines() {
  const [ref, { w, h }] = useBox<HTMLDivElement>();
  const top = h * 0.16 + 30;
  // NAT frames sit higher on phones (see NatFrame) to leave room for the labels underneath.
  const wide = w > 0 && window.matchMedia("(min-width: 768px)").matches;
  const frameTop = h * ((wide ? 0.64 : 0.56) - 0.15);
  return (
    <div ref={ref} className="absolute inset-0">
      {w > 0 && (
        <svg viewBox={`0 0 ${w} ${h}`} aria-hidden className="absolute inset-0 size-full">
          {[
            `M${w * 0.24} ${frameTop} L${w * 0.5 - 8} ${top}`,
            `M${w * 0.76} ${frameTop} L${w * 0.5 + 8} ${top}`,
          ].map((d, i) => (
            <RiddenPath
              key={i}
              d={d}
              dashed
              riders={[
                { cls: "ess-dash ess-pk-once", style: { ...at(0.03 + i * 0.02), "--pk-ms": "1100ms" } },
                { cls: "ess-dash-back ess-pk-once", style: { ...at(0.15 + i * 0.02), "--pk-ms": "1100ms" } },
              ]}
            />
          ))}
        </svg>
      )}
    </div>
  );
}

function NatFrame({ side, children }: { side: "left" | "right"; children: ReactNode }) {
  return (
    <div
      className={`absolute top-[56%] grid h-[30%] w-[46%] md:top-[64%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[24px] border border-dashed border-edge-3 md:w-[32%] ${
        side === "left" ? "left-[24%]" : "left-[76%]"
      }`}
    >
      <span className="absolute -top-[9px] left-4 bg-bg-deep px-1.5 font-mono text-[11px] leading-4 text-dim">NAT</span>
      {children}
    </div>
  );
}

function TunnelScene() {
  return (
    <div className="absolute inset-0">
      <StunLines />

      {/* Beacon: the rendezvous for STUN, and the relay if a direct path can't be punched. */}
      <div className="absolute top-[16%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-[16px] bg-card py-2.5 pr-4 pl-2.5 shadow-card">
        <GlyphTile name="beacon" size={32} />
        <div>
          <p className="text-[13px] leading-tight font-medium text-fg">Beacon</p>
          <p className="text-[11.5px] leading-tight text-mute">STUN · relay</p>
        </div>
      </div>

      <NatFrame side="left">
        <div className="flex w-[88%] flex-col items-center gap-2 rounded-[16px] bg-card p-3 shadow-card md:w-[88%] md:flex-row md:gap-3">
          <DaemonTile size={34} />
          <div className="min-w-0 text-center md:text-left">
            <p className="truncate text-[13px] font-medium text-fg">Your machine</p>
            <p className="ess-in truncate text-[11.5px] text-mute" style={at(0.26)}>
              endpoint found
            </p>
          </div>
        </div>
      </NatFrame>
      <NatFrame side="right">
        <div className="flex w-[88%] flex-col items-center gap-2 rounded-[16px] bg-card p-3 shadow-card md:w-[88%] md:flex-row md:gap-3">
          <GlyphTile name="weather" size={34} />
          <div className="min-w-0 text-center md:text-left">
            <p className="truncate font-mono text-[11px] text-fg xl:text-[12px]">open-meteo-forecast</p>
            <p className="ess-in truncate text-[11.5px] text-mute" style={at(0.28)}>
              endpoint found
            </p>
          </div>
        </div>
      </NatFrame>

      {/* The direct path between the two machines, through both NATs. */}
      <div className="absolute top-[56%] left-[44.2%] h-px w-[11.6%] md:top-[64%] md:left-[38.1%] md:w-[23.8%]">
        <div className="ess-wire ess-wire-x absolute inset-0 bg-edge-2">
          <span className="ess-in ess-lime absolute inset-x-0 -top-px h-[3px] rounded-full" style={at(0.54)} />
          <span className="ess-pk ess-pk-fwd ess-pk-once" style={{ ...at(0.32), "--pk-ms": "900ms" } as Vars} />
          <span className="ess-pk ess-pk-back ess-pk-once" style={{ ...at(0.33), "--pk-ms": "900ms" } as Vars} />
          <span className="ess-pk ess-pk-fwd" style={{ "--pk-ms": "1400ms", "--pk-delay": "calc(var(--dur) * 0.6)" } as Vars} />
          <span className="ess-pk ess-pk-back" style={{ "--pk-ms": "1400ms", "--pk-delay": "calc(var(--dur) * 0.6 + 700ms)" } as Vars} />
        </div>
      </div>
      <div
        className="ess-in absolute top-[78%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[14px] bg-card px-3.5 py-2 text-center shadow-float md:top-[64%] md:-translate-y-[calc(100%+16px)]"
        style={at(0.58)}
      >
        <p className="text-[12.5px] font-medium whitespace-nowrap text-fg">Direct tunnel</p>
        <p className="font-mono text-[11px] whitespace-nowrap text-mute md:max-xl:hidden">X25519 · AES-256-GCM</p>
      </div>
      <p
        className="ess-in absolute top-[85%] left-1/2 hidden -translate-x-1/2 -translate-y-1/2 font-mono text-[11.5px] whitespace-nowrap text-mute md:block"
        style={at(0.7)}
      >
        ping open-meteo-forecast · <span className="text-fg">144.99 ms</span>
      </p>

      <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <ol className="flex gap-1 rounded-full bg-fg/[0.045] p-1">
          {PHASES.map((p, i) => (
            <li key={p.label} className="relative grid">
              <span className="col-start-1 row-start-1 rounded-full px-2.5 py-1 text-[12px] font-medium whitespace-nowrap text-dim">
                {i + 1} {p.label}
              </span>
              <span
                aria-hidden
                className={`${p.to === 1 ? "ess-in" : "ess-inout"} col-start-1 row-start-1 rounded-full bg-card px-2.5 py-1 text-[12px] font-medium whitespace-nowrap text-fg shadow-tile`}
                style={at(p.from, p.to)}
              >
                {i + 1} {p.label}
              </span>
            </li>
          ))}
        </ol>
        <p className="flex items-center gap-2 text-[12px] text-mute">
          <span aria-hidden className="w-5 border-t-[1.5px] border-dashed border-edge-3" />
          Relay fallback, still encrypted
        </p>
      </div>
    </div>
  );
}

/* ---------------- The section ---------------- */

const STEPS = [
  {
    label: "Your agent",
    ms: 6400,
    figure: "4",
    unit: "SDKs, plus pilotctl",
    body: "Your agent talks to a Pilot daemon on its own machine. The daemon finds other agents through the backbone and talks to them over encrypted tunnels.",
    scene: AgentScene,
  },
  {
    label: "Address",
    ms: 6300,
    figure: "48",
    unit: "-bit address",
    body: "Move the agent from your laptop to a cloud VM to a container and it keeps the same address and the same Ed25519 identity.",
    scene: AddressScene,
  },
  {
    label: "Trust",
    ms: 7000,
    figure: "2",
    unit: "sides approve",
    body: "Agents start private. Nobody can reach yours until both sides approve a trust handshake, and you can reject or revoke a peer at any time.",
    scene: TrustScene,
  },
  {
    label: "Tunnels",
    ms: 8000,
    figure: "256",
    unit: "-bit AES-GCM",
    body: "Both machines can sit behind NAT. STUN and hole punching open a direct tunnel, and when that fails the beacon relays the traffic, still encrypted. Every tunnel uses X25519 key exchange and AES-256-GCM.",
    scene: TunnelScene,
  },
];

export function Essentials() {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hover, setHover] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-20% 0px" });
  const reduced = usePrefersReducedMotion();
  const tabs = useRef<HTMLDivElement>(null);
  const running = auto && !reduced;
  const current = STEPS[step];
  const Scene = current.scene;

  // Keep the active pill in view when the row scrolls on phones.
  useEffect(() => {
    const row = tabs.current;
    const tab = row?.children[step] as HTMLElement | undefined;
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: tab.offsetLeft - 20, behavior: "smooth" });
  }, [step]);

  function choose(i: number) {
    setAuto(false);
    setStep(i);
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next = e.key === "Home" ? 0 : e.key === "End" ? STEPS.length - 1 : (step + delta + STEPS.length) % STEPS.length;
    choose(next);
    (tabs.current?.children[next] as HTMLElement | undefined)?.focus();
  }

  return (
    <section id="how-it-works" aria-labelledby="essentials-title" className="py-28 sm:py-36">
      <div className="wrap">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            id="essentials-title"
            title="An address, keys and trust"
            muted="for every agent."
            lede={
              <>
                The daemon and <span className="font-mono text-[0.92em] text-fg">pilotctl</span> put an agent on the
                network. Static binaries with no runtime dependencies, and SDKs for Node, Python, Swift and Go.
              </>
            }
          />
          <Reveal delay={60} className="flex flex-wrap gap-x-6 gap-y-3 lg:pb-1.5">
            <TextLink href={LINKS.gettingStarted}>Getting started</TextLink>
            <TextLink href={LINKS.concepts}>How the protocol works</TextLink>
          </Reveal>
        </div>

        <Reveal delay={100} className="mt-12 sm:mt-16">
          <div
            ref={ref}
            data-paused={!inView || hover}
            onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
            onPointerLeave={() => setHover(false)}
            style={{ "--dur": `${current.ms}ms` } as Vars}
          >
            <div
              ref={tabs}
              role="tablist"
              aria-label="What every agent gets"
              onKeyDown={onKey}
              className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:w-fit sm:rounded-full sm:bg-fg/[0.045] sm:p-1"
            >
              {STEPS.map((s, i) => {
                const active = i === step;
                return (
                  <button
                    key={s.label}
                    type="button"
                    role="tab"
                    id={`ess-tab-${i}`}
                    aria-selected={active}
                    aria-controls="ess-panel"
                    tabIndex={active ? 0 : -1}
                    onClick={() => choose(i)}
                    className="pressable flex h-10 shrink-0 items-center gap-2 rounded-full pr-4 pl-2 text-[14px] font-medium whitespace-nowrap text-mute transition-[background-color,color,box-shadow] duration-300 hover:text-fg aria-selected:bg-card aria-selected:text-fg aria-selected:shadow-tile max-sm:bg-fg/[0.045]"
                  >
                    <span className="relative grid size-6 place-items-center">
                      <svg viewBox="0 0 18 18" aria-hidden className="absolute inset-0 size-full -rotate-90">
                        <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={1.5} />
                        {active && (
                          <circle
                            key={`${step}-${running}`}
                            cx="9"
                            cy="9"
                            r="7"
                            fill="none"
                            stroke="var(--color-lime-ink)"
                            strokeWidth={1.75}
                            strokeLinecap="round"
                            className="ess-ring"
                            data-run={running}
                            onAnimationEnd={() => setStep((n) => (n + 1) % STEPS.length)}
                          />
                        )}
                      </svg>
                      <span className="font-mono text-[11px] tabular-nums">{i + 1}</span>
                    </span>
                    {s.label}
                  </button>
                );
              })}
            </div>

            <div
              id="ess-panel"
              role="tabpanel"
              aria-labelledby={`ess-tab-${step}`}
              className="mt-5 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-12"
            >
              <div
                aria-hidden
                className="ess-stage relative h-[560px] overflow-hidden rounded-[28px] ring-1 ring-edge sm:h-[500px] md:h-[440px] lg:h-[500px]"
              >
                <Scene key={step} />
              </div>
              <div key={step} className="ess-caption flex flex-col xl:justify-end xl:pb-2">
                <p className="flex items-baseline gap-2.5 text-fg">
                  <span className="text-[clamp(72px,9vw,120px)] leading-[0.8] font-medium tracking-[-0.06em] tabular-nums">
                    {current.figure}
                  </span>
                  <span className="text-[17px] font-medium tracking-[-0.01em] text-mute">{current.unit}</span>
                </p>
                <h3 className="mt-7 text-[20px] font-medium tracking-[-0.02em] text-fg">{current.label}</h3>
                <p className="mt-2 max-w-[440px] text-[16px] leading-[1.55] text-mute">{current.body}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
