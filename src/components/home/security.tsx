"use client";

import { useEffect, useState } from "react";
import { Reveal, SectionHead, TextLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";
import "./security.css";

type Item = { title: string; body: string; tags?: string };

const PILOT: Item[] = [
  { title: "Identity", body: "A persistent Ed25519 keypair, stable across IP, cloud and container changes.", tags: "Signed handshakes · key rotation" },
  { title: "Encryption", body: "X25519 key exchange and AES-256-GCM per tunnel, with separate nonce spaces and replay checks.", tags: "X25519 · AES-256-GCM" },
  { title: "Trust", body: "Agents start private. A peer becomes reachable after a handshake both sides approve.", tags: "Approve · reject · revoke" },
  { title: "Reachability", body: "STUN and hole punching connect peers directly; when that fails, the beacon relays, still encrypted.", tags: "STUN · relay fallback" },
];

const YOURS: Item[] = [
  { title: "Permissions", body: "What a trusted peer may ask your agent to do." },
  { title: "Spending", body: "Budgets and payments, including any App Store app that costs money." },
  { title: "Approvals", body: "When a person has to sign off before the agent acts." },
  { title: "Data", body: "What the agent sends, to whom, and what it keeps." },
];

/* ---------------- Isometric geometry ---------------- */

const C = Math.cos(Math.PI / 6);
type P = readonly [number, number];
const iso = (x: number, y: number, z: number): P => [(x - y) * C, (x + y) / 2 - z];
const pts = (...p: P[]) => p.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");

function box(x: number, y: number, w: number, d: number, z: number, h: number) {
  return {
    top: pts(iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)),
    right: pts(iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)),
    left: pts(iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)),
  };
}

/** Lays text flat on the top face of a block at height z (reads along the x axis). */
const onTop = (z: number) => `matrix(${C} 0.5 ${-C} 0.5 0 ${-z})`;
/** Lays text on the front-left face (y = d) of a slab, reading along its edge. */
const onEdge = (d: number) => `matrix(${C} 0.5 0 1 ${(-d * C).toFixed(1)} ${d / 2})`;

const SIZE = 300;
const BASE_H = 18;
const BLOCK = 118;
const SLOTS: [number, number][] = [
  [22, 22],
  [160, 22],
  [22, 160],
  [160, 160],
];
const LOW_Z = BASE_H;
const LOW_H = 34;
const UP_Z = LOW_Z + LOW_H + 128;
const UP_H = 16;
const UP_BLOCK_H = 26;

const ORDER = [0, 1, 2, 3]; // back to front; slots 1 and 2 never overlap
/** Item indices: 0–3 Pilot's base, 4–7 the layer you keep. */
const SEQUENCE = [4, 5, 6, 7, 0, 1, 2, 3];

