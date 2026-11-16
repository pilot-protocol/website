import { SECURITY_TXT } from "@/generated/files";
import { PageHeader } from "@/components/page/page-header";
import { DISCLOSURE_MAILTO, SECURITY_EMAIL } from "@/components/pages/security/contact";
import { DisclosureForm } from "@/components/pages/security/disclosure-form";
import { CopyButton, FLAT_CARD, FLAT_CODE, NumberedList, SKY, SKY_H2, SKY_LEDE, Soft } from "@/components/pages/security/kit";
import { Reveal, TextLink } from "@/components/ui";

const RULES = [
  {
    t: "Minimize data",
    b: "Do not include credentials, private keys, customer data, or destructive payloads. Use redacted samples.",
  },
  {
    t: "Stop at proof",
    b: "Do not persist access, change data, degrade service, or continue when testing may affect another party.",
  },
  {
    t: "Coordinate publication",
    b: "Give the team a reasonable opportunity to investigate and remediate before public disclosure.",
  },
];

/** The published security.txt, captured at build time so the page always shows the real file. */
function securityTxt() {
  return SECURITY_TXT || `Contact: mailto:${SECURITY_EMAIL}`;
}

function SecurityTxt() {
  const lines = securityTxt().split("\n");
  if (SKY)
    return (
      <figure className={FLAT_CODE}>
        <figcaption className="flex h-11 items-center justify-between gap-3 border-b border-(--sky-card-line) px-4">
          <span className="truncate font-mono text-[12px] text-mute">/.well-known/security.txt</span>
          <a href="/.well-known/security.txt" className="shrink-0 text-[13px] text-mute transition-colors hover:text-fg">
            Open raw
          </a>
        </figcaption>
        <pre className="no-scrollbar overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.8] sm:px-5">
          {lines.map((l) => {
            const i = l.indexOf(":");
            return (
              <div key={l} className="whitespace-pre">
                <span className="text-(--sky-accent)">{l.slice(0, i + 1)}</span>
                <span className="text-soft">{l.slice(i + 1)}</span>
              </div>
            );
          })}
        </pre>
      </figure>
    );
  return (
    <figure className="pp-island">
      <figcaption className="flex h-10 items-center justify-between border-b border-edge px-4">
        <span className="font-mono text-[11.5px] text-dim">/.well-known/security.txt</span>
        <a
          href="/.well-known/security.txt"
          className="font-mono text-[11.5px] text-dim transition-colors hover:text-fg"
        >
          Open raw
        </a>
      </figcaption>
      <pre className="no-scrollbar overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.8]">
        {lines.map((l) => {
          const i = l.indexOf(":");
          return (
            <div key={l} className="whitespace-pre">
              <span className="text-fg">{l.slice(0, i + 1)}</span>
              <span className="text-soft">{l.slice(i + 1)}</span>
            </div>
          );
        })}
      </pre>
    </figure>
  );
}

