"use client";

import type { CSSProperties } from "react";
import type { TermLine } from "@/components/terminal";
import { useInView } from "@/lib/hooks";

/*
 * A recorded pilotctl session on the sky site: a flat, bordered code card in the page's own theme (kit), its title
 * bar on the card's quieter fill. The lines print in order the first time it scrolls into view (opacity and a 4px
 * rise, 22ms apart); with reduced motion they are simply there.
 *
 * `highlight` marks a run of lines (first and last index) the way the docs mark a block: a sky tint with a blue
 * edge, and the second column of a two-column line (a command's description) in the accent.
 */
export function SkyTerminal({
  title,
  lines,
  tag,
  highlight,
  className = "",
}: {
  title: string;
  lines: TermLine[];
  /** The small note in the header after "Recorded" (when, or how much of the reply is shown). */
  tag?: string;
  highlight?: [number, number];
  className?: string;
}) {
  const [ref, on] = useInView<HTMLDivElement>({ margin: "0px 0px -15% 0px" });
  return (
    <figure className={`sky-card min-w-0 overflow-hidden ${className}`}>
      <div ref={ref}>
        <div className="flex h-11 items-center gap-3 border-b border-(--sky-card-line) bg-card-2 px-4 sm:px-5">
          <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-mute">{title}</span>
          <span className="flex shrink-0 items-center gap-1.5 text-[12px] text-dim">
            <span aria-hidden className="size-1.5 rounded-full bg-(--sky-fill)" />
            Recorded{tag && ` · ${tag}`}
          </span>
        </div>
        <pre tabIndex={0} className="no-scrollbar overflow-x-auto py-4 font-mono text-[12px] leading-[1.75] sm:text-[12.5px]">
          {lines.map((l, i) => {
            const lit = highlight !== undefined && i >= highlight[0] && i <= highlight[1];
            const cols = lit && typeof l.out === "string" ? /^(\s*\S.*?\s{3,})(\S.*)$/.exec(l.out) : null;
            return (
              <div
                key={i}
                data-on={on}
                style={{ "--d": `${Math.min(i, 30) * 22}ms` } as CSSProperties}
                className={`w-max min-w-full border-l-2 pr-5 pl-[14px] whitespace-pre transition-[opacity,transform] duration-500 ease-(--ease-out) [transition-delay:var(--d)] data-[on=false]:translate-y-1 data-[on=false]:opacity-0 motion-reduce:transition-none motion-reduce:data-[on=false]:translate-y-0 motion-reduce:data-[on=false]:opacity-100 sm:pl-[18px] ${
                  lit ? "border-(--sky-fill) bg-(--sky-tint)" : "border-transparent"
                }`}
              >
                {l.cmd ? (
                  <span className="text-fg">
                    <span className="text-(--sky-accent) select-none">$ </span>
                    {l.cmd}
                  </span>
                ) : l.note ? (
                  <span className="text-dim">{l.note}</span>
                ) : cols ? (
                  <span className="text-fg">
                    {cols[1]}
                    <span className="text-(--sky-accent)">{cols[2]}</span>
                  </span>
                ) : (
                  <span className={lit ? "text-fg" : "text-mute"}>{l.out}</span>
                )}
              </div>
            );
          })}
        </pre>
      </div>
    </figure>
  );
}
