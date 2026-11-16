import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { Obj, ObjTile, type ObjName } from "@/components/pages/security/infra";
import { Code, FLAT_CARD, Glyph, SectionHead, SKY, SKY_PILL, Soft } from "@/components/pages/security/kit";
import { HatchPanel } from "@/components/sky/kit";
import { Reveal, SmartLink } from "@/components/ui";
import { BrandMark, type Brand } from "@/components/v4/logos";

const inline = "text-fg underline decoration-fg/30 underline-offset-[3px] transition-[text-decoration-color] hover:decoration-fg";

/* ------------------------------------------------------------------ */
/* What exists, stated plainly                                          */
/* ------------------------------------------------------------------ */

type Kind = "ships" | "run" | "none" | "yours";

const STATUS: { topic: string; status: string; kind: Kind; body: string }[] = [
  {
    topic: "Protocol implementation",
    status: "Open source",
    kind: "ships",
    body: "The daemon, pilotctl, registry and beacon are published under AGPL-3.0 and can be inspected, modified and redistributed under that license.",
  },
  {
    topic: "Wire specification",
    status: "Published",
    kind: "ships",
    body: "Message types, addressing, transport, encryption and the trust model are documented alongside the implementation.",
  },
  {
    topic: "Pre-trust hardening",
    status: "Operator flags",
    kind: "run",
    body: "Strict checks on key exchange, directory lookups, registration and hole punching. Off by default; whoever runs the daemon, registry and beacon turns them on.",
  },
  {
    topic: "Registry controls",
    status: "Self-hosted",
    kind: "run",
    body: "Roles, identity-provider validation, policy, audit export and blueprints ship in the open-source registry and work on a registry you run.",
  },
  {
    topic: "App isolation",
    status: "Not implemented",
    kind: "none",
    body: "Apps run as ordinary processes. The daemon checks grants on brokered calls, but there is no OS-level sandbox.",
  },
  {
    topic: "Security certification",
    status: "None",
    kind: "none",
    body: "Pilot has no SOC 2 report or other independent certification. Evaluate the controls on this page against your own requirements.",
  },
  {
    topic: "Business-process governance",
    status: "Your application",
    kind: "yours",
    body: "Pilot governs agent connectivity. Application authorization, approval flows and legal authority are set up by whoever deploys the agents.",
  },
];

/* Sky site: what each row is about, as an object (the source, the spec, the flags, the registry, the app, the
   certificate that doesn't exist, your application's rules). */
const STATUS_OBJ: ObjName[] = ["terminal", "book", "shield", "server", "boxCheck", "badgeCheck", "scale"];

const LEGEND: [Kind, string][] = [
  ["ships", "Ships today"],
  ["run", "Yours to turn on or run"],
  ["none", "Doesn’t exist"],
  ["yours", "Your application’s job"],
];

