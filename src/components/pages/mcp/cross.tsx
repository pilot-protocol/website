"use client";

import { useEffect, useState } from "react";
import { LOGO_MARK_PATH } from "@/components/logo";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

/*
 * MCP is vertical (one agent, many tools on one machine); Pilot is horizontal
 * (many agents, one network). pilot-mcp is where they cross: one of the agent's
 * tools is a Pilot node. A call runs down the MCP side, through pilotctl, and
 * out over a tunnel to a different peer each time.
 */

export const PEERS = [
  { tool: "pilot_query", name: "open-meteo-forecast", note: "A service agent: live data as JSON", mono: true },
  { tool: "pilot_send · pilot_inbox", name: "Another agent", note: "On another machine, behind NAT", mono: false },
  { tool: "pilot_subscribe", name: "A topic on a peer’s node", note: "Events pushed to its followers", mono: false },
];

/** Steps of one call: client → pilot-mcp, pilot-mcp → daemon, daemon → peer. */
export const LEG_MS = [720, 520, 1100, 900];

export function useCall() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "-10% 0px" });
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState({ leg: 0, peer: 0, n: 0 });

  useEffect(() => {
    if (!inView || reduced) return;
    const t = window.setTimeout(() => {
      setStep((s) => (s.leg < 3 ? { ...s, leg: s.leg + 1, n: s.n + 1 } : { leg: 0, peer: (s.peer + 1) % PEERS.length, n: s.n + 1 }));
    }, LEG_MS[step.leg]);
    return () => window.clearTimeout(t);
  }, [inView, reduced, step]);

  return { ref, step, animate: inView && !reduced };
}

const LINE = { className: "stroke-fg", strokeOpacity: 0.26, strokeWidth: 1.2, fill: "none" } as const;
const DASHED_BOX = { fill: "none", className: "stroke-fg", strokeOpacity: 0.2, strokeDasharray: "4 5" } as const;

function Run({ d, ms, id }: { d: string; ms: number; id: string }) {
  return (
    <path
      key={id}
      d={d}
      pathLength={100}
      className="stroke-lime-ink"
      strokeWidth={2.4}
      strokeLinecap="square"
      fill="none"
      strokeDasharray="7 200"
      style={{ animation: `mcp-run ${ms}ms var(--ease-in-out) both` }}
    />
  );
}

/* ---------------- wide ---------------- */

const W = {
  bus: "M300 136V176H450V214",
  busA: "M300 176H150V214",
  down: "M450 286V330",
  fan: ["M568 370H660C740 370 740 80 820 80", "M568 370H660C740 370 740 230 820 230", "M568 370H820"],
  peerY: [40, 190, 330],
};

