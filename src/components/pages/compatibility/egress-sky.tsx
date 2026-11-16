"use client";

import { useEffect, useState } from "react";
import { EGRESS } from "@/components/pages/compatibility/data";
import { Tile, TintedMark, type IconName } from "@/components/pages/compatibility/marks";
import { Code, FLAT_CARD, SKY_LABEL as LABEL } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { Reveal } from "@/components/ui";
import type { Brand } from "@/components/v4/logos";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

/*
 * Sky site: the seven egress models as one flat table card. Each row leads with the kind of network (a line icon),
 * names the vendors it means where they have a mark, and shows the verdict as a gate: traffic passing through the
 * network's edge, or stopping at it.
 */

const KIND: Record<string, { icon: IconName; marks?: Brand[] }> = {
  "Open egress": { icon: "wifi", marks: ["docker"] },
  "Default-deny, TCP/443 only": { icon: "plane" },
  "HTTP CONNECT proxy": { icon: "building" },
  "Transparent TLS interception": { icon: "eye", marks: ["fortinet", "paloalto"] },
  "HTTP-proxy-only sandbox": { icon: "cube", marks: ["replit", "devin", "docker"] },
  "Domain-name allowlist": { icon: "list", marks: ["cursor"] },
  "DPI / protocol allowlist": { icon: "wall" },
};

/** Replays every few seconds while the table is on screen. */
function usePulse(ms: number) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setN((v) => v + 1), ms);
    return () => window.clearInterval(id);
  }, [inView, reduced, ms]);
  return { ref, run: inView && !reduced ? n : null };
}

/** The verdict as a gate in the network's edge: a wire through it (open) or up to it (blocked). */
function Gate({ ok, run, delay }: { ok: boolean; run: number | null; delay: number }) {
  const wire = ok ? "M2 10H62" : "M2 10H15";
  return (
    <svg aria-hidden viewBox="0 0 64 20" className="mt-[2px] h-5 w-16 shrink-0 overflow-visible md:mt-0">
      <path d="M2 10H62" fill="none" strokeWidth={1.5} strokeLinecap="round" className="stroke-fg/[0.08]" />
      <path d={wire} fill="none" strokeWidth={1.5} strokeLinecap="round" className={ok ? "stroke-(--sky-fill)/55" : "stroke-fg/25"} />
      {ok && <Beam d={wire} run={run} delay={delay} duration={900} tail={22} width={1.5} />}
      <rect x={29} y={1} width={6} height={18} rx={3} className={ok ? "fill-(--sky-accent)/20" : "fill-fg/45"} />
      {ok ? (
        <circle cx={62} cy={10} r={2.5} className="fill-(--sky-fill)" />
      ) : (
        <path d="M19.5 7.5l5 5m0-5-5 5" strokeWidth={1.6} strokeLinecap="round" className="stroke-fg" />
      )}
    </svg>
  );
}

export function EgressTable() {
  const cols = "md:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,3fr)]";
  const { ref, run } = usePulse(3600);
  return (
    <Reveal delay={60} className={`mt-12 overflow-hidden sm:mt-14 ${FLAT_CARD}`}>
      <div ref={ref}>
        <div className={`hidden gap-8 border-b border-edge px-6 py-4 md:grid ${cols} ${LABEL}`}>
          <span>Model</span>
          <span className="pl-[76px]">Today</span>
          <span>What’s needed</span>
        </div>
        <ul>
          {EGRESS.map((e, i) => {
            const k = KIND[e.model] ?? { icon: "globe" as IconName };
            return (
              <li key={e.model} className={`grid grid-cols-1 gap-3 border-b border-edge px-5 py-5 last:border-b-0 sm:px-6 md:items-center md:gap-8 ${cols}`}>
                <div className="flex min-w-0 items-center gap-3.5">
                  <Tile icon={k.icon} off={!e.ok} />
                  <div className="min-w-0">
                    <p className={`text-[16px] leading-[1.35] font-medium tracking-[-0.015em] ${e.ok ? "text-fg" : "text-soft"}`}>{e.model}</p>
                    <p className="mt-1 text-[13.5px] leading-[1.5] text-mute">
                      {k.marks && (
                        <span aria-hidden className="mr-2 inline-flex translate-y-[2px] items-center gap-1.5 align-baseline">
                          {k.marks.map((b) => (
                            <TintedMark key={b} brand={b} className="size-[14px]" />
                          ))}
                        </span>
                      )}
                      {e.examples}
                    </p>
                  </div>
                </div>
                <p className="flex items-start gap-3 text-[15px] leading-[1.55] text-soft md:items-center">
                  <Gate ok={e.ok} run={run} delay={i * 140} />
                  <span className="sr-only">{e.ok ? "Works:" : "Blocked:"}</span>
                  <span className={e.ok ? "" : "text-mute"}>{e.today}</span>
                </p>
                <p className="text-[14px] leading-[1.5]">
                  <span className="text-mute md:hidden">Needed: </span>
                  {e.needed.startsWith("-") ? (
                    <Code>{e.needed}</Code>
                  ) : (
                    <span className={e.ok ? "text-fg" : "text-dim"}>{e.needed.charAt(0).toUpperCase() + e.needed.slice(1)}</span>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </Reveal>
  );
}
