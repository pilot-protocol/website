import type { ReactNode } from "react";
import { Logo, PilotMarkP } from "@/components/logo";
import { Glyph } from "@/components/pages/about/glyphs";

/* eslint-disable @next/next/no-img-element */

/*
 * Sky: the press page's quick rules as the specimens a brand guide shows: each rule next to the logo used that way,
 * right (a blue tick) or wrong (an ink cross). The sky lockup is 173 × 24: the P is the first 18 units, the
 * wordmark starts at 31.92.
 */

const H = 15; // the specimens' logo height, px
const W = (H * 173) / 24;
const WORD_X = (H * 31.92) / 24;

const DO: { rule: string; specimen: ReactNode }[] = [
  {
    rule: "Set the logo in ink on light backgrounds and in white on blue or dark ones.",
    specimen: (
      <span className="grid size-full grid-cols-2">
        <span className="grid place-items-center bg-white text-ink">
          <Logo style={{ height: 12, width: (12 * 173) / 24 }} />
        </span>
        <span className="grid place-items-center bg-(--sky-800) text-white">
          <Logo style={{ height: 12, width: (12 * 173) / 24 }} />
        </span>
      </span>
    ),
  },
  {
    rule: "Keep clear space equal to the logo’s height.",
    specimen: (
      <span className="grid size-full place-items-center bg-white text-ink">
        <span className="relative" style={{ padding: H }}>
          <span aria-hidden className="absolute inset-0 rounded-[2px] border border-dashed border-(--sky-fill)/60" />
          <span aria-hidden className="absolute top-0 left-1/2 w-px -translate-x-1/2 bg-(--sky-fill)/60" style={{ height: H }} />
          <span aria-hidden className="absolute top-1/2 left-0 h-px -translate-y-1/2 bg-(--sky-fill)/60" style={{ width: H }} />
          <Logo style={{ height: H, width: W }} />
        </span>
      </span>
    ),
  },
  {
    rule: "Use the sky blues for accents; paper and white stay the ground.",
    specimen: (
      <span className="flex size-full">
        <span className="flex-[4] bg-[#f6f6f1]" />
        <span className="flex-[4] bg-white" />
        <span className="flex-[1] bg-(--sky-fill)" />
        <span className="flex-[1] bg-(--sky-800)" />
      </span>
    ),
  },
];

const DONT: { rule: string; specimen: ReactNode }[] = [
  {
    rule: "Recolor, stretch or rotate the logo.",
    specimen: (
      <span className="flex size-full items-center justify-around bg-white px-2 text-ink">
        <PilotMarkP className="h-6 w-auto text-[#e8590c]" />
        <PilotMarkP className="h-6 w-auto scale-x-[1.7]" />
        <PilotMarkP className="h-6 w-auto -rotate-[18deg]" />
      </span>
    ),
  },
  {
    rule: "Separate the mark from the wordmark, except as the app icon.",
    specimen: (
      <span className="flex size-full items-center justify-center gap-7 bg-white text-ink">
        <PilotMarkP style={{ height: H + 6 }} className="w-auto" />
        <span className="overflow-hidden" style={{ width: W - WORD_X, height: H }}>
          <Logo style={{ height: H, width: W, marginLeft: -WORD_X }} />
        </span>
      </span>
    ),
  },
  {
    rule: "Bring back the lime accent or the earlier mark.",
    specimen: (
      <span className="grid size-full place-items-center bg-[#141414]">
        <img src="/brand/pilot-protocol-mark-lime.svg" alt="" width={113} height={72} className="h-6 w-auto" />
      </span>
    ),
  },
];

function Badge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`absolute top-2 right-2 grid size-5 place-items-center rounded-full ring-2 ring-white ${ok ? "bg-(--sky-fill) text-white" : "bg-ink text-white"}`}
    >
      <Glyph name={ok ? "check" : "x"} className="size-3" />
    </span>
  );
}

function Column({ title, ok, items }: { title: string; ok: boolean; items: { rule: string; specimen: ReactNode }[] }) {
  return (
    <div>
      <p className="border-b border-fg/20 pb-2.5 text-[15px] font-medium text-fg">{title}</p>
      <ul className="mt-4 flex flex-col gap-5">
        {items.map((it) => (
          <li key={it.rule}>
            <span aria-hidden className="relative block h-[84px] overflow-hidden rounded-[8px] ring-1 ring-(--sky-card-line)">
              {it.specimen}
              <Badge ok={ok} />
            </span>
            <p className="mt-2.5 text-[14px] leading-[1.5] text-pretty text-soft">{it.rule}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Rules() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6">
      <Column title="Do" ok items={DO} />
      <Column title="Don’t" ok={false} items={DONT} />
    </div>
  );
}
