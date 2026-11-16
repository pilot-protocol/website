"use client";

import type { ReactNode } from "react";
import { CheckIcon, LockIcon } from "@/components/icons";
import { at, ObjTile, Stage, WIRE } from "@/components/pages/security/infra";
import { CodePanel, FLAT_CARD, SkySplit, useStepper } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import "./p2p.css";

const AGENT_A = `# agent A - install and start
$ curl -fsSL https://pilotprotocol.network/install.sh | sh
$ pilotctl daemon start --hostname agent-a
Daemon running (pid 24817)
  Address:  0:0000.A91F.7C2E
  Hostname: agent-a`;

const AGENT_B = `# agent B - handshake then dial agent A directly
$ pilotctl handshake agent-a
$ pilotctl connect agent-a --message "hello, peer"
✓ direct-path example · 34ms · relay not needed`;

const STEPS: { t: string; b: string; panel: "a" | "b"; lines: [number, number] }[] = [
  { t: "Install", b: "One command. Static binaries (daemon + CLI), no dependencies.", panel: "a", lines: [1, 1] },
  { t: "Start the daemon", b: "Gets a permanent address. Joins the network. NAT traversal is automatic.", panel: "a", lines: [2, 5] },
  { t: "Trust", b: "Mutual handshake before any connection. You decide who can reach you.", panel: "b", lines: [1, 1] },
  { t: "Dial", b: "Connect by hostname. Direct tunnel, encrypted end-to-end.", panel: "b", lines: [2, 3] },
];

const DURATIONS = [2200, 2600, 2200, 3000] as const;

