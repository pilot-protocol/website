"use client";

import type { CSSProperties } from "react";
import { useInView } from "@/lib/hooks";
import { Glyph } from "./glyphs";
import { AgentTile, SOURCE_OF, SourceTile } from "./marks";

/*
 * list-agents on the sky site: the recorded call, and what came back drawn as the directory would show it. Each
 * result is the agent's hostname with the mark of the source it wraps, its category and its example query. The
 * reply is the real one from October 2026 (3 of 430, for "recall").
 */

const CMD = [
  "pilotctl --json send-message list-agents \\",
  `    --data '/data {"search":"recall","limit":3}' --wait \\`,
  "    | jq '.data.reply.data | fromjson | .items[] | {hostname, category, example}'",
];

const RESULTS = [
  { hostname: "nhtsa-recalls", category: "vehicles", example: '/data {"make": "<make>", "model": "<model>", "year": 1}' },
  { hostname: "openfda-food-recall", category: "health", example: '/data {"query": "<query>"}' },
  { hostname: "openfdadevice-recall", category: "health", example: "/data {}" },
];

export function SkyListAgents() {
  const [ref, on] = useInView<HTMLDivElement>({ margin: "0px 0px -15% 0px" });
  const appear =
    "transition-[opacity,transform] duration-500 ease-(--ease-out) [transition-delay:var(--d)] data-[on=false]:translate-y-1.5 data-[on=false]:opacity-0 motion-reduce:transition-none motion-reduce:data-[on=false]:translate-y-0 motion-reduce:data-[on=false]:opacity-100";

  return (
    <figure ref={ref} className="sky-card w-full min-w-0 overflow-hidden rounded-[20px]">
      <div className="flex h-12 items-center gap-3 border-b border-(--sky-card-line) bg-card-2 px-4 sm:px-5">
        <AgentTile size={26} />
        <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-fg">list-agents</span>
        <span className="flex shrink-0 items-center gap-1.5 text-[12px] text-dim">
          <span aria-hidden className="size-1.5 rounded-full bg-(--sky-fill)" />
          Recorded · 3 of 430
        </span>
      </div>

      <pre tabIndex={0} className="no-scrollbar overflow-x-auto border-b border-(--sky-card-line) px-4 py-3.5 font-mono text-[11.5px] leading-[1.7] text-mute sm:px-5 sm:text-[12px]">
        {CMD.map((l, i) => (
          <div key={i} className="w-max">
            {i === 0 && <span className="text-(--sky-accent) select-none">$ </span>}
            {i === 1 ? (
              <>
                {"    --data '/data "}
                <span className="text-fg">{'{"search":"recall","limit":3}'}</span>
                {"' --wait \\"}
              </>
            ) : (
              l
            )}
          </div>
        ))}
      </pre>

      <ul className="flex flex-col gap-2 p-3 sm:p-4" aria-label="What list-agents returned">
        {RESULTS.map((r, i) => {
          const brand = SOURCE_OF[r.hostname];
          return (
            <li
              key={r.hostname}
              data-on={on}
              style={{ "--d": `${200 + i * 140}ms` } as CSSProperties}
              className={`grid grid-cols-[76px_minmax(0,1fr)] items-center gap-x-3.5 rounded-[14px] bg-card-2 p-3 ring-1 ring-(--sky-card-line) ring-inset sm:gap-x-4 sm:p-3.5 ${appear}`}
            >
              <span className="flex justify-center">{brand && <SourceTile brand={brand} size={40} />}</span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="font-mono text-[13.5px] leading-5 text-fg">{r.hostname}</span>
                  <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-(--sky-tint) pr-2 pl-1.5 text-[12px] font-medium text-(--sky-accent)">
                    <Glyph name={r.category} className="size-3" />
                    {r.category}
                  </span>
                </span>
                <span className="mt-1 block font-mono text-[11.5px] leading-[1.55] break-words text-mute">{r.example}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
