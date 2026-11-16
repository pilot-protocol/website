"use client";

import type { CSSProperties } from "react";
import { Command } from "@/components/ui";
import { useInView } from "@/lib/hooks";

export const TASK = "any open safety recalls for a 2020 Honda Accord?";

// pilot-mom's real reply to TASK (October 2026). Each step also carries params, guide_url and source.
export const STEPS = [
  { id: "s1", resource: "nhtsa-recalls", rationale: "NHTSA safety recall campaigns for the 2020 Honda Accord" },
  { id: "s2", resource: "nhtsa-complaints", rationale: "Consumer safety complaints for context on the same model year" },
];

export const CALLS = STEPS.map(
  (s) => `pilotctl send-message ${s.resource} --data '/data {"make":"honda","model":"accord","year":"2020"}' --wait`,
);

/** The plan's `output` field, verbatim. */
export const OUTPUT =
  "s1 recall campaigns (campaign #, summary, consequence, remedy, dates) — answer whether any are open/unremedied; s2 complaints as supporting context";

export const RAW = `$ pilotctl --json send-message pilot-mom \\
    --data 'any open safety recalls for a 2020 Honda Accord?' --wait \\
    | jq '.data.reply.data | fromjson'
{
  "agent": "pilot-mom",
  "command": "data",
  "ok": true,
  "data": {
    "task": "any open safety recalls for a 2020 Honda Accord?",
    "class": "achievable",
    "kind": "workflow",
    "calls": [
      "pilotctl send-message nhtsa-recalls --data '/data {\\"make\\":\\"honda\\",\\"model\\":\\"accord\\",\\"year\\":\\"2020\\"}' --wait",
      "pilotctl send-message nhtsa-complaints --data '/data {\\"make\\":\\"honda\\",\\"model\\":\\"accord\\",\\"year\\":\\"2020\\"}' --wait"
    ],
    "steps": [
      { "id": "s1", "resource": "nhtsa-recalls", "parallel_group": "g1", "depends_on": [],
        "rationale": "NHTSA safety recall campaigns for the 2020 Honda Accord" },
      { "id": "s2", "resource": "nhtsa-complaints", "parallel_group": "g1", "depends_on": [],
        "rationale": "Consumer safety complaints for context on the same model year" }
    ],
    "handoff": [],
    "output": "s1 recall campaigns (campaign #, summary, consequence, remedy, dates) — answer
      whether any are open/unremedied; s2 complaints as supporting context"
  }
}
# trimmed: each step also carries its params, guide_url and source`;

/**
 * pilot-mom's reply drawn as the plan it describes: one task in, two steps in the
 * same parallel group, the ready-to-run calls out.
 */
export function Plan() {
  const [ref, on] = useInView<HTMLDivElement>({ margin: "0px 0px -20% 0px" });
  const at = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
  const show = "transition-[opacity,transform,filter] duration-700 ease-(--ease-out) [transition-delay:var(--d)]";
  const hidden = on ? "" : "translate-y-2 opacity-0 blur-[4px]";

  return (
    <div ref={ref} className="flex flex-col gap-3">
      <div className={`ml-auto max-w-[94%] rounded-[18px] rounded-br-[6px] bg-card px-4 py-3 shadow-card ${show} ${hidden}`} style={at(0)}>
        <p className="font-mono text-[11.5px] text-dim">to pilot-mom</p>
        <p className="mt-1 text-[16px] leading-[1.4] text-fg sm:text-[17px]">{TASK}</p>
      </div>

      <div className={`pp-island ${show} ${hidden}`} style={at(450)}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-edge px-4 py-3">
          <p className="font-mono text-[12px] text-fg">
            plan <span className="text-dim">· class</span> <span className="text-lime-ink">achievable</span>
            <span className="text-dim"> · kind</span> workflow
          </p>
          <p className="font-mono text-[11.5px] text-dim">2 steps · 1 parallel group</p>
        </div>

        {/* The fork: both steps sit in g1 and depend on nothing, so they run together. */}
        <div className="relative px-4 py-5 sm:px-5">
          <p aria-hidden className="mb-2 font-mono text-[11px] text-lime-ink">g1 · parallel</p>
          <ol className="flex flex-col gap-3 pl-6 sm:pl-8">
            {STEPS.map((s, i) => (
              <li key={s.id} className="relative">
                {/* Rail: down from the group label to the last step, with a branch into each. */}
                <span
                  aria-hidden
                  className={`absolute -left-6 w-px origin-top bg-lime/60 motion-safe:[animation:sa-draw-y_600ms_var(--ease-out)_900ms_both] sm:-left-8 ${
                    i === 0 ? "-top-2 -bottom-3" : "-top-px h-[20px]"
                  }`}
                  style={{ animationPlayState: on ? "running" : "paused" }}
                />
                <span
                  aria-hidden
                  className="absolute top-[19px] -left-6 h-px w-6 origin-left bg-lime/60 motion-safe:[animation:sa-draw_450ms_var(--ease-out)_1300ms_both] sm:-left-8 sm:w-8"
                  style={{ animationPlayState: on ? "running" : "paused" }}
                />
                <div className={`rounded-[16px] border border-edge-2 bg-bg px-3.5 py-3 ${show} ${hidden}`} style={at(1350)}>
                  <p className="flex flex-wrap items-baseline gap-x-2.5 font-mono text-[12.5px]">
                    <span className="text-dim">{s.id}</span>
                    <span className="text-fg">{s.resource}</span>
                    <span className="text-faint">depends_on []</span>
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.45] text-mute">{s.rationale}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className={`border-t border-edge px-4 py-4 sm:px-5 ${show} ${hidden}`} style={at(1900)}>
          <p className="font-mono text-[11.5px] text-dim">calls · what your agent runs</p>
          <div className="mt-2.5 flex flex-col gap-2">
            {CALLS.map((c) => (
              <Command key={c} value={c} prefix="$ " label="Copy call" />
            ))}
          </div>
        </div>
        <div className={`grid grid-cols-1 border-t border-edge sm:grid-cols-[auto_minmax(0,1fr)] ${show} ${hidden}`} style={at(2300)}>
          <p className="border-edge px-4 py-3 font-mono text-[11.5px] text-dim sm:border-r sm:px-5">
            handoff <span className="text-soft">[]</span>
          </p>
          <p className="border-t border-edge px-4 py-3 text-[13.5px] leading-[1.5] text-mute sm:border-t-0 sm:px-5">
            <span className="font-mono text-[11.5px] text-dim">output </span>
            {OUTPUT}
          </p>
        </div>
      </div>

      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-mono text-[11.5px] text-dim transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
          <span aria-hidden className="inline-block transition-transform duration-200 group-open:rotate-90">
            ›
          </span>
          A real reply, recorded in October 2026. Show it raw.
        </summary>
        <pre className="no-scrollbar mt-3 overflow-x-auto rounded-[14px] border border-edge-2 bg-bg-deep p-4 font-mono text-[12px] leading-[1.65] text-soft">
          {RAW}
        </pre>
      </details>
    </div>
  );
}