/** The green site: the numbered list beside the two sessions. */
export function FourSteps() {
  const { ref, step, go } = useStepper<HTMLDivElement>(STEPS.length, DURATIONS);
  const s = STEPS[step];

  return (
    <div ref={ref} className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <ol className="flex flex-col border-t border-edge">
        {STEPS.map((x, i) => {
          const on = i === step;
          return (
            <li key={x.t} className="border-b border-edge">
              <button
                type="button"
                onClick={() => go(i)}
                aria-pressed={on}
                className="group relative grid w-full grid-cols-[44px_minmax(0,1fr)] py-5 text-left"
              >
                {on && <span aria-hidden className="absolute top-0 bottom-0 -left-px w-[2px] bg-lime" />}
                <span className={`pl-4 font-mono text-[12.5px] transition-colors ${on ? "text-lime-ink" : "text-dim"}`}>0{i + 1}</span>
                <span>
                  <span className={`block text-[18px] font-medium tracking-[-0.015em] transition-colors ${on ? "text-fg" : "text-soft group-hover:text-fg"}`}>
                    {x.t}
                  </span>
                  <span className={`mt-1 block text-[14.5px] leading-[1.55] transition-colors duration-300 ${on ? "text-mute" : "text-dim"}`}>
                    {x.b}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="flex min-w-0 flex-col gap-4">
        <CodePanel title="agent@node-a ~ direct p2p" meta="example" code={AGENT_A} highlight={s.panel === "a" ? s.lines : [-1, -1]} />
        <CodePanel title="agent@node-b ~ direct p2p" meta="example" code={AGENT_B} highlight={s.panel === "b" ? s.lines : [-1, -1]} />
        <p className="font-mono text-[11.5px] text-dim">
          Example session. Addresses, timings and process IDs will differ on your machines.
        </p>
      </div>
    </div>
  );
}

/**
 * The sky site: a split section (Figma 218:22895). The heading and the four steps as the Cloud section's vertical
 * stepper (211:14568) on the paper half; the two sessions on the hatched half, the lines for the step in view lit.
 */
export function SkyFourSteps({ id, labelledBy, head }: { id?: string; labelledBy: string; head: ReactNode }) {
  const { ref, step, run, manual, go, reduced } = useStepper<HTMLDivElement>(STEPS.length, DURATIONS);
  const s = STEPS[step];
  return (
    <SkySplit
      id={id}
      labelledBy={labelledBy}
      text={
        <>
          {head}
          <div ref={ref} className="mt-10 -ml-5">
            <ol className="flex flex-col">
              {STEPS.map((x, i) => {
                const on = i === step;
                const last = i === STEPS.length - 1;
                return (
                  <li key={x.t} className="relative">
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-pressed={on}
                      className="group flex w-full flex-col gap-1.5 rounded-[18px] px-5 py-4 text-left transition-colors duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-fg/[0.03]"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`grid size-6 shrink-0 place-items-center rounded-full text-[12px] leading-[18px] font-medium tabular-nums transition-colors duration-300 ${
                            on ? "bg-(--sky-fill) text-white" : "bg-fg/[0.07] text-mute"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span
                          className={`text-[16px] leading-[22px] font-medium tracking-[-0.03em] transition-colors duration-300 ${on ? "text-fg" : "text-mute group-hover:text-fg"}`}
                        >
                          {x.t}
                        </span>
                      </span>
                      <span className={`pl-9 text-[15px] leading-[1.45] text-pretty transition-colors duration-300 sm:text-[16px] ${on ? "text-fg/70" : "text-mute"}`}>
                        {x.b}
                      </span>
                    </button>
                    {on && !last && (
                      <span aria-hidden className="pointer-events-none absolute top-[46px] bottom-[-10px] left-[32px] w-px overflow-hidden bg-fg/10">
                        {!reduced && (
                          <span
                            key={run}
                            className="kit-motion p2p-fill-y absolute inset-0 origin-top bg-(--sky-fill)"
                            style={{ animationDuration: `${DURATIONS[i] * (manual ? 2.2 : 1)}ms` }}
                          />
                        )}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </>
      }
      visual={
        <div className="flex w-full max-w-[560px] min-w-0 flex-col gap-3">
          <PairPicture step={step} run={run} />
          <CodePanel title="agent@node-a ~ direct p2p" meta="Example session" code={AGENT_A} highlight={s.panel === "a" ? s.lines : [-1, -1]} />
          <CodePanel title="agent@node-b ~ direct p2p" meta="Example session" code={AGENT_B} highlight={s.panel === "b" ? s.lines : [-1, -1]} />
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Sky site: the two machines, as the steps leave them                 */
/* ------------------------------------------------------------------ */

const PW = 480;
const PH = 124;
const PA: [number, number] = [78, 44];
const PB: [number, number] = [402, 44];
const LINK = `M${PA[0]} ${PA[1]} L${PB[0]} ${PB[1]}`;
const BACK = `M${PB[0]} ${PB[1]} L${PA[0]} ${PA[1]}`;

function Check() {
  return (
    <span className="infra-pop grid size-full place-items-center rounded-full bg-(--sky-fill) text-white">
      <CheckIcon className="size-3" />
    </span>
  );
}

/**
 * Agent A and agent B above the two sessions: A installed, then running with its address, then the handshake between
 * them, then B dialling A over the direct tunnel. The figures are the example session's.
 */
function PairPicture({ step, run }: { step: number; run: number }) {
  return (
    <div aria-hidden className={`px-5 pt-5 pb-3 ${FLAT_CARD}`}>
      <Stage
        w={PW}
        h={PH}
        svg={
          <>
            <path d={LINK} className={WIRE} data-lit={step === 3} strokeWidth={step === 3 ? 2.5 : 1.5} strokeDasharray={step < 2 ? "2 6" : undefined} />
            <g key={`${step}-${run}`}>
              {step === 2 && (
                <>
                  <Beam d={BACK} run={run} duration={900} delay={150} tail={56} />
                  <Beam d={LINK} run={run} duration={900} delay={1100} tail={56} />
                </>
              )}
              {step === 3 && [0, 1].map((i) => <Beam key={i} d={BACK} run={run} duration={1000} delay={200 + i * 1100} tail={64} width={2.5} />)}
            </g>
          </>
        }
      >
        <div style={at(PA[0], PA[1], PW, PH, 52)} className="flex flex-col items-center">
          <ObjTile name="laptop" size={52} lit={step <= 1 || step === 3} dim={false} badge={step >= 2 ? <Check key="a" /> : undefined} />
          <span className="mt-2 font-mono text-[12px] leading-4 text-fg">agent-a</span>
          <span className={`font-mono text-[11px] leading-4 text-mute transition-opacity duration-300 ${step >= 1 ? "opacity-100" : "opacity-0"}`}>
            0:0000.A91F.7C2E
          </span>
        </div>
        <div style={at(PB[0], PB[1], PW, PH, 52)} className="flex flex-col items-center">
          <ObjTile name="laptop" size={52} lit={step >= 2} dim={step < 2} badge={step >= 2 ? <Check key="b" /> : undefined} />
          <span className="mt-2 font-mono text-[12px] leading-4 text-fg">agent-b</span>
          <span className="font-mono text-[11px] leading-4 text-mute">&nbsp;</span>
        </div>
        <span style={at((PA[0] + PB[0]) / 2, PA[1], PW, PH)}>
          <span key={step} className="infra-chip infra-pop" data-tone={step === 3 ? "sky" : step === 2 ? undefined : "off"}>
            {step === 0 && "Installed"}
            {step === 1 && "Daemon running"}
            {step === 2 && "Handshake"}
            {step === 3 && (
              <>
                <LockIcon className="size-3" /> Direct · 34ms
              </>
            )}
          </span>
        </span>
      </Stage>
    </div>
  );
}