export function DisclosurePage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Security", href: "/security" }, { label: "Disclosure" }]}
        title={
          <>
            Tell us what <span className={SKY ? "text-mute" : "text-lime-ink"}>you found.</span>
          </>
        }
        lede="Report security issues, privacy concerns, reliability defects, and product bugs directly to the team responsible for Pilot."
        aside={
          SKY ? (
            <div className={`rise-in flex flex-col gap-3 p-5 [--delay:240ms] sm:p-6 lg:w-[400px] ${FLAT_CARD}`}>
              <p className="text-[13px] leading-5 text-mute">Direct security contact</p>
              <div className="flex items-center gap-2.5 rounded-[8px] bg-fg/[0.04] py-1.5 pr-1.5 pl-3.5">
                <a
                  href={DISCLOSURE_MAILTO}
                  className="min-w-0 flex-1 truncate font-mono text-[13px] text-fg underline decoration-fg/0 underline-offset-[3px] transition-[text-decoration-color] hover:decoration-fg/50"
                >
                  {SECURITY_EMAIL}
                </a>
                <CopyButton value={SECURITY_EMAIL} label="Copy email address" />
              </div>
              <p className="text-[13px] leading-[1.5] text-mute">Or use the form below; it writes the email for you.</p>
            </div>
          ) : (
          <div className="rise-in flex flex-col gap-3 [--delay:240ms] lg:w-[400px]">
            <p className="font-mono text-[12px] text-dim">Direct security contact</p>
            <div className="flex items-center gap-2.5 rounded-md border border-edge-3 py-1.5 pr-1.5 pl-3">
              <a
                href={DISCLOSURE_MAILTO}
                className="min-w-0 flex-1 truncate font-mono text-[13px] text-fg underline decoration-fg/0 underline-offset-[3px] transition-[text-decoration-color] hover:decoration-fg/50"
              >
                {SECURITY_EMAIL}
              </a>
              <CopyButton value={SECURITY_EMAIL} label="Copy email address" />
            </div>
          </div>
          )
        }
      />

      {/* Safe reporting: three rules, numbered, before anyone starts typing. */}
      {SKY ? (
        <section aria-labelledby="safe-title" className="py-24 sm:py-32">
          <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
            <Reveal>
              <h2 id="safe-title" className={SKY_H2}>
                Useful evidence, <span className="block text-mute">minimal risk.</span>
              </h2>
              <p className={`mt-4 max-w-[440px] ${SKY_LEDE}`}>
                Provide enough detail to reproduce the issue while minimizing exposure of live systems and sensitive
                information.
              </p>
            </Reveal>
            <Reveal delay={80} className="lg:pt-2">
              <NumberedList items={RULES.map((r) => ({ key: r.t, title: r.t, body: r.b }))} />
            </Reveal>
          </div>
        </section>
      ) : (
      <section aria-labelledby="safe-title" className="py-20 sm:py-24">
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <Reveal>
            <p className="flex items-center gap-2.5 font-mono text-[13px] text-dim">
              <span aria-hidden className="size-2 bg-lime" />
              Safe reporting
            </p>
            <h2
              id="safe-title"
              className="mt-5 text-[clamp(28px,3vw,36px)] leading-[1.08] font-medium tracking-[-0.03em] text-balance text-fg"
            >
              Useful evidence, <Soft>minimal risk.</Soft>
            </h2>
            <p className="mt-4 max-w-[380px] text-[15.5px] leading-[1.55] text-mute">
              Provide enough detail to reproduce the issue while minimizing exposure of live systems and sensitive
              information.
            </p>
          </Reveal>
          <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge sm:grid-cols-3">
            {RULES.map((r, i) => (
              <Reveal as="li" key={r.t} delay={i * 70} className="flex flex-col bg-bg p-5 sm:p-6">
                <span className="text-[32px] leading-none font-medium tracking-[-0.04em] text-graphite sm:text-[clamp(40px,4vw,56px)]">
                  0{i + 1}
                </span>
                <span className="mt-4 text-[17px] font-medium tracking-[-0.015em] text-fg sm:mt-8">{r.t}</span>
                <span className="mt-2 text-[14.5px] leading-[1.55] text-mute">{r.b}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
      )}

      {SKY ? (
        <DisclosureForm />
      ) : (
        <section aria-label="Disclosure form" className="border-t border-edge py-20 sm:py-24">
          <div className="wrap">
            <DisclosureForm />
          </div>
        </section>
      )}

      <section aria-labelledby="scope-title" className={SKY ? "py-24 sm:py-32" : "border-t border-edge py-20 sm:py-24"}>
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16">
          <Reveal>
            {SKY ? (
              <h2 id="scope-title" className={SKY_H2}>
                Scope <span className="block text-mute">and rewards.</span>
              </h2>
            ) : (
              <h2 id="scope-title" className="text-[24px] leading-[1.15] font-medium tracking-[-0.025em] text-fg">
                Scope and rewards
              </h2>
            )}
            <p className={SKY ? `mt-4 max-w-[520px] ${SKY_LEDE}` : "mt-4 max-w-[520px] text-[15.5px] leading-[1.6] text-mute"}>
              This channel supports coordinated reporting but does not promise a bounty, safe-harbor determination, or
              fixed response time. If the issue is urgent, mark the reporter-assessed severity and use the direct email
              above as well.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              <TextLink href="/security">What Pilot secures</TextLink>
              <TextLink href="/docs/security">Security documentation</TextLink>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <SecurityTxt />
          </Reveal>
        </div>
      </section>
    </>
  );
}
