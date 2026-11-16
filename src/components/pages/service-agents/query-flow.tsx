"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SkyExchange } from "./sky-exchange";
import { SPLIT, SPLIT_ART, SPLIT_TEXT } from "./split";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import "./service-agents.css";

/* Where the three lifelines stand, as % of the diagram's width. */
const X = { you: 13, agent: 50, api: 87 } as const;
type End = keyof typeof X;

type Msg = { from: End; to: End; label: string; short?: string; quiet?: boolean };

// The real exchange behind the nhtsa-recalls example on this page.
const MSGS: Msg[] = [
  { from: "you", to: "agent", label: "handshake" },
  { from: "agent", to: "you", label: "approved automatically", short: "approved" },
  { from: "you", to: "agent", label: "/help" },
  { from: "agent", to: "you", label: "filters: make, model, year", short: "make, model, year" },
  { from: "you", to: "agent", label: '/data {"make":"Honda","model":"Accord","year":2020}', short: '/data {"make":"Honda",…}' },
  { from: "agent", to: "api", label: "GET /recalls/recallsByVehicle", short: "GET recallsByVehicle" },
  { from: "api", to: "agent", label: "5 recall campaigns", short: "5 campaigns" },
  { from: "agent", to: "you", label: "envelope · count 5 · truncated false", short: "envelope, 5 items" },
];

// Phase 0 is "find the agent"; phases 1–8 are the messages above.
const STEP_OF_PHASE = [0, 1, 1, 2, 2, 3, 3, 3, 3];
const FIRST_PHASE = [0, 1, 3, 5];
const LAST_PHASE = [0, 2, 4, 8];
const PHASE_MS = 1250;

const STEPS: { title: ReactNode; body: ReactNode }[] = [
  {
    title: "Find the agent",
    body: (
      <>
        {/* Plain text, not links: the whole step is a button, and a link can't sit inside one. */}
        Search the directory with <code className="font-mono text-[13px] text-soft">list-agents</code>, or describe the task
        to <code className="font-mono text-[13px] text-soft">pilot-mom</code> and get the exact calls back.
      </>
    ),
  },
  {
    title: "Handshake once",
    body: (
      <>
        <code className="font-mono text-[13px] text-soft">pilotctl handshake &lt;agent&gt;</code>. Service agents approve
        automatically, and <code className="font-mono text-[13px] text-soft">send-message</code> handshakes with the built-in
        list on first contact.
      </>
    ),
  },
  {
    title: (
      <>
        Read its <code className="font-mono">/help</code>
      </>
    ),
    body: "Every agent lists its filters, which ones are required, and the upstream source it calls.",
  },
  {
    title: (
      <>
        Send <code className="font-mono">/data</code> with <code className="font-mono">--wait</code>
      </>
    ),
    body: (
      <>
        The reply prints inline. With <code className="font-mono text-[13px] text-soft">--json</code> it&apos;s the string in{" "}
        <code className="font-mono text-[13px] text-soft">data.reply.data</code>. A non-zero exit means no reply in time: retry,
        or wait longer with <code className="font-mono text-[13px] text-soft">--wait 60s</code>.
      </>
    ),
  },
];

function Head({ x, name, role, lit }: { x: number; name: string; role: string; lit: boolean }) {
  return (
    <div className="absolute top-0 w-[33%] -translate-x-1/2 text-center" style={{ left: `${x}%` }}>
      <p
        className={`mx-auto w-fit max-w-full truncate rounded-md border px-1.5 py-1.5 font-mono text-[10px] transition-colors duration-500 sm:px-3 sm:text-[12px] ${
          lit ? "border-lime-ink/70 text-fg" : "border-edge-2 text-soft"
        }`}
      >
        {name}
      </p>
      <p className="mt-1.5 truncate font-mono text-[10px] text-dim sm:text-[11px]">{role}</p>
    </div>
  );
}

