"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AGENT_CATEGORIES, AGENT_TOTAL } from "@/lib/agents";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

// The order the field walks through on its own: the most recognisable sources first.
const TOUR = ["weather", "finance", "transit", "space", "sports", "flights", "health", "dev", "news", "food"];
const TOUR_MS = 2800;

/**
 * Every agent in the list-agents directory as one 8px square, stacked by
 * category like a bar chart. A query lights its category up and names a few
 * of the agents it returns.
 */
export function AgentField({ className = "" }: { className?: string }) {
  const [active, setActive] = useState(TOUR[0]);
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-15% 0px" });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!inView || hovering || pinned || reduced) return;
    const id = window.setInterval(
      () => setActive((a) => TOUR[(Math.max(0, TOUR.indexOf(a)) + 1) % TOUR.length]),
      TOUR_MS,
    );
    return () => window.clearInterval(id);
  }, [inView, hovering, pinned, reduced]);

  const cat = AGENT_CATEGORIES.find((c) => c.id === active)!;

  return (
    <div
      ref={ref}
      className={`pp-island ${className}`}
      onPointerLeave={() => setHovering(false)}
    >
      <p className="flex items-center gap-3 border-b border-edge px-4 py-3 font-mono text-[12.5px] whitespace-nowrap">
        <span className="text-lime-ink">❯</span>
        <span className="min-w-0 truncate text-dim">
          list-agents <span className="text-faint">/data</span> {"{"}&quot;search&quot;:&quot;
          <span key={cat.id} className="inline-block text-lime-ink motion-safe:animate-[type-in_420ms_steps(8)_both]">
            {cat.id}
          </span>
          &quot;{"}"}
        </span>
      </p>

      <div
        role="group"
        aria-label={`${AGENT_TOTAL} data service agents by category`}
        className="flex flex-wrap items-end gap-x-[18px] gap-y-5 px-4 py-6 sm:px-6"
      >
        {AGENT_CATEGORIES.map((c) => {
          const on = c.id === active;
          return (
            <button
              key={c.id}
              type="button"
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                setHovering(true);
                setActive(c.id);
              }}
              onClick={() => {
                setPinned(true);
                setActive(c.id);
              }}
              aria-pressed={on}
              aria-label={`${c.name}: ${c.count} agents`}
              className="group flex flex-col items-start gap-2 text-left"
            >
              <span className="flex w-[63px] flex-wrap-reverse gap-[3px]" aria-hidden>
                {Array.from({ length: c.count }, (_, i) => (
                  <span
                    key={i}
                    style={{ "--i": i } as CSSProperties}
                    className={`size-2 transition-colors duration-300 ${
                      on ? "bg-lime [transition-delay:calc(var(--i)*9ms)]" : "bg-fg/14 group-hover:bg-fg/30"
                    }`}
                  />
                ))}
              </span>
              <span
                className={`font-mono text-[10.5px] leading-none whitespace-nowrap transition-colors duration-300 ${
                  on ? "text-fg" : "text-dim"
                }`}
              >
                {c.id}
                <sup className="ml-0.5 text-[8.5px] text-faint">{c.count}</sup>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-edge px-4 py-3.5 sm:px-6" aria-live="polite">
        <p className="font-mono text-[12px] text-fg">
          {cat.name} <span className="text-dim">· {cat.count} of {AGENT_TOTAL}</span>
        </p>
        <ul key={cat.id} className="flex flex-wrap gap-1.5">
          {cat.examples.map((name, i) => (
            <li
              key={name}
              style={{ animationDelay: `${120 + i * 70}ms` }}
              className="rounded-md border border-edge-2 px-2 py-1 font-mono text-[11.5px] text-soft motion-safe:animate-[row-in_420ms_var(--ease-out)_both]"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
