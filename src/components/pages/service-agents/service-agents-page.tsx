import type { ReactNode } from "react";
import { NetworkCanvas } from "@/components/hero/network-canvas";
import { Breadcrumbs } from "@/components/page/page-header";
import { Terminal } from "@/components/terminal";
import { Button, Command, Eyebrow, GhostButton, Reveal, TextLink } from "@/components/ui";
import { SKY } from "@/components/pages/security/kit";
import { INSTALL_CMD, LINKS } from "@/lib/site";
import { C, CLASSES, FILTERS, KNOW, SPEC } from "./content";
import { DIRECTORY_TOTAL } from "./data";
import { Directory } from "./directory";
import { Envelope } from "./envelope";
import { Modes } from "./modes";
import { Plan } from "./plan";
import { QueryFlow } from "./query-flow";
import { SkyServiceAgentsPage } from "./sky-page";
import { LIST_AGENTS, NHTSA } from "./terminals";
import "./service-agents.css";

const H2 = "text-[clamp(30px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg";
const LEDE = "mt-5 max-w-[520px] text-[16px] leading-[1.55] text-mute sm:text-[17px]";

function Head({ id, eyebrow, title, rest, children }: { id: string; eyebrow?: string; title: string; rest: string; children?: ReactNode }) {
  return (
    <Reveal className="max-w-[640px]">
      {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
      <h2 id={id} className={H2}>
        {title} <span className="text-dim">{rest}</span>
      </h2>
      {children && <div className={LEDE}>{children}</div>}
    </Reveal>
  );
}

export function ServiceAgentsPage() {
  if (SKY) return <SkyServiceAgentsPage />;
  return (
    <>
      {/* ---------------- Hero: the directory itself ---------------- */}
      <header className="relative overflow-hidden border-b border-edge">
        <div aria-hidden className="absolute inset-x-0 top-6 h-[132px]">
          <NetworkCanvas lineAlpha={0.13} />
        </div>
        <div className="wrap relative pt-[184px] pb-16 sm:pb-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end lg:gap-16">
            <div className="max-w-[780px]">
              <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Service agents" }]} />
              <h1 className="mt-5 text-[clamp(40px,5.6vw,72px)] leading-[1.02] font-medium tracking-[-0.035em] text-balance text-fg">
                Live data, <span className="text-lime-ink sm:block">one message away.</span>
              </h1>
              <p className="mt-6 max-w-[620px] text-[17px] leading-[1.55] text-mute sm:text-[18px]">
                About {DIRECTORY_TOTAL} specialist agents run on the Pilot backbone. Each wraps one public data source, from
                weather and exchange rates to vehicle recalls, papers and train departures, and answers{" "}
                <C>pilotctl send-message</C> with typed JSON. Vulture Labs runs them.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <Button href="#query">Query an agent</Button>
                <GhostButton href="#pilot-mom">Plan with pilot-mom</GhostButton>
                <TextLink href={LINKS.serviceAgentDocs} className="ml-3">
                  Service agent docs
                </TextLink>
              </div>
            </div>
            <dl className="grid grid-cols-1 border-t border-edge font-mono text-[12.5px] sm:grid-cols-2 lg:grid-cols-1">
              {SPEC.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-edge py-2.5 sm:max-lg:odd:pr-4 sm:max-lg:even:border-l sm:max-lg:even:pl-4">
                  <dt className="text-dim">{k}</dt>
                  <dd className="text-right text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Reveal delay={120} className="mt-14 sm:mt-16" id="categories">
            <Directory />
          </Reveal>
        </div>
      </header>

      {/* ---------------- How a query works ---------------- */}
      <section id="query" aria-labelledby="query-title" className="scroll-mt-20 py-24 sm:py-32">
        <div className="wrap">
          <Head id="query-title" title="Handshake, ask," rest="get JSON back.">
            A service agent is an ordinary Pilot node. You reach it by name over an encrypted tunnel, the same way you reach
            any peer.
          </Head>
          <Reveal delay={80} className="mt-12 sm:mt-16">
            <QueryFlow />
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-10 sm:mt-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <Reveal className="min-w-0">
              <Terminal title="agent@node ~ nhtsa-recalls" lines={NHTSA} minHeight={612} caption="Real output from pilotctl 1.18.0, October 2026." />
            </Reveal>
            <Reveal delay={100}>
              <Modes />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- The envelope ---------------- */}
      <section id="reply" aria-labelledby="reply-title" className="border-t border-edge py-24 sm:py-32">
        <div className="wrap">
          <Head id="reply-title" title="One envelope" rest="for every agent.">
            Every data agent wraps its source’s answer in the same envelope, so an agent can page through results and tell
            when a reply was cut short.
          </Head>
          <Reveal delay={80} className="mt-12 sm:mt-16">
            <Envelope />
          </Reveal>
        </div>
      </section>

      {/* ---------------- list-agents ---------------- */}
      <section id="directory" aria-labelledby="dir-title" className="pp-invert py-24 sm:py-32">
        <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <Head id="dir-title" eyebrow="list-agents" title="The directory" rest="is an agent too.">
              <C>list-agents</C> answers the same way any data agent does. Use it to enumerate what exists, or to look up an
              agent’s hostname and an example query.
            </Head>
            <Reveal delay={80}>
              <dl className="mt-10 border-t border-edge">
                {FILTERS.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-1 gap-1 border-b border-edge py-3.5 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-4">
                    <dt className="font-mono text-[13px] text-fg">{k}</dt>
                    <dd className="text-[14.5px] leading-[1.5] text-mute">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
          <Reveal delay={120} className="min-w-0 lg:pt-2">
            <Terminal title="agent@node ~ list-agents" lines={LIST_AGENTS} minHeight={436} caption="Real output. 3 of 430." />
          </Reveal>
        </div>
      </section>

      {/* ---------------- pilot-mom ---------------- */}
      <section id="pilot-mom" aria-labelledby="mom-title" className="py-24 sm:py-32">
        <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="flex flex-col">
            <Head id="mom-title" eyebrow="pilot-mom" title="Describe the task." rest="Get the plan.">
              <C>pilot-mom</C> knows every agent in the directory and every App Store app. Send it a task in plain English and
              it returns the calls to run, in order. It plans; your agent runs the calls.
            </Head>
            <Reveal delay={80} className="mt-10">
              <p className="font-mono text-[12px] text-dim">class</p>
              <ul className="mt-3 flex flex-col gap-2">
                {CLASSES.map(([k, v], i) => (
                  <li key={k} className="flex items-baseline gap-3 text-[14.5px] text-mute">
                    <span
                      className={`shrink-0 rounded-md px-1.5 py-[3px] font-mono text-[11.5px] leading-none ${
                        i === 0 ? "bg-lime text-ink" : "border border-edge-2 text-soft"
                      }`}
                    >
                      {k}
                    </span>
                    when {v}
                  </li>
                ))}
              </ul>
              <dl className="mt-8 grid grid-cols-1 gap-3 text-[14.5px] leading-[1.5]">
                <div>
                  <dt className="inline font-mono text-[13px] text-fg">calls </dt>
                  <dd className="inline text-mute">Ready-to-run pilotctl commands. This is what you execute.</dd>
                </div>
                <div>
                  <dt className="inline font-mono text-[13px] text-fg">steps </dt>
                  <dd className="inline text-mute">The same plan as data, with dependencies and steps that can run in parallel.</dd>
                </div>
                <div>
                  <dt className="inline font-mono text-[13px] text-fg">handoff </dt>
                  <dd className="inline text-mute">What your runtime has to do itself, such as installing an app.</dd>
                </div>
              </dl>
              <p className="mt-8 text-[14.5px] leading-[1.5] text-mute">
                The same planner answers over HTTP at{" "}
                <a href="https://mom.pilotprotocol.network" className="text-fg underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg">
                  mom.pilotprotocol.network
                </a>
                .
              </p>
              <div className="mt-6">
                <TextLink href={LINKS.pilotMomDocs}>pilot-mom docs</TextLink>
              </div>
            </Reveal>
          </div>
          <Reveal delay={120} className="min-w-0">
            <Plan />
          </Reveal>
        </div>
      </section>

      {/* ---------------- Good to know ---------------- */}
      <section id="good-to-know" aria-labelledby="know-title" className="border-t border-edge py-24 sm:py-32">
        <div className="wrap">
          <Head id="know-title" title="What to expect" rest="from a reply.">
            The agents pass along public data sources. They are only as fresh, complete and available as the source behind
            them.
          </Head>
          <Reveal delay={80} className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {KNOW.map((k) => (
              <div key={k.title} className="bg-bg p-6 sm:p-7">
                <h3 className="flex items-center gap-2.5 text-[16px] font-medium tracking-[-0.01em] text-fg">
                  <span aria-hidden className="size-1.5 bg-lime" />
                  {k.title}
                </h3>
                <p className="mt-2.5 text-[14.5px] leading-[1.55] text-mute">{k.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------- First question ---------------- */}
      <section aria-labelledby="first-title" className="border-t border-edge py-24 sm:py-32">
        <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-end lg:gap-16">
          <Reveal>
            <h2 id="first-title" className="text-[clamp(36px,5vw,64px)] leading-[1.02] font-medium tracking-[-0.035em] text-fg">
              Ask your first <span className="text-lime-ink">question.</span>
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Button href={LINKS.gettingStarted}>Install Pilot</Button>
              <TextLink href={LINKS.pilotMomDocs}>pilot-mom docs</TextLink>
              <TextLink href={LINKS.security}>Security</TextLink>
            </div>
          </Reveal>
          <Reveal delay={100} className="flex min-w-0 flex-col gap-5">
            <div>
              <p className="font-mono text-[12px] text-dim">1 · install the daemon</p>
              <Command value={INSTALL_CMD} prefix="$ " className="mt-2.5" label="Copy install command" />
            </div>
            <div>
              <p className="font-mono text-[12px] text-dim">2 · list the weather agents</p>
              <Command
                value={`pilotctl send-message list-agents --data '/data {"category":"weather"}' --wait`}
                prefix="$ "
                className="mt-2.5"
                label="Copy query"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
