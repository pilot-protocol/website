"use client";

import { CheckIcon } from "@/components/icons";
import { at as pos, ObjTile, Stage, WIRE, type ObjName } from "@/components/pages/security/infra";
import { SectionHead, SKY, Soft, useStepper } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { Reveal } from "@/components/ui";

type Owner = "pilot" | "you" | "both";

const GATES: { t: string; b: string; who: Owner }[] = [
  { t: "Identify", b: "The daemon proves its Ed25519 identity in the handshake.", who: "pilot" },
  { t: "Admit", b: "A private node checks peer trust or shared network membership.", who: "pilot" },
  { t: "Constrain", b: "A network with a port policy drops traffic to unlisted ports.", who: "pilot" },
  { t: "Authorize", b: "Your application checks scope, data, budget and approvals.", who: "you" },
  { t: "Record", b: "Your own logs, plus the registry’s audit export if you run the registry.", who: "both" },
];

// Five gates, then a beat with everything passed before the request starts again.
const DURATIONS = [1100, 1100, 1100, 1500, 1300, 1800] as const;

const PILOT = [
  "Daemon identity and signed handshakes",
  "Encrypted tunnels between peers",
  "Who can reach a private node: trust and network membership",
  "Rejecting and revoking trust",
  "NAT traversal and relay fallback",
  "On a registry you run: roles, network policy and audit export",
];

const YOURS = [
  "Which tasks, tools and methods an agent may use",
  "Spending, order and counterparty limits",
  "Human approval for consequential actions",
  "What data an agent may read, share or keep",
  "Prompt, model and tool safety",
  "Legal, regulatory and contractual compliance",
];

function OwnerBar({ who }: { who: Owner }) {
  if (who === "both")
    return (
      <span className="flex h-7 overflow-hidden rounded-lg font-mono text-[11.5px]">
        <span className="flex flex-1 items-center bg-fg/[0.07] px-2.5 text-mute">You</span>
        <span className="flex flex-1 items-center bg-lime px-2.5 text-ink">+ registry</span>
      </span>
    );
  return null;
}

