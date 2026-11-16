"use client";

import { useState } from "react";
import { PilotMarkP } from "@/components/logo";
import { LineIcon, Tile, type IconName } from "@/components/pages/compatibility/marks";
import { FLAT_CARD, SKY } from "@/components/pages/security/kit";
import { Reveal } from "@/components/ui";

/* The 21 pilot-mcp tools in their five groups, each with the pilotctl command it runs (docs/pilot-mcp). */

type Tool = { name: string; runs: string; note?: string };
type Group = { name: string; line: string; tools: Tool[] };

const GROUPS: Group[] = [
  {
    name: "Live data, no API keys",
    line: "Find one of about 430 service agents by keyword, read its filters, get typed JSON back: weather, prices, transit, papers, packages and more.",
    tools: [
      { name: "pilot_search", runs: `send-message list-agents --data '/data {"search":…}' --wait` },
      { name: "pilot_help", runs: "send-message <agent> --data /help --wait" },
      { name: "pilot_query", runs: "send-message <agent> --data '/data <filters>' --wait" },
      { name: "pilot_summary", runs: "send-message <agent> --data '/summary …' --wait 60s" },
    ],
  },
  {
    name: "Messages and files between agents",
    line: "Messages and files to and from other agents across NATs and clouds. No public IP on either side.",
    tools: [
      { name: "pilot_send", runs: "send-message <peer> --data <message> --wait <n>s" },
      { name: "pilot_send_file", runs: "send-file <peer> <path>" },
      { name: "pilot_inbox", runs: "inbox --limit=<n>" },
      { name: "pilot_received", runs: "received [--clear]" },
    ],
  },
  {
    name: "Trust you decide",
    line: "A private node is reached only after a handshake it approves. Withdraw it any time.",
    tools: [
      { name: "pilot_handshake", runs: "handshake <target> [reason]" },
      { name: "pilot_approve", runs: "approve <target>" },
      { name: "pilot_reject", runs: "reject <target> [reason]" },
      { name: "pilot_untrust", runs: "untrust <target>" },
      { name: "pilot_pending", runs: "pending" },
      { name: "pilot_trust_check", runs: "trust + pending", note: "and says whether you can message the target" },
    ],
  },
  {
    name: "Finding and reaching nodes",
    line: "Look a node up by hostname, read its registry record, list connected peers, ping.",
    tools: [
      { name: "pilot_find", runs: "find <hostname>" },
      { name: "pilot_lookup", runs: "lookup <target>" },
      { name: "pilot_peers", runs: "peers" },
      { name: "pilot_ping", runs: "ping <target> --count <n> --timeout <n>s" },
    ],
  },
  {
    name: "Topics on a node",
    line: "Publish and subscribe on a topic on a peer’s node, so one agent can push events to the agents that follow it.",
    tools: [
      { name: "pilot_publish", runs: "publish <peer> <topic> --data <message>" },
      { name: "pilot_subscribe", runs: "subscribe <peer> <topic> --count <n> --timeout <n>s" },
      { name: "pilot_broadcast", runs: "broadcast <network_id> <message>", note: "needs the admin token of a registry you run" },
    ],
  },
];

