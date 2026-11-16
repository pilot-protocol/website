"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui";

/* Color tokens exactly as defined in src/app/globals.css. */

type Swatch = { name: string; hex: string; role: string };

const DARK: Swatch[] = [
  { name: "ink", hex: "#0b0b0a", role: "Text on lime" },
  { name: "bg-deep", hex: "#141414", role: "Footer, sunken panels" },
  { name: "bg", hex: "#1a1a1a", role: "Page" },
  { name: "card", hex: "#1f1f1e", role: "Cards, raised surfaces" },
  { name: "graphite", hex: "#3a3a37", role: "Drawn lines" },
  { name: "faint", hex: "#5d5d57", role: "Placeholders" },
  { name: "dim", hex: "#8a8a83", role: "Captions" },
  { name: "mute", hex: "#9b9b93", role: "Body copy" },
  { name: "soft", hex: "#cfcfc8", role: "Secondary text" },
  { name: "fg", hex: "#f2f2ec", role: "Headings, text" },
];

const LIGHT: Swatch[] = [
  { name: "bg-deep", hex: "#efefe9", role: "Footer, sunken panels" },
  { name: "bg", hex: "#f6f6f1", role: "Page" },
  { name: "card", hex: "#ffffff", role: "Cards, raised surfaces" },
  { name: "graphite", hex: "#dcdcd5", role: "Drawn lines" },
  { name: "faint", hex: "#b3b3ab", role: "Placeholders" },
  { name: "dim", hex: "#7f7f78", role: "Captions" },
  { name: "mute", hex: "#696962", role: "Body copy" },
  { name: "soft", hex: "#2f2f2c", role: "Secondary text" },
  { name: "fg", hex: "#141413", role: "Headings, text" },
  { name: "lime-ink", hex: "#4f7300", role: "Lime for text" },
];

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return {
    copied,
    copy: async (hex: string) => {
      try {
        await navigator.clipboard.writeText(hex);
      } catch {
        return;
      }
      setCopied(hex);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(null), 1400);
    },
  };
}

function Chip({ s, copied, onCopy }: { s: Swatch; copied: boolean; onCopy: () => void }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy ${s.name} ${s.hex}`}
      className="group flex min-w-0 flex-row items-center gap-4 text-left lg:flex-col lg:items-stretch lg:gap-0"
    >
      <span
        className="block h-14 w-20 shrink-0 rounded-md shadow-[inset_0_0_0_1px_rgb(128_128_120/0.22)] transition-transform duration-300 ease-(--ease-out) group-hover:-translate-y-0.5 lg:h-40 lg:w-auto"
        style={{ background: s.hex }}
      />
      <span className="flex min-w-0 flex-col lg:mt-3">
        <span className="text-[14px] font-medium text-fg">{s.name}</span>
        <span className="font-mono text-[11.5px] text-dim">{copied ? "Copied" : s.hex}</span>
        <span className="mt-0.5 text-[12.5px] leading-[1.35] text-mute">{s.role}</span>
      </span>
    </button>
  );
}

export function Palette() {
  const { copied, copy } = useCopy();
  return (
    <div className="flex flex-col gap-16">
      {/* The one accent. */}
      <Reveal className="grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <button
          type="button"
          onClick={() => copy("#c6f24e")}
          aria-label="Copy lime #c6f24e"
          className="group relative flex min-h-[240px] flex-col justify-between bg-lime p-6 text-left text-ink sm:p-8"
        >
          <span className="font-mono text-[12px]">{copied === "#c6f24e" ? "Copied" : "#c6f24e"}</span>
          <span>
            <span className="block text-[clamp(40px,5vw,64px)] leading-none font-medium tracking-[-0.04em]">Lime</span>
            <span className="mt-3 block max-w-[420px] text-[15px] leading-[1.45] text-ink/75">
              The only accent. Packets, highlights and calls to action; a fill on white sections, never text.
            </span>
          </span>
          <span aria-hidden className="absolute top-6 right-6 size-2 bg-ink sm:top-8 sm:right-8" />
        </button>
        <div className="grid grid-rows-2 gap-px bg-edge">
          <button
            type="button"
            onClick={() => copy("#d4f76e")}
            aria-label="Copy lime-hi #d4f76e"
            className="flex flex-col justify-end p-6 text-left text-ink sm:p-8"
            style={{ background: "#d4f76e" }}
          >
            <span className="text-[17px] font-medium">lime-hi</span>
            <span className="font-mono text-[12px] text-ink/70">{copied === "#d4f76e" ? "Copied" : "#d4f76e"}</span>
          </button>
          <div className="flex flex-col justify-end bg-bg p-6 sm:p-8">
            <span className="flex items-center gap-3">
              <span aria-hidden className="size-2 rounded-[2px] bg-lime" />
              <span className="text-[17px] font-medium text-fg">The packet</span>
            </span>
            <span className="mt-1 text-[13.5px] leading-[1.45] text-mute">An 8px lime square: a message on the network.</span>
          </div>
        </div>
      </Reveal>

      <div>
        <h3 className="text-[17px] font-medium text-fg">Dark theme</h3>
        <p className="mt-1 text-[14px] text-mute">Ten neutrals, warm grey, from the deepest ink to the text color. Click one to copy it.</p>
        <Reveal className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-10 lg:gap-3">
          {DARK.map((s) => (
            <Chip key={s.name} s={s} copied={copied === s.hex} onCopy={() => copy(s.hex)} />
          ))}
        </Reveal>
      </div>

      <div>
        <h3 className="text-[17px] font-medium text-fg">Light theme</h3>
        <p className="mt-1 text-[14px] text-mute">
          Warm paper and white cards, the same names, so every component works in both. Lime stays a fill; text accents
          use lime-ink.
        </p>
        <Reveal className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-10 lg:gap-3">
          {LIGHT.map((s) => (
            <Chip key={s.name} s={s} copied={copied === s.hex} onCopy={() => copy(s.hex)} />
          ))}
        </Reveal>
      </div>

      <div>
        <h3 className="text-[17px] font-medium text-fg">Hairlines</h3>
        <p className="mt-1 text-[14px] text-mute">Borders and grids are the text color at low opacity, so they sit on any surface.</p>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            ["edge", "9% dark · 8% light", "border-edge"],
            ["edge-2", "16% dark · 13% light", "border-edge-2"],
            ["edge-3", "24% dark · 22% light", "border-edge-3"],
          ].map(([n, pct, cls]) => (
            <div key={n}>
              <div className={`h-16 rounded-[12px] border ${cls}`} />
              <p className="mt-3 text-[14px] font-medium text-fg">{n}</p>
              <p className="font-mono text-[11.5px] text-dim">fg at {pct}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
