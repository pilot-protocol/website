import { ArrowUpRightIcon } from "@/components/icons";
import { PilotMarkP } from "@/components/logo";
import { PageHeader } from "@/components/page/page-header";
import { FLAT_CARD, SKY, SKY_H2, SKY_PILL } from "@/components/pages/security/kit";
import { Button, Command, GhostButton, Reveal, SmartLink } from "@/components/ui";
import { Anatomy } from "./anatomy";
import { Catalogue } from "./catalogue";
import { clawhubUrl, SKILL_GROUPS, SKILL_TOTAL } from "./data";
import { CatalogueShape } from "./shape";

const CLAWHUB = clawhubUrl("pilot-protocol");
const REPO = "https://github.com/TeoSlayer/pilot-skills";

export function SkillsPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Agent skills" }]}
        title={
          <>
            82 agent skills. <span className="text-lime-ink">One command each.</span>
          </>
        }
        lede={
          <>
            Each skill teaches an agent to use <code className="font-mono text-[0.9em] text-fg">pilotctl</code> for one
            job: messaging, file transfer, trust, pub/sub, bridges, the service agents. All of them install from{" "}
            <a href={CLAWHUB} className="text-fg underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg">
              ClawHub
            </a>
            ; the list is built from{" "}
            <a href={REPO} className="text-fg underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg">
              TeoSlayer/pilot-skills
            </a>
            .
          </>
        }
        aside={<CatalogueShape />}
      >
        <div className="flex flex-wrap gap-2">
          <Button href={CLAWHUB}>
            Browse on ClawHub
            <ArrowUpRightIcon className="size-3" />
          </Button>
          <GhostButton href="/docs/getting-started">Install Pilot</GhostButton>
        </div>
      </PageHeader>

      {/* The one to start with. */}
      {SKY ? (
        <SkyCore />
      ) : (
      <section aria-labelledby="core-title" className="border-b border-edge">
        <div className="wrap grid grid-cols-1 gap-6 py-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-center lg:gap-16">
          <Reveal>
            <p className="font-mono text-[12px] text-dim">Start here · the main skill</p>
            <h2 id="core-title" className="mt-3 font-mono text-[24px] font-medium tracking-[-0.02em] text-fg">
              pilot-protocol
            </h2>
            <p className="mt-3 max-w-[620px] text-[15.5px] leading-[1.55] text-mute">
              Teaches an OpenClaw-compatible agent the <code className="font-mono text-[14px] text-fg">pilotctl</code>{" "}
              commands for its address, encrypted tunnels, trust handshakes, messaging and the service agents, with the
              steps to install Pilot itself.
            </p>
          </Reveal>
          <Reveal delay={80} className="flex flex-col gap-3">
            <Command value="clawhub install pilot-protocol" prefix="clawhub " className="w-full" label="Copy install command">
              install pilot-protocol
            </Command>
            <a href={CLAWHUB} className="group inline-flex w-fit items-center gap-1.5 text-[13px] text-soft hover:text-fg">
              View on ClawHub
              <ArrowUpRightIcon className="size-[10px] transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Reveal>
        </div>
      </section>
      )}

      {SKY ? (
        <section id="catalogue" aria-labelledby="catalogue-title" className="scroll-mt-20 py-20 sm:py-24 lg:py-[100px]">
          <div className="wrap">
            {/* As the service page's directory (Figma 218:22229): the heading on the left, a short note on the right. */}
            <Reveal className="mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
              <h2 id="catalogue-title" className={SKY_H2}>
                The whole catalogue.
                <span className="block text-mute">
                  {SKILL_TOTAL} skills in {SKILL_GROUPS.length} groups.
                </span>
              </h2>
              <p className="max-w-[360px] text-[15px] leading-[1.5] text-pretty text-mute lg:pb-1.5">
                Pick a skill to read it and copy its install command, or search by what you need done. Skills that describe
                features Pilot doesn’t have are left out.
              </p>
            </Reveal>
            <Catalogue />
          </div>
        </section>
      ) : (
      <section aria-labelledby="catalogue-title" className="py-20 sm:py-28">
        <div className="wrap">
          <Reveal className="mb-10 sm:mb-12">
            <h2 id="catalogue-title" className="text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-fg">
              The whole catalogue.
            </h2>
            <p className="mt-4 max-w-[560px] text-[16px] leading-[1.5] text-mute">
              Pick a skill to read it and copy its install command, or search by what you need done.
            </p>
          </Reveal>
          <Catalogue />
        </div>
      </section>
      )}

      <Anatomy />

      {SKY ? (
        <SkyInstall />
      ) : (
      <section aria-labelledby="install-title" className="relative overflow-hidden bg-lime text-ink">
        <div className="wrap grid grid-cols-1 gap-10 py-20 sm:py-24 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <Reveal>
            <h2 id="install-title" className="text-[clamp(40px,6vw,84px)] leading-[0.95] font-medium tracking-[-0.045em]">
              Install any skill
              <br />
              in one command.
            </h2>
          </Reveal>
          <Reveal delay={80} className="flex flex-col gap-5 lg:items-end">
            <p className="font-mono text-[14px] tracking-[-0.01em]">
              clawhub install <span className="rounded-md bg-ink px-1.5 py-0.5 text-lime">&lt;skill&gt;</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={CLAWHUB}
                className="pressable inline-flex h-11 items-center gap-2.5 rounded-[10px] bg-ink px-4 text-[14px] font-medium text-paper hover:bg-ink/85"
              >
                View on ClawHub
                <ArrowUpRightIcon className="size-3" />
              </a>
              <SmartLink
                href="/docs/getting-started"
                className="pressable inline-flex h-11 items-center gap-2.5 rounded-[10px] border border-ink/30 px-4 text-[14px] font-medium hover:border-ink/70 hover:bg-ink/5"
              >
                Getting started
              </SmartLink>
            </div>
          </Reveal>
        </div>
      </section>
      )}
    </>
  );
}

