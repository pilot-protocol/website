import type { ReactNode } from "react";
import { SKY } from "@/components/pages/security/kit";
import { LINKS } from "@/lib/site";
import { DIRECTORY_TOTAL, ROWS } from "./data";

/* The page's copy, shared by the green layout and the sky layout. */

export const C = ({ children }: { children: ReactNode }) => (
  <code className={SKY ? "font-mono text-[0.9em] whitespace-nowrap text-soft" : "font-mono text-[0.9em] text-soft"}>{children}</code>
);

export const SPEC: [string, ReactNode][] = [
  ["directory", `${DIRECTORY_TOTAL} agents`],
  ["categories", ROWS.length],
  ["replies", "typed JSON"],
  ["cost", "none per request"],
];

export const FILTERS: [string, ReactNode][] = [
  [
    "search",
    <>
      Matches hostnames and descriptions exactly, fuzzily (typos and plurals) and by meaning, so “aviation” finds flight
      agents. Results carry a <C>match_score</C>.
    </>,
  ],
  ["category", "One of the 30 category ids."],
  ["hostname", "An exact hostname."],
  ["limit", "Results per reply: 50 by default, 500 at most."],
];

export const CLASSES: [string, string][] = [
  ["achievable", "the network can do it"],
  ["agent", "part of it needs your own runtime"],
  ["not-yet", "it can’t, yet"],
];

export const KNOW: { title: string; body: ReactNode }[] = [
  {
    title: "Check the source",
    body: (
      <>
        <C>upstream_url</C> names the API each answer came from. The agents don’t correct or verify upstream data.
      </>
    ),
  },
  {
    title: "Replies can time out",
    body: (
      <>
        An agent or its source can be slow or down. <C>--wait</C> then exits non-zero; retry, or try another agent from the
        same category.
      </>
    ),
  },
  {
    title: "Who sees your query",
    body: (
      <>
        The agent and its upstream API. <C>/summary</C> and free-text queries also go to Google Gemini.
      </>
    ),
  },
  {
    title: "Public backbone only",
    body: (
      <>
        The agents live on the public backbone. A daemon pointed at a{" "}
        <a href={LINKS.selfHosting} className="text-soft underline decoration-fg/25 underline-offset-2 hover:decoration-fg">
          registry you run yourself
        </a>{" "}
        won’t find them there.
      </>
    ),
  },
  {
    title: "From a chat app",
    body: (
      <>
        <a href={LINKS.cloudPage} className="text-soft underline decoration-fg/25 underline-offset-2 hover:decoration-fg">
          Pilot Cloud
        </a>{" "}
        reaches the same agents from Claude, ChatGPT and other MCP clients, with nothing to install.
      </>
    ),
  },
  {
    title: "How they’re built",
    body: (
      <>
        Each agent maps its filters onto one upstream API. The{" "}
        <a href={LINKS.serviceAgentDocs} className="text-soft underline decoration-fg/25 underline-offset-2 hover:decoration-fg">
          service agent docs
        </a>{" "}
        cover the responder and the dispatch flow.
      </>
    ),
  },
];
