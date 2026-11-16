"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LockIcon } from "@/components/icons";
import { curve, NodeLabel, ObjTile, Stage, WIRE, at, type Pt } from "@/components/pages/security/infra";
import { Code, CodePanel, FLAT_CARD, SectionHead, SKY, Soft } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { Reveal } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import "./self-hosting.css";

const BUILD = `# on the registry host (Go, at the version in go.mod)
$ git clone https://github.com/pilot-protocol/rendezvous
$ cd rendezvous && go build ./cmd/rendezvous

# registry on TCP 9000, beacon on UDP 9001, dashboard on 3000
$ export PILOT_ADMIN_TOKEN="$(openssl rand -hex 32)"
$ ./rendezvous -registry-addr :9000 -beacon-addr :9001 \\
    -store /var/lib/pilot/registry.json -http 127.0.0.1:3000`;

const POINT = `# on each agent machine
$ pilotctl daemon start --registry registry.example.com:9000 \\
    --beacon registry.example.com:9001`;

const NETWORK = `# create a network with the admin token, then join it
$ export PILOT_REGISTRY=registry.example.com:9000
$ pilotctl network create --name ops --join-rule token \\
    --token "$JOIN_TOKEN" --node-id <your node id>
$ pilotctl network join <network id> --token "$JOIN_TOKEN"`;

const SETTINGS = `# OIDC/JWT: tokens checked against your JWKS
$ pilotctl extras idp set --type oidc \\
    --url https://login.example.com/.well-known/jwks.json \\
    --issuer https://login.example.com --client-id pilot

# audit export to Splunk (or --format syslog_cef | json)
$ pilotctl extras audit-export set --format splunk_hec \\
    --endpoint https://splunk.example.com:8088/services/collector \\
    --splunk-token "$HEC_TOKEN"

# a whole network from one file, and roles from your directory
$ pilotctl extras provision ops-blueprint.json
$ pilotctl extras directory-sync directory.json --network <id> --remove-unlisted`;

type Port = { port: string; what: string; reach: "open" | "local" | "disk"; note: string };

const PORTS: Port[] = [
  { port: "TCP :9000", what: "registry", reach: "open", note: "TCP 9000" },
  { port: "UDP :9001", what: "beacon", reach: "open", note: "UDP 9001" },
  { port: "127.0.0.1:3000", what: "dashboard", reach: "local", note: "stays on the host" },
  { port: "-store", what: "state on disk", reach: "disk", note: "without it, memory only" },
];

/** The registry host, what it listens on, and which of those your agents reach through the firewall. */
function Ports() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  return (
    <div
      ref={ref}
      data-play={inView}
      className="sh-play pp-island"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-edge md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)]">
        <p className="px-4 py-3 font-mono text-[12px] text-dim sm:px-5">
          registry host · <span className="text-fg">rendezvous</span>
        </p>
        <p className="hidden border-l border-edge px-5 py-3 font-mono text-[12px] text-dim md:block">your firewall</p>
        <p className="border-l border-edge px-4 py-3 font-mono text-[12px] text-dim sm:px-5">agent machines</p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)]">
        {PORTS.map((p, i) => (
          <Row key={p.port} p={p} i={i} />
        ))}
        {/* Agent machines span the two open rows. */}
        <div className="col-start-2 row-span-2 row-start-1 flex flex-col justify-center gap-2 border-l border-edge p-3 sm:p-4 md:col-start-3">
          {[0, 1, 2].map((k) => (
            <div key={k} className="flex items-center gap-2.5 rounded-[16px] border border-edge-2 px-3 py-2">
              <span aria-hidden className="size-1.5 bg-fg" />
              <span className="font-mono text-[11.5px] text-soft">pilot-daemon</span>
            </div>
          ))}
        </div>
        <div className="col-start-2 row-span-2 row-start-3 border-l border-edge md:col-start-3" />
      </div>
    </div>
  );
}