function GateChain() {
  const { ref, step } = useStepper<HTMLDivElement>(DURATIONS.length, DURATIONS);
  // step 0..4 = request at gate; 5 = through every gate.
  const at = Math.min(step, GATES.length - 1);
  const done = step === GATES.length;

  return (
    <div ref={ref}>
      {/* Wide: owners above, a track with gates, the request hopping along it. */}
      <div className="hidden md:block">
        <div className="grid grid-cols-5 gap-px">
          <span className="col-span-3 flex h-7 items-center justify-between rounded-lg bg-lime px-3 font-mono text-[11.5px] text-ink">
            <span>Pilot</span>
            <span>whether two endpoints can talk</span>
          </span>
          <span className="flex h-7 items-center rounded-md bg-fg/[0.07] px-3 font-mono text-[11.5px] text-mute">
            Your application
          </span>
          <OwnerBar who="both" />
        </div>

        <div className="relative mt-8 h-3">
          <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-edge-2" />
          <span
            aria-hidden
            className="absolute top-1/2 left-0 h-px origin-left bg-fg transition-transform duration-[900ms] ease-(--ease-in-out)"
            style={{ width: "100%", transform: `scaleX(${done ? 1 : (at + 0.5) / GATES.length})` }}
          />
          {GATES.map((g, i) => (
            <span
              key={g.t}
              aria-hidden
              data-state={i < at || done ? "passed" : i === at ? "here" : "ahead"}
              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 border border-edge-3 bg-bg transition-[background-color,border-color] duration-500 data-[state=here]:border-fg data-[state=passed]:border-fg data-[state=passed]:bg-fg"
              style={{ left: `${((i + 0.5) / GATES.length) * 100}%` }}
            />
          ))}
          <span
            aria-hidden
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 bg-lime shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-lime)_35%,transparent)] transition-[left] duration-[900ms] ease-(--ease-in-out) motion-reduce:hidden"
            style={{ left: done ? "100%" : `${((at + 0.5) / GATES.length) * 100}%` }}
          />
          {/* The line Pilot doesn't cross. */}
          <span aria-hidden className="absolute -top-[52px] -bottom-[150px] left-[60%] w-px border-l border-dashed border-fg/40" />
        </div>

        <ol className="mt-8 grid grid-cols-5 gap-6">
          {GATES.map((g, i) => (
            <li
              key={g.t}
              data-on={i === at && !done}
              className="pr-2 transition-opacity duration-500"
            >
              <p className="flex items-baseline gap-2">
                <span className="font-mono text-[12px] text-dim">0{i + 1}</span>
                <span className="text-[17px] font-medium tracking-[-0.015em] text-fg">{g.t}</span>
              </p>
              <p className="mt-2 text-[14px] leading-[1.5] text-mute">{g.b}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Narrow: the same gates down a rail. */}
      <ol className="relative flex flex-col md:hidden">
        <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-edge-2" />
        {GATES.map((g, i) => {
          const state = i < at || done ? "passed" : i === at ? "here" : "ahead";
          const owner = g.who === "pilot" ? "Pilot" : g.who === "you" ? "Your application" : "You, plus the registry if you run it";
          return (
            <li key={g.t} className="relative pb-7 pl-8 last:pb-0">
              <span
                aria-hidden
                data-state={state}
                className="absolute top-[5px] left-0 size-[11px] border border-edge-3 bg-bg transition-[background-color,border-color] duration-500 data-[state=here]:border-lime data-[state=here]:bg-lime data-[state=passed]:border-fg data-[state=passed]:bg-fg"
              />
              {i === 3 && (
                <span aria-hidden className="absolute -top-4 right-0 left-8 border-t border-dashed border-fg/40" />
              )}
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-mono text-[12px] text-dim">0{i + 1}</span>
                <span className="text-[17px] font-medium tracking-[-0.015em] text-fg">{g.t}</span>
                <span
                  className={`ml-auto rounded-md px-1.5 py-[3px] font-mono text-[10.5px] leading-none ${
                    g.who === "pilot" ? "bg-lime text-ink" : "bg-fg/[0.07] text-mute"
                  }`}
                >
                  {owner}
                </span>
              </p>
              <p className="mt-1.5 text-[14.5px] leading-[1.5] text-mute">{g.b}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Sky site: the same five gates, each drawn as the thing that does the checking (an identity, the trust list, the
 * port policy, your application's rules, the log), pill owners above them, the request travelling along the track as
 * the kit's beam, and one dashed line where Pilot's part ends.
 */
const GATE_OBJ: ObjName[] = ["fingerprint", "users", "router", "scale", "archive"];
const GW = 1200;
const GH = 80;
const gx = (i: number) => ((i + 0.5) / GATES.length) * GW;

function SkyGateChain() {
  const { ref, step, run, inView } = useStepper<HTMLDivElement>(DURATIONS.length, DURATIONS);
  const at = Math.min(step, GATES.length - 1);
  const done = step === GATES.length;

  return (
    <div ref={ref}>
      <div className="hidden md:block">
        <div className="grid grid-cols-5 gap-1.5">
          <span className="col-span-3 flex h-8 items-center justify-between rounded-full bg-fg px-4 text-[13px] text-bg">
            <span className="font-medium">Pilot</span>
            <span className="opacity-70">whether two endpoints can talk</span>
          </span>
          <span className="flex h-8 items-center rounded-full bg-fg/[0.08] px-4 text-[13px] text-soft">Your application</span>
          <span className="flex h-8 overflow-hidden rounded-full text-[13px]">
            <span className="flex flex-1 items-center bg-fg/[0.08] pl-4 text-soft">You</span>
            <span className="flex flex-1 items-center bg-fg px-3 text-bg">+ registry</span>
          </span>
        </div>

        {/* The request crossing the five gates: each gate is the thing that checks it, lit while it does. */}
        <div className="relative mt-8">
          <Stage
            w={GW}
            h={GH}
            svg={
              <>
                <path d={`M${gx(0)} ${GH / 2} L${gx(GATES.length - 1)} ${GH / 2}`} className={WIRE} />
                <path d={`M${gx(0)} ${GH / 2} L${gx(at)} ${GH / 2}`} className={WIRE} data-lit />
                {inView && step > 0 && step < GATES.length && (
                  <Beam key={run} d={`M${gx(step - 1)} ${GH / 2} L${gx(step)} ${GH / 2}`} run={run} duration={700} color="#8ec1ff" tail={70} />
                )}
              </>
            }
          >
            {GATES.map((g, i) => (
              <div key={g.t} style={pos(gx(i), GH / 2, GW, GH)}>
                <ObjTile
                  name={GATE_OBJ[i]}
                  size={56}
                  lit={i === at && !done}
                  dim={i > at && !done}
                  badge={
                    i < at || done ? (
                      <span className="infra-pop grid size-full place-items-center rounded-full bg-(--sky-fill) text-white">
                        <CheckIcon className="size-3" />
                      </span>
                    ) : undefined
                  }
                />
              </div>
            ))}
          </Stage>
          <span aria-hidden className="absolute -top-[52px] -bottom-[150px] left-[60%] w-px border-l border-dashed border-fg/30" />
        </div>

        <ol className="mt-8 grid grid-cols-5 gap-6">
          {GATES.map((g, i) => (
            <li key={g.t} className="px-2 text-center">
              <p className="flex items-baseline justify-center gap-2">
                <span className="text-[13px] text-mute tabular-nums">{i + 1}</span>
                <span className="text-[17px] font-medium tracking-[-0.015em] text-fg">{g.t}</span>
              </p>
              <p className="mt-2 text-[14px] leading-[1.5] text-mute">{g.b}</p>
            </li>
          ))}
        </ol>
      </div>

      <ol className="relative flex flex-col md:hidden">
        <span aria-hidden className="absolute top-4 bottom-4 left-[5px] w-px bg-edge-2" />
        {GATES.map((g, i) => {
          const state = i < at || done ? "passed" : i === at ? "here" : "ahead";
          const owner = g.who === "pilot" ? "Pilot" : g.who === "you" ? "Your application" : "You, plus the registry if you run it";
          return (
            <li key={g.t} className="relative pb-7 pl-12 last:pb-0">
              <span aria-hidden className="absolute top-0 -left-[10px]">
                <ObjTile name={GATE_OBJ[i]} size={32} lit={state === "here"} dim={state === "ahead"} />
              </span>
              {i === 3 && <span aria-hidden className="absolute -top-4 right-0 left-8 border-t border-dashed border-fg/30" />}
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5">
                <span className="text-[13px] text-mute tabular-nums">{i + 1}</span>
                <span className="text-[17px] font-medium tracking-[-0.015em] text-fg">{g.t}</span>
                <span
                  className={`ml-auto rounded-full px-2.5 py-1 text-[12px] leading-none ${
                    g.who === "pilot" ? "bg-fg text-bg" : "bg-fg/[0.08] text-soft"
                  }`}
                >
                  {owner}
                </span>
              </p>
              <p className="mt-1.5 text-[14.5px] leading-[1.5] text-mute">{g.b}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Sky site: the two lists as two flat bordered cards on the band; Pilot's items get the sky mark, yours stay neutral. */
function SkyColumn({ title, sub, items, tone }: { title: string; sub: string; items: string[]; tone: "pilot" | "you" }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[12px] border border-edge-2 bg-card">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4">
        <p className="text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">{title}</p>
        <p className="text-[13px] text-mute">{sub}</p>
      </div>
      <ul className="flex flex-1 flex-col">
        {items.map((it) => (
          <li key={it} className="flex gap-3 border-t border-edge px-5 py-3.5 text-[15px] leading-[1.45] text-soft">
            <span
              aria-hidden
              className={`mt-[7px] size-1.5 shrink-0 rounded-full ${tone === "pilot" ? "bg-(--sky-accent)" : "bg-fg/30"}`}
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Column({ title, sub, items, tone }: { title: string; sub: string; items: string[]; tone: "pilot" | "you" }) {
  return (
    <div className="flex flex-col">
      <p
        className={`flex h-10 items-center justify-between px-4 font-mono text-[12px] ${
          tone === "pilot" ? "bg-lime text-ink" : "bg-fg/[0.06] text-mute"
        }`}
      >
        {title}
        <span>{sub}</span>
      </p>
      <ul className="flex flex-1 flex-col">
        {items.map((it) => (
          <li key={it} className="flex gap-3 border-b border-edge px-4 py-3.5 text-[15px] leading-[1.45] text-soft">
            <span aria-hidden className={`mt-[7px] size-1.5 shrink-0 ${tone === "pilot" ? "bg-fg" : "bg-faint"}`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Responsibility() {
  return (
    <section aria-labelledby="split-title" className="pp-invert py-24 sm:py-32">
      <div className="wrap">
        <SectionHead
          id="split-title"
          kicker="Responsibility split"
          center={SKY}
          title={
            SKY ? (
              <>
                Connectivity is not <span className="block text-mute">permission to act.</span>
              </>
            ) : (
              <>
                Connectivity is not <Soft>permission to act.</Soft>
              </>
            )
          }
          lede="Pilot decides whether two endpoints can talk. Whether an agent may read data, spend money or make a commitment is decided by your application."
        />

        <Reveal delay={80} className="mt-14 sm:mt-20">
          {SKY ? <SkyGateChain /> : <GateChain />}
        </Reveal>

        <Reveal delay={60} className={SKY ? "mt-20 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4" : "mt-20 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"}>
          {SKY ? (
            <>
              <SkyColumn title="Pilot handles" sub="Identity and reachability" items={PILOT} tone="pilot" />
              <SkyColumn title="Your application owns" sub="What an agent may do" items={YOURS} tone="you" />
            </>
          ) : (
            <>
              <Column title="Pilot handles" sub="Identity and reachability" items={PILOT} tone="pilot" />
              <Column title="Your application owns" sub="What an agent may do" items={YOURS} tone="you" />
            </>
          )}
        </Reveal>

        <Reveal className={`mt-16 grid grid-cols-1 gap-6 border-t pt-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 ${SKY ? "border-edge-3" : "border-fg"}`}>
          <p className="text-[clamp(22px,2.4vw,30px)] leading-[1.2] font-medium tracking-[-0.025em] text-balance text-fg">
            A trusted connection only means two endpoints may exchange packets.
          </p>
          <p className="text-[16px] leading-[1.55] text-mute lg:pt-1">
            It does not authorize a purchase, a payment, a data disclosure or a contract. Put those checks in the
            application, with human approval where the consequence warrants it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
