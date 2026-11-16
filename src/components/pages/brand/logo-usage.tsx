import type { CSSProperties, ReactNode } from "react";
import { DownloadIcon } from "@/components/icons";
import { Logo, LogoInline, LogoMark } from "@/components/logo";
import { Reveal } from "@/components/ui";

function Tile({ children, caption, className = "", style }: { children: ReactNode; caption: string; className?: string; style?: CSSProperties }) {
  return (
    <figure className="flex flex-col">
      <div className={`grid min-h-[220px] place-items-center rounded-[16px] p-8 ${className}`} style={style}>
        {children}
      </div>
      <figcaption className="mt-3 font-mono text-[11.5px] text-dim">{caption}</figcaption>
    </figure>
  );
}

const DONTS: { caption: string; style: CSSProperties; className?: string }[] = [
  { caption: "Don’t recolor it", style: { color: "#4f7cff" } },
  { caption: "Don’t stretch it", style: { transform: "scaleX(1.45) scaleY(0.8)" } },
  { caption: "Don’t rotate it", style: { transform: "rotate(-14deg)" } },
  { caption: "Don’t add effects", style: { filter: "drop-shadow(0 0 14px #c6f24e) drop-shadow(0 6px 4px #000)" } },
];

export type LogoFile = { label: string; href: string; size: string; note: string };

export function LogoUsage({ files }: { files: LogoFile[] }) {
  return (
    <div className="flex flex-col gap-16">
      {/* Lockups */}
      <Reveal className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Tile caption="Primary lockup, two lines" className="border border-edge bg-bg-deep md:col-span-2 lg:col-span-1">
          <Logo className="h-auto w-[min(260px,70%)] text-fg" />
        </Tile>
        <Tile caption="One line, for tight spaces like the nav" className="border border-edge bg-bg-deep">
          <LogoInline className="h-auto w-[min(280px,80%)] text-fg" />
        </Tile>
        <Tile caption="The mark on its own: favicon and app icon" className="border border-edge bg-bg-deep">
          <span className="grid size-24 place-items-center rounded-[22px] bg-[#141414] shadow-tile">
            <LogoMark className="h-auto w-[62%] text-lime" />
          </span>
        </Tile>
        <Tile caption="On white" className="bg-white shadow-card">
          <Logo className="h-auto w-[min(220px,70%)] text-ink" />
        </Tile>
        <Tile caption="On lime, in ink" className="bg-lime">
          <Logo className="h-auto w-[min(220px,70%)] text-ink" />
        </Tile>
        <Tile caption="Clear space: the logo's height on every side" className="border border-edge bg-bg-deep">
          <span className="relative block w-[min(150px,46%)]">
            <span aria-hidden className="absolute -inset-x-[19.9%] -inset-y-full border border-dashed border-lime-ink/60" />
            <span aria-hidden className="absolute inset-0 bg-lime/[0.06]" />
            <Logo className="relative h-auto w-full text-fg" />
          </span>
        </Tile>
      </Reveal>

      {/* Don'ts */}
      <div>
        <h3 className="text-[17px] font-medium text-fg">Keep it as drawn</h3>
        <p className="mt-1 text-[14px] text-mute">
          Don&apos;t separate the mark from the wordmark without approval; the favicon and app icon are the approved
          exception.
        </p>
        <Reveal className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {DONTS.map((d) => (
            <figure key={d.caption}>
              <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[16px] border border-edge bg-bg-deep">
                <Logo className="h-auto w-[52%] text-fg" style={d.style} />
                <svg aria-hidden viewBox="0 0 100 75" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                  <line x1="0" y1="75" x2="100" y2="0" className="stroke-fg" strokeOpacity="0.35" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
              <figcaption className="mt-3 font-mono text-[11.5px] text-dim">{d.caption}</figcaption>
            </figure>
          ))}
        </Reveal>
      </div>

      {/* Files */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {files.map((f) => (
          <a
            key={f.href}
            href={f.href}
            download
            className="group flex items-center justify-between gap-4 rounded-[16px] border border-edge-2 px-5 py-4 transition-colors duration-200 hover:border-edge-3 hover:bg-fg/[0.03]"
          >
            <span className="flex min-w-0 flex-col">
              <span className="text-[15px] font-medium text-fg">{f.label}</span>
              <span className="truncate font-mono text-[11.5px] text-dim">
                {f.note} · {f.size}
              </span>
            </span>
            <DownloadIcon className="size-[14px] shrink-0 text-dim transition-[color,transform] duration-300 ease-(--ease-out) group-hover:translate-y-0.5 group-hover:text-lime-ink" />
          </a>
        ))}
      </div>
    </div>
  );
}