function Row({ p, i }: { p: Port; i: number }) {
  const open = p.reach === "open";
  return (
    <>
      <div
        className="col-start-1 flex items-center justify-between gap-4 border-b border-edge px-4 py-4 sm:px-5"
        style={{ gridRowStart: i + 1 }}
      >
        <span className="flex min-w-0 flex-col">
          <span className={`font-mono text-[13px] ${open ? "text-fg" : "text-soft"}`}>{p.port}</span>
          <span className="mt-0.5 text-[13.5px] text-mute">{p.what}</span>
        </span>
        <span
          aria-hidden
          className={`size-2.5 shrink-0 ${open ? "bg-lime" : "border border-edge-3"}`}
        />
      </div>
      <div
        className="relative col-start-2 hidden items-center border-b border-l border-edge px-5 md:flex"
        style={{ gridRowStart: i + 1 }}
      >
        {open ? (
          <>
            <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-edge-3" />
            <span
              aria-hidden
              className="kit-motion absolute top-1/2 -mt-1 size-2 bg-lime"
              style={{
                animation: `sh-cross-back ${i === 0 ? 2.2 : 1.7}s var(--ease-in-out) ${i * 0.6}s infinite both`,
              }}
            />
            <span className="relative mx-auto rounded-md border border-lime-ink/50 bg-bg-deep px-2 py-[3px] font-mono text-[11px] text-lime-ink">
              open {p.note}
            </span>
          </>
        ) : (
          <span className="font-mono text-[11.5px] text-faint">{p.note}</span>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Sky site: the registry host, your firewall and the agent machines   */
/* ------------------------------------------------------------------ */

type HL = {
  w: number;
  h: number;
  small: boolean;
  host: { x: number; y: number; w: number; h: number };
  server: Pt;
  dash: Pt;
  disk: Pt;
  /** The two ports on the host's edge, TCP 9000 then UDP 9001. */
  ports: [Pt, Pt];
  /** The firewall: a wall with two openings, one per port. */
  wall: { x: number; y: number; w: number; h: number };
  gaps: [Pt, Pt];
  agents: Pt[];
  tile: number;
};

const H_WIDE: HL = {
  w: 1160,
  h: 380,
  small: false,
  host: { x: 0, y: 10, w: 520, h: 360 },
  server: [180, 140],
  dash: [110, 268],
  disk: [250, 268],
  ports: [
    [520, 130],
    [520, 250],
  ],
  wall: { x: 716, y: 24, w: 12, h: 332 },
  gaps: [
    [722, 130],
    [722, 250],
  ],
  agents: [
    [990, 70],
    [990, 190],
    [990, 310],
  ],
  tile: 60,
};

const H_NARROW: HL = {
  w: 340,
  h: 600,
  small: true,
  host: { x: 0, y: 290, w: 340, h: 310 },
  server: [170, 392],
  dash: [90, 516],
  disk: [250, 516],
  ports: [
    [110, 290],
    [230, 290],
  ],
  wall: { x: 4, y: 200, w: 332, h: 10 },
  gaps: [
    [110, 205],
    [230, 205],
  ],
  agents: [
    [60, 64],
    [170, 64],
    [280, 64],
  ],
  tile: 50,
};

/** Where each daemon's wires join, just outside the firewall's opening for that port. */
function joint(L: HL, port: 0 | 1): Pt {
  const gap = L.gaps[port];
  return L.small ? [gap[0], gap[1] - 46] : [gap[0] + 80, gap[1]];
}

/** The shared run from the joint, through the opening, to the port and on to the server. */
function trunk(L: HL, port: 0 | 1) {
  const gap = L.gaps[port];
  const edge = L.ports[port];
  const j = joint(L, port);
  return L.small
    ? `M${j[0]} ${j[1]} L${gap[0]} ${gap[1]} L${edge[0]} ${edge[1]} ${curve(edge, L.server, "y").replace(/^M[^C]+/, "")}`
    : `M${j[0]} ${j[1]} L${gap[0]} ${gap[1]} L${edge[0]} ${edge[1]} ${curve(edge, L.server, "x").replace(/^M[^C]+/, "")}`;
}

/** A daemon's own wire to the joint. */
function fan(L: HL, agent: Pt, port: 0 | 1) {
  return curve(agent, joint(L, port), L.small ? "y" : "x");
}

/** The whole way, for the beam: machine, through the firewall's opening, to the port on the host. */
function hostWire(L: HL, agent: Pt, port: 0 | 1) {
  return `${fan(L, agent, port)} ${trunk(L, port).replace(/^M\S+ \S+ /, "")}`;
}

function HostDiagram({ L, tick, inView }: { L: HL; tick: number; inView: boolean }) {
  const lane = (tick % 2) as 0 | 1;
  const who = tick % L.agents.length;
  const wires = L.agents.flatMap((a, i) => [0, 1].map((port) => ({ d: fan(L, a, port as 0 | 1), i, port })));
  const h = L.host;
  const W = L.wall;
  const gapHalf = L.small ? 18 : 22;
  return (
    <Stage
      w={L.w}
      h={L.h}
      svg={
        <>
          <rect
            x={h.x + 0.5}
            y={h.y + 0.5}
            width={h.w - 1}
            height={h.h - 1}
            rx={L.small ? 18 : 24}
            className="fill-[color-mix(in_srgb,var(--color-fg)_3%,var(--color-bg))] stroke-(--sky-card-line)"
          />
          {wires.map((x) => (
            <path key={`${x.i}-${x.port}`} d={x.d} className={WIRE} data-lit={inView && x.i === who && x.port === lane} />
          ))}
          {([0, 1] as const).map((port) => (
            <path key={port} d={trunk(L, port)} className={WIRE} data-lit={inView && port === lane} />
          ))}
          {/* The dashboard and the store stay on the host. */}
          <path d={curve(L.server, L.dash, "y")} className={WIRE} />
          <path d={curve(L.server, L.disk, "y")} className={WIRE} />
          {/* Your firewall: solid except for the two openings. */}
          {L.small ? (
            <>
              <rect x={W.x} y={W.y} width={L.gaps[0][0] - gapHalf - W.x} height={W.h} rx={W.h / 2} className="fill-fg/[0.14]" />
              <rect
                x={L.gaps[0][0] + gapHalf}
                y={W.y}
                width={L.gaps[1][0] - gapHalf - (L.gaps[0][0] + gapHalf)}
                height={W.h}
                rx={W.h / 2}
                className="fill-fg/[0.14]"
              />
              <rect x={L.gaps[1][0] + gapHalf} y={W.y} width={W.x + W.w - (L.gaps[1][0] + gapHalf)} height={W.h} rx={W.h / 2} className="fill-fg/[0.14]" />
            </>
          ) : (
            <>
              <rect x={W.x} y={W.y} width={W.w} height={L.gaps[0][1] - gapHalf - W.y} rx={W.w / 2} className="fill-fg/[0.14]" />
              <rect
                x={W.x}
                y={L.gaps[0][1] + gapHalf}
                width={W.w}
                height={L.gaps[1][1] - gapHalf - (L.gaps[0][1] + gapHalf)}
                rx={W.w / 2}
                className="fill-fg/[0.14]"
              />
              <rect x={W.x} y={L.gaps[1][1] + gapHalf} width={W.w} height={W.y + W.h - (L.gaps[1][1] + gapHalf)} rx={W.w / 2} className="fill-fg/[0.14]" />
            </>
          )}
          {inView && (
            <Beam key={tick} d={hostWire(L, L.agents[who], lane)} run={tick} duration={1500} tail={L.small ? 46 : 70} />
          )}
        </>
      }
    >
      <span
        className="absolute text-[12.5px] leading-4 whitespace-nowrap text-mute"
        style={{ left: `${((h.x + (L.small ? 16 : 22)) / L.w) * 100}%`, top: `${((h.y + (L.small ? 16 : 20)) / L.h) * 100}%` }}
      >
        Registry host
      </span>
      <span
        className="absolute -translate-x-1/2 text-[12.5px] leading-4 whitespace-nowrap text-mute"
        style={
          L.small
            ? { left: "50%", top: `${((W.y + W.h + 14) / L.h) * 100}%` }
            : { left: `${((W.x + W.w / 2) / L.w) * 100}%`, top: `${((W.y - 22) / L.h) * 100}%` }
        }
      >
        Your firewall
      </span>

      <div style={at(L.server[0], L.server[1], L.w, L.h, L.tile + 12)}>
        <ObjTile name="server" size={L.tile + 12} lit={inView} />
        <NodeLabel title="rendezvous" sub="registry + beacon" mono={false} className="absolute top-full left-1/2 mt-3 -translate-x-1/2" />
      </div>
      <div style={at(L.dash[0], L.dash[1], L.w, L.h, L.tile - 8)}>
        <ObjTile name="monitor" size={L.tile - 8} badge={<LockIcon className="size-2.5" />} />
        <NodeLabel title="Dashboard" sub="127.0.0.1:3000" className="absolute top-full left-1/2 mt-2.5 -translate-x-1/2" />
      </div>
      <div style={at(L.disk[0], L.disk[1], L.w, L.h, L.tile - 8)}>
        <ObjTile name="disk" size={L.tile - 8} />
        <NodeLabel title="State" sub="-store" className="absolute top-full left-1/2 mt-2.5 -translate-x-1/2" />
      </div>

      {(["TCP", "UDP"] as const).map((proto, i) => (
        <span key={proto} style={at(L.ports[i][0], L.ports[i][1], L.w, L.h)}>
          <span className="infra-chip" data-tone="sky">
            <span className="font-mono">
              {proto} {i === 0 ? "9000" : "9001"}
            </span>
            {!L.small && <span className="font-normal text-mute">{i === 0 ? "registry" : "beacon"}</span>}
          </span>
        </span>
      ))}

      {L.small && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[12.5px] leading-4 whitespace-nowrap text-mute">
          Agent machines <span className="font-mono text-[11.5px]">pilot-daemon</span>
        </span>
      )}
      {L.agents.map((p, i) => (
        <div key={i} style={at(p[0], p[1], L.w, L.h, L.tile)}>
          <ObjTile name="laptop" size={L.tile} lit={inView && i === who} />
          {!L.small && (
            <span className="absolute top-1/2 left-full ml-4 -translate-y-1/2 font-mono text-[11.5px] leading-4 whitespace-nowrap text-mute">
              pilot-daemon
            </span>
          )}
        </div>
      ))}
    </Stage>
  );
}

/**
 * The sky site's version of the ports drawing, as the machines it describes: the registry host (rendezvous, its
 * dashboard on localhost and its state on disk), your firewall with exactly two openings, and the agent machines
 * dialling in through them.
 */
function SkyPorts() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const [tick, setTick] = useState(0);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1700);
    return () => window.clearInterval(id);
  }, [inView, reduced]);
  return (
    <div ref={ref} className={`${FLAT_CARD} px-4 py-8 sm:px-10 sm:py-12`}>
      <div className="hidden md:block">
        <HostDiagram L={H_WIDE} tick={tick} inView={inView} />
      </div>
      <div className="mx-auto max-w-[380px] md:hidden">
        <HostDiagram L={H_NARROW} tick={tick} inView={inView} />
      </div>
    </div>
  );
}