function Block({
  x,
  y,
  z,
  h,
  label,
  tone,
  active,
  onEnter,
  onLeave,
}: {
  x: number;
  y: number;
  z: number;
  h: number;
  label: string;
  tone: "lime" | "plain";
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const b = box(x, y, BLOCK, BLOCK, z, h);
  const lime = tone === "lime";
  return (
    <g className="iso-block" data-active={active} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <polygon points={b.left} style={{ fill: lime ? "var(--iso-lime-left)" : "var(--iso-left)" }} />
      <polygon points={b.right} style={{ fill: lime ? "var(--iso-lime-right)" : "var(--iso-right)" }} />
      <polygon
        className="iso-top"
        points={b.top}
        style={{
          fill: active ? (lime ? "var(--color-lime-hi)" : "var(--color-fg)") : lime ? "var(--iso-lime-top)" : "var(--iso-top)",
          stroke: lime ? "var(--iso-lime-line)" : "var(--iso-line)",
        }}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <text
        className="iso-label"
        transform={onTop(z + h)}
        x={x + BLOCK / 2}
        y={y + BLOCK / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={500}
        letterSpacing="-0.01em"
        style={{ fill: lime ? "var(--color-ink)" : active ? "var(--color-bg)" : "var(--color-fg)" }}
      >
        {label}
      </text>
    </g>
  );
}

function Stack({
  open,
  active,
  setHover,
}: {
  open: boolean;
  active: number | null;
  setHover: (i: number | null) => void;
}) {
  const base = box(0, 0, SIZE, SIZE, 0, BASE_H);
  const glass = box(0, 0, SIZE, SIZE, UP_Z, UP_H);

  // Faint isometric ground grid around the stack.
  const line = (a: P, b: P) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  const grid: string[] = [];
  for (let i = -120; i <= SIZE + 120; i += 30) {
    grid.push(line(iso(i, -120, 0), iso(i, SIZE + 120, 0)));
    grid.push(line(iso(-120, i, 0), iso(SIZE + 120, i, 0)));
  }

  return (
    <svg
      viewBox="-290 -250 580 570"
      className="sec-iso h-auto w-full overflow-visible"
      data-open={open}
      role="img"
      aria-label="Two layers. Pilot secures the base: identity, encryption, trust and reachability. On top, what you keep: permissions, spending, approvals and data."
    >
      <defs>
        <radialGradient id="sec-fade" cx="50%" cy="72%" r="50%">
          <stop offset="0.55" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="sec-mask" maskUnits="userSpaceOnUse" x="-290" y="-250" width="580" height="570">
          <rect x="-290" y="-250" width="580" height="570" fill="url(#sec-fade)" />
        </mask>
      </defs>

      <path d={grid.join("")} mask="url(#sec-mask)" style={{ stroke: "var(--iso-grid)" }} strokeWidth={1} fill="none" />

      {/* Base: what Pilot secures */}
      <polygon points={base.left} style={{ fill: "var(--iso-left)", stroke: "var(--iso-line)" }} strokeWidth={1} strokeLinejoin="round" />
      <polygon points={base.right} style={{ fill: "var(--iso-right)", stroke: "var(--iso-line)" }} strokeWidth={1} strokeLinejoin="round" />
      <polygon points={base.top} style={{ fill: "var(--iso-top)", stroke: "var(--iso-line)" }} strokeWidth={1} strokeLinejoin="round" />
      <text transform={onEdge(SIZE)} x={16} y={-BASE_H / 2} dominantBaseline="central" fontSize={10.5} fontWeight={500} style={{ fill: "var(--color-mute)" }}>
        Pilot secures
      </text>
      {ORDER.map((i) => (
        <Block
          key={PILOT[i].title}
          x={SLOTS[i][0]}
          y={SLOTS[i][1]}
          z={LOW_Z}
          h={LOW_H}
          label={PILOT[i].title}
          tone="lime"
          active={active === i}
          onEnter={() => setHover(i)}
          onLeave={() => setHover(null)}
        />
      ))}

      {/* Upper layer: what you keep, on glass so the base shows through */}
      {/* Focusing a base item turns the upper blocks to glass, so the base shows through. */}
      <g className="iso-upper" data-ghost={active !== null && active < 4}>
        <polygon points={glass.left} style={{ fill: "var(--iso-glass-side)", stroke: "var(--iso-glass-line)" }} strokeWidth={1} strokeLinejoin="round" />
        <polygon points={glass.right} style={{ fill: "var(--iso-glass-side)", stroke: "var(--iso-glass-line)" }} strokeWidth={1} strokeLinejoin="round" />
        <polygon points={glass.top} style={{ fill: "var(--iso-glass)", stroke: "var(--iso-glass-line)" }} strokeWidth={1} strokeLinejoin="round" />
        <text transform={onEdge(SIZE)} x={16} y={-(UP_Z + UP_H / 2)} dominantBaseline="central" fontSize={10} fontWeight={500} style={{ fill: "var(--color-mute)" }}>
          You keep
        </text>
        {ORDER.map((i) => (
          <Block
            key={YOURS[i].title}
            x={SLOTS[i][0]}
            y={SLOTS[i][1]}
            z={UP_Z + UP_H}
            h={UP_BLOCK_H}
            label={YOURS[i].title}
            tone="plain"
            active={active === i + 4}
            onEnter={() => setHover(i + 4)}
            onLeave={() => setHover(null)}
          />
        ))}
      </g>
    </svg>
  );
}

/* ---------------- Lists ---------------- */

function Group({
  title,
  owner,
  tone,
  items,
  offset,
  active,
  setHover,
}: {
  title: string;
  owner: string;
  tone: "lime" | "plain";
  items: Item[];
  offset: number;
  active: number | null;
  setHover: (i: number | null) => void;
}) {
  return (
    <div>
      <p className="flex items-center justify-between gap-4 px-4 text-[13px]">
        <span className="flex items-center gap-2.5 font-medium text-fg">
          <span
            aria-hidden
            className={`size-3 rounded-[3px] ${tone === "lime" ? "bg-lime" : "bg-card shadow-[0_0_0_1px_var(--color-edge-3)]"}`}
          />
          {title}
        </span>
        <span className="text-dim">{owner}</span>
      </p>
      <ul className="mt-2 flex flex-col">
        {items.map((item, i) => {
          const on = active === offset + i;
          return (
            <li
              key={item.title}
              onMouseEnter={() => setHover(offset + i)}
              onMouseLeave={() => setHover(null)}
              data-active={on}
              className="rounded-[14px] px-4 py-3 transition-[background-color,box-shadow] duration-300 ease-(--ease-out) data-[active=true]:bg-card data-[active=true]:shadow-tile"
            >
              <p className="text-[15.5px] leading-[1.35] font-medium text-fg">{item.title}</p>
              <p className="mt-0.5 text-[14.5px] leading-[1.5] text-mute">{item.body}</p>
              {item.tags && <p className="mt-1.5 font-mono text-[11.5px] text-dim">{item.tags}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Security() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-12% 0px" });
  const [openRef, opened] = useInView<HTMLDivElement>({ margin: "0px 0px -25% 0px" });
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  // Walk through the blocks one at a time, top layer first; a pointer on any item takes over.
  useEffect(() => {
    if (!inView || reduced || hover !== null) return;
    const id = window.setInterval(() => setStep((a) => (a + 1) % SEQUENCE.length), 2600);
    return () => window.clearInterval(id);
  }, [inView, reduced, hover]);

  const active = hover ?? (reduced ? null : SEQUENCE[step]);

  return (
    <section id="security" aria-labelledby="security-title" className="py-28 sm:py-36">
      <div className="wrap">
        <SectionHead
          id="security-title"
          title="Private until"
          muted="both sides approve."
          lede="Pilot handles who an agent is, how its traffic is encrypted, who may reach it and how packets get through. What a trusted peer may do once connected is up to you."
        >
          <div className="mt-7">
            <TextLink href={LINKS.security}>Read the security page</TextLink>
          </div>
        </SectionHead>

        <div ref={ref} className="mt-14 grid grid-cols-1 items-center gap-x-14 gap-y-10 sm:mt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <Reveal as="figure" className="mx-auto w-full max-w-[640px] lg:max-w-none">
            <div ref={openRef}>
              <Stack open={opened || reduced} active={active} setHover={setHover} />
            </div>
          </Reveal>
          <Reveal delay={100} className="flex flex-col gap-8">
            <Group title="What you keep" owner="Your application" tone="plain" items={YOURS} offset={4} active={active} setHover={setHover} />
            <Group title="What Pilot secures" owner="Pilot" tone="lime" items={PILOT} offset={0} active={active} setHover={setHover} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
