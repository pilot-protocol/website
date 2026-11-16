"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

export type TermLine = { cmd?: string; out?: ReactNode; note?: string };

const TYPE_MS = 16;
const LINE_MS = 70;

/**
 * Terminal that types its commands and prints their output the first time it
 * scrolls into view. Output is real, recorded from pilotctl.
 */
export function Terminal({
  title,
  lines,
  caption,
  className = "",
  minHeight,
}: {
  title: string;
  lines: TermLine[];
  caption?: string;
  className?: string;
  minHeight?: number;
}) {
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -20% 0px" });
  const reduced = usePrefersReducedMotion();
  const [run, setRun] = useState(0);
  // How far we are: index of the current line, and characters typed into it if it's a command.
  const [pos, setPos] = useState({ line: 0, chars: 0 });

  useEffect(() => {
    if (!inView || reduced) return;
    let line = 0;
    let chars = 0;
    let t: number;
    const tick = () => {
      const current = lines[line];
      if (!current) return;
      if (current.cmd && chars < current.cmd.length) {
        chars++;
        setPos({ line, chars });
        t = window.setTimeout(tick, TYPE_MS + (Math.random() < 0.08 ? 90 : 0));
        return;
      }
      line++;
      chars = 0;
      setPos({ line, chars });
      t = window.setTimeout(tick, current.cmd ? 380 : LINE_MS);
    };
    t = window.setTimeout(tick, 400);
    return () => window.clearTimeout(t);
  }, [inView, reduced, lines, run]);

  const shown = reduced ? { line: lines.length, chars: 0 } : pos;
  const done = shown.line >= lines.length;

  return (
    <figure className={className}>
      <div ref={ref} className="pp-island">
        <div className="flex h-10 items-center gap-4 border-b border-edge px-4">
          <span aria-hidden className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2.5 rounded-full bg-fg/12" />
            ))}
          </span>
          <span className="min-w-0 flex-1 truncate text-center font-mono text-[11.5px] text-dim">{title}</span>
          <button
            type="button"
            onClick={() => {
              setPos({ line: 0, chars: 0 });
              setRun((r) => r + 1);
            }}
            disabled={!done}
            className="pressable font-mono text-[11.5px] text-dim transition-opacity hover:text-fg disabled:opacity-0"
          >
            Replay
          </button>
        </div>
        <pre
          className="no-scrollbar overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.7] text-soft sm:text-[13px]"
          style={{ minHeight }}
        >
          {lines.map((l, i) => {
            if (i > shown.line) return null;
            if (l.cmd) {
              const text = i === shown.line ? l.cmd.slice(0, shown.chars) : l.cmd;
              return (
                <div key={i} className="whitespace-pre text-fg">
                  <span className="text-lime-ink select-none">❯ </span>
                  {text}
                  {i === shown.line && <span className="caret-blink ml-px inline-block h-[1.1em] w-[7px] translate-y-[3px] bg-lime" />}
                </div>
              );
            }
            if (i === shown.line) return null;
            return (
              <div key={i} className={`whitespace-pre ${l.note ? "text-dim" : ""}`}>
                {l.note ?? l.out}
              </div>
            );
          })}
          {done && (
            <div>
              <span className="text-lime-ink select-none">❯ </span>
              <span className="caret-blink inline-block h-[1.1em] w-[7px] translate-y-[3px] bg-lime/80" />
            </div>
          )}
        </pre>
      </div>
      {caption && <figcaption className="mt-3 font-mono text-[11.5px] text-dim">{caption}</figcaption>}
    </figure>
  );
}