function Step({ n, title, where, meta, children, code }: { n: string; title: string; where: string; meta?: string; children?: ReactNode; code: string }) {
  if (SKY)
    // The service page's numbered list (Figma 218:22856): the number in a 24px dot beside the title.
    return (
      <Reveal className="grid grid-cols-1 gap-5 border-t border-(--sky-card-line) pt-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
        <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-3">
          <span className="sky-step-dot tabular-nums">{Number(n)}</span>
          <div className="min-w-0">
            <h3 className="text-[18px] leading-6 font-medium tracking-[-0.03em] text-fg">{title}</h3>
            {children && <div className="mt-2 text-[14.5px] leading-[1.55] text-pretty text-mute">{children}</div>}
          </div>
        </div>
        <CodePanel title={where} meta={meta} code={code} />
      </Reveal>
    );
  return (
    <Reveal className="grid grid-cols-1 gap-5 border-t border-edge pt-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
      <div>
        <p className="font-mono text-[12px] text-lime-ink">{n}</p>
        <h3 className="mt-3 text-[20px] leading-[1.25] font-medium tracking-[-0.02em] text-fg">{title}</h3>
        {children && <div className="mt-2 text-[14.5px] leading-[1.55] text-mute">{children}</div>}
      </div>
      <CodePanel title={where} meta={meta} code={code} />
    </Reveal>
  );
}

