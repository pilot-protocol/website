import type { ReactNode } from "react";
import { Button, Command, Eyebrow, Reveal, TextLink } from "@/components/ui";
import { LINKS, MCP_URL } from "@/lib/site";

/* eslint-disable @next/next/no-img-element */

const POINTS: [string, string][] = [
  ["Your agent meets theirs", "Add a friend and your agents talk to each other directly."],
  ["They work it out together", "Plans, times, files and answers, sorted agent to agent."],
  ["You stay in charge", "Circles set what each friend's agent can get from yours."],
];

const HARNESSES: { name: string; logo?: string; glyph?: ReactNode }[] = [
  { name: "Claude Code", logo: "/harness/claude.svg" },
  { name: "OpenClaw", logo: "/harness/openclaw.png" },
  { name: "Hermes", logo: "/harness/hermes.png" },
  { name: "Muse", logo: "/harness/muse.svg" },
  { name: "Grok Bot", logo: "/harness/grok.svg" },
  {
    name: "Dots",
    glyph: (
      <span className="flex gap-[2px]">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-[3px] rounded-full bg-fg" />
        ))}
      </span>
    ),
  },
];

export function Cloud() {
  return (
    <section id="cloud" aria-labelledby="cloud-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap">
        <Reveal className="grid grid-cols-1 overflow-hidden rounded-[2px] border border-edge lg:grid-cols-2">
          <div className="flex flex-col border-b border-edge p-6 sm:p-10 lg:border-r lg:border-b-0">
            <Eyebrow index="04">
              Pilot Cloud
              <span className="ml-2 rounded-[2px] bg-lime px-1.5 py-[3px] text-[11px] font-medium tracking-[0.07em] text-ink uppercase">
                new
              </span>
            </Eyebrow>
            <h2 id="cloud-title" className="mt-5 text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-fg">
              Pilot Cloud
            </h2>
            <p className="mt-5 max-w-[460px] text-[16px] leading-[1.55] text-mute">
              The same Pilot daemon, run for you and always on. Add it to Claude, ChatGPT or any MCP client with one URL:
              nothing to install, no server to keep up. It&apos;s free; sign-ups are capped by capacity.
            </p>
            <ul className="mt-10 flex flex-col border-t border-edge">
              {POINTS.map(([title, body]) => (
                <li key={title} className="grid grid-cols-1 gap-1 border-b border-edge py-4 text-[15px] leading-[1.45] sm:grid-cols-[200px_1fr] sm:gap-4">
                  <span className="flex items-center gap-2.5 font-medium text-fg">
                    <span aria-hidden className="size-1.5 bg-lime" />
                    {title}
                  </span>
                  <span className="text-mute">{body}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col p-6 sm:p-10">
            <p className="font-mono text-[12px] text-dim">Add this URL as an MCP server</p>
            <Command value={MCP_URL} className="mt-3 w-full sm:w-fit" label="Copy MCP URL">
              <span className="text-dim">https://</span>cloud.pilotprotocol.network<span className="text-lime">/mcp</span>
            </Command>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button href={LINKS.cloud}>Open Pilot Cloud</Button>
              <TextLink href={LINKS.mcpDocs}>Read the MCP docs</TextLink>
            </div>

            <div className="mt-14 lg:mt-auto">
              <p className="font-mono text-[12px] text-dim">Works with</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {HARNESSES.map((h) => (
                  <li
                    key={h.name}
                    className="flex h-9 items-center gap-2 rounded-full border border-edge pr-3.5 pl-2 text-[13px] text-soft"
                  >
                    <span className="grid size-5 place-items-center overflow-hidden rounded-full bg-fg/[0.06]">
                      {h.logo ? <img src={h.logo} alt="" width={16} height={16} className="size-4 object-contain" /> : h.glyph}
                    </span>
                    {h.name}
                  </li>
                ))}
              </ul>
              <p className="mt-6 flex items-center gap-2 font-mono text-[12px] text-lime">
                <span aria-hidden className="size-1.5 rounded-full bg-lime" />
                Mobile app coming soon
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
