import type { ReactNode } from "react";
import { ArrowUpRightIcon, DownloadIcon } from "@/components/icons";
import { Button, Command, Eyebrow, GhostButton, Packet, Reveal, TextLink } from "@/components/ui";
import { INSTALL_CMD } from "@/lib/site";
import { LiveFigure } from "./live-figure";

/* The site's own components, rendered live from src/components/ui.tsx. */

function Cell({ name, note, children, className = "" }: { name: string; note: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col justify-between gap-10 bg-bg p-6 sm:p-8 ${className}`}>
      <div className="flex min-h-[64px] flex-wrap items-center gap-3">{children}</div>
      <div>
        <p className="text-[14.5px] font-medium text-fg">{name}</p>
        <p className="mt-1 text-[13.5px] leading-[1.45] text-mute">{note}</p>
      </div>
    </div>
  );
}

export function Parts() {
  return (
    <Reveal className="grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge md:grid-cols-2 lg:grid-cols-3">
      <Cell name="Buttons" note="Solid off-white for the main action, an outline beside it. 40px tall, 2px corners.">
        <Button href="#parts">
          Install
          <DownloadIcon className="size-[13px]" />
        </Button>
        <GhostButton href="#parts">
          Use Pilot Cloud
          <ArrowUpRightIcon className="size-3" />
        </GhostButton>
      </Cell>
      <Cell name="Text link" note="Underlined, with the tilted arrow that nudges on hover.">
        <TextLink href="#parts">Getting started</TextLink>
      </Cell>
      <Cell name="Command" note="One copyable line in a hairline box, with the program in lime.">
        <Command value={INSTALL_CMD} prefix="curl" className="w-full" label="Copy install command">
          {INSTALL_CMD.replace(/^curl/, "")}
        </Command>
      </Cell>
      <Cell name="Section label" note="A packet, an index and a plain name. Sentence case, used sparingly.">
        <Eyebrow index="01">Pilot Protocol</Eyebrow>
      </Cell>
      <Cell name="Live figures" note="A pulsing dot marks numbers that come from the live registry.">
        <LiveFigure />
      </Cell>
      <Cell name="Packets and hairlines" note="Lime squares travel along 1px lines: the network, drawn.">
        <span aria-hidden className="relative block h-2 w-full">
          <span className="absolute inset-x-0 top-1/2 h-px bg-fg/20" />
          <Packet className="absolute top-0 left-[18%] motion-safe:animate-[slide-x_3.4s_var(--ease-in-out)_infinite]" />
          <Packet className="absolute top-0 left-[64%] motion-safe:animate-[slide-x-back_4.2s_var(--ease-in-out)_1.2s_infinite]" />
        </span>
      </Cell>
    </Reveal>
  );
}
