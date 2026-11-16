"use client";

import type { ReactNode } from "react";
import { Tile } from "@/components/pages/compatibility/marks";
import { FLAT_CODE, SectionHead, SKY, SkySplit, useStepper } from "@/components/pages/security/kit";
import { Reveal, TextLink } from "@/components/ui";
import { sourceUrl } from "./data";

/*
 * A real skill file, trimmed: skills/pilot-chat/SKILL.md from
 * github.com/TeoSlayer/pilot-skills. Three parts carry the weight, so they're labelled.
 */

const K = ({ children }: { children: ReactNode }) => <span className="text-dim">{children}</span>;
const C = ({ children }: { children: ReactNode }) => <span className="text-fg">{children}</span>;
const H = ({ children }: { children: ReactNode }) => <span className="text-lime-ink">{children}</span>;

const REGIONS: { label: string; note: string; lines: ReactNode[] }[] = [
  {
    label: "When to use it",
    note: "A one-line description and the cases it’s for.",
    lines: [
      <K key="a">---</K>,
      <>
        <K>name:</K> pilot-chat
      </>,
      <>
        <K>description:</K> &gt;
      </>,
      "  Send and receive text messages between agents over the Pilot Protocol network.",
      "",
      "  Use this skill when:",
      "  1. You need direct 1:1 communication with another agent",
      "  2. You want to ask a question or exchange short text messages",
      "  3. You need simple request-response interactions",
    ],
  },
  {
    label: "What it needs",
    note: "pilotctl on the PATH and a running daemon.",
    lines: [
      <>
        <K>compatibility:</K> &gt;
      </>,
      "  Requires pilot-protocol skill and pilotctl binary on PATH.",
      "  The daemon must be running (pilotctl daemon start).",
      <K key="b">---</K>,
    ],
  },
  {
    label: "What to run",
    note: "The exact pilotctl commands for the job.",
    lines: [
      <H key="c"># pilot-chat</H>,
      "",
      <H key="d">## Commands</H>,
      "",
      <K key="e">### Send data message</K>,
      <C key="f">pilotctl --json send-message &lt;hostname&gt; --data &quot;&lt;text&gt;&quot;</C>,
      "",
      <K key="g">### Receive messages</K>,
      <C key="h">pilotctl --json inbox</C>,
    ],
  },
];

