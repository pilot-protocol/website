"use client";

import { motion } from "motion/react";
import { useRef, type ElementType, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import "./kit.css";

/*
 * The sky site's kit (Figma 233:1195). See kit.css for what each piece looks like and where it comes from.
 * Sections compose these rather than restyling their own panels, tabs and steppers.
 */

/** The flat card: white, a hairline border, 12px corners, no shadow. Add your own padding and radius overrides. */
export const SKY_CARD = "sky-card";

/**
 * The showcase panel: hatched paper in a 1px square frame, with full-width fading hairlines along its top and
 * bottom (turn them off with `rules={false}` where two panels meet).
 */
export function HatchPanel({
  as: Tag = "div",
  rules = true,
  className = "",
  children,
  ...rest
}: {
  as?: ElementType;
  rules?: boolean;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`sky-hatch ${className}`} data-rules={rules} {...rest}>
      {children}
    </Tag>
  );
}

/** A full-width fading hairline, on its own (between sections, above and below a split). */
export function SkyRule({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`sky-rule ${className}`} />;
}

export type SegItem<T extends string> = { id: T; label: ReactNode; num?: number };

/**
 * Segmented tabs: a quiet track with the chosen tab in ink. Roving focus with the arrow keys, Home and End.
 * `role` is "tablist" when the tabs switch a panel (pass `panelId`), "radiogroup" when they pick a mode.
 */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  label,
  layoutId,
  panelId,
  className = "",
}: {
  items: SegItem<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  /** Unique per instance on a page, for the sliding pill. */
  layoutId: string;
  panelId?: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs = Boolean(panelId);

  function onKey(e: KeyboardEvent) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const i = items.findIndex((x) => x.id === value);
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    onChange(items[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div role={tabs ? "tablist" : "radiogroup"} aria-label={label} onKeyDown={onKey} className={`sky-seg ${className}`}>
      {items.map((item, i) => {
        const on = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role={tabs ? "tab" : "radio"}
            aria-selected={tabs ? on : undefined}
            aria-checked={tabs ? undefined : on}
            aria-controls={tabs ? panelId : undefined}
            tabIndex={on ? 0 : -1}
            data-on={on}
            onClick={() => onChange(item.id)}
            className="sky-seg-tab"
          >
            {on && (
              <motion.span
                layoutId={layoutId}
                aria-hidden
                className="sky-seg-pill"
                transition={reduced ? { duration: 0 } : { type: "spring", duration: 0.35, bounce: 0 }}
              />
            )}
            {item.num !== undefined && <span className="sky-seg-num relative">{item.num}</span>}
            <span className="sky-seg-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * One head of the stepper: the number in its dot (blue when it's the step in view) and the title under it, with
 * the line running on to the next step. Lay them out in a grid; `last` drops the line.
 */
export function StepHead({ n, title, on, last = false }: { n: number; title: ReactNode; on: boolean; last?: boolean }) {
  return (
    <div className="relative flex flex-col items-center gap-3 text-center">
      <span className="relative flex w-full justify-center">
        {!last && <span aria-hidden className="sky-step-line absolute top-1/2 left-[calc(50%+20px)] w-[calc(100%-40px)]" />}
        <span className="sky-step-dot relative tabular-nums" data-on={on}>
          {n}
        </span>
      </span>
      <span className="text-[16px] leading-[22px] font-medium tracking-[-0.03em] text-fg">{title}</span>
    </div>
  );
}