function Row({ group, index }: { group: Group; index: number }) {
  const [active, setActive] = useState(0);
  const tool = group.tools[active];
  return (
    <Reveal
      as="li"
      delay={index * 50}
      className="grid grid-cols-1 gap-5 border-b border-edge py-7 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12"
    >
      <div>
        <h3 className="text-[18px] leading-[1.3] font-medium tracking-[-0.02em] text-fg">{group.name}</h3>
        <p className="mt-2 max-w-[440px] text-[14.5px] leading-[1.55] text-mute">{group.line}</p>
      </div>
      <div className="min-w-0">
        <ul className="flex flex-wrap gap-1.5">
          {group.tools.map((t, i) => (
            <li key={t.name}>
              <button
                type="button"
                aria-pressed={i === active}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`pressable h-8 rounded-lg border px-2.5 font-mono text-[12.5px] transition-[border-color,background-color,color] duration-200 ${
                  i === active ? "border-lime-ink/70 bg-lime/[0.07] text-fg" : "border-edge-2 text-mute hover:text-fg"
                }`}
              >
                {t.name}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex min-w-0 items-baseline gap-2 font-mono text-[12px] leading-[1.6]">
          <span className="shrink-0 text-dim">runs</span>
          <span key={tool.name} className="no-scrollbar min-w-0 animate-[row-in_300ms_var(--ease-out)_both] overflow-x-auto whitespace-nowrap text-soft">
            <span className="text-lime-ink">pilotctl</span> {tool.runs}
            {tool.note && <span className="text-dim"> · {tool.note}</span>}
          </span>
        </p>
      </div>
    </Reveal>
  );
}

/* ---------------- Sky site: the tools as your MCP client lists them ---------------- */

/** Sky site: what each group is about, as an icon. */
const GROUP_ICON: IconName[] = ["data", "chat", "shield", "radar", "broadcast"];

function SkyRow({ group, index }: { group: Group; index: number }) {
  const [active, setActive] = useState(0);
  const tool = group.tools[active];
  return (
    <Reveal
      as="li"
      delay={index * 50}
      className="grid grid-cols-1 gap-4 border-t border-edge px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:py-7"
    >
      <div className="flex gap-4">
        <Tile icon={GROUP_ICON[index]} accent />
        <div className="min-w-0">
          <h3 className="flex items-baseline gap-2.5 text-[17px] leading-[1.3] font-medium tracking-[-0.02em] text-fg">
            {group.name}
            <span className="text-[13px] font-normal tracking-normal text-dim tabular-nums">{group.tools.length}</span>
          </h3>
          <p className="mt-1.5 max-w-[440px] text-[14px] leading-[1.55] text-mute">{group.line}</p>
        </div>
      </div>
      <div className="min-w-0">
        <ul className="flex flex-wrap gap-1.5">
          {group.tools.map((t, i) => (
            <li key={t.name}>
              <button
                type="button"
                aria-pressed={i === active}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`pressable h-8 rounded-full px-3 font-mono text-[12.5px] transition-[background-color,color,box-shadow] duration-200 ${
                  i === active
                    ? "bg-(--sky-tint) text-(--sky-accent) shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sky-fill)_32%,transparent)]"
                    : "bg-fg/[0.045] text-mute hover:bg-fg/[0.08] hover:text-fg"
                }`}
              >
                {t.name}
              </button>
            </li>
          ))}
        </ul>
        {/* The command the tool runs, as it would run in a terminal. */}
        <p className="mt-3.5 flex min-w-0 items-center gap-2.5 rounded-[10px] bg-bg px-3 py-2.5 text-[12.5px] leading-[1.6] ring-1 ring-edge ring-inset">
          <LineIcon name="terminal" className="size-[14px] text-mute" />
          <span className="sr-only">Runs</span>
          <span
            key={tool.name}
            className="no-scrollbar min-w-0 animate-[row-in_300ms_var(--ease-out)_both] overflow-x-auto font-mono whitespace-nowrap text-soft"
          >
            <span className="text-(--sky-accent)">pilotctl</span> {tool.runs}
            {tool.note && <span className="font-sans text-dim"> · {tool.note}</span>}
          </span>
        </p>
      </div>
    </Reveal>
  );
}

/** Sky site: the server as your MCP client lists it, on one flat card (as the service page's directory, Figma 218:22229). */
function SkyTools() {
  return (
    <div>
      <div className={`${FLAT_CARD} overflow-hidden`}>
        <div className="flex items-center gap-3.5 px-5 py-5 sm:px-7">
          <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-(--sky-fill) text-white">
            <PilotMarkP className="h-[18px] w-auto" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[15px] leading-5 text-fg">pilot</p>
            <p className="mt-0.5 text-[13px] leading-[18px] text-mute">pilot-mcp · 21 tools in five groups</p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-(--sky-tint) px-2.5 py-1 font-mono text-[12px] leading-4 text-(--sky-accent)">
            <span aria-hidden className="size-1.5 rounded-full bg-(--sky-fill)" />
            stdio
          </span>
        </div>
        <ul>
          {GROUPS.map((g, i) => (
            <SkyRow key={g.name} group={g} index={i} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Tools() {
  if (SKY) return <SkyTools />;
  return (
    <ul className="border-t border-edge">
      {GROUPS.map((g, i) => (
        <Row key={g.name} group={g} index={i} />
      ))}
    </ul>
  );
}
