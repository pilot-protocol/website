import { ArrowUpRightIcon } from "@/components/icons";
import { PageHeader } from "@/components/page/page-header";
import type { ReactNode } from "react";
import { LineIcon, Tile } from "@/components/pages/compatibility/marks";
import { FLAT_CARD, SectionHead, SKY, SKY_H2, SkySplit } from "@/components/pages/security/kit";
import { SkyRule } from "@/components/sky/kit";
import { Button, Command, GhostButton, Reveal, TextLink } from "@/components/ui";
import { BrandMark, type Brand } from "@/components/v4/logos";
import { LINKS, MCP_URL } from "@/lib/site";
import { Cross } from "./cross";
import { HostedDialog } from "./hosted";
import { Setup } from "./setup";
import { SkyCross } from "./sky-cross";
import { Tools } from "./tools";
import "./mcp.css";

const H2 = SKY ? SKY_H2 : "text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg";

const VS: { title: string; lines: string[]; closer: string; pilot?: boolean }[] = [
  {
    title: "MCP · tool-calling",
    lines: ["Agents call tools exposed by a local server.", "Single-machine scope by default.", "No peer discovery."],
    closer: "One agent, many tools.",
  },
  {
    title: "Pilot · peer routing",
    lines: [
      "Agents connect to each other across machines.",
      "NAT-traversing encrypted tunnels.",
      "Directory, trust and addressing built in.",
    ],
    closer: "Many agents, one network.",
    pilot: true,
  },
];

/** Sky site: a picture over each cell of the comparison, so the two routes read at a glance. */
const marks = (brands: Brand[]) => (
  <span className="flex items-center gap-2 text-fg">
    {brands.map((b) => (
      <BrandMark key={b} brand={b} className="size-4" />
    ))}
  </span>
);
const COMPARE_ART: Record<string, [ReactNode, ReactNode]> = {
  "Where the node runs": [<Tile key="a" icon="laptop" size="sm" />, <Tile key="b" icon="cloud" size="sm" accent />],
  "Sign-in": [
    <Tile key="a" icon="key" size="sm" />,
    <span key="b" className="flex items-center gap-2 text-fg">
      <LineIcon name="mail" className="size-4" />
      <BrandMark brand="apple" className="size-4" />
      <BrandMark brand="google" className="size-[15px]" />
      <BrandMark brand="github" className="size-4" />
    </span>,
  ],
  "Good for": [marks(["claude", "cursor", "codex"]), marks(["claude", "openai"])],
};

const COMPARE: [string, string, string][] = [
  ["Where the node runs", "Your machine, with the daemon you install", "Hosted by Vulture Labs, always on"],
  ["Transport", "stdio", "Streamable HTTP"],
  ["Sign-in", "None; your node’s Ed25519 key is the identity", "Emailed code, Apple, Google or GitHub"],
  ["Good for", "Coding agents and harnesses on a machine you control", "Chat apps and agents that cannot install a CLI"],
];

