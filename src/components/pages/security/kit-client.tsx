"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

/* The stateful half of the kit (see kit.tsx, which re-exports both). */

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className="pressable grid size-[27px] shrink-0 place-items-center rounded-[5px] text-fg/60 hover:bg-fg/[0.07] hover:text-fg"
    >
      <CopyIcon
        className="col-start-1 row-start-1 size-[13px] transition-[opacity,filter,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0 data-[hidden=true]:blur-[2px]"
        data-hidden={copied}
      />
      <CheckIcon
        className="col-start-1 row-start-1 size-[14px] text-lime-ink transition-[opacity,filter,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0 data-[hidden=true]:blur-[2px]"
        data-hidden={!copied}
      />
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}

/**
 * Steps through `count` states while the element is on screen. `durations` is
 * per step (a stable, module-level array). Picking a step by hand holds it a
 * little longer before the loop carries on.
 */
export function useStepper<T extends Element>(count: number, durations: readonly number[]) {
  const [ref, inView] = useInView<T>({ once: false, margin: "-8% 0px" });
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState({ step: 0, run: 0, manual: false });

  useEffect(() => {
    if (!inView || reduced) return;
    const ms = durations[state.step % durations.length] * (state.manual ? 2.2 : 1);
    const id = window.setTimeout(
      () => setState((s) => ({ step: (s.step + 1) % count, run: s.run + 1, manual: false })),
      ms,
    );
    return () => window.clearTimeout(id);
  }, [inView, reduced, state, count, durations]);

  const go = (step: number) => setState((s) => ({ step, run: s.run + 1, manual: true }));
  return { ref, step: state.step, run: state.run, manual: state.manual, go, inView, reduced };
}

