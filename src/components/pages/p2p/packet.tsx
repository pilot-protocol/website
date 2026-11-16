"use client";

import { useEffect, useState } from "react";
import { LockIcon } from "@/components/icons";
import { at, ObjTile, Stage, WIRE } from "@/components/pages/security/infra";
import { FLAT_CARD } from "@/components/pages/security/kit";
import { Beam } from "@/components/sky/beam";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

/*
 * Sky site: what rides with every packet. Two machines with packets crossing the direct path between them (the
 * round trip is the whole latency), and one packet opened up under the wire: the 34-byte header (flow-control window
 * and CRC32), the encryption envelope (nonce and GCM tag) and the payload, which only the two peers can read. Only the
 * header has a published size, so nothing is to scale.
 */

const W = 480;
const H = 120;
const A: [number, number] = [34, 34];
const B: [number, number] = [446, 34];
const WIRE_D = `M${A[0]} ${A[1]} L${B[0]} ${B[1]}`;
const MID = (A[0] + B[0]) / 2;

const LEGEND: [string, string, string][] = [
  ["Header", "34 bytes: flow-control window + CRC32.", "bg-(--sky-fill)"],
  ["Envelope", "Encryption adds a small, separate envelope: nonce + GCM tag.", "bg-(--sky-fill)/30"],
  ["Payload", "AES-256-GCM, readable only by the two peers.", "bg-fg/[0.12]"],
];

export function SkyPacket() {
  const [ref, inView] = useInView<HTMLElement>({ once: false, margin: "0px" });
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1500);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  return (
    <figure ref={ref} className={`w-full max-w-[540px] p-5 sm:p-7 ${FLAT_CARD}`}>
      <figcaption className="flex items-baseline justify-between gap-4">
        <span className="text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">What rides with every packet</span>
        <span className="shrink-0 text-[13px] text-mute">Not to scale</span>
      </figcaption>

      <div aria-hidden className="mt-6">
        <Stage
          w={W}
          h={H}
          svg={
            <>
              <path d={WIRE_D} className={WIRE} data-lit />
              {inView && <Beam key={tick} d={WIRE_D} run={tick} reverse={tick % 2 === 1} duration={1100} tail={60} width={2} />}
              {/* Zoom lines from the packet on the wire down to the packet opened up. */}
              <path d={`M${MID - 14} 46 L6 ${H}`} className={WIRE} strokeDasharray="2 4" />
              <path d={`M${MID + 14} 46 L${W - 6} ${H}`} className={WIRE} strokeDasharray="2 4" />
            </>
          }
        >
          <div style={at(A[0], A[1], W, H)}>
            <ObjTile name="laptop" size={44} lit />
          </div>
          <div style={at(B[0], B[1], W, H)}>
            <ObjTile name="laptop" size={44} lit />
          </div>
          <span style={at(MID, A[1] - 22, W, H)} className="text-[12.5px] leading-4 whitespace-nowrap text-mute">
            Direct, ≈ RTT
          </span>
          {/* The packet itself, small, on the wire. */}
          <span style={at(MID, A[1] + 6, W, H)} className="flex h-[10px] w-[34px] overflow-hidden rounded-[3px] shadow-[0_0_0_1px_var(--color-card)]">
            <span className="w-[30%] bg-(--sky-fill)" />
            <span className="w-[22%] bg-(--sky-fill)/35" />
            <span className="flex-1 bg-fg/25" />
          </span>
        </Stage>
      </div>

      {/* The same packet, opened. */}
      <div aria-hidden className="flex h-[58px] w-full gap-[3px] overflow-hidden rounded-[12px] text-[12px] leading-4 whitespace-nowrap">
        <span className="flex w-[30%] min-w-[118px] flex-col justify-center bg-(--sky-fill) px-2.5 text-white sm:px-3">
          <span className="font-medium">34 B header</span>
          <span className="font-mono text-[11px] text-white/80">window · CRC32</span>
        </span>
        <span className="flex w-[24%] min-w-[86px] flex-col justify-center bg-(--sky-fill)/16 px-2.5 text-(--sky-accent) sm:px-3">
          <span className="font-medium">Envelope</span>
          <span className="font-mono text-[11px] opacity-80">nonce · tag</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col justify-center bg-fg/[0.05] px-2.5 text-mute sm:px-3">
          <span className="flex items-center gap-1.5 font-medium text-fg">
            <LockIcon className="size-3" /> Payload
          </span>
          <span className="truncate font-mono text-[11px]">a7f3 09e1 5c2b 8d40</span>
        </span>
      </div>

      <dl className="mt-6 border-t border-(--sky-card-line) text-[14.5px] leading-[1.5]">
        {LEGEND.map(([k, v, swatch]) => (
          <div
            key={k}
            className="grid grid-cols-[10px_minmax(0,1fr)] gap-x-3 border-b border-(--sky-card-line) py-3.5 last:border-b-0 last:pb-0 sm:grid-cols-[10px_88px_minmax(0,1fr)]"
          >
            <span aria-hidden className={`mt-[7px] size-2.5 rounded-[3px] ${swatch}`} />
            <dt className="font-medium text-fg">{k}</dt>
            <dd className="col-start-2 text-mute sm:col-start-3">{v}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