function Arrow({ m, state }: { m: Msg; state: "past" | "now" | "next" }) {
  const a = X[m.from];
  const b = X[m.to];
  const right = b > a;
  const left = Math.min(a, b);
  const width = Math.abs(b - a);
  return (
    <div
      className={`relative h-[46px] transition-opacity duration-500 ${state === "next" ? "opacity-20" : "opacity-100"}`}
      aria-hidden={state === "next"}
    >
      <p
        className={`absolute top-[6px] bg-bg-deep px-1 font-mono text-[10.5px] whitespace-nowrap transition-colors duration-500 sm:text-[11.5px] ${
          state === "now" ? "text-lime-ink" : "text-soft"
        }`}
        style={right ? { left: `calc(${a}% + 3px)` } : { right: `calc(${100 - a}% + 3px)` }}
      >
        {m.short ? (
          <>
            <span className="sm:hidden">{m.short}</span>
            <span className="max-sm:hidden">{m.label}</span>
          </>
        ) : (
          m.label
        )}
      </p>
      <div className="absolute top-[30px] h-px" style={{ left: `${left}%`, width: `${width}%` }}>
        <span className={`absolute inset-0 transition-colors duration-500 ${state === "now" ? "bg-fg/50" : "bg-edge-3"}`} />
        {/* Arrowhead */}
        <span
          className={`absolute top-1/2 size-[7px] -translate-y-1/2 rotate-45 border-edge-3 ${
            right ? "right-0 border-t border-r" : "left-0 border-b border-l"
          } ${state === "now" ? "border-fg/60" : ""}`}
        />
        {state === "now" && (
          <span
            className="absolute top-1/2 -mt-1 size-2 bg-lime motion-reduce:hidden"
            style={{ animation: `${right ? "sa-run" : "sa-run-back"} ${PHASE_MS - 150}ms var(--ease-in-out) both` }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Plays the exchange one message at a time while it's in view; a click on a step holds it there. The sky site holds
 * a step with all of its messages shown (`holdAtEnd`), and counts the passes (`lap`) to change your agent's mark.
 */
function useQueryPlayer(holdAtEnd = false) {
  const [phase, setPhase] = useState(0);
  const [lap, setLap] = useState(0);
  const [held, setHeld] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-20% 0px" });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!inView || held || reduced) return;
    const last = phase === MSGS.length;
    const id = window.setTimeout(() => {
      if (last) setLap((l) => l + 1);
      setPhase((p) => (p + 1) % (MSGS.length + 1));
    }, last ? PHASE_MS * 2.6 : PHASE_MS);
    return () => window.clearTimeout(id);
  }, [inView, held, reduced, phase]);

  const shown = reduced ? MSGS.length : phase;
  return {
    ref,
    held,
    shown,
    lap,
    step: STEP_OF_PHASE[shown],
    play: () => setHeld(false),
    holdAt: (i: number) => {
      setHeld(true);
      setPhase(holdAtEnd ? LAST_PHASE[i] : FIRST_PHASE[i]);
    },
  };
}

/** The three lifelines and the messages between them. */
function Diagram({ shown, step }: { shown: number; step: number }) {
  return (
    <div className="relative">
      {/* Lifelines */}
      {(Object.keys(X) as End[]).map((k) => (
        <span
          key={k}
          aria-hidden
          className="absolute top-[54px] bottom-0 w-px border-l border-dashed border-edge-2"
          style={{ left: `${X[k]}%` }}
        />
      ))}
      <div className="relative h-[54px]">
        <Head x={X.you} name="your agent" role="pilotctl" lit={step === 0 || step === 3} />
        <Head x={X.agent} name="nhtsa-recalls" role="service agent" lit={step > 0 || shown === 0} />
        <Head x={X.api} name="api.nhtsa.gov" role="upstream source" lit={shown === 6 || shown === 7} />
      </div>
      <div className="relative pt-2 pb-1">
        {MSGS.map((m, i) => (
          <Arrow key={i} m={m} state={i + 1 < shown ? "past" : i + 1 === shown ? "now" : "next"} />
        ))}
      </div>
    </div>
  );
}

/** Steps on the left, the exchange they cause on the right, played in sync. */
export function QueryFlow() {
  const { ref, held, shown, step, play, holdAt } = useQueryPlayer();

  return (
    <div ref={ref} className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <ol className="flex flex-col border-t border-edge">
        {STEPS.map((s, i) => {
          const on = step === i;
          return (
            <li key={i} className="border-b border-edge">
              <button
                type="button"
                onClick={() => holdAt(i)}
                aria-current={on ? "step" : undefined}
                className="group grid w-full grid-cols-[28px_minmax(0,1fr)] gap-x-3 py-4 text-left"
              >
                <span
                  className={`mt-0.5 grid size-5 place-items-center font-mono text-[11px] font-medium transition-colors duration-300 ${
                    on ? "bg-lime text-ink" : "border border-edge-2 text-dim group-hover:text-fg"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className={`block text-[16px] font-medium tracking-[-0.01em] transition-colors duration-300 ${on ? "text-fg" : "text-soft"}`}>
                    {s.title}
                  </span>
                  <span className={`mt-1.5 block text-[14.5px] leading-[1.5] transition-colors duration-300 ${on ? "text-mute" : "text-dim"}`}>
                    {s.body}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <figure className="rounded-[20px] border border-edge bg-bg-deep px-3 pt-5 pb-3 sm:px-6 sm:pt-6">
        <Diagram shown={shown} step={step} />
        <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-edge pt-3 font-mono text-[11px] text-dim">
          <span>You reach the agent over an encrypted tunnel; it calls the source for you.</span>
          {held && (
            <button type="button" onClick={play} className="pressable text-soft hover:text-fg">
              Play
            </button>
          )}
        </figcaption>
      </figure>
    </div>
  );
}

/**
 * The sky site's version (Figma 218:22895): a split section. The heading and the numbered steps on plain paper,
 * the exchange on a flat card in the hatched half. `head` is the section's heading and lede.
 */
export function SkyQueryFlow({ head }: { head: ReactNode }) {
  const { ref, held, shown, lap, step, play, holdAt } = useQueryPlayer(true);

  return (
    <div ref={ref} className={SPLIT}>
      <div className={SPLIT_TEXT}>
        {head}
        <ol className="mt-10 flex flex-col border-t border-(--sky-card-line)">
          {STEPS.map((s, i) => {
            const on = step === i;
            return (
              <li key={i} className="border-b border-(--sky-card-line)">
                <button
                  type="button"
                  onClick={() => holdAt(i)}
                  aria-current={on ? "step" : undefined}
                  className="group grid w-full grid-cols-[24px_minmax(0,1fr)] gap-x-4 py-4 text-left"
                >
                  <span className="sky-step-dot tabular-nums" data-on={on}>
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">{s.title}</span>
                    <span
                      className={`mt-1.5 block text-[14.5px] leading-[1.5] tracking-[-0.013em] transition-colors duration-300 ${
                        on ? "text-mute" : "text-dim group-hover:text-mute"
                      }`}
                    >
                      {s.body}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div className={SPLIT_ART}>
        <figure className="sky-card w-full max-w-[560px] rounded-[20px] px-4 pt-6 pb-4 sm:px-6 sm:pt-7 sm:pb-5">
          <SkyExchange shown={shown} lap={lap} />
          <figcaption className="sr-only">
            Your agent reaches nhtsa-recalls over an encrypted tunnel, reads its filters, and sends /data; nhtsa-recalls
            calls api.nhtsa.gov and hands back the envelope with 5 recall campaigns.
          </figcaption>
          {held && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={play}
                className="pressable rounded-full bg-card px-3 py-1 text-[12.5px] text-soft ring-1 ring-(--sky-card-line) hover:text-fg"
              >
                Play
              </button>
            </div>
          )}
        </figure>
      </div>
    </div>
  );
}
