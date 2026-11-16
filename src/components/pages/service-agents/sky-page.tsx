import type { ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { HeroStamps, PageHeader } from "@/components/page/page-header";
import { HatchPanel, SkyRule } from "@/components/sky/kit";
import { Button, Command, Reveal, TextLink } from "@/components/ui";
import { LiveD } from "@/components/v4/live";
import { INSTALL_CMD, LINKS } from "@/lib/site";
import { C, CLASSES, FILTERS, KNOW } from "./content";
import { DIRECTORY_TOTAL, ROWS } from "./data";
import { Directory } from "./directory";
import { SkyEnvelope } from "./envelope";
import { Modes } from "./modes";
import { SkyQueryFlow } from "./query-flow";
import { SkyListAgents } from "./sky-list-agents";
import { SkyPlan } from "./sky-plan";
import { SkyTerminal } from "./sky-terminal";
import { H2, LEDE, SPLIT, SPLIT_ART, SPLIT_TEXT, SPLIT_TEXT_END } from "./split";
import { NHTSA } from "./terminals";
import "./service-agents.css";

/*
 * /service-agents on the sky site (Figma 218:24787). The sky hero with the directory's facts, the directory as a real
 * search card, then the kit's split sections (text on paper, the visual on hatching): how a query works, the reply's
 * envelope, the directory agent and pilot-mom, with the recorded session and the four ways to ask on a full hatched
 * panel between them. Good to know and the first question close the page.
 */

/** Heading and lede for the text half of a split. */
function SplitHead({ id, title, rest, children }: { id: string; title: string; rest: string; children?: ReactNode }) {
  return (
    <Reveal>
      <h2 id={id} className={H2}>
        {title} <span className="block text-mute">{rest}</span>
      </h2>
      {children && <div className={`mt-6 max-w-[520px] sm:mt-8 ${LEDE}`}>{children}</div>}
    </Reveal>
  );
}

/** A two-column list of names and what they mean, with hairlines between the rows. */
function Fields({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="mt-10 border-t border-(--sky-card-line)">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-1 gap-1 border-b border-(--sky-card-line) py-4 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-4">
          <dt className="font-mono text-[13px] leading-[21px] font-medium text-fg">{k}</dt>
          <dd className="text-[14.5px] leading-[1.5] text-pretty text-mute">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const linkCls = "text-fg underline decoration-fg/25 underline-offset-[3px] transition-[text-decoration-color] duration-200 hover:decoration-fg";

/** What pilot-mom hands back, field by field (the class first: it says whether the rest is worth running). */
const PLAN_FIELDS: [string, ReactNode][] = [
  [
    "class",
    <ul key="class" className="flex flex-col gap-2">
      {CLASSES.map(([k, v], i) => (
        <li key={k} className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[12px] leading-[18px] ${
              i === 0 ? "bg-(--sky-tint) text-(--sky-accent)" : "text-soft shadow-[0_0_0_1px_var(--color-edge-2)]"
            }`}
          >
            {k}
          </span>
          when {v}
        </li>
      ))}
    </ul>,
  ],
  ["calls", "Ready-to-run pilotctl commands. This is what you execute."],
  ["steps", "The same plan as data, with dependencies and steps that can run in parallel."],
  ["handoff", "What your runtime has to do itself, such as installing an app."],
];

export function SkyServiceAgentsPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Service agents" }]}
        title={
          <>
            Live <HeroStamps /> data, <span className="block">one message away.</span>
          </>
        }
        lede={
          <>
            About {DIRECTORY_TOTAL} specialist agents run on the Pilot backbone. Each wraps one public data source, from weather
            and exchange rates to vehicle recalls, papers and train departures, and answers <C>pilotctl send-message</C> with
            typed JSON. Vulture Labs runs them.
          </>
        }
        primary={{ label: "Query an agent", href: "#query", icon: <ArrowRightIcon className="size-[11px] rotate-90" /> }}
        secondary={{ label: "Plan with pilot-mom", href: "#pilot-mom" }}
        link={{ label: "Service agent docs", href: LINKS.serviceAgentDocs }}
        stats={[
          { value: DIRECTORY_TOTAL, label: "Agents in the directory" },
          { value: ROWS.length, label: "Categories" },
          { value: "JSON", label: "Typed replies" },
          { value: "None", label: "Cost per request" },
        ]}
      />

      {/* ---------------- The directory ---------------- */}
      {/* The live demo (moved here from the home page): four real questions, answered live by the agents that serve them. */}
      <LiveD />

      <section id="categories" aria-labelledby="dir-search-title" className="scroll-mt-20 pt-12 pb-[88px] sm:pt-[104px] sm:pb-[100px]">
        <div className="wrap">
          <Reveal className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-[122px]">
            <h2 id="dir-search-title" className={`${H2} lg:max-w-[793px]`}>
              Every agent, by category. <span className="block text-mute">Search it the way your agent does.</span>
            </h2>
            <p className={`${LEDE} max-w-[520px] lg:w-[285px] lg:shrink-0`}>
              Type a word, or pick a category. The list lights up what <C>list-agents</C> would hand back.
            </p>
          </Reveal>
          <Reveal delay={80} className="mt-10 sm:mt-12">
            <Directory />
          </Reveal>
        </div>
      </section>

      {/* ---------------- How a query works: a split ---------------- */}
      <section id="query" aria-labelledby="query-title" className="scroll-mt-16">
        <SkyRule />
        <SkyQueryFlow
          head={
            <SplitHead id="query-title" title="Handshake, ask," rest="get JSON back.">
              A service agent is an ordinary Pilot node. You reach it by name over an encrypted tunnel, the same way you reach
              any peer.
            </SplitHead>
          }
        />
        <SkyRule />
      </section>

      {/* ---------------- The recorded session and the four ways to ask, on a hatched panel ---------------- */}
      <section aria-label="A recorded query to nhtsa-recalls, and the four ways to ask an agent" className="pt-[88px] sm:pt-[100px]">
        <div className="wrap">
          <HatchPanel className="sa-session">
            <Reveal className="sa-session-term">
              <SkyTerminal title="agent@node ~ nhtsa-recalls" lines={NHTSA} tag="Oct 2026" highlight={[9, 13]} />
            </Reveal>
            <Reveal delay={120} className="sa-session-modes">
              <Modes />
            </Reveal>
          </HatchPanel>
        </div>
      </section>

      {/* ---------------- The envelope: a split ---------------- */}
      <section id="reply" aria-labelledby="reply-title" className="mt-[88px] sm:mt-[100px]">
        <SkyRule />
        <SkyEnvelope
          head={
            <SplitHead id="reply-title" title="One envelope" rest="for every agent.">
              Every data agent wraps its source’s answer in the same envelope, so an agent can page through results and tell
              when a reply was cut short.
            </SplitHead>
          }
        />
        <SkyRule />
      </section>

      {/* ---------------- list-agents: a split, the session on the left ---------------- */}
      <section id="directory" aria-labelledby="dir-title" className="mt-[88px] sm:mt-[100px]">
        <SkyRule />
        <div className={SPLIT}>
          <div className={`${SPLIT_ART} max-lg:order-2`}>
            <Reveal className="w-full min-w-0">
              <SkyListAgents />
            </Reveal>
          </div>
          <div className={SPLIT_TEXT_END}>
            <SplitHead id="dir-title" title="The directory" rest="is an agent too.">
              <C>list-agents</C> answers the same way any data agent does. Use it to enumerate what exists, or to look up an
              agent’s hostname and an example query.
            </SplitHead>
            <Reveal delay={80}>
              <Fields rows={FILTERS} />
            </Reveal>
          </div>
        </div>
        <SkyRule />
      </section>

      {/* ---------------- pilot-mom: a split ---------------- */}
      <section id="pilot-mom" aria-labelledby="mom-title" className="mt-[88px] scroll-mt-16 sm:mt-[100px]">
        <SkyRule />
        <div className={SPLIT}>
          <div className={SPLIT_TEXT}>
            <SplitHead id="mom-title" title="Describe the task." rest="Get the plan.">
              <C>pilot-mom</C> knows every agent in the directory and every App Store app. Send it a task in plain English and
              it returns the calls to run, in order. It plans; your agent runs the calls.
            </SplitHead>
            <Reveal delay={80}>
              <Fields rows={PLAN_FIELDS} />
              <p className="mt-8 text-[14.5px] leading-[1.5] text-mute">
                The same planner answers over HTTP at{" "}
                <a href="https://mom.pilotprotocol.network" className={linkCls}>
                  mom.pilotprotocol.network
                </a>
                .
              </p>
              <div className="mt-6">
                <TextLink href={LINKS.pilotMomDocs}>pilot-mom docs</TextLink>
              </div>
            </Reveal>
          </div>
          <div className={SPLIT_ART}>
            <Reveal delay={120} className="w-full min-w-0">
              <SkyPlan />
            </Reveal>
          </div>
        </div>
        <SkyRule />
      </section>

      {/* ---------------- Good to know ---------------- */}
      <section id="good-to-know" aria-labelledby="know-title" className="py-[88px] sm:py-[120px]">
        <div className="wrap">
          <Reveal className="mx-auto flex max-w-[720px] flex-col items-center text-center">
            <h2 id="know-title" className={H2}>
              What to expect <span className="block text-mute">from a reply.</span>
            </h2>
            <p className={`mt-6 max-w-[560px] ${LEDE}`}>
              The agents pass along public data sources. They are only as fresh, complete and available as the source behind
              them.
            </p>
          </Reveal>
          <ul className="mt-12 grid grid-cols-1 gap-3 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {KNOW.map((k, i) => (
              <Reveal as="li" key={k.title} delay={(i % 3) * 60} className="sky-card p-6">
                <h3 className="text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">{k.title}</h3>
                <p className="mt-2 text-[14.5px] leading-[1.55] text-pretty text-mute">{k.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- First question ---------------- */}
      <section aria-labelledby="first-title" className="pb-[88px] sm:pb-[120px]">
        <SkyRule />
        <div className="wrap grid grid-cols-1 gap-12 pt-[88px] sm:pt-[120px] lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-center lg:gap-16">
          <Reveal>
            <h2 id="first-title" className={H2}>
              Ask your first question. <span className="block text-mute">Two commands away.</span>
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button href={LINKS.gettingStarted}>Install Pilot</Button>
              <TextLink href={LINKS.pilotMomDocs}>pilot-mom docs</TextLink>
              <TextLink href={LINKS.security}>Security</TextLink>
            </div>
          </Reveal>
          <Reveal delay={100} className="sky-card flex min-w-0 flex-col gap-6 p-5 sm:p-6">
            {[
              { n: 1, label: "Install the daemon", value: INSTALL_CMD, aria: "Copy install command" },
              {
                n: 2,
                label: "List the weather agents",
                value: `pilotctl send-message list-agents --data '/data {"category":"weather"}' --wait`,
                aria: "Copy query",
              },
            ].map((s) => (
              <div key={s.n}>
                <p className="flex items-center gap-3 text-[14.5px] leading-5 font-medium tracking-[-0.01em] text-fg">
                  <span className="sky-step-dot tabular-nums" data-on={false}>
                    {s.n}
                  </span>
                  {s.label}
                </p>
                <Command value={s.value} prefix="$ " className="mt-3" label={s.aria} />
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