export function Anatomy() {
  if (SKY) return <SkyAnatomy />;
  return (
    <section aria-labelledby="anatomy-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap">
        <Reveal className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-end">
          <h2 id="anatomy-title" className="text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg">
            One skill, one file.
          </h2>
          <div>
            <p className="text-[16px] leading-[1.55] text-mute">
              Each skill is a <code className="font-mono text-[14.5px] text-fg">SKILL.md</code> that teaches an agent to
              use <code className="font-mono text-[14.5px] text-fg">pilotctl</code> for one job. This is most of the one
              for chat, straight from the repository.
            </p>
            <TextLink href={sourceUrl("pilot-chat")} className="mt-5">
              Read the whole file
            </TextLink>
          </div>
        </Reveal>

        <Reveal delay={100} className="mt-12 sm:mt-16">
          <figure>
            <div className="pp-island">
              <div className="flex h-10 items-center justify-between gap-4 border-b border-edge px-4 font-mono text-[11.5px] text-dim">
                <span className="truncate">skills/pilot-chat/SKILL.md</span>
                <span className="shrink-0">markdown</span>
              </div>
              <div className="flex flex-col">
                {REGIONS.map((r, i) => (
                  <div
                    key={r.label}
                    className={`grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px] lg:grid-cols-[minmax(0,1fr)_300px] ${i > 0 ? "border-t border-dashed border-edge-2" : ""}`}
                  >
                    <pre className="no-scrollbar overflow-x-auto px-4 py-4 font-mono text-[12px] leading-[1.75] text-soft sm:px-5 sm:text-[12.5px]">
                      {r.lines.map((l, j) => (
                        <div key={j} className="min-h-[1.75em] whitespace-pre">
                          {l}
                        </div>
                      ))}
                    </pre>
                    <div className="order-first flex items-start gap-3 border-b border-edge px-4 pt-4 pb-3 md:order-none md:border-b-0 md:border-l md:px-5 md:pt-[18px]">
                      <span aria-hidden className="mt-[5px] size-2 shrink-0 bg-lime" />
                      <p className="text-[14px] leading-[1.5]">
                        <span className="font-medium text-fg">{r.label}.</span>{" "}
                        <span className="text-mute">{r.note}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <figcaption className="mt-3 font-mono text-[11.5px] text-dim">
              Trimmed: the full file also lists tags, metadata and a worked example.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

const STEP_MS = [2800, 2400, 3000] as const;

/**
 * Sky site: a split section, as the service page's envelope (Figma 218:23847). The heading and the file's three
 * parts as a numbered list on the paper half; the file itself on the hatched half. The two stay in step: the part in
 * view lights up in both, on its own while the section is on screen, or under your pointer.
 */
function SkyAnatomy() {
  const { ref, step, go } = useStepper<HTMLDivElement>(REGIONS.length, STEP_MS);
  return (
    <div ref={ref}>
      <SkySplit
        id="anatomy"
        labelledBy="anatomy-title"
        text={
          <>
            <SectionHead
              id="anatomy-title"
              title={
                <>
                  One skill, <span className="block text-mute">one file.</span>
                </>
              }
              lede={
                <>
                  Each skill is a <code className="font-mono text-[0.86em] text-fg">SKILL.md</code> that teaches an agent to use{" "}
                  <code className="font-mono text-[0.86em] text-fg">pilotctl</code> for one job. This is most of the one for chat,
                  straight from the repository.
                </>
              }
            />
            <Reveal delay={80}>
              <ol className="mt-10 border-t border-(--sky-card-line)">
                {REGIONS.map((r, i) => (
                  <li key={r.label}>
                    <button
                      type="button"
                      aria-pressed={step === i}
                      onClick={() => go(i)}
                      onPointerEnter={(e) => e.pointerType === "mouse" && step !== i && go(i)}
                      className="group grid w-full grid-cols-[24px_minmax(0,1fr)] gap-x-3 border-b border-(--sky-card-line) py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sky-accent)"
                    >
                      <span className="sky-step-dot tabular-nums" data-on={step === i}>
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-[16px] leading-6 font-medium tracking-[-0.03em] transition-colors duration-300 ${step === i ? "text-fg" : "text-soft group-hover:text-fg"}`}
                        >
                          {r.label}
                        </span>
                        <span className="mt-1.5 block text-[14.5px] leading-[1.5] text-pretty text-mute">{r.note}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <TextLink href={sourceUrl("pilot-chat")} className="mt-8">
                Read the whole file
              </TextLink>
            </Reveal>
          </>
        }
        visual={
          <Reveal delay={120} className="w-full min-w-0">
            <SkyFile on={step} />
          </Reveal>
        }
      />
    </div>
  );
}

/** Sky site: the file as a flat code card under its tab, each part numbered to match the list; the one in view lit. */
function SkyFile({ on }: { on: number }) {
  return (
    <figure className={`w-full ${FLAT_CODE}`}>
      <figcaption className="flex h-12 items-center justify-between gap-4 border-b border-(--sky-card-line) pr-4 pl-2.5 sm:pr-5">
        <span className="flex min-w-0 items-center gap-2.5">
          <Tile brand="markdown" size="sm" />
          <span className="truncate font-mono text-[12.5px] text-mute">
            skills/pilot-chat/<span className="text-fg">SKILL.md</span>
          </span>
        </span>
        <span className="shrink-0 text-[12px] text-dim">Trimmed</span>
      </figcaption>
      {REGIONS.map((r, i) => (
        <div
          key={r.label}
          data-on={on === i}
          className={`relative transition-[background-color,opacity] duration-500 data-[on=false]:opacity-50 data-[on=true]:bg-(--sky-tint) ${i > 0 ? "border-t border-(--sky-card-line)" : ""}`}
        >
          <span className="sr-only">
            Part {i + 1}, {r.label.toLowerCase()}:
          </span>
          <span
            aria-hidden
            className={`absolute inset-y-0 left-0 w-[2px] bg-(--sky-fill) transition-opacity duration-500 ${on === i ? "opacity-100" : "opacity-0"}`}
          />
          <span aria-hidden className="sky-step-dot absolute top-3.5 right-3 sm:right-4" data-on={on === i}>
            {i + 1}
          </span>
          <pre className="no-scrollbar overflow-x-auto py-4 pr-12 pl-4 font-mono text-[12px] leading-[1.75] text-soft sm:pl-5 sm:text-[12.5px]">
            {r.lines.map((l, j) => (
              <div key={j} className="min-h-[1.75em] whitespace-pre">
                {l}
              </div>
            ))}
          </pre>
        </div>
      ))}
    </figure>
  );
}
