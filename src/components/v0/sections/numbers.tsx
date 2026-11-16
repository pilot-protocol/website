"use client";

import { LiveDot, Reveal } from "@/components/ui";
import { useInView } from "@/lib/hooks";
import { useStats } from "@/lib/stats";

/** One odometer wheel. clip-path instead of overflow keeps the baseline where text expects it. */
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

function Odometer({ value, on, prefix = "" }: { value: number; on: boolean; prefix?: string }) {
  const text = value.toLocaleString("en-US");
  let digitIndex = 0;
  return (
    <span className="inline-flex leading-none tabular-nums" aria-label={`${prefix}${text}`}>
      {prefix && <span aria-hidden>{prefix}</span>}
      {text.split("").map((ch, i) => {
        if (ch === ",") {
          return (
            <span key={i} aria-hidden>
              ,
            </span>
          );
        }
        const k = digitIndex++;
        return <Digit key={i} value={on ? Number(ch) : 0} delay={k * 70} />;
      })}
    </span>
  );
}

function Stat({
  value,
  approx,
  label,
  note,
  live,
  on,
}: {
  value: number;
  approx?: boolean;
  label: string;
  note: string;
  live?: boolean;
  on: boolean;
}) {
  const shown = approx ? Math.round(value / 1000) * 1000 : value;
  return (
    <div className="relative border-l border-edge-2 pl-5">
      <span aria-hidden className="absolute top-0 -left-px h-4 w-px bg-lime" />
      <p className="text-[clamp(40px,4.4vw,60px)] leading-none font-medium tracking-[-0.04em] text-fg">
        <Odometer value={shown} on={on} prefix={approx ? "~" : ""} />
      </p>
      <p className="mt-4 flex items-center gap-2 text-[15px] font-medium text-fg">
        {label}
        {live && <LiveDot className="ml-1" />}
      </p>
      <p className="mt-2 max-w-[320px] text-[14px] leading-[1.5] text-mute">{note}</p>
    </div>
  );
}

export function Numbers() {
  const stats = useStats();
  const [ref, on] = useInView<HTMLDivElement>({ margin: "0px 0px -15% 0px" });

  return (
    <section id="numbers" aria-labelledby="numbers-title" className="relative border-t border-edge py-24 sm:py-32">
      <span aria-hidden className="absolute -top-1 right-[18%] size-2 bg-lime" />
      <div className="wrap">
        <Reveal>
          <h2 id="numbers-title" className="text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-fg">
            The numbers, and
            <br />
            what each one counts.
          </h2>
        </Reveal>

        <div ref={ref} className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            on={on}
            value={stats.totalNodes}
            approx
            live
            label="Registered addresses"
            note="Every address the public registry has issued since launch, including daemons that have since gone offline."
          />
          <Stat
            on={on}
            value={stats.activeNodes}
            approx
            live
            label="Daemons seen in 30 minutes"
            note="Daemons that sent the registry a heartbeat in the last 30 minutes. A daemon is one running Pilot node."
          />
          <Stat
            on={on}
            value={stats.requestsPerSec}
            live
            label="Registry requests per second"
            note="Registrations, lookups and heartbeats, averaged over about 10 seconds."
          />
          <Stat on={on} value={stats.dataAgents} label="Data service agents" note="Agents listed in the list-agents directory." />
          <Stat on={on} value={stats.apps} label="Apps" note="Apps in the App Store catalogue." />
        </div>
        <p className="mt-14 flex items-center gap-2 font-mono text-[11.5px] text-dim">
          <LiveDot /> Live figures come from the public registry&apos;s stats endpoint and refresh every minute.
        </p>
      </div>
    </section>
  );
}