function Wide({ step, animate }: { step: { leg: number; peer: number; n: number }; animate: boolean }) {
  return (
    <svg viewBox="0 0 1200 470" className="h-auto w-full" role="img" aria-labelledby="cross-title-wide">
      <title id="cross-title-wide">
        Your MCP client calls pilot-mcp, one of its tools, which runs pilotctl against the Pilot daemon on your machine;
        the daemon reaches service agents, other agents and topics over encrypted tunnels.
      </title>

      {/* Your machine */}
      <text x="0" y="12" className="fill-dim font-mono text-[12px]">
        Your machine
      </text>
      <rect x="0.5" y="24.5" width="600" height="436" rx="10" {...DASHED_BOX} />

      <rect x="32.5" y="64.5" width="536" height="72" rx="10" className="fill-card stroke-fg" strokeOpacity="0.16" />
      <text x="56" y="95" className="fill-fg text-[15px] font-medium">
        Your MCP client
      </text>
      <text x="56" y="118" className="fill-dim font-mono text-[12px]">
        Claude Code · Cursor · Codex CLI · Cline · and more
      </text>

      <path d={W.bus} {...LINE} />
      <path d={W.busA} {...LINE} />
      <text x="312" y="162" className="fill-dim font-mono text-[11px]">
        MCP
      </text>

      <rect x="32.5" y="214.5" width="236" height="72" rx="10" fill="none" className="stroke-fg" strokeOpacity="0.16" />
      <text x="56" y="246" className="fill-soft text-[14px]">
        Your other MCP servers
      </text>
      <text x="56" y="268" className="fill-dim font-mono text-[11.5px]">
        kept as they are
      </text>

      <rect x="332.5" y="214.5" width="236" height="72" rx="10" className="fill-lime/10 stroke-lime-ink" strokeOpacity="0.75" />
      <text x="356" y="246" className="fill-fg font-mono text-[15px]">
        pilot-mcp
      </text>
      <text x="356" y="268" className="fill-dim font-mono text-[11.5px]">
        21 tools · stdio
      </text>

      <path d={W.down} {...LINE} />
      <text x="462" y="313" className="fill-dim font-mono text-[11px]">
        pilotctl
      </text>

      <rect x="332.5" y="330.5" width="236" height="80" rx="10" className="fill-bg-deep stroke-fg" strokeOpacity="0.24" />
      <path d={LOGO_MARK_PATH} transform="translate(352 357) scale(0.34)" className="fill-lime-ink" />
      <text x="404" y="366" className="fill-fg text-[15px] font-medium">
        Pilot daemon
      </text>
      <text x="404" y="388" className="fill-dim font-mono text-[11.5px]">
        address · keys · trust
      </text>

      <text x="32" y="378" className="fill-fg text-[17px] font-medium tracking-[-0.02em]">
        Vertical.
      </text>
      <text x="32" y="400" className="fill-dim font-mono text-[12px]">
        one agent, many tools
      </text>

      {/* The network */}
      {W.fan.map((d) => (
        <path key={d} d={d} {...LINE} />
      ))}
      <text x="612" y="398" className="fill-dim font-mono text-[11px]">
        encrypted tunnels
      </text>

      {PEERS.map((p, i) => {
        const y = W.peerY[i];
        const lit = animate && step.peer === i && step.leg >= 3;
        return (
          <g key={p.name}>
            <rect
              x="820.5"
              y={y + 0.5}
              width="378"
              height="80"
              rx="10"
              fill="none"
              strokeOpacity={lit ? 0.75 : 0.2}
              strokeDasharray={lit ? undefined : "4 5"}
              className={`transition-[fill,stroke,stroke-opacity] duration-300 ${lit ? "fill-lime/10 stroke-lime-ink" : "fill-transparent stroke-fg"}`}
            />
            <text x="844" y={y + 26} className="fill-lime-ink font-mono text-[11.5px]">
              {p.tool}
            </text>
            <text x="844" y={y + 50} className={`fill-fg text-[15px] ${p.mono ? "font-mono" : "font-medium"}`}>
              {p.name}
            </text>
            <text x="844" y={y + 69} className="fill-dim font-mono text-[11.5px]">
              {p.note}
            </text>
          </g>
        );
      })}

      <text x="820" y="446" className="fill-fg text-[17px] font-medium tracking-[-0.02em]">
        Horizontal.
      </text>
      <text x="921" y="446" className="fill-dim font-mono text-[12px]">
        many agents, one network
      </text>

      {animate && (
        <g>
          {step.leg === 0 && <Run id={`a${step.n}`} d={W.bus} ms={LEG_MS[0]} />}
          {step.leg === 1 && <Run id={`b${step.n}`} d={W.down} ms={LEG_MS[1]} />}
          {step.leg === 2 && <Run id={`c${step.n}`} d={W.fan[step.peer]} ms={LEG_MS[2]} />}
        </g>
      )}
    </svg>
  );
}

/* ---------------- narrow ---------------- */

const N = {
  bus: "M180 128V156H266V182",
  busA: "M180 156H94V182",
  down: "M266 246V284",
  fan: ["M266 348V392H344V466H324", "M266 348V392H344V560H324", "M266 348V392H344V654H324"],
  peerY: [430, 524, 618],
};

