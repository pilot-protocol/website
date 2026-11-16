"use client";

import { Fragment, useEffect, useState } from "react";
import { LogoMark } from "@/components/logo";
import { CopyButton } from "@/components/pages/security/kit";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { SOURCE_OF, SourceChip } from "./marks";
import { CALLS, OUTPUT, RAW, STEPS, TASK } from "./plan";

/*
 * pilot-mom on the sky site: a short thread on a flat card (kit), set in the hatched half of its split section. Your agent asks
 * in plain English; pilot-mom answers with the plan (two steps in one parallel group), then the calls your agent
 * runs. Everything in it is pilot-mom's real reply from October 2026.
 */

/* Messages arrive: a short rise out of a soft blur. Reduced motion keeps the fade and drops the movement. */
const appear =
  "transition-[opacity,transform,filter] duration-600 ease-(--ease-out) data-[on=false]:translate-y-2 data-[on=false]:opacity-0 data-[on=false]:blur-[4px] motion-reduce:transition-opacity motion-reduce:data-[on=false]:translate-y-0 motion-reduce:data-[on=false]:blur-none";
const bubble = "rounded-[18px] bg-card-2 ring-1 ring-(--sky-card-line) ring-inset";

export function SkyPlan() {
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -30% 0px" });
  const reduced = usePrefersReducedMotion();
  const [played, setPlayed] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    // 1 the ask · 2 typing · 3 the plan · 4 the calls
    const ids = [0, 700, 1800, 2700].map((t, i) => window.setTimeout(() => setPlayed(i + 1), t));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [inView, reduced]);
  const step = reduced && inView ? 4 : played;

  return (
    <div className="sky-card w-full min-w-0 overflow-hidden rounded-[20px]">
      <div className="px-3.5 pt-7 pb-6 sm:px-8 sm:pt-9 sm:pb-8">
        <div ref={ref} className="mx-auto w-full max-w-[520px]">
          {/* 1 · Your agent asks. */}
          <div data-on={step >= 1} className={`ml-auto w-fit max-w-[86%] ${appear}`}>
            <p className="pr-1 text-right text-[12px] leading-4 text-mute">Your agent</p>
            <p className={`${bubble} mt-1.5 rounded-br-[6px] px-4 py-2.5 text-[15px] leading-[1.4] text-pretty text-fg`}>{TASK}</p>
          </div>

          {/* 2–4 · pilot-mom thinks, answers with the plan, then the calls. */}
          <div className="mt-5 flex items-start gap-2.5">
            <span
              data-on={step >= 2}
              className={`mt-[22px] grid size-8 shrink-0 place-items-center rounded-full bg-(--sky-deep) text-white shadow-tile ${appear}`}
            >
              <LogoMark className="size-[17px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p data-on={step >= 2} className={`pl-1 text-[12px] leading-4 text-mute ${appear}`}>
                pilot-mom <span className="text-dim">· Recorded · Oct 2026</span>
              </p>
              <div className="relative mt-1.5">
                <div
                  aria-hidden
                  data-on={step === 2}
                  className={`${bubble} absolute top-0 left-0 flex h-10 items-center gap-1 rounded-tl-[6px] px-4 ${appear}`}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full bg-mute motion-safe:animate-[sa-typing_1.1s_ease-in-out_infinite]"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>

                {/* The plan. */}
                <div data-on={step >= 3} className={`${bubble} rounded-tl-[6px] px-4 pt-3.5 pb-4 sm:px-5 ${appear}`}>
                  <p className="text-[13px] leading-5 text-mute">
                    {STEPS.length} steps · <span className="font-medium text-(--sky-accent)">achievable</span> · workflow
                  </p>
                  <p className="mt-3 text-[12px] leading-4 text-dim">Run together, nothing to wait for</p>
                  <ol className="relative mt-2 flex flex-col gap-3 pl-4">
                    <span aria-hidden className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-(--sky-fill)/70" />
                    {STEPS.map((s) => (
                      <li key={s.id} className="min-w-0">
                        <p className="flex flex-wrap items-center gap-x-2 font-mono text-[13px] leading-5">
                          <span className="text-dim">{s.id}</span>
                          {SOURCE_OF[s.resource] && <SourceChip brand={SOURCE_OF[s.resource]} />}
                          <span className="text-fg">{s.resource}</span>
                        </p>
                        <p className="mt-0.5 text-[13.5px] leading-[1.45] text-pretty text-mute">{s.rationale}</p>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3.5 border-t border-edge pt-3 text-[12.5px] leading-[1.5] text-pretty text-mute">
                    <span className="text-soft">Output:</span> {OUTPUT}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-4 text-dim">Handoff: none for this task</p>
                </div>

                {/* The calls: what your agent actually runs. */}
                <div data-on={step >= 4} className={`${bubble} mt-2 rounded-tl-[6px] px-4 pt-3.5 pb-3 sm:px-5 ${appear}`}>
                  <p className="text-[13px] leading-5 text-mute">Calls for your agent to run</p>
                  <ul className="mt-2 flex flex-col">
                    {CALLS.map((c) => (
                      <li key={c} className="flex items-start gap-2 border-t border-edge py-2 first:border-t-0">
                        <code className="min-w-0 flex-1 font-mono text-[12px] leading-[1.6] break-words text-fg">
                          <span className="text-(--sky-accent) select-none">$ </span>
                          {/* Break opportunities after the JSON commas, so a phone wraps between filters. */}
                          {c.split(",").map((part, i) => (
                            <Fragment key={i}>
                              {i > 0 && (
                                <>
                                  ,<wbr />
                                </>
                              )}
                              {part}
                            </Fragment>
                          ))}
                        </code>
                        <CopyButton value={c} label="Copy call" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <details className="group border-t border-(--sky-card-line) bg-card-2 px-4 py-3 sm:px-6">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-[13px] leading-6 text-mute transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
          <span aria-hidden className="inline-block transition-transform duration-200 ease-(--ease-out) group-open:rotate-90">
            ›
          </span>
          Show the raw reply
        </summary>
        <pre
          tabIndex={0}
          className="no-scrollbar mt-3 mb-1 max-h-[360px] overflow-auto rounded-[10px] bg-card p-4 font-mono text-[12px] leading-[1.65] text-soft ring-1 ring-(--sky-card-line) ring-inset"
        >
          {RAW}
        </pre>
      </details>
    </div>
  );
}
