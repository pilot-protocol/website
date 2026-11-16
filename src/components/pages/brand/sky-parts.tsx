"use client";

import { useState, type ReactNode } from "react";
import { ArrowUpRightIcon, DownloadIcon } from "@/components/icons";
import { PilotMarkP } from "@/components/logo";
import { HatchPanel, Segmented, StepHead } from "@/components/sky/kit";
import { Button, Command, GhostButton, Reveal, TextLink } from "@/components/ui";
import { INSTALL_CMD, LINKS } from "@/lib/site";
import { TOPICS } from "@/lib/topics";
import { LiveFigure } from "./live-figure";

/*
 * The parts every sky page is built from, rendered live from the same components the pages use: the kit's tabs,
 * stepper, flat card and showcase panel (src/components/sky/kit.*), and the buttons, links and commands from ui.tsx.
 */

/** One part on a flat card: its name, then the part itself. */
function Cell({ name, children, className = "" }: { name: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex min-h-[200px] min-w-0 flex-col justify-between gap-10 rounded-[12px] border border-(--sky-card-line) bg-card p-6 sm:p-8 ${className}`}
    >
      <p className="text-[15px] font-medium text-fg">{name}</p>
      <div className="flex min-h-[48px] min-w-0 flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/** The blog's real topic filters, as the kit's segmented tabs. */
function TabsDemo() {
  const items = [{ id: "All", label: "All" }, ...TOPICS.slice(0, 2).map((t) => ({ id: t.label, label: t.label }))];
  const [value, setValue] = useState("All");
  return <Segmented items={items} value={value} onChange={setValue} label="Topics, a sample" layoutId="brand-tabs" />;
}

/** The docs' first three steps (Figma 232:4839), as the kit's stepper heads: pick one, as on the pages that use it. */
const STEPS = ["Install", "Ask a specialist", "Hand pilot-mom a task"];

function StepperDemo() {
  const [on, setOn] = useState(0);
  return (
    <div role="radiogroup" aria-label="Steps, a sample" className="grid w-full grid-cols-3">
      {STEPS.map((t, i) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={on === i}
          onClick={() => setOn(i)}
          className="pressable cursor-pointer rounded-[12px] py-1 outline-none focus-visible:ring-2 focus-visible:ring-(--sky-accent)"
        >
          <StepHead n={i + 1} title={<span className="text-[13.5px] leading-5">{t}</span>} on={on === i} last={i === STEPS.length - 1} />
        </button>
      ))}
    </div>
  );
}

export function SkyParts() {
  return (
    <Reveal className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      <Cell name="Buttons">
        <Button href="/#get-started">
          Install
          <DownloadIcon className="size-[13px]" />
        </Button>
        <GhostButton href={LINKS.cloud}>
          Use Pilot Cloud
          <ArrowUpRightIcon className="size-3" />
        </GhostButton>
      </Cell>
      <Cell name="Text link">
        <TextLink href={LINKS.gettingStarted}>Getting started</TextLink>
      </Cell>
      <Cell name="Command">
        <Command value={INSTALL_CMD} prefix="curl" className="w-full" label="Copy install command">
          {INSTALL_CMD.replace(/^curl/, "")}
        </Command>
      </Cell>
      <Cell name="Tags">
        <span className="rounded-full bg-(--sky-tint) px-2.5 py-1 text-[12px] leading-4 font-medium text-(--sky-accent)">Admin</span>
        <span className="rounded-full bg-fg px-2.5 py-1 text-[12px] leading-4 font-medium text-bg">Owner</span>
        <span className="rounded-full px-2.5 py-1 text-[12px] leading-4 font-medium text-soft ring-1 ring-edge-2 ring-inset">Member</span>
      </Cell>
      <Cell name="Tabs">
        <TabsDemo />
      </Cell>
      <Cell name="Stepper">
        <StepperDemo />
      </Cell>
      <Cell name="Icon tiles">
        <span className="grid size-10 place-items-center rounded-[11px] bg-(--sky-fill) text-white shadow-tile">
          <PilotMarkP className="h-[44%] w-auto" />
        </span>
        <span className="grid size-10 place-items-center rounded-[11px] bg-card text-fg shadow-tile">
          <DownloadIcon className="size-[15px]" />
        </span>
        <span className="grid size-10 place-items-center rounded-[9px] bg-fg/10 text-soft">
          <ArrowUpRightIcon className="size-3.5" />
        </span>
      </Cell>
      <Cell name="Live figures">
        <LiveFigure />
      </Cell>
      <Cell name="Showcase panel" className="gap-6">
        <HatchPanel rules={false} className="grid h-[104px] w-full place-items-center">
          <span className="rounded-[10px] border border-(--sky-card-line) bg-card px-4 py-2.5 text-[13px] text-soft">A flat card</span>
        </HatchPanel>
      </Cell>
    </Reveal>
  );
}
