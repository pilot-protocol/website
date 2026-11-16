import type { ReactNode } from "react";
import { ArrowRightIcon, LockIcon } from "@/components/icons";
import { Obj, ObjTile, type ObjName } from "@/components/pages/security/infra";
import { Code, FLAT_CARD } from "@/components/pages/security/kit";
import { Reveal, SmartLink } from "@/components/ui";
import { BrandMark } from "@/components/v4/logos";

/*
 * Sky site: "What the backbone can see", as what each part actually holds. The registry's card is a registry entry
 * (what `pilotctl lookup` returns, plus what the registry keeps beside it), the beacon's a few lines of its log, the
 * tunnel's the ciphertext, and so on. Every field named in the copy appears once, with an example value; the values
 * are examples (example.com, documentation addresses).
 */

const inline = "text-fg underline decoration-fg/30 underline-offset-[3px] transition-[text-decoration-color] hover:decoration-fg";

function Head({ obj, name, by, dark = false }: { obj: ObjName; name: string; by: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {dark ? (
        <span className="grid size-10 place-items-center rounded-[11px] bg-white/12 text-white">
          <LockIcon className="size-[18px]" />
        </span>
      ) : (
        <ObjTile name={obj} size={40} />
      )}
      <span className="flex flex-col">
        <span className={`text-[16px] leading-6 font-medium tracking-[-0.03em] ${dark ? "text-white" : "text-fg"}`}>{name}</span>
        <span className={`text-[12.5px] leading-4 ${dark ? "text-white/65" : "text-mute"}`}>{by}</span>
      </span>
    </div>
  );
}

function Note({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={`mt-auto flex gap-2.5 pt-5 text-[14px] leading-[1.5] text-pretty ${dark ? "text-white/75" : "text-mute"}`}>
      <Obj name="eyeSlash" className={`mt-[2px] size-4 ${dark ? "text-white/60 [--ob-accent:#8ec1ff]" : "text-fg/50"}`} />
      <span>{children}</span>
    </p>
  );
}

/** A field the part sees: its name, and an example of what it looks like there. */
function Field({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] items-center gap-3 border-t border-(--sky-card-line) py-2 first:border-t-0 sm:grid-cols-[minmax(0,168px)_minmax(0,1fr)]">
      <dt className="text-[13px] leading-5 text-mute">{k}</dt>
      <dd className="flex min-w-0 flex-wrap items-center gap-1.5 font-mono text-[12.5px] leading-5 text-fg">{children}</dd>
    </div>
  );
}

const PILL = "inline-flex items-center rounded-full px-2 py-[3px] font-sans text-[11.5px] leading-none font-medium";

function Registry() {
  return (
    <div className={`flex h-full flex-col p-5 sm:p-6 ${FLAT_CARD}`}>
      <Head obj="server" name="Registry" by="Run by Vulture Labs" />
      <div className="mt-5 overflow-hidden rounded-[10px] shadow-[0_0_0_1px_var(--sky-card-line)]">
        <p className="flex items-center gap-2 border-b border-(--sky-card-line) bg-fg/[0.025] px-3.5 py-2 font-mono text-[12px] text-mute">
          <span className="text-(--sky-accent) select-none">$</span> pilotctl lookup agent-a
        </p>
        <dl className="px-3.5 py-1.5" aria-label="What the registry sees">
          <Field k="Node ID">48213</Field>
          <Field k="Public key">
            <span className="text-mute">ed25519</span> 9f2c41d0…c1e0
          </Field>
          <Field k="Version">v1.13.11</Field>
          <Field k="Hostname and tags, if set">
            agent-a
            <span className={`${PILL} bg-fg/[0.06] text-soft`}>web-server</span>
          </Field>
          <Field k="Public or private flag">
            <span className={`${PILL} bg-fg text-bg`}>Private</span>
          </Field>
          <Field k="Advertised endpoints">203.0.113.7:4000</Field>
          <Field k="Network membership">
            <span className={`${PILL} bg-(--sky-tint) text-(--sky-accent)`}>ops</span>
          </Field>
          <Field k="Which nodes trust each other">
            agent-a <ArrowRightIcon className="size-3 text-faint" /> agent-b
          </Field>
          <Field k="Heartbeat times">
            <span className="size-1.5 rounded-full bg-(--sky-fill)" /> 12 s ago
          </Field>
          <Field k="Recovery email, if given">you@example.com</Field>
        </dl>
      </div>
      <Note>Traffic between agents never passes through it.</Note>
    </div>
  );
}