/** Sky site: the main skill as one flat bordered card, the P beside it. */
function SkyCore() {
  return (
    <section aria-labelledby="core-title" className="pt-2 sm:pt-4">
      <div className="wrap">
        <Reveal
          className={`${FLAT_CARD} grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center lg:gap-16 lg:p-8`}
        >
          <div className="flex gap-4 sm:gap-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-[11px] bg-(--sky-fill) text-white">
              <PilotMarkP className="h-[20px] w-auto" />
            </span>
            <div className="min-w-0">
              <p className={SKY_PILL}>Start here</p>
              <h2 id="core-title" className="mt-2.5 font-mono text-[22px] leading-[1.25] font-medium tracking-[-0.02em] text-fg">
                pilot-protocol
              </h2>
              <p className="mt-2.5 max-w-[620px] text-[15px] leading-[1.55] text-mute">
                The main skill. Teaches an OpenClaw-compatible agent the{" "}
                <code className="font-mono text-[13.5px] text-fg">pilotctl</code> commands for its address, encrypted tunnels,
                trust handshakes, messaging and the service agents, with the steps to install Pilot itself.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Command value="clawhub install pilot-protocol" prefix="clawhub " className="w-full" label="Copy install command">
              install pilot-protocol
            </Command>
            <a href={CLAWHUB} className="group inline-flex w-fit items-center gap-1.5 text-[13px] text-mute hover:text-fg">
              View on ClawHub
              <ArrowUpRightIcon className="size-[10px] transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Sky site: the close, on the page itself (the footer starts in deep blue right under it). */
function SkyInstall() {
  return (
    <section aria-labelledby="install-title" className="py-24 sm:py-32">
      <div className="wrap flex flex-col items-center text-center">
        <Reveal>
          <h2 id="install-title" className={SKY_H2}>
            Install any skill
            <span className="block text-mute">in one command.</span>
          </h2>
        </Reveal>
        <Reveal delay={80} className="mt-8 flex flex-col items-center gap-6">
          <p className="font-mono text-[14px] tracking-[-0.01em] text-fg">
            clawhub install <span className="rounded-md bg-(--sky-tint) px-1.5 py-0.5 text-(--sky-accent)">&lt;skill&gt;</span>
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button href={CLAWHUB}>
              View on ClawHub
              <ArrowUpRightIcon className="size-3" />
            </Button>
            <GhostButton href="/docs/getting-started">Getting started</GhostButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
