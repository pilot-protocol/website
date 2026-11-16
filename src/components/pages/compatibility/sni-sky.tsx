"use client";

import type { ReactNode } from "react";
import { LineIcon, Tile, type IconName } from "@/components/pages/compatibility/marks";
import { Beam } from "@/components/sky/beam";
import type { Brand } from "@/components/v4/logos";

/*
 * Sky site: single-port 443 as a picture. The compat daemon's one TLS connection carries a ClientHello whose SNI
 * names the service; nginx on :443 reads it before anything is decrypted and sends registry traffic to the TLS
 * terminator in front of the registry, beacon traffic to the WebSocket vhost in front of the beacon. Nodes are HTML on
 * a fixed-ratio stage; the wires and the beam are SVG, with soft curves where the routes split.
 */

type Pt = [number, number];
type Layout = {
  w: number;
  h: number;
  vertical: boolean;
  daemon: Pt;
  hello: Pt;
  nginx: Pt;
  term: Pt;
  registry: Pt;
  wss: Pt;
  beacon: Pt;
  toRegistry: string;
  toBeacon: string;
};

const WIDE: Layout = {
  w: 1000,
  h: 330,
  vertical: false,
  daemon: [96, 190],
  hello: [390, 58],
  nginx: [390, 190],
  term: [700, 98],
  registry: [905, 98],
  wss: [700, 282],
  beacon: [905, 282],
  toRegistry: "M96 190H470C548 190 548 98 626 98H905",
  toBeacon: "M96 190H470C548 190 548 282 626 282H905",
};

const NARROW: Layout = {
  w: 360,
  h: 620,
  vertical: true,
  daemon: [180, 36],
  hello: [180, 112],
  nginx: [180, 214],
  term: [92, 382],
  registry: [92, 548],
  wss: [268, 382],
  beacon: [268, 548],
  toRegistry: "M180 36V250C180 316 92 316 92 382V548",
  toBeacon: "M180 36V250C180 316 268 316 268 382V548",
};

const HOSTS = ["registry.pilotprotocol.network", "beacon.pilotprotocol.network"] as const;

function At({ p, L, children, className = "" }: { p: Pt; L: Layout; children: ReactNode; className?: string }) {
  return (
    <div className={`absolute -translate-x-1/2 -translate-y-1/2 ${className}`} style={{ left: `${(p[0] / L.w) * 100}%`, top: `${(p[1] / L.h) * 100}%` }}>
      {children}
    </div>
  );
}

function Node({
  icon,
  brand,
  accent,
  title,
  sub,
  lit,
  compact,
}: {
  icon?: IconName;
  brand?: Brand;
  accent?: boolean;
  title: ReactNode;
  sub: ReactNode;
  lit: boolean;
  compact: boolean;
}) {
  return (
    <div
      data-lit={lit}
      className={`sky-card flex items-center gap-3 rounded-[14px]! transition-[box-shadow,opacity] duration-500 data-[lit=true]:shadow-[0_0_0_1px_var(--sky-fill)] ${
        compact ? "w-[164px] p-2 pr-2.5" : "p-2.5 pr-4"
      }`}
    >
      <Tile icon={icon} brand={brand} accent={accent} size={compact ? "sm" : "md"} />
      <span className="flex min-w-0 flex-col">
        <span className={`leading-5 font-medium tracking-[-0.01em] whitespace-nowrap text-fg ${compact ? "text-[13px]" : "text-[14.5px]"}`}>{title}</span>
        <span className={`leading-[18px] whitespace-nowrap text-mute ${compact ? "text-[11.5px]" : "text-[12.5px]"}`}>{sub}</span>
      </span>
    </div>
  );
}

function Stage({ L, step, run }: { L: Layout; step: number; run: number }) {
  const toReg = step === 0;
  const c = L.vertical;
  return (
    <div aria-hidden className="relative w-full" style={{ aspectRatio: `${L.w} / ${L.h}` }}>
      <svg viewBox={`0 0 ${L.w} ${L.h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <path d={L.toRegistry} fill="none" strokeWidth={1.5} className={`transition-[stroke] duration-500 ${toReg ? "stroke-(--sky-fill)/50" : "stroke-fg/[0.09]"}`} />
        <path d={L.toBeacon} fill="none" strokeWidth={1.5} className={`transition-[stroke] duration-500 ${toReg ? "stroke-fg/[0.09]" : "stroke-(--sky-fill)/50"}`} />
        {[0, 1].map((i) => (
          <Beam key={`${step}-${i}`} d={toReg ? L.toRegistry : L.toBeacon} run={run} duration={2000} delay={100 + i * 750} tail={c ? 70 : 120} />
        ))}
      </svg>

      {/* What travels on the wire: a ClientHello, its SNI naming the service. */}
      <At p={L.hello} L={L}>
        <span
          key={step}
          className="flex animate-[kit-pop_350ms_var(--ease-out)_both] items-center gap-2 rounded-full bg-card py-1 pr-3 pl-1 ring-1 ring-(--sky-fill)/30 ring-inset"
        >
          <span className="grid size-6 place-items-center rounded-full bg-(--sky-tint) text-(--sky-accent)">
            <LineIcon name="lock" className="size-[13px]" />
          </span>
          <span className="font-mono text-[11.5px] whitespace-nowrap text-mute">
            SNI <span className="text-(--sky-accent)">{HOSTS[step]}</span>
          </span>
        </span>
      </At>

      <At p={L.daemon} L={L}>
        <Node icon="laptop" title="Compat daemon" sub="Outbound: TCP/443 only" lit={false} compact={false} />
      </At>
      <At p={L.nginx} L={L}>
        <div className="sky-card flex flex-col items-center rounded-[16px]! px-5 pt-4 pb-3.5 text-center shadow-[0_0_0_1px_var(--sky-fill)]">
          <Tile brand="nginx" size="lg" />
          <span className="mt-3 flex items-baseline gap-1.5 text-[15px] leading-5 font-medium tracking-[-0.01em] text-fg">
            nginx <span className="font-mono text-[13px] font-normal text-(--sky-accent)">:443</span>
          </span>
          <span className="mt-0.5 text-[12.5px] leading-[18px] whitespace-nowrap text-mute">Reads the SNI, then routes</span>
        </div>
      </At>
      <At p={L.term} L={L}>
        <Node icon="lock" title="TLS terminator" sub="Plain bytes onward" lit={toReg} compact={c} />
      </At>
      <At p={L.registry} L={L}>
        <Node icon="book" accent title="Registry" sub="Control" lit={toReg} compact={c} />
      </At>
      <At p={L.wss} L={L}>
        <Node icon="link" title="WSS vhost" sub="WebSocket Secure" lit={!toReg} compact={c} />
      </At>
      <At p={L.beacon} L={L}>
        <Node icon="antenna" accent title="Beacon" sub="Data plane" lit={!toReg} compact={c} />
      </At>
    </div>
  );
}

export function SniStage({ step, run }: { step: number; run: number }) {
  return (
    <>
      {/* The wide stage needs room for its six nodes; below xl the stacked one reads better. */}
      <div className="hidden xl:block">
        <Stage L={WIDE} step={step} run={run} />
      </div>
      <div className="mx-auto max-w-[380px] md:max-w-[440px] xl:hidden">
        <Stage L={NARROW} step={step} run={run} />
      </div>
    </>
  );
}