function Beacon() {
  const rows: [string, ReactNode, string][] = [
    ["STUN", "203.0.113.7:4000", "Your public IP and port"],
    [
      "Punch",
      <>
        agent-a <ArrowRightIcon className="inline size-3 text-faint" /> agent-b
      </>,
      "Hole-punch requests",
    ],
    ["Relay", "14:02:11.204 · 1,280 B", "Timing and size of relayed packets"],
  ];
  return (
    <div className={`flex h-full flex-col p-5 sm:p-6 ${FLAT_CARD}`}>
      <Head obj="antenna" name="Beacon" by="Run by Vulture Labs" />
      <ul className="mt-5 flex flex-col gap-2" aria-label="What the beacon sees">
        {rows.map(([k, v, what]) => (
          <li key={k} className="rounded-[10px] px-3 py-2.5 shadow-[0_0_0_1px_var(--sky-card-line)]">
            <p className="flex items-center gap-2 font-mono text-[12.5px] leading-5 text-fg">
              <span className="w-[44px] shrink-0 text-(--sky-accent)">{k}</span>
              <span className="min-w-0 truncate">{v}</span>
            </p>
            <p className="mt-0.5 pl-[52px] text-[12.5px] leading-4 text-mute">{what}</p>
          </li>
        ))}
      </ul>
      <Note>Relayed payloads are ciphertext; the beacon has no tunnel keys.</Note>
    </div>
  );
}

function Tunnel() {
  return (
    <div className="flex h-full flex-col rounded-[20px] bg-(--sky-deep) p-5 text-white sm:p-6">
      <Head obj="lock" name="Peer tunnel" by="Run by the two endpoints" dark />
      <div className="mt-6 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-[10px] bg-white text-[#1a1a1a]">
          <Obj name="laptop" className="size-[18px]" />
        </span>
        <span className="h-px flex-1 bg-white/30" />
        <span className="rounded-full bg-white/14 px-2.5 py-1 font-mono text-[11.5px] leading-none text-white/85">a7f3…09e1</span>
        <span className="h-px flex-1 bg-white/30" />
        <span className="grid size-9 place-items-center rounded-[10px] bg-white text-[#1a1a1a]">
          <Obj name="laptop" className="size-[18px]" />
        </span>
      </div>
      <p className="mt-5 flex flex-wrap items-center gap-2 text-[14px] text-white/80">
        <span className="rounded-full bg-white/14 px-2.5 py-1 text-[13px] leading-[18px] text-white">Payload</span>
        readable at A and B only
      </p>
      <p className="mt-auto pt-5 text-[14px] leading-[1.5] text-pretty text-white/75">
        Only the two peers can read the payload. Neither the registry nor the beacon receives the keys.
      </p>
    </div>
  );
}

/** A small flow: what goes in, the part it passes through, where it goes next. */
function Flow({ from, via, to }: { from: ReactNode; via: ObjName; to: ReactNode }) {
  return (
    <div className="mt-5 flex items-center gap-2">
      {from}
      <ArrowRightIcon className="size-3 shrink-0 text-faint" />
      <ObjTile name={via} size={34} lit />
      <ArrowRightIcon className="size-3 shrink-0 text-faint" />
      {to}
    </div>
  );
}