function Narrow({ step, animate }: { step: { leg: number; peer: number; n: number }; animate: boolean }) {
  return (
    <svg viewBox="0 0 360 760" className="mx-auto h-auto w-full max-w-[480px]" role="img" aria-labelledby="cross-title-narrow">
      <title id="cross-title-narrow">
        Your MCP client calls pilot-mcp, which runs pilotctl against the Pilot daemon; the daemon reaches service agents,
        other agents and topics over encrypted tunnels.
      </title>
      <text x="0" y="12" className="fill-dim font-mono text-[12px]">
        Your machine
      </text>
      <rect x="0.5" y="24.5" width="359" height="344" rx="10" {...DASHED_BOX} />

      <rect x="16.5" y="44.5" width="327" height="84" rx="10" className="fill-card stroke-fg" strokeOpacity="0.16" />
      <text x="32" y="74" className="fill-fg text-[15px] font-medium">
        Your MCP client
      </text>
      <text x="32" y="96" className="fill-dim font-mono text-[11.5px]">
        Claude Code · Cursor · Codex CLI
      </text>
      <text x="32" y="114" className="fill-dim font-mono text-[11.5px]">
        Cline · and more
      </text>

      <path d={N.bus} {...LINE} />
      <path d={N.busA} {...LINE} />

      <rect x="16.5" y="182.5" width="156" height="64" rx="10" fill="none" className="stroke-fg" strokeOpacity="0.16" />
      <text x="30" y="210" className="fill-soft text-[13px]">
        Other MCP servers
      </text>
      <text x="30" y="230" className="fill-dim font-mono text-[11px]">
        kept as they are
      </text>
      <rect x="188.5" y="182.5" width="155" height="64" rx="10" className="fill-lime/10 stroke-lime-ink" strokeOpacity="0.75" />
      <text x="202" y="210" className="fill-fg font-mono text-[14px]">
        pilot-mcp
      </text>
      <text x="202" y="230" className="fill-dim font-mono text-[11px]">
        21 tools
      </text>

      <path d={N.down} {...LINE} />
      <text x="276" y="270" className="fill-dim font-mono text-[10.5px]">
        pilotctl
      </text>
      <rect x="188.5" y="284.5" width="155" height="64" rx="10" className="fill-bg-deep stroke-fg" strokeOpacity="0.24" />
      <path d={LOGO_MARK_PATH} transform="translate(202 306) scale(0.24)" className="fill-lime-ink" />
      <text x="238" y="314" className="fill-fg text-[13.5px] font-medium">
        Pilot daemon
      </text>
      <text x="238" y="333" className="fill-dim font-mono text-[10.5px]">
        keys · trust
      </text>

      <text x="16" y="306" className="fill-fg text-[15px] font-medium">
        Vertical.
      </text>
      <text x="16" y="326" className="fill-dim font-mono text-[11px]">
        one agent,
      </text>
      <text x="16" y="342" className="fill-dim font-mono text-[11px]">
        many tools
      </text>

      {N.fan.map((d) => (
        <path key={d} d={d} {...LINE} />
      ))}
      <text x="16" y="404" className="fill-dim font-mono text-[11px]">
        encrypted tunnels
      </text>

      {PEERS.map((p, i) => {
        const y = N.peerY[i];
        const lit = animate && step.peer === i && step.leg >= 3;
        return (
          <g key={p.name}>
            <rect
              x="0.5"
              y={y + 0.5}
              width="323"
              height="72"
              rx="10"
              fill="none"
              strokeOpacity={lit ? 0.75 : 0.2}
              strokeDasharray={lit ? undefined : "4 5"}
              className={`transition-[fill,stroke,stroke-opacity] duration-300 ${lit ? "fill-lime/10 stroke-lime-ink" : "fill-transparent stroke-fg"}`}
            />
            <text x="16" y={y + 22} className="fill-lime-ink font-mono text-[11px]">
              {p.tool}
            </text>
            <text x="16" y={y + 44} className={`fill-fg text-[14px] ${p.mono ? "font-mono" : "font-medium"}`}>
              {p.name}
            </text>
            <text x="16" y={y + 62} className="fill-dim font-mono text-[10.5px]">
              {p.note}
            </text>
          </g>
        );
      })}
      <text x="0" y="728" className="fill-fg text-[15px] font-medium">
        Horizontal.
      </text>
      <text x="0" y="748" className="fill-dim font-mono text-[11px]">
        many agents, one network
      </text>

      {animate && (
        <g>
          {step.leg === 0 && <Run id={`a${step.n}`} d={N.bus} ms={LEG_MS[0]} />}
          {step.leg === 1 && <Run id={`b${step.n}`} d={N.down} ms={LEG_MS[1]} />}
          {step.leg === 2 && <Run id={`c${step.n}`} d={N.fan[step.peer]} ms={LEG_MS[2]} />}
        </g>
      )}
    </svg>
  );
}

export function Cross() {
  const { ref, step, animate } = useCall();
  return (
    <div ref={ref}>
      <div className="hidden lg:block">
        <Wide step={step} animate={animate} />
      </div>
      <div className="lg:hidden">
        <Narrow step={step} animate={animate} />
      </div>
    </div>
  );
}