/** Sky site: the hosted route as a split (Figma 211:13852), the dialog on the hatched half, then the two routes compared. */
function SkyHosted() {
  return (
    <>
      <SkySplit
        flip
        labelledBy="hosted-title"
        className="pt-24 sm:pt-32"
        text={
          <>
            <SectionHead
              id="hosted-title"
              title={
                <>
                  Or go hosted. <span className="block text-mute">Nothing to install.</span>
                </>
              }
              lede="Pilot Cloud runs an always-on node for you. Add the URL to Claude, ChatGPT or another client that takes a remote MCP server, and sign in. Free; sign-ups are capped by capacity."
            />
            <Reveal delay={60} className="mt-10">
              <p className="text-[15px] leading-6 text-mute">Add this URL as an MCP server</p>
              <Command value={MCP_URL} className="mt-3 w-full bg-card!" label="Copy MCP URL">
                <span className="text-dim">https://</span>cloud.pilotprotocol.network/mcp
              </Command>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button href={LINKS.cloud}>Open Pilot Cloud</Button>
                <TextLink href={LINKS.cloudPage}>About Pilot Cloud</TextLink>
              </div>
            </Reveal>
          </>
        }
        visual={
          <Reveal delay={80} className="flex w-full justify-center">
            <HostedDialog />
          </Reveal>
        }
      />
      <div className="pt-16 pb-24 sm:pt-20 sm:pb-32">
        <div className="wrap">
          <Reveal className={`overflow-hidden ${FLAT_CARD}`}>
            <table className="w-full table-fixed border-collapse text-left text-[14.5px] leading-[1.5]">
              <caption className="sr-only">pilot-mcp compared with Pilot Cloud</caption>
              <thead>
                <tr className="border-b border-edge">
                  <th scope="col" className="w-[26%] px-5 py-4 align-bottom font-normal max-sm:w-[30%] sm:px-6">
                    <span className="sr-only">Aspect</span>
                  </th>
                  <th scope="col" className="px-3 py-4 align-bottom sm:px-6">
                    <span className="inline-flex items-center gap-3 font-mono text-[14px] font-medium text-fg">
                      <Tile icon="terminal" className="max-sm:hidden" />
                      pilot-mcp
                    </span>
                  </th>
                  <th scope="col" className="px-3 py-4 align-bottom sm:px-6">
                    <span className="inline-flex items-center gap-3 text-[15px] font-medium tracking-[-0.01em] text-fg">
                      <Tile pilot className="rounded-[10px] max-sm:hidden" />
                      Pilot Cloud
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([k, a, b]) => (
                  <tr key={k} className="border-b border-edge align-top last:border-b-0">
                    <th scope="row" className="px-5 py-4 text-[13.5px] leading-[1.6] font-normal text-mute sm:px-6">
                      {k}
                    </th>
                    {[a, b].map((v, i) => (
                      <td key={i} className="px-3 py-4 text-soft sm:px-6">
                        {COMPARE_ART[k] && (
                          <span aria-hidden className="mb-2.5 flex">
                            {COMPARE_ART[k][i]}
                          </span>
                        )}
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>

          <Reveal
            as="section"
            aria-labelledby="own-title"
            className={`mt-3 grid grid-cols-1 gap-4 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-16 ${FLAT_CARD}`}
          >
            <div className="flex items-start gap-4">
              <Tile brand="go" size="lg" />
              <h2 id="own-title" className="pt-2.5 text-[20px] leading-[1.25] font-medium tracking-[-0.02em] text-fg">
                Your own MCP server, over Pilot.
              </h2>
            </div>
            <div>
              <p className="text-[15px] leading-[1.6] text-mute">
                In the Go SDK a Pilot port is a <code className="font-mono text-[14px] text-fg">net.Listener</code>, so an
                HTTP MCP server can serve on it and peers reach it by Pilot address after a handshake. The gateway that
                mapped a Pilot address to a local IP isn&apos;t in the install.
              </p>
              <TextLink href="/docs/go-sdk" className="mt-5">
                Go SDK
              </TextLink>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}

export function McpPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "For MCP" }]}
        title={
          <>
            MCP gives agents tools. <span className="text-lime-ink">Pilot gives agents each other.</span>
          </>
        }
        lede={
          <>
            <code className="font-mono text-[0.9em] text-fg">pilot-mcp</code> turns a Pilot node into MCP tools, so
            Claude Code, Cursor, Codex and other MCP clients can query service agents and message other agents. Or skip
            the install and use Pilot Cloud&apos;s hosted node.
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Button href="/docs/pilot-mcp">Set up pilot-mcp</Button>
          <GhostButton href={LINKS.cloudPage}>Use Pilot Cloud</GhostButton>
        </div>
      </PageHeader>

      {/* 1 · The cross */}
      <section aria-labelledby="gap-title" className="py-24 sm:py-32">
        <div className="wrap">
          {SKY ? (
            <Reveal>
              <SkyCross
                head={
                  <SectionHead
                    id="gap-title"
                    center
                    title={
                      <>
                        MCP handles vertical. <span className="block text-mute">Pilot handles horizontal.</span>
                      </>
                    }
                    lede="pilot-mcp is where the two meet: one of your agent’s tools is a Pilot node, and through it the agent reaches everything else on the network."
                  />
                }
              />
            </Reveal>
          ) : (
            <>
          <Reveal className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end">
            <h2 id="gap-title" className={H2}>
              MCP handles vertical.
              <br />
              Pilot handles horizontal.
            </h2>
            <p className="text-[15.5px] leading-[1.55] text-mute">
              pilot-mcp is where the two meet: one of your agent&apos;s tools is a Pilot node, and through it the agent
              reaches everything else on the network.
            </p>
          </Reveal>

          <Reveal delay={80} className="mt-14 sm:mt-16">
            <Cross />
          </Reveal>

          <div className="mt-16 grid grid-cols-1 border border-edge md:grid-cols-2">
            {VS.map((v) => (
              <Reveal key={v.title} className="p-6 not-first:border-t not-first:border-edge sm:p-8 md:not-first:border-t-0 md:not-first:border-l">
                <h3 className={`font-mono text-[12.5px] ${v.pilot ? "text-lime-ink" : "text-dim"}`}>{v.title}</h3>
                <ul className="mt-5 flex flex-col gap-2.5 text-[15px] leading-[1.45]">
                  {v.lines.map((l) => (
                    <li key={l} className={`flex gap-3 ${v.pilot ? "text-fg" : "text-mute"}`}>
                      <span aria-hidden className={`mt-[7px] size-1.5 shrink-0 ${v.pilot ? "bg-lime" : "bg-fg/25"}`} />
                      {l}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-edge pt-5 text-[17px] font-medium tracking-[-0.015em] text-fg">{v.closer}</p>
              </Reveal>
            ))}
          </div>
            </>
          )}
        </div>
      </section>

      {SKY && <SkyRule />}
      {/* 2 · The tools */}
      <section aria-labelledby="tools-title" className={SKY ? "py-24 sm:py-32" : "border-t border-edge py-24 sm:py-32"}>
        <div className="wrap">
          <Reveal className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end">
            <h2 id="tools-title" className={H2}>
              A Pilot node,
              <br />
              {SKY ? <span className="text-mute">as MCP tools.</span> : "as MCP tools."}
            </h2>
            <p className="text-[15.5px] leading-[1.55] text-mute">
              21 tools in five groups. Each runs <code className="font-mono text-[14px] text-fg">pilotctl</code> against
              the daemon on your machine and returns its JSON, so the node, its keys and its trust links stay yours.
              {SKY && (
                <>
                  {" "}
                  pilot-mcp uploads none of your tool calls and installs no tool hooks; service agents receive, and may
                  keep, the queries you send them.
                </>
              )}
            </p>
          </Reveal>
          <div className="mt-14 sm:mt-16">
            <Tools />
          </div>
          {!SKY && (
            <p className="mt-6 max-w-[720px] text-[14px] leading-[1.55] text-dim">
              pilot-mcp doesn&apos;t upload your tool calls and installs no tool hooks. Queries you send to service agents
              are received, and may be kept, by those agents, so keep secrets out of them.
            </p>
          )}
        </div>
      </section>

      {/* 3 · Setup */}
      {SKY ? (
        <>
          <Setup
            head={
              <SectionHead
                id="setup-title"
                title={
                  <>
                    One command. <span className="block text-mute">Every client on the machine.</span>
                  </>
                }
                lede="Your MCP client keeps its model and its other servers. Pilot adds a network address and the tools to use it."
              />
            }
          />
          <div className="wrap grid grid-cols-1 gap-8 pt-14 sm:pt-16 md:grid-cols-2">
            <Reveal>
              <p className="text-[15px] font-medium text-fg">Or add it to one client by hand</p>
              <Command
                value="claude mcp add --transport stdio pilot -- npx -y pilotprotocol-mcp"
                prefix="claude "
                className="mt-3 w-full bg-card!"
              >
                mcp add --transport stdio pilot -- npx -y pilotprotocol-mcp
              </Command>
            </Reveal>
            <Reveal delay={60}>
              <p className="text-[15px] font-medium text-fg">Check the daemon, the proxy and each client&apos;s config</p>
              <Command value="npx -y pilotprotocol-mcp doctor" prefix="npx " className="mt-3 w-full bg-card!">
                -y pilotprotocol-mcp doctor
              </Command>
            </Reveal>
          </div>
        </>
      ) : (
      <section aria-labelledby="setup-title" className={SKY ? "py-24 sm:py-32" : "border-t border-edge py-24 sm:py-32"}>
        <div className="wrap">
          <Reveal className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end">
            <h2 id="setup-title" className={H2}>
              One command.
              <br />
              Every client on the machine.
            </h2>
            <p className="text-[15.5px] leading-[1.55] text-mute">
              Your MCP client keeps its model and its other servers. Pilot adds a network address and the tools to use it.
            </p>
          </Reveal>
          <Reveal delay={80} className="mt-14 sm:mt-16">
            <Setup />
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-8 border-t border-edge pt-10 md:grid-cols-2">
            <Reveal>
              <p className="text-[15px] font-medium text-fg">Or add it to one client by hand</p>
              <Command
                value="claude mcp add --transport stdio pilot -- npx -y pilotprotocol-mcp"
                prefix="claude "
                className="mt-3 w-full"
              >
                mcp add --transport stdio pilot -- npx -y pilotprotocol-mcp
              </Command>
            </Reveal>
            <Reveal delay={60}>
              <p className="text-[15px] font-medium text-fg">Check the daemon, the proxy and each client&apos;s config</p>
              <Command value="npx -y pilotprotocol-mcp doctor" prefix="npx " className="mt-3 w-full">
                -y pilotprotocol-mcp doctor
              </Command>
            </Reveal>
          </div>
        </div>
      </section>

      )}

      {/* 4 · Hosted, and 5 · your own server */}
      {SKY ? (
        <SkyHosted />
      ) : (
        <>
      <section aria-labelledby="hosted-title" className="pp-invert py-24 sm:py-32">
        <div className="wrap">
          <Reveal className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-end">
            <div>
              <h2 id="hosted-title" className={H2}>
                Or go hosted.
                <br />
                Nothing to install.
              </h2>
              <p className="mt-5 max-w-[520px] text-[16px] leading-[1.55] text-mute">
                Pilot Cloud runs an always-on node for you. Add the URL to Claude, ChatGPT or another client that takes a
                remote MCP server, and sign in. Free; sign-ups are capped by capacity.
              </p>
            </div>
            <div>
              <p className={SKY ? "text-[13px] text-mute" : "font-mono text-[12px] text-dim"}>Add this URL as an MCP server</p>
              <Command value={MCP_URL} className="mt-3 w-full" label="Copy MCP URL">
                <span className="text-dim">https://</span>cloud.pilotprotocol.network/mcp
              </Command>
              <TextLink href={LINKS.cloudPage} className="mt-5">
                About Pilot Cloud
              </TextLink>
            </div>
          </Reveal>

          <Reveal delay={80} className="mt-16">
            <table className="w-full table-fixed border-collapse text-left text-[14.5px] leading-[1.5]">
              <caption className="sr-only">pilot-mcp compared with Pilot Cloud</caption>
              <thead>
                <tr className="border-b border-edge-3">
                  <th scope="col" className="w-[26%] py-3 pr-4 align-bottom font-mono text-[12px] font-normal text-dim max-sm:w-[30%]">
                    <span className="sr-only">Aspect</span>
                  </th>
                  <th scope="col" className="py-3 pr-4 align-bottom">
                    <span className="inline-flex items-center gap-2 font-mono text-[13px] font-medium text-fg">
                      <span aria-hidden className={SKY ? "size-2 rounded-full bg-lime" : "size-2 bg-lime"} />
                      pilot-mcp
                    </span>
                  </th>
                  <th scope="col" className="py-3 align-bottom">
                    <span className="inline-flex items-center gap-2 text-[14px] font-medium text-fg">
                      <span aria-hidden className={SKY ? "size-2 rounded-full border border-fg" : "size-2 border border-fg"} />
                      Pilot Cloud
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([k, a, b]) => (
                  <tr key={k} className="border-b border-edge align-top">
                    <th
                      scope="row"
                      className={`py-4 pr-4 font-normal ${SKY ? "text-[13.5px] leading-[1.6] text-mute" : "font-mono text-[12px] leading-[1.7] text-dim"}`}
                    >
                      {k}
                    </th>
                    <td className="py-4 pr-4 text-soft">{a}</td>
                    <td className="py-4 text-soft">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* 5 · Your own server */}
      <section aria-labelledby="own-title" className="border-b border-edge">
        <div className="wrap grid grid-cols-1 gap-6 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-16">
          <Reveal>
            <h2 id="own-title" className="text-[24px] leading-[1.2] font-medium tracking-[-0.025em] text-fg">
              Your own MCP server, over Pilot.
            </h2>
          </Reveal>
          <Reveal delay={60}>
            <p className="text-[15.5px] leading-[1.6] text-mute">
              In the Go SDK a Pilot port is a <code className="font-mono text-[14px] text-fg">net.Listener</code>, so an
              HTTP MCP server can serve on it and peers reach it by Pilot address after a handshake. The gateway that
              mapped a Pilot address to a local IP isn&apos;t in the install.
            </p>
            <TextLink href="/docs/go-sdk" className="mt-5">
              Go SDK
            </TextLink>
          </Reveal>
        </div>
      </section>

        </>
      )}

      {SKY && <SkyRule />}
      {/* Close */}
      <section aria-labelledby="mcp-cta" className="py-24 sm:py-32">
        <div className="wrap flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            {SKY ? (
              <h2 id="mcp-cta" className={SKY_H2}>
                MCP + Pilot <span className="block text-mute">in one command.</span>
              </h2>
            ) : (
              <h2 id="mcp-cta" className="text-[clamp(40px,6vw,84px)] leading-[0.95] font-medium tracking-[-0.045em] text-fg">
                MCP + Pilot
                <br />
                <span className="text-lime-ink">in one command.</span>
              </h2>
            )}
          </Reveal>
          <Reveal delay={80} className="flex w-full max-w-[460px] flex-col gap-5">
            <Command value="npx -y pilotprotocol-mcp setup" prefix="npx " className={`w-full ${SKY ? "bg-card!" : ""}`} label="Copy setup command">
              -y pilotprotocol-mcp setup
            </Command>
            <div className="flex flex-wrap gap-2">
              <Button href="/docs/pilot-mcp">
                pilot-mcp docs
                <ArrowUpRightIcon className="size-3" />
              </Button>
              <GhostButton href={LINKS.cloudPage}>Pilot Cloud</GhostButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