function DataAgents() {
  return (
    <div className={`flex h-full flex-col p-5 sm:p-6 ${FLAT_CARD}`}>
      <Head obj="nodes" name="Data service agents" by="Run by Vulture Labs" />
      <Flow
        from={<span className="truncate rounded-[10px] rounded-br-[3px] bg-(--sky-fill) px-2.5 py-1.5 font-mono text-[12px] text-white">/summary</span>}
        via="nodes"
        to={
          <span className="flex items-center gap-1.5">
            <ObjTile name="database" size={34} />
            <span className="grid size-[34px] place-items-center rounded-[9px] bg-card shadow-[0_0_0_1px_var(--sky-card-line)]">
              <BrandMark brand="gemini" className="size-4" />
            </span>
          </span>
        }
      />
      <p className="mt-2 text-[12.5px] leading-4 text-mute">Your query</p>
      <p className="mt-auto pt-5 text-[14px] leading-[1.5] text-pretty text-mute">
        The{" "}
        <SmartLink href="/service-agents" className={inline}>
          agent you query
        </SmartLink>{" "}
        calls its upstream data source. <Code>/summary</Code> and free-text queries are also sent to Google Gemini.
      </p>
    </div>
  );
}

function Broker() {
  return (
    <div className={`flex h-full flex-col p-5 sm:p-6 ${FLAT_CARD}`}>
      <Head obj="boxCheck" name="App Store broker" by="Run by Vulture Labs" />
      <Flow
        from={
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/apps/agentphone.webp" alt="" width={34} height={34} className="size-[34px] rounded-[9px] shadow-tile" />
        }
        via="boxCheck"
        to={<ObjTile name="cloud" size={34} />}
      />
      <p className="mt-2 text-[12.5px] leading-4 text-mute">Contents of brokered requests</p>
      <p className="mt-auto pt-5 text-[14px] leading-[1.5] text-pretty text-mute">
        Some apps route calls through Pilot’s broker, which forwards them to the provider named in the app’s listing.
      </p>
    </div>
  );
}

function Usage() {
  const events = ["Catalogue views", "App views", "Installs", "Reviews"];
  return (
    <div className={`grid h-full grid-cols-1 gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center lg:grid-cols-1 lg:items-start lg:gap-5 ${FLAT_CARD}`}>
      <div>
        <Head obj="chart" name="Usage events" by="Signed events from pilotctl" />
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="What usage events record">
          {events.map((e) => (
            <li key={e} className="flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1.5 text-[12.5px] leading-4 text-soft shadow-[0_0_0_1px_var(--sky-card-line)]">
              <span className="size-1.5 rounded-full bg-(--sky-fill)" />
              {e}
            </li>
          ))}
        </ul>
      </div>
      <div className="min-w-0">
        <div className="overflow-hidden rounded-[10px] shadow-[0_0_0_1px_var(--sky-card-line)]">
          <p className="border-b border-(--sky-card-line) bg-fg/[0.025] px-3.5 py-2 font-mono text-[12px] text-mute">~/.pilot/config.json</p>
          <pre className="no-scrollbar overflow-x-auto px-3.5 py-3 font-mono text-[12.5px] leading-5 text-fg">
            {"{ "}
            <span className="text-mute">&quot;consent&quot;</span>
            {": { "}
            <span className="text-mute">&quot;telemetry&quot;</span>
            {": "}
            <span className="text-(--sky-accent)">false</span>
            {" } }"}
          </pre>
        </div>
        <p className="mt-3 text-[14px] leading-[1.5] text-pretty text-mute">
          Turn them off in <Code>~/.pilot/config.json</Code>; see{" "}
          <SmartLink href="/docs/consent" className={inline}>
            consent
          </SmartLink>
          .
        </p>
      </div>
    </div>
  );
}

export function SeesBento() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-3 sm:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
      <Reveal className="md:col-span-2 lg:col-span-2 lg:row-span-2">
        <Registry />
      </Reveal>
      <Reveal delay={60}>
        <Tunnel />
      </Reveal>
      <Reveal delay={90}>
        <Beacon />
      </Reveal>
      <Reveal delay={60}>
        <DataAgents />
      </Reveal>
      <Reveal delay={90}>
        <Broker />
      </Reveal>
      <Reveal delay={120} className="md:col-span-2 lg:col-span-1">
        <Usage />
      </Reveal>
    </div>
  );
}
