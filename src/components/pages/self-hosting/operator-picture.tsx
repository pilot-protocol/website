"use client";

import { useEffect, useState } from "react";
import { KeyIcon } from "@/components/icons";
import { at, curve, NodeLabel, ObjTile, Stage, WIRE, type Pt } from "@/components/pages/security/infra";
import { Beam } from "@/components/sky/beam";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

/*
 * Sky site: "Same protocol, different operator" as the choice it is. One agent machine in the middle; the public
 * backbone on one side (the default) and your registry on the other (two flags). The admin token sits with whoever
 * runs each: its operators, or you. Messages go one way, then the other.
 */

type L = { w: number; h: number; pub: Pt; me: Pt; yours: Pt; small: boolean };
const WIDE: L = { w: 960, h: 150, pub: [150, 46], me: [480, 46], yours: [810, 46], small: false };
const NARROW: L = { w: 340, h: 620, pub: [170, 40], me: [170, 290], yours: [170, 540], small: true };

function TokenBadge({ mine }: { mine: boolean }) {
  return (
    <span className={`grid size-full place-items-center rounded-full ${mine ? "bg-(--sky-fill) text-white" : "text-mute"}`}>
      <KeyIcon className="size-3" />
    </span>
  );
}

function Picture({ L, tick, inView }: { L: L; tick: number; inView: boolean }) {
  const axis = L.small ? "y" : "x";
  const toPub = curve(L.me, L.pub, axis);
  const toYours = curve(L.me, L.yours, axis);
  const side = tick % 2;
  const cmdAt = (p: Pt): Pt => (L.small ? [p[0], (p[1] + L.me[1]) / 2] : [(p[0] + L.me[0]) / 2, p[1]]);
  return (
    <Stage
      w={L.w}
      h={L.h}
      svg={
        <>
          <path d={toPub} className={WIRE} data-lit={inView && side === 0} />
          <path d={toYours} className={WIRE} data-lit={inView && side === 1} />
          {inView && <Beam key={tick} d={side === 0 ? toPub : toYours} run={tick} duration={1000} tail={L.small ? 44 : 64} />}
        </>
      }
    >
      <div style={at(L.pub[0], L.pub[1], L.w, L.h, 60)} className="flex flex-col items-center">
        <ObjTile name="globe" size={60} badge={<TokenBadge mine={false} />} />
        <NodeLabel title="Public backbone" sub="Admin token: its operators" mono={false} className="mt-3 rounded-[8px] bg-card px-2 py-0.5" />
      </div>
      <div style={at(L.me[0], L.me[1], L.w, L.h, 60)} className="flex flex-col items-center">
        <ObjTile name="laptop" size={60} lit={inView} />
        <NodeLabel title="Your agent machine" sub="pilot-daemon" className="mt-3 rounded-[8px] bg-card px-2 py-0.5" />
      </div>
      <div style={at(L.yours[0], L.yours[1], L.w, L.h, 60)} className="flex flex-col items-center">
        <ObjTile name="server" size={60} lit={inView && side === 1} badge={<TokenBadge mine />} />
        <NodeLabel title="Your registry" sub="Admin token: you" mono={false} className="mt-3 rounded-[8px] bg-card px-2 py-0.5" />
      </div>
      <span style={at(...cmdAt(L.pub), L.w, L.h)} className="infra-chip font-mono font-normal">
        pilotctl daemon start
      </span>
      <span style={at(...cmdAt(L.yours), L.w, L.h)} className="infra-chip font-mono font-normal" data-tone="sky">
        --registry · --beacon
      </span>
    </Stage>
  );
}

export function OperatorPicture() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1600);
    return () => window.clearInterval(id);
  }, [inView, reduced]);
  return (
    <div ref={ref} aria-hidden className="px-4 pt-8 pb-8 sm:px-8 sm:pt-10">
      <div className="hidden md:block">
        <Picture L={WIDE} tick={tick} inView={inView} />
      </div>
      <div className="mx-auto max-w-[360px] md:hidden">
        <Picture L={NARROW} tick={tick} inView={inView} />
      </div>
    </div>
  );
}