export function Status() {
  return (
    <section aria-labelledby="status-title" className={SKY ? "py-24 sm:py-32" : "border-t border-edge py-24 sm:py-32"}>
      <div className="wrap">
        <SectionHead
          id="status-title"
          kicker="Current status"
          title={
            SKY ? (
              <>
                What exists, <span className="block text-mute">stated plainly.</span>
              </>
            ) : (
              <>
                What exists, <Soft>stated plainly.</Soft>
              </>
            )
          }
          lede={
            <>
              The open-source registry also has private networks, owner, admin and member roles, OIDC/JWT validation,
              directory sync, network policy, audit export and blueprints. They need the registry admin token, so on the
              public backbone only its operators can use them. To use them yourself,{" "}
              <SmartLink href="/self-hosting" className={inline}>
                run your own registry
              </SmartLink>
              ; nobody runs one for you.
            </>
          }
        />

        <Reveal
          delay={60}
          className={`mt-12 flex flex-wrap gap-x-7 gap-y-3 sm:mt-14 ${SKY ? "text-[13px] text-mute" : "font-mono text-[12px] text-dim"}`}
        >
          {LEGEND.map(([k, label]) => (
            <span key={k} className="flex items-center gap-2.5">
              <Glyph kind={k} />
              {label}
            </span>
          ))}
        </Reveal>

        <ul className={SKY ? `mt-5 overflow-hidden ${FLAT_CARD}` : "mt-6 border-t border-edge-2"}>
          {STATUS.map((s, i) => (
            <Reveal
              as="li"
              key={s.topic}
              delay={i * 40}
              className={`grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,4fr)_minmax(0,3fr)_minmax(0,7fr)] md:gap-8 ${
                SKY ? "border-b border-(--sky-card-line) px-5 py-5 last:border-b-0 sm:px-6" : "border-b border-edge py-6"
              }`}
            >
              {SKY ? (
                <p className="flex items-center gap-3 text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">
                  <ObjTile name={STATUS_OBJ[i]} size={36} dim={s.kind === "none"} />
                  {s.topic}
                </p>
              ) : (
                <p className="text-[17px] leading-[1.35] font-medium tracking-[-0.015em] text-fg">{s.topic}</p>
              )}
              {SKY ? (
                <p className="md:pt-2">
                  <span
                    className={
                      s.kind === "ships"
                        ? SKY_PILL
                        : `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] leading-4 font-medium shadow-[0_0_0_1px_var(--color-edge-2)] ${
                            s.kind === "none" ? "text-mute" : "text-fg"
                          }`
                    }
                  >
                    <Glyph kind={s.kind} className="size-2" />
                    {s.status}
                  </span>
                </p>
              ) : (
              <p
                className={`flex items-center gap-2.5 font-mono text-[13px] md:h-[23px] ${
                  s.kind === "none" ? "text-mute" : "text-fg"
                }`}
              >
                <Glyph kind={s.kind} />
                {s.status}
              </p>
              )}
              <p className={SKY ? "text-[14.5px] leading-[1.55] text-pretty text-mute md:pt-1" : "text-[15px] leading-[1.55] text-mute"}>{s.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The documents a reviewer asks for                                    */
/* ------------------------------------------------------------------ */

const DOC_OBJ: Record<string, ObjName> = {
  "Privacy policy": "shield",
  "Sub-processors": "users",
  "Government data requests": "gavel",
  "Terms of Service": "signature",
  "Cookie policy": "cookie",
  "Vulnerability disclosure": "envelope",
};

/** A document, drawn as a sheet: its mark, a title line and a few lines of text, its address under it. */
function Sheet({ obj, href }: { obj: ObjName; href: string }) {
  return (
    <span className="flex scale-[0.7] flex-col items-center gap-3 sm:scale-100">
      <span className="kit-sheet relative flex h-[118px] w-[92px] flex-col gap-[7px] px-3 pt-3 transition-transform duration-300 ease-(--ease-out) group-hover:-translate-y-1">
        <span className="kit-sheet-fold absolute top-0 right-0 size-[18px]" />
        <Obj name={obj} className="size-[22px] text-[#1a1a1a] dark:text-[#f2f2ec] dark:[--ob-accent:#5aa9ff]" />
        <span className="mt-1 h-[5px] w-[58px] rounded-full bg-[#1a1a1a]/70 dark:bg-white/70" />
        {[64, 56, 66, 44].map((w, i) => (
          <span key={i} className="h-[4px] rounded-full bg-[#1a1a1a]/12 dark:bg-white/14" style={{ width: w }} />
        ))}
      </span>
      <span className="hidden font-mono text-[11.5px] leading-none text-mute sm:block">{href}</span>
    </span>
  );
}

const DOCS = [
  { kind: "Policy", t: "Privacy policy", b: "What the daemon, website and registry collect, the legal basis for processing, and your GDPR and CCPA rights.", href: "/privacy" },
  { kind: "Policy", t: "Sub-processors", b: "The third parties that process data on our behalf, what each one does, and where the data is processed.", href: "/privacy#subprocessors" },
  { kind: "Policy", t: "Government data requests", b: "We disclose user data only under valid legal process, narrow overbroad requests, and notify affected users unless the law prohibits it.", href: "/privacy#legal-requests" },
  { kind: "Policy", t: "Terms of Service", b: "The terms governing use of the Pilot Protocol daemon, website and Pilot-operated services.", href: "/terms" },
  { kind: "Policy", t: "Cookie policy", b: "The cookies set on pilotprotocol.network. Analytics and advertising cookies load only after you consent.", href: "/cookies" },
  { kind: "Reporting", t: "Vulnerability disclosure", b: "How to report a security issue, privacy concern or bug privately, and what to include.", href: "/security/disclosure" },
];

/** Sky site (Figma 233:1195; the docs index 232:4839): the documents as flat link cards on one hatched panel. */
function SkyDocuments() {
  return (
    <section aria-labelledby="documents-title" className="pb-24 sm:pb-32">
      <div className="wrap">
        <HatchPanel className="px-4 py-14 sm:px-10 sm:py-20 lg:px-14">
          <SectionHead
            center
            id="documents-title"
            title={
              <>
                The documents <span className="block text-mute">a reviewer asks for.</span>
              </>
            }
            lede="Pilot Protocol is operated by Vulture Labs, Inc. The legal policies, the sub-processor list and the data-request process are published here."
          />
          <Reveal delay={60} className="mx-auto mt-12 grid max-w-[980px] grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
            {DOCS.map((d) => (
              <SmartLink
                key={d.t}
                href={d.href}
                className={`group grid grid-cols-[96px_minmax(0,1fr)] overflow-hidden sm:flex sm:flex-col ${FLAT_CARD}`}
              >
                <span
                  aria-hidden
                  className="flex items-center justify-center border-r border-(--sky-card-line) bg-[color-mix(in_srgb,var(--color-fg)_3%,var(--color-card))] sm:border-r-0 sm:border-b sm:pt-6 sm:pb-4"
                >
                  <Sheet obj={DOC_OBJ[d.t]} href={d.href} />
                </span>
                <span className="flex flex-1 flex-col p-4 sm:p-6">
                <span className="flex items-start justify-between gap-4">
                  <span className="text-[16px] leading-6 font-medium tracking-[-0.03em] text-fg">{d.t}</span>
                  <ArrowUpRightIcon className="mt-1.5 size-3 shrink-0 text-faint transition-[color,transform] duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-(--sky-accent)" />
                </span>
                <span className="mt-1.5 text-[14px] leading-[1.5] text-pretty text-mute">{d.b}</span>
                </span>
              </SmartLink>
            ))}
          </Reveal>
        </HatchPanel>
      </div>
    </section>
  );
}

export function Documents() {
  if (SKY) return <SkyDocuments />;
  return (
    <section aria-labelledby="documents-title" className="border-t border-edge py-24 sm:py-32">
      <div className="wrap">
        <SectionHead
          id="documents-title"
          kicker="Policies"
          title={
            <>
              The documents a <Soft>reviewer asks for.</Soft>
            </>
          }
          lede="Pilot Protocol is operated by Vulture Labs, Inc. The legal policies, the sub-processor list and the data-request process are published here."
        />
        <Reveal delay={60} className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge sm:grid-cols-2 lg:grid-cols-3">
          {DOCS.map((d) => (
            <SmartLink
              key={d.t}
              href={d.href}
              className="group flex min-h-[176px] flex-col bg-bg p-6 transition-colors duration-300 hover:bg-fg/[0.03]"
            >
              <span className="flex items-center justify-between font-mono text-[12px] text-dim">
                {d.kind}
                <ArrowUpRightIcon className="size-3 text-faint transition-[color,transform] duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-lime-ink" />
              </span>
              <span className="mt-auto pt-8 text-[17px] font-medium tracking-[-0.015em] text-fg">{d.t}</span>
              <span className="mt-1.5 text-[14px] leading-[1.5] text-mute">{d.b}</span>
            </SmartLink>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* What we hold, and for how long                                       */
/* ------------------------------------------------------------------ */

const HOLD: { topic: string; value: ReactNode; body: ReactNode }[] = [
  {
    topic: "Hosting",
    value: "United States",
    body: (
      <>
        The registry and Pilot-operated agents run on Google Cloud Platform, with data at rest in <Code>us-central1</Code>.
        The website is served by Cloudflare’s global edge network.
      </>
    ),
  },
  {
    topic: "Payload visibility",
    value: "End-to-end",
    body: "Peer-to-peer tunnel traffic is end-to-end encrypted, and we do not hold the keys. Relayed traffic stays encrypted; we see only routing metadata. Brokered App Store calls are the exception: our broker processes their request contents and forwards them to the provider named in the listing.",
  },
  {
    topic: "Encryption",
    value: "In transit & at rest",
    body: "TLS 1.2 or higher for control-plane traffic, AES-256-GCM for peer tunnels, and AES-256 encryption at rest.",
  },
  {
    topic: "Retention",
    value: "30 days",
    body: (
      <>
        Registration data is deleted after an agent has been offline for 30 consecutive days. Server access logs are
        deleted after 30 days. See{" "}
        <SmartLink href="/privacy#retention" className={inline}>
          the full retention schedule
        </SmartLink>
        .
      </>
    ),
  },
  {
    topic: "Breach notification",
    value: "As required by law",
    body: "If a data breach occurs, we notify affected users and the relevant authorities as applicable law requires.",
  },
  {
    topic: "Legal requests",
    value: "Process required",
    body: (
      <>
        We disclose user data only under valid, legally binding process, and we notify affected users first unless the
        law prohibits it. See{" "}
        <SmartLink href="/privacy#legal-requests" className={inline}>
          the full policy
        </SmartLink>
        .
      </>
    ),
  },
];

/** A brand's mark on a small tile (hosting providers the copy names). */
function MarkTile({ brand }: { brand: Brand }) {
  return (
    <span className="infra-tile" style={{ width: 40, height: 40, borderRadius: 11 }}>
      <BrandMark brand={brand} className="size-[18px]" />
    </span>
  );
}

/* What each commitment is about, drawn: the two hosts the copy names, the lock and key, thirty days, the notice, the gavel. */
const HOLD_ART: ReactNode[] = [
  <>
    <MarkTile key="g" brand="googlecloud" />
    <MarkTile key="c" brand="cloudflare" />
  </>,
  <ObjTile key="l" name="lock" size={40} />,
  <ObjTile key="k" name="key" size={40} />,
  <span key="d" className="flex gap-[3px]">
    {Array.from({ length: 30 }, (_, i) => (
      <span key={i} className={`h-[18px] w-[4px] rounded-full ${i === 29 ? "bg-(--sky-fill)" : "bg-fg/[0.12]"}`} />
    ))}
  </span>,
  <ObjTile key="e" name="envelope" size={40} />,
  <ObjTile key="g" name="gavel" size={40} />,
];

export function DataHandling() {
  return (
    <section aria-labelledby="hold-title" className={SKY ? "pb-24 sm:pb-32" : "border-t border-edge py-24 sm:py-32"}>
      <div className="wrap">
        <SectionHead
          id="hold-title"
          kicker="Data handling"
          center={SKY}
          title={
            SKY ? (
              <>
                What we hold, <span className="block text-mute">and for how long.</span>
              </>
            ) : (
              <>
                What we hold, <Soft>and for how long.</Soft>
              </>
            )
          }
          lede={
            <>
              A summary of the commitments in our{" "}
              <SmartLink href="/privacy" className={inline}>
                privacy policy
              </SmartLink>
              . Where the two differ, the privacy policy governs.
            </>
          }
        />
        {SKY ? (
          <Reveal
            delay={60}
            className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-[12px] border border-(--sky-card-line) bg-(--sky-card-line) sm:mt-16 sm:grid-cols-2 lg:grid-cols-3"
          >
            {HOLD.map((h, i) => (
              <div key={h.topic} className="flex flex-col bg-card p-5 sm:p-6">
                <span aria-hidden className="mb-5 flex h-10 items-center gap-2">
                  {HOLD_ART[i]}
                </span>
                <p className="text-[13px] leading-5 text-mute">{h.topic}</p>
                <p className="mt-2 text-[clamp(22px,2.2vw,26px)] leading-[1.15] font-medium tracking-[-0.04em] text-fg">{h.value}</p>
                <p className="mt-3 text-[14.5px] leading-[1.55] text-pretty text-mute">{h.body}</p>
              </div>
            ))}
          </Reveal>
        ) : (
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {HOLD.map((h, i) => (
            <Reveal key={h.topic} delay={(i % 3) * 60} className="relative border-l border-edge-2 pl-5">
              <span aria-hidden className="absolute top-0 -left-px h-4 w-px bg-lime" />
              <p className="font-mono text-[12px] text-dim">{h.topic}</p>
              <p className="mt-3 text-[clamp(24px,2.4vw,30px)] leading-[1.1] font-medium tracking-[-0.03em] text-fg">
                {h.value}
              </p>
              <p className="mt-3 text-[14.5px] leading-[1.55] text-mute">{h.body}</p>
            </Reveal>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
