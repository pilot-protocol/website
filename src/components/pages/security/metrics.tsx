"use client";

import { useEffect, useState } from "react";
import { CheckIcon, XIcon } from "@/components/icons";
import { ObjTile, Stage, WIRE } from "@/components/pages/security/infra";
import { Code, FLAT_CARD, SectionHead, SKY, SkySplit, Soft } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { LiveDot, Reveal } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { STATS_ENDPOINT } from "@/lib/site";
import { approx, useStats } from "@/lib/stats";

const inline = "text-fg underline decoration-fg/30 underline-offset-[3px] transition-[text-decoration-color] hover:decoration-fg";

export function Metrics() {
  const stats = useStats();
  const rows = [
    {
      field: "total_nodes",
      value: approx(stats.totalNodes),
      label: "Registered addresses (all time)",
      is: "Every address the public registry has issued.",
      not: "A count of people, organizations, customers or agents online.",
    },
    {
      field: "active_nodes",
      value: approx(stats.activeNodes),
      label: "Daemons seen in the last 30 minutes",
      is: "Daemons that sent the registry a heartbeat within its 30-minute stale threshold.",
      not: "A count of machines or AI agents. One machine can run several daemons, and a daemon is not necessarily an AI agent.",
    },
    {
      field: "requests_per_sec",
      value: stats.requestsPerSec.toLocaleString("en-US"),
      label: "Registry requests per second",
      is: "The rate of requests the public registry handles, such as heartbeats, lookups and registrations.",
      not: "Traffic between agents, which never passes through the registry.",
    },
  ];

  const source = (
    <>
      Source:{" "}
      <a href={STATS_ENDPOINT} className={inline}>
        public network telemetry JSON
      </a>
      . Where a page shows requests per hour, it is <Code>requests_per_sec</Code> × 3,600. Build-time values are used when
      the endpoint can’t be reached. These counters have not been independently audited.
    </>
  );

  if (SKY)
    // Sky site (Figma 233:1195): a split. The definitions on paper; the three live counters as one flat card on
    // the hatched half, each with what it counts and what it doesn't.
    return (
      <SkySplit
        id="metrics"
        labelledBy="metrics-title"
        text={
          <SectionHead
            id="metrics-title"
            title={
              <>
                What the live <span className="block text-mute">counters count.</span>
              </>
            }
            lede="Network figures on this site come from the public registry’s telemetry endpoint. Each label says exactly what its counter measures."
          >
            <p className="mt-6 max-w-[480px] text-[14.5px] leading-[1.55] text-pretty text-mute">{source}</p>
          </SectionHead>
        }
        visual={
          <Reveal delay={60} className="w-full max-w-[520px]">
            <div className={`overflow-hidden ${FLAT_CARD}`}>
              <p className="flex items-center gap-3 border-b border-(--sky-card-line) px-5 py-3.5 sm:px-6">
                <ObjTile name="server" size={34} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[14.5px] leading-5 font-medium tracking-[-0.02em] text-fg">Public registry</span>
                  <span className="truncate font-mono text-[11.5px] leading-4 text-mute">telemetry JSON</span>
                </span>
                {stats.live && (
                  <span className="flex items-center gap-2 text-[12.5px] text-mute">
                    <LiveDot /> Live
                  </span>
                )}
              </p>
              <ul>
                {rows.map((r, i) => (
                  <li key={r.field} className="border-b border-(--sky-card-line) px-5 py-5 last:border-b-0 sm:px-6 sm:py-6">
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <p className="font-mono text-[12px] text-mute">{r.field}</p>
                        <p className="mt-2 text-[clamp(32px,3.4vw,40px)] leading-none font-medium tracking-[-0.05em] text-fg tabular-nums">
                          {r.value}
                        </p>
                        <p className="mt-2 text-[15px] leading-6 font-medium tracking-[-0.02em] text-fg">{r.label}</p>
                      </div>
                      <div aria-hidden className="hidden shrink-0 pt-1 sm:block">
                        {i === 0 && <Addresses lit={1} />}
                        {i === 1 && <Addresses lit={stats.totalNodes ? stats.activeNodes / stats.totalNodes : 0.86} clock />}
                        {i === 2 && <Requests />}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col gap-2 text-[14px] leading-[1.5]">
                      <p className="flex gap-2.5 text-soft">
                        <span className="mt-[3px] grid size-4 shrink-0 place-items-center rounded-full bg-(--sky-fill) text-white">
                          <CheckIcon className="size-2.5" />
                          <span className="sr-only">Counts:</span>
                        </span>
                        {r.is}
                      </p>
                      <p className="flex gap-2.5 text-mute">
                        <span className="mt-[3px] grid size-4 shrink-0 place-items-center rounded-full bg-fg/[0.07] text-mute">
                          <XIcon className="size-2" />
                          <span className="sr-only">Is not:</span>
                        </span>
                        {r.not}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        }
      />
    );

  return (
    <section id="metrics" aria-labelledby="metrics-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap">
        <SectionHead
          id="metrics-title"
          kicker="Metric definitions"
          title={
            <>
              What the live <Soft>counters count.</Soft>
            </>
          }
          lede="Network figures on this site come from the public registry’s telemetry endpoint. Each label says exactly what its counter measures."
        />

        <ul className="mt-14 border-t border-edge-2 sm:mt-16">
          {rows.map((r, i) => (
            <Reveal
              as="li"
              key={r.field}
              delay={i * 60}
              className="grid grid-cols-1 gap-6 border-b border-edge py-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
            >
              <div>
                <p className="font-mono text-[12px] text-dim">{r.field}</p>
                <p className="mt-3 text-[clamp(36px,4vw,52px)] leading-none font-medium tracking-[-0.04em] text-fg tabular-nums">
                  {r.value}
                </p>
                <p className="mt-3 flex items-center gap-2.5 text-[15px] font-medium text-fg">
                  {r.label}
                  {stats.live && <LiveDot />}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:pt-6">
                <p className="flex gap-3 text-[15px] leading-[1.5] text-soft">
                  <span className="mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-[5px] bg-lime text-ink">
                    <CheckIcon className="size-3" />
                  </span>
                  <span>
                    <span className="block font-mono text-[11.5px] text-dim">Counts</span>
                    {r.is}
                  </span>
                </p>
                <p className="flex gap-3 text-[15px] leading-[1.5] text-mute">
                  <span className="mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-edge-3 text-mute">
                    <XIcon className="size-2.5" />
                  </span>
                  <span>
                    <span className="block font-mono text-[11.5px] text-dim">Is not</span>
                    {r.not}
                  </span>
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-8 max-w-[860px] text-[14px] leading-[1.6] text-dim">{source}</Reveal>
      </div>
    </section>
  );
}

/** Issued addresses as a block of dots; `lit` is the share drawn in sky (the ones seen in the last 30 minutes). */
function Addresses({ lit, clock = false }: { lit: number; clock?: boolean }) {
  const n = 48;
  const on = Math.round(Math.max(0, Math.min(1, lit)) * n);
  return (
    <span className="relative grid grid-cols-8 gap-[5px] rounded-[12px] p-3 shadow-[0_0_0_1px_var(--sky-card-line)]">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`size-[7px] rounded-full ${clock ? (i < on ? "bg-(--sky-fill)" : "bg-fg/[0.12]") : "bg-fg/40"}`} />
      ))}
      {clock && (
        <span className="absolute -right-2 -bottom-2 rounded-full bg-card px-1.5 py-0.5 font-mono text-[10.5px] leading-none text-mute shadow-[0_0_0_1px_var(--sky-card-line)]">
          30 min
        </span>
      )}
    </span>
  );
}

/** Requests arriving at the registry, one after another, while it's on screen. */
function Requests() {
  const [ref, inView] = useInView<HTMLSpanElement>({ once: false, margin: "0px" });
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 420);
    return () => window.clearInterval(id);
  }, [inView, reduced]);
  const lanes = ["M4 14 C40 14 60 40 104 40", "M4 40 L104 40", "M4 66 C40 66 60 40 104 40"];
  return (
    <span ref={ref} className="block w-[136px]">
      <Stage
        w={136}
        h={80}
        svg={
          <>
            {lanes.map((d) => (
              <path key={d} d={d} className={WIRE} />
            ))}
            {inView && <Beam key={tick} d={lanes[tick % 3]} run={tick} duration={520} tail={28} width={1.5} />}
          </>
        }
      >
        <span className="absolute top-1/2 right-0 -translate-y-1/2">
          <ObjTile name="server" size={36} lit={inView} />
        </span>
      </Stage>
    </span>
  );
}