export function Run() {
  return (
    <section id="run" aria-labelledby="run-title" className={SKY ? "scroll-mt-20 pb-24 sm:pb-32" : "border-t border-edge py-24 sm:py-32"}>
      <div className="wrap">
        <SectionHead
          id="run-title"
          kicker="Build and run"
          center={SKY}
          title={
            SKY ? (
              <>
                From source <span className="block text-mute">to first network.</span>
              </>
            ) : (
              <>
                From source <Soft>to first network.</Soft>
              </>
            )
          }
          lede={
            <>
              The build is plain Go with no cgo. Open TCP 9000 and UDP 9001 to your agents. Without <Code>-store</Code>,
              the registry keeps its state in memory only.
            </>
          }
        />

        <Reveal delay={80} className="mt-14 sm:mt-16">
          {SKY ? <SkyPorts /> : <Ports />}
        </Reveal>

        <div className="mt-16 flex flex-col gap-12">
          <Step n="01" title="Build and start the registry" where="ops@registry ~ rendezvous" meta="go build" code={BUILD}>
            One process serves the registry and the beacon. Keep the admin token secret: it can create and change every
            network.
          </Step>
          <Step n="02" title="Point your daemons at it" where="agent@node ~" code={POINT}>
            A daemon talks to one registry at a time.
          </Step>
          <Step n="03" title="Create a network and join it" where="agent@node ~" meta="admin token" code={NETWORK}>
            <Code>pilotctl info</Code> shows your node ID.
          </Step>
          <Step n="04" title="Turn on the registry controls" where="ops@registry ~ registry settings" meta="admin token" code={SETTINGS}>
            Registry admin commands sit under <Code>pilotctl extras</Code> and read <Code>PILOT_REGISTRY</Code> and{" "}
            <Code>PILOT_ADMIN_TOKEN</Code>.
          </Step>
        </div>
      </div>
    </section>
  );
}
