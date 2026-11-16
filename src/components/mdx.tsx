import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { ArrowUpRightIcon, DownloadIcon } from "@/components/icons";
import { Command } from "@/components/ui";
import { INSTALL_CMD } from "@/lib/site";

/** What the old site's install widget offered: the one-liner, or a sentence for an agent that's already running. */
const AGENT_PROMPT = "Join Pilot Protocol (pilotprotocol.network) and get on the network.";

function Install() {
  return (
    <div className="not-prose my-8 rounded-[18px] bg-card p-5 shadow-card sm:p-6">
      <p className="text-[13px] font-medium text-dim">In your terminal</p>
      <Command value={INSTALL_CMD} prefix="curl" className="mt-2.5" label="Copy install command">
        {INSTALL_CMD.replace(/^curl/, "")}
      </Command>
      <p className="mt-2.5 text-[13.5px] text-mute">One command. Static binaries, no runtime dependencies, no API key.</p>
      <div className="my-5 h-px bg-edge" />
      <p className="text-[13px] font-medium text-dim">Already have an agent? Tell it</p>
      <Command value={AGENT_PROMPT} className="mt-2.5" label="Copy the prompt" wrap>
        {AGENT_PROMPT}
      </Command>
    </div>
  );
}

/** A paper on the Research page: who, when, what kind, the abstract and its links. */
function Paper({
  authors,
  date,
  meta,
  kind,
  pdf,
  arxiv,
  children,
}: {
  authors: string;
  date: string;
  meta?: string;
  kind?: string;
  pdf?: string;
  arxiv?: string;
  children: ReactNode;
}) {
  return (
    <div className="not-prose my-6 rounded-[18px] bg-card p-5 shadow-card sm:p-6">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-dim">
        <span className="font-medium text-soft">{authors}</span>
        <span>{date}</span>
        {meta && <span>{meta}</span>}
        {kind && <span className="rounded-full bg-lime/20 px-2 py-0.5 text-[12px] font-medium text-lime-ink">{kind}</span>}
      </p>
      <div className="mt-3.5 text-[15.5px] leading-[1.62] text-pretty text-soft [&_strong]:font-semibold [&_strong]:text-fg">
        {children}
      </div>
      {(pdf || arxiv) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {pdf && (
            <a
              href={pdf}
              className="pressable inline-flex h-9 items-center gap-2 rounded-[10px] bg-fg px-3.5 text-[13.5px] font-medium text-bg hover:bg-fg/88"
            >
              <DownloadIcon className="size-3" />
              PDF
            </a>
          )}
          {arxiv && (
            <a
              href={arxiv}
              className="pressable inline-flex h-9 items-center gap-2 rounded-[10px] bg-bg-deep px-3.5 text-[13.5px] font-medium text-fg ring-1 ring-edge ring-inset hover:ring-edge-3"
            >
              arXiv
              <ArrowUpRightIcon className="size-2.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return { ...defaultMdxComponents, Install, Paper, ...components } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
