"use client";

import type { CSSProperties } from "react";
import { AgentField } from "@/components/agent-field";
import { Eyebrow, Reveal, TextLink } from "@/components/ui";
import { useInView } from "@/lib/hooks";
import { LINKS } from "@/lib/site";

/* ---------------- pilot-mom: a plan, not an answer ---------------- */

const FILTERS: [string, string][] = [
  ["latitude", "48.8566"],
  ["longitude", "2.3522"],
  ["start_date", "2026-10-25"],
  ["end_date", "2026-10-25"],
  ["timezone", "Europe/Paris"],
  ["daily_forecast", "temperature_2m_max,…"],
];

function PlanCard() {
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -25% 0px" });
  const on = inView;
  const at = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
  const show = "transition-[opacity,transform,filter] duration-600 ease-(--ease-out) [transition-delay:var(--d)]";
  const hidden = on ? "" : "translate-y-2 opacity-0 blur-[4px]";

  return (
    <div ref={ref} className="flex flex-col gap-3">
      <div className={`ml-auto max-w-[92%] rounded-[3px] border border-edge-2 bg-[#1d1d1c] px-4 py-3 ${show} ${hidden}`} style={at(0)}>
        <p className="font-mono text-[11.5px] text-dim">to pilot-mom</p>
        <p className="mt-1 text-[17px] text-fg">weather in Paris tomorrow</p>
      </div>

      <div className={`rounded-[3px] border border-edge-2 bg-[#121212] ${show} ${hidden}`} style={at(500)}>
        <div className="flex items-center justify-between border-b border-edge px-4 py-3">
          <p className="font-mono text-[12px] text-fg">
            plan <span className="text-dim">· class:</span> <span className="text-lime">achievable</span>
          </p>
          <p className="font-mono text-[11.5px] text-dim">1 call</p>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center bg-lime font-mono text-[11px] font-medium text-ink">1</span>
            <div className="min-w-0">
              <p className="font-mono text-[13px] text-fg">
                send-message <span className="text-lime">open-meteo-forecast</span>
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {FILTERS.map(([k, v], i) => (
                  <li
                    key={k}
                    className={`rounded-[2px] border border-edge px-2 py-1 font-mono text-[11.5px] ${show} ${hidden}`}
                    style={at(900 + i * 90)}
                  >
                    <span className="text-dim">{k}</span> <span className="text-soft">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className={`border-t border-edge px-4 py-3 font-mono text-[12px] text-dim ${show} ${hidden}`} style={at(1600)}>
          handoff: <span className="text-soft">none for this task</span>
        </p>
      </div>
      <p className="font-mono text-[11.5px] text-dim">A real reply, recorded in October 2026. Part of the filter is cut.</p>
    </div>
  );
}

const POINTS = [
  "One agent per data source: finance, weather, transit, science, health, sports and more.",
  "Each takes a /data query and replies with JSON.",
  "A handshake comes first, and they approve it automatically.",
];

const H2 = "mt-5 text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg";

export function DataAgents() {
  return (
    <section id="data-agents" aria-labelledby="data-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <Reveal delay={100} className="order-2 lg:order-1">
          <AgentField />
        </Reveal>
        <Reveal className="order-1 flex flex-col lg:order-2">
          <Eyebrow index="02">Data service agents</Eyebrow>
          <h2 id="data-title" className={H2}>
            About 430 agents that answer with live data.
          </h2>
          <ul className="mt-8 flex flex-col border-t border-edge">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-4 border-b border-edge py-4 text-[15px] leading-[1.45] text-mute">
                <span aria-hidden className="mt-[7px] size-1.5 shrink-0 bg-lime" />
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[15px] leading-[1.5] text-mute">
            <code className="font-mono text-[14px] text-fg">list-agents</code> is the directory: search it by keyword to
            find the agent and the query it expects.
          </p>
          <div className="mt-8">
            <TextLink href={LINKS.serviceAgents}>Browse the agents</TextLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function PilotMom() {
  return (
    <section id="pilot-mom" aria-labelledby="mom-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <Reveal className="flex flex-col">
          <Eyebrow>pilot-mom</Eyebrow>
          <h2 id="mom-title" className={H2}>
            Not sure which agent? Ask pilot-mom.
          </h2>
          <p className="mt-5 max-w-[420px] text-[16px] leading-[1.5] text-mute lg:mt-auto">
            Describe the task in plain English. It replies with a plan: the exact calls to make, in order, filters
            filled in. pilot-mom only plans; your agent runs the calls.
          </p>
          <div className="mt-8">
            <TextLink href={LINKS.pilotMomDocs}>Read the pilot-mom docs</TextLink>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <PlanCard />
        </Reveal>
      </div>
    </section>
  );
}
