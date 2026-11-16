"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui";
import "@/components/sky/kit.css";

/* The sky site's colours, exactly as defined in src/components/v4/v4.css and src/app/(site)/globals.css. */

type Swatch = { name: string; hex: string; role?: string };

const RAMP: Swatch[] = [
  { name: "sky-900", hex: "#0a2a9c", role: "The top of the sky; contrast bands" },
  { name: "sky-800", hex: "#0b2ca0", role: "Accent text, links and deep panels by day" },
  { name: "sky-600", hex: "#1f5bff", role: "Solid fills: the app icon, toggles, marks" },
  { name: "sky-400", hex: "#5aa9ff", role: "Mid sky; bullets and dots" },
  { name: "sky-200", hex: "#b9dcff", role: "Light fills, with ink text on them" },
  { name: "sky-50", hex: "#eaf3ff", role: "The palest step, for washes" },
];

const NIGHT: Swatch[] = [
  { name: "accent, dark", hex: "#8ec1ff" },
  { name: "fill, dark", hex: "#2f6bff" },
  { name: "deep, dark", hex: "#1438b8" },
];

const LIGHT: Swatch[] = [
  { name: "bg", hex: "#f6f6f1" },
  { name: "card", hex: "#ffffff" },
  { name: "bg-deep", hex: "#efefe9" },
  { name: "faint", hex: "#b3b3ab" },
  { name: "mute", hex: "#696962" },
  { name: "fg", hex: "#141413" },
];

const DARK: Swatch[] = [
  { name: "bg", hex: "#1a1a1a" },
  { name: "card", hex: "#1f1f1e" },
  { name: "bg-deep", hex: "#141414" },
  { name: "faint", hex: "#5d5d57" },
  { name: "mute", hex: "#9b9b93" },
  { name: "fg", hex: "#f2f2ec" },
];

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return {
    copied,
    copy: async (key: string, value: string) => {
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        return;
      }
      setCopied(key);
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
      className="group flex min-w-0 flex-row items-center gap-4 rounded-[14px] text-left lg:flex-col lg:items-stretch lg:gap-0"
    >
      <span
        className="block h-14 w-20 shrink-0 rounded-[12px] shadow-[inset_0_0_0_1px_rgb(20_20_18/0.08)] transition-transform duration-300 ease-(--ease-out) lg:h-32 lg:w-auto [@media(hover:hover)]:group-hover:-translate-y-0.5"
        style={{ background: s.hex }}
      />
      <span className="flex min-w-0 flex-col lg:mt-3">
        <span className="text-[14px] font-medium text-fg">{s.name}</span>
        <span className="font-mono text-[12px] text-mute">{copied ? "Copied" : s.hex}</span>
        {s.role && <span className="mt-0.5 text-[13px] leading-[1.35] text-mute">{s.role}</span>}
      </span>
    </button>
  );
}

function Row({ title, items, cols, copied, copy }: { title: string; items: Swatch[]; cols: string; copied: string | null; copy: (k: string, v: string) => void }) {
  return (
    <div>
      <h3 className="text-[17px] font-medium text-fg">{title}</h3>
      <Reveal className={`mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-3 ${cols}`}>
        {items.map((s) => (
          <Chip key={title + s.name} s={s} copied={copied === title + s.name} onCopy={() => copy(title + s.name, s.hex)} />
        ))}
      </Reveal>
    </div>
  );
}

const HERO = "linear-gradient(180deg, #0a2a9c 0%, #1f5bff 40%, #5aa9ff 76%, #b9dcff 100%)";

export function SkyPalette() {
  const { copied, copy } = useCopy();
  return (
    <div className="flex flex-col gap-16">
      {/* The sky itself, the showcase surface, and the night. */}
      <Reveal className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <button
          type="button"
          onClick={() => copy("hero", HERO)}
          aria-label="Copy the sky gradient"
          className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[12px] p-6 text-left text-white sm:p-8"
          style={{ background: HERO }}
        >
          <span className="font-mono text-[12px] text-white/75">{copied === "hero" ? "Copied" : "#0a2a9c → #1f5bff → #5aa9ff → #b9dcff"}</span>
          <span className="block text-[clamp(40px,5vw,64px)] leading-none font-medium tracking-[-0.045em]">The sky</span>
        </button>
        <div className="grid grid-rows-2 gap-4">
          {/* The showcase surface (src/components/sky/kit.css): fine 45° lines in a 1px frame. */}
          <button
            type="button"
            onClick={() => copy("hatch", "#1a1a1a at 10% (#ffffff at 7% by night), 45°, every 16px")}
            aria-label="Copy the hatching"
            className="sky-hatch-bg sky-frame flex flex-col justify-end rounded-[12px] border p-6 text-left sm:p-8"
          >
            <span className="text-[17px] font-medium text-fg">Hatching</span>
            <span className="mt-1 font-mono text-[12px] text-mute">{copied === "hatch" ? "Copied" : "#1a1a1a 10% · #ffffff 7% · 45°"}</span>
          </button>
          <button
            type="button"
            onClick={() => copy("night", "#040b2c")}
            aria-label="Copy night #040b2c"
            className="flex flex-col justify-end rounded-[12px] p-6 text-left sm:p-8"
            style={{ background: "#040b2c" }}
          >
            <span className="text-[17px] font-medium text-white">Night</span>
            <span className="mt-1 font-mono text-[12px] text-white/70">{copied === "night" ? "Copied" : "#040b2c"}</span>
          </button>
        </div>
      </Reveal>

      <Row
        title="The ramp"
        items={RAMP}
        cols="lg:grid-cols-6"
        copied={copied}
        copy={copy}
      />
      <Row
        title="At night"
        items={NIGHT}
        cols="lg:grid-cols-6"
        copied={copied}
        copy={copy}
      />
      <Row
        title="Paper, by day"
        items={LIGHT}
        cols="lg:grid-cols-6"
        copied={copied}
        copy={copy}
      />
      <Row
        title="Charcoal, at night"
        items={DARK}
        cols="lg:grid-cols-6"
        copied={copied}
        copy={copy}
      />
    </div>
  );
}
