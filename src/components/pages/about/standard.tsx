"use client";

import { useState, type PointerEvent, type ReactNode } from "react";
import { bySite, isSky, LABEL_SM } from "@/components/page/sky";
import { FLAT_CARD, SkySplit } from "@/components/pages/security/kit";
import { Reveal, SmartLink } from "@/components/ui";

/*
 * The publishing standard, shown on a real page: the July 2026 seed
 * announcement. Each rule points at the part of that page it governs.
 */

type Rule = { n: string; title: string; body: string };

const RULES: Rule[] = [
  {
    n: "1",
    title: "Who created it",
    body: "Articles identify an individual author when one is known and otherwise name the Pilot Protocol editorial team. Technical papers retain their named authors.",
  },
  {
    n: "2",
    title: "How claims are scoped",
    body: "Product content should separate what ships today from roadmap direction. Version-specific commands belong in documentation; architecture and evidence belong in technical references.",
  },
  {
    n: "3",
    title: "How corrections work",
    body: "Readers can report a factual or technical issue through the contact path. Security-sensitive reports use the separate disclosure channel. Material edits should update the visible page date.",
  },
];

function Marker({ n, on }: { n: string; on: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-grid size-[18px] shrink-0 place-items-center font-medium transition-colors duration-200 ${bySite(
        "rounded-[5px] font-mono text-[10.5px]",
        "rounded-full text-[11px] tabular-nums",
      )} ${on ? bySite("bg-lime text-ink", "bg-(--sky-600) text-white") : "bg-fg/12 text-soft"}`}
    >
      {n}
    </span>
  );
}

function Mark({ n, active, children, className = "" }: { n: string; active: string | null; children: ReactNode; className?: string }) {
  const on = active === n;
  return (
    <span
      className={`relative rounded-md transition-[box-shadow,background-color] duration-200 ${
        on
          ? bySite(
              "bg-lime/[0.08] shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-lime)_70%,transparent)]",
              "bg-(--sky-tint) shadow-[0_0_0_1px_var(--sky-400)]",
            )
          : "shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-fg)_14%,transparent)]"
      } ${className}`}
    >
      {children}
    </span>
  );
}

/** The sky site's rule markers: the kit's 24px step dot, blue while its rule is in focus. */
function SkyRules({ active, setActive }: { active: string | null; setActive: (n: string | null) => void }) {
  return (
    <ol className="mt-10 border-t border-(--sky-card-line)" onPointerLeave={() => setActive(null)}>
      {RULES.map((r, i) => (
        <Reveal
          as="li"
          key={r.n}
          delay={i * 60}
          tabIndex={0}
          onPointerEnter={(e: PointerEvent) => e.pointerType === "mouse" && setActive(r.n)}
          onFocus={() => setActive(r.n)}
          onBlur={() => setActive(null)}
          className="grid cursor-default grid-cols-[24px_minmax(0,1fr)] gap-x-3 border-b border-(--sky-card-line) py-4 outline-none focus-visible:bg-fg/[0.03]"
        >
          <span aria-hidden className="sky-step-dot tabular-nums" data-on={active === r.n}>
            {r.n}
          </span>
          <div>
            <h3 className="text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">{r.title}</h3>
            <p className="mt-1.5 text-[14.5px] leading-[1.5] text-pretty text-mute">{r.body}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

export function Standard({ date, head }: { date: string; head?: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);

  const page = (
    <div className={bySite("pp-island", `overflow-hidden ${FLAT_CARD}`)}>
            <div className={`flex h-10 items-center gap-3 border-b px-4 font-mono text-[11.5px] text-dim ${bySite("border-edge", "border-(--sky-card-line)")}`}>
              <span aria-hidden className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-2.5 rounded-full bg-fg/12" />
                ))}
              </span>
              <span className="truncate">pilotprotocol.network/news/pilot-raises-4-5m-seed</span>
              {isSky && (
                <SmartLink
                  href="/news/pilot-raises-4-5m-seed"
                  className="ml-auto shrink-0 rounded-full bg-fg/[0.06] px-2.5 py-1 font-sans text-[12px] leading-4 font-medium text-soft transition-colors duration-200 hover:bg-fg/10 hover:text-fg"
                >
                  Excerpt, as published
                </SmartLink>
              )}
            </div>
            <div className="px-5 py-7 sm:px-9 sm:py-10">
              <p className={`flex flex-wrap items-center gap-x-2 gap-y-2 ${bySite("font-mono text-[12px] text-dim", "text-[13px] text-mute")}`}>
                <Mark n="3" active={active} className="inline-flex items-center gap-2 px-1.5 py-0.5">
                  <Marker n="3" on={active === "3"} />
                  <time dateTime="2026-07-27">{date}</time>
                </Mark>
                <span aria-hidden>·</span>
                <span>4 min read</span>
                <span aria-hidden>·</span>
                <Mark n="1" active={active} className="inline-flex items-center gap-2 px-1.5 py-0.5 text-soft">
                  <Marker n="1" on={active === "1"} />
                  Razvan Roman
                </Mark>
              </p>
              <p className="mt-5 text-[clamp(22px,2.4vw,30px)] leading-[1.12] font-medium tracking-[-0.03em] text-balance text-fg">
                Pilot raises a $4.5M seed round to build the internet for agents
              </p>
              <p className="mt-5 text-[15px] leading-[1.65] text-mute">
                Here&apos;s the part that still surprises me. We didn&apos;t market Pilot to anyone. Agents found it on the
                open web, decided it looked useful, installed it themselves. Around 250,000 are on the network today, and
                most of their owners have no idea.
              </p>
              <Mark n="2" active={active} className="mt-4 block p-3.5">
                <span className="flex gap-3">
                  <Marker n="2" on={active === "2"} />
                  <span className="text-[14px] leading-[1.6] text-soft">
                    <strong className="font-medium text-fg">Metric note:</strong> the launch-era figure above refers to
                    cumulative registered addresses, not a count of unique active agents, users, or customers.
                  </span>
                </span>
              </Mark>
            </div>
    </div>
  );

  if (isSky)
    return (
      <SkySplit
        id="publishing"
        labelledBy="publishing-title"
        text={
          <>
            {head}
            <SkyRules active={active} setActive={setActive} />
          </>
        }
        visual={
          <Reveal className="w-full">
            <figure>{page}</figure>
          </Reveal>
        }
      />
    );

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
      {/* The page, as published. */}
      <Reveal>
        <figure>
          {page}
          <figcaption className={`mt-3 ${LABEL_SM}`}>
            An excerpt from the{" "}
            <SmartLink href="/news/pilot-raises-4-5m-seed" className="text-soft underline decoration-fg/30 underline-offset-2 hover:decoration-fg">
              seed announcement
            </SmartLink>
            , as published.
          </figcaption>
        </figure>
      </Reveal>

      {/* The rules that shaped it. */}
      <ol className="flex flex-col border-t border-edge" onPointerLeave={() => setActive(null)}>
        {RULES.map((r, i) => (
          <Reveal
            as="li"
            key={r.n}
            delay={i * 60}
            tabIndex={0}
            onPointerEnter={(e: PointerEvent) => e.pointerType === "mouse" && setActive(r.n)}
            onFocus={() => setActive(r.n)}
            onBlur={() => setActive(null)}
            className="flex cursor-default gap-4 border-b border-edge py-6 outline-none focus-visible:bg-fg/[0.03]"
          >
            <span className="pt-[3px]">
              <Marker n={r.n} on={active === r.n} />
            </span>
            <div>
              <h3 className="text-[17px] leading-[1.3] font-medium tracking-[-0.015em] text-fg">{r.title}</h3>
              <p className="mt-2 text-[14.5px] leading-[1.55] text-mute">{r.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
