"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { bySite, isSky, LABEL } from "@/components/page/sky";
import { Glyph, type GlyphName } from "@/components/pages/about/glyphs";
import { useAnchors } from "@/components/pages/about/use-anchors";
import { Beam } from "@/components/sky/beam";
import { Reveal } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { PRINCIPLES } from "./data";

const CYCLE = 8; // seconds for one packet to cross all four filters
const LEAD = 8; // the packet starts this % of the width before the first filter

/** When (in seconds) the packet reaches the filter at the start of column i. */
const passAt = (i: number) => (((LEAD + i * 25) / (100 + LEAD)) * CYCLE).toFixed(2);

export function Filters() {
  const [ref, on] = useInView<HTMLDivElement>({ once: false, margin: "0px" });

  if (isSky) return <SkyFilters />;

  return (
    <div ref={ref} data-on={on} className="roadmap-run">
      {/* Wide: one rail, four gates, a packet that has to get through each of them. */}
      <div className="relative hidden h-16 md:block">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-fg/14" />
        <span aria-hidden className="absolute inset-y-0 right-0" style={{ left: `-${LEAD}%` }}>
          <span
            data-anim
            className={`absolute top-1/2 -mt-1 size-2 motion-reduce:hidden ${bySite("bg-lime", "rounded-full bg-(--sky-600)")}`}
            style={{ animation: `roadmap-pass-x ${CYCLE}s linear infinite` } as CSSProperties}
          />
        </span>
        <div aria-hidden className="absolute inset-0 grid grid-cols-4">
          {PRINCIPLES.map((p, i) => (
            <span key={p.title} className="relative">
              <span
                data-anim
                className={`absolute top-1/2 left-0 h-11 w-[3px] -translate-y-1/2 bg-fg/24 motion-reduce:animate-none! ${isSky ? "rounded-full" : ""}`}
                style={{ animation: `${isSky ? "roadmap-gate-sky" : "roadmap-gate"} ${CYCLE}s linear ${passAt(i)}s infinite` }}
              />
            </span>
          ))}
        </div>
      </div>

      <ol className="grid grid-cols-1 gap-y-10 md:mt-8 md:grid-cols-4">
        {PRINCIPLES.map((p, i) => (
          <Reveal as="li" key={p.title} delay={i * 70} className="relative pl-7 md:pr-8 md:pl-0">
            <span aria-hidden className={`absolute top-0 bottom-0 left-[1px] w-[3px] md:hidden ${bySite("bg-lime", "rounded-full bg-(--sky-400)")}`} />
            <p className={LABEL}>{isSky ? i + 1 : `0${i + 1}`}</p>
            <h3 className="mt-2 text-[18px] leading-[1.25] font-medium tracking-[-0.02em] text-fg">{p.title}</h3>
            <p className="mt-2 max-w-[300px] text-[14.5px] leading-[1.55] text-mute">{p.body}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

/*
 * The sky site: the four filters as gates a change has to pass, in order. Each gate is an object tile (a shield, a
 * magnifier, a plug, a staircase); a change travels the wire into the first gate and on through the rest (the
 * shared beam), and each gate lights as it gets through. Phones get the same gates down a vertical wire. With
 * reduced motion every gate shows lit and nothing travels.
 */
const GATE_GLYPH: GlyphName[] = ["shieldCheck", "magnifier", "plug", "stairs"];
const HOP_MS = 900;
const REST_MS = 1800;

type Seg = { d: string; to: number }; // `to`: the gate it arrives at, or -1 for the way out

function SkyFilters() {
  const [viewRef, on] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const [ref, geo] = useAnchors<HTMLOListElement>();
  const reduced = usePrefersReducedMotion();
  const [cycle, setCycle] = useState(0);
  const [seg, setSeg] = useState(-1); // the segment in flight, -1 when idle
  const [lit, setLit] = useState(0); // how many gates the change has passed
  const rest = useRef<number>(undefined);

  // The wires: into the first gate, between the gates, and out of the last (wide screens); between them (phones).
  const gates = PRINCIPLES.map((_, i) => geo?.at[`gate-${i}`]);
  const segs: Seg[] = [];
  if (geo && gates.every(Boolean)) {
    const g = gates as NonNullable<(typeof gates)[number]>[];
    const across = Math.abs(g[1].y - g[0].y) < 4;
    if (across) {
      const y = g[0].y + g[0].h / 2;
      segs.push({ d: `M0 ${y}H${g[0].x}`, to: 0 });
      for (let i = 0; i < g.length - 1; i++) segs.push({ d: `M${g[i].x + g[i].w} ${y}H${g[i + 1].x}`, to: i + 1 });
      segs.push({ d: `M${g[g.length - 1].x + g[g.length - 1].w} ${y}H${geo.w}`, to: -1 });
    } else {
      const x = g[0].x + g[0].w / 2;
      for (let i = 0; i < g.length - 1; i++) segs.push({ d: `M${x} ${g[i].y + g[i].h}V${g[i + 1].y}`, to: i + 1 });
    }
  }
  const entry = segs[0]?.to === 0;
  const ready = segs.length > 0;

  // Start a pass shortly after the gates come on screen; stop when they leave.
  useEffect(() => {
    if (!on || reduced || !ready) return;
    const id = window.setTimeout(() => {
      setLit(entry ? 0 : 1);
      setSeg(0);
    }, 300);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(rest.current);
      setSeg(-1);
    };
  }, [on, reduced, ready, entry, cycle]);

  function arrive(s: number) {
    const to = segs[s]?.to ?? -1;
    if (to >= 0) setLit(to + 1);
    if (s + 1 < segs.length) setSeg(s + 1);
    else {
      setSeg(-1);
      rest.current = window.setTimeout(() => setCycle((c) => c + 1), REST_MS);
    }
  }

  const passed = (i: number) => reduced || i < lit;

  return (
    <div ref={viewRef} className="roadmap-run">
      <ol ref={ref} className="relative grid grid-cols-1 gap-y-9 md:grid-cols-4 md:gap-x-4 lg:gap-x-6">
        {ready && (
          <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible text-fg" width={geo!.w} height={geo!.h}>
            {entry && (
              <defs>
                {/* The way in and the way out fade towards the panel's edges (in px, as the wires are straight). */}
                <linearGradient id="rm-wire-in" gradientUnits="userSpaceOnUse" x1={0} x2={gates[0]!.x} y1={0} y2={0}>
                  <stop offset="0" stopColor="currentColor" stopOpacity="0" />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0.28" />
                </linearGradient>
                <linearGradient id="rm-wire-out" gradientUnits="userSpaceOnUse" x1={gates[gates.length - 1]!.x + gates[gates.length - 1]!.w} x2={geo!.w} y1={0} y2={0}>
                  <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
            )}
            {segs.map((s, i) => {
              const edge = entry && (i === 0 || i === segs.length - 1);
              return (
                <g key={i} className="text-fg">
                  <path
                    d={s.d}
                    fill="none"
                    strokeWidth={edge ? 1.5 : 1.25}
                    stroke={edge ? `url(#${i === 0 ? "rm-wire-in" : "rm-wire-out"})` : "currentColor"}
                    strokeOpacity={edge ? 1 : 0.2}
                  />
                  <Beam d={s.d} run={seg === i ? `${cycle}-${i}` : null} duration={HOP_MS} width={1.5} tail={56} onArrive={() => arrive(i)} />
                </g>
              );
            })}
          </svg>
        )}
        {PRINCIPLES.map((p, i) => {
          const done = passed(i);
          return (
            <Reveal
              as="li"
              key={p.title}
              delay={i * 70}
              className="relative grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-4 md:flex md:flex-col md:items-center md:text-center"
            >
              <span
                aria-hidden
                data-anchor={`gate-${i}`}
                className={`relative grid size-14 place-items-center rounded-[14px] bg-card shadow-tile transition-[box-shadow,color] duration-300 ease-(--ease-out) ${
                  done ? "text-(--sky-accent) ring-2 ring-(--sky-fill)/70" : "text-fg ring-0"
                }`}
              >
                <Glyph name={GATE_GLYPH[i]} className="size-[22px]" />
                <span
                  className={`absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full text-[11px] leading-none font-medium tabular-nums ring-2 ring-bg transition-colors duration-300 ${
                    done ? "bg-(--sky-fill) text-white" : "rm-dot text-fg"
                  }`}
                >
                  {i + 1}
                </span>
              </span>
              <div className="min-w-0 pt-1 md:pt-0">
                <h3 className="text-[16px] leading-[22px] font-medium tracking-[-0.03em] text-balance text-fg md:mt-4">{p.title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-[1.5] text-pretty text-mute md:mx-auto md:mt-2 md:max-w-[250px] md:text-[14px]">{p.body}</p>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
