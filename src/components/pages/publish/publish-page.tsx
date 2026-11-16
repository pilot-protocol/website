import type { ReactNode } from "react";
import { NetworkCanvas } from "@/components/hero/network-canvas";
import { PilotMarkP } from "@/components/logo";
import { Tile, type IconName } from "@/components/pages/compatibility/marks";
import { Breadcrumbs, PageHeader } from "@/components/page/page-header";
import { CodePanel, NumberedList, SKY_H2, SKY_LEDE } from "@/components/pages/security/kit";
import { HatchPanel, SkyRule } from "@/components/sky/kit";
import { Button, GhostButton, Reveal, TextLink } from "@/components/ui";
import { LINKS, SITE_VARIANT } from "@/lib/site";
import { Pipeline } from "./pipeline";
import { PublishForm } from "./publish-form";

/*
 * The sky site (flight design) reads the variant here: this is a server component, and constants exported from
 * client modules arrive as client references, not values.
 */
const SKY = SITE_VARIANT === "sky";
const Q = SKY ? "text-mute" : "text-dim";

const H2 = "text-[clamp(30px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg";
const B = ({ children }: { children: ReactNode }) => <span className="text-fg">{children}</span>;
const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} className="text-soft underline decoration-fg/25 underline-offset-2 transition-[text-decoration-color] hover:decoration-fg">
    {children}
  </a>
);

const YOU: ReactNode[] = [
  <>
    <B>A valid email.</B> We use it to reach you about your submission.
  </>,
  <>
    <B>A description of your app’s methods.</B> You don’t upload any code.
  </>,
  <>
    <B>Your signature on a short release.</B> You confirm you have the right to publish the app, let us use your name and the
    app’s name to list it, and agree to the <A href="/terms">Terms</A>, <A href="/aup">Acceptable Use Policy</A> and{" "}
    <A href="/publisher-agreement">Publisher Release Agreement</A>.
  </>,
];

const US: ReactNode[] = [
  <>
    <B>The adapter.</B> We generate it, sign it and verify it for you.
  </>,
  <>
    <B>Your keys stay yours.</B> Secrets are never collected here; operators supply them at install time.
  </>,
  <>
    <B>A review.</B> Every submission is reviewed by our team before it appears in the store.
  </>,
  <>
    <B>Updates by email.</B> A confirmation when you submit, and again when your app is approved or needs changes.
  </>,
];

// The app-template route, from the App Store docs.
const CLI: { note: string; cmds: string[] }[] = [
  {
    note: "Install the scaffolder and describe your API",
    cmds: ["go install github.com/pilot-protocol/app-template/cmd/pilot-app@latest", "pilot-app example > pilot.app.yaml", "pilot-app validate"],
  },
  {
    note: "Generate the adapter, then build, pin, sign and package it",
    cmds: ["pilot-app init -o ./my-app", "cd my-app", "make gen-key", "make package", "pilot-app verify io.pilot.<id>-<ver>.tar.gz"],
  },
  { note: "Prepare the submission in your fork of app-template", cmds: ["pilot-app submit -C . --prepare /path/to/app-template-fork"] },
];

/** Sky: the two halves of the work as two flat cards on the hatched showcase panel, the second one Pilot's. */
function Halves() {
  const card = (title: string, icon: ReactNode, items: ReactNode[], icons: IconName[]) => (
    <div className="sky-card flex flex-col p-6 sm:p-8">
      <div className="flex items-center gap-3.5">
        {icon}
        <h3 className="text-[17px] leading-6 font-medium tracking-[-0.03em] text-fg">{title}</h3>
      </div>
      <ul className="mt-6 flex flex-col">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3.5 border-t border-(--sky-card-line) py-4 text-[15px] leading-[1.55] text-mute">
            <Tile icon={icons[i]} size="sm" accent className="-mt-px" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <Reveal delay={80} className="mt-12 sm:mt-16">
      <HatchPanel className="grid grid-cols-1 gap-3 p-3 sm:gap-4 sm:p-8 md:grid-cols-2 lg:p-12">
        {card(
          "What you bring",
          <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-fg text-bg">
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.5 2.5l3 3-7.75 7.75H2.75v-3L10.5 2.5zM9 4l3 3" />
            </svg>
          </span>,
          YOU,
          ["mail", "list", "pen"],
        )}
        {card(
          "What we handle",
          <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-(--sky-fill) text-white shadow-tile">
            <PilotMarkP className="h-[44%] w-auto" />
          </span>,
          US,
          ["package", "key", "eye", "mail"],
        )}
      </HatchPanel>
    </Reveal>
  );
}

/** Sky: one half of a split section (Figma 211:13852): the hatched side, with the divider and the outer edge. */
const HATCH_HALF =
  "sky-hatch-bg sky-frame relative -mx-5 min-w-0 border-t px-5 py-10 sm:-mx-6 sm:px-10 sm:py-14 lg:mx-0 lg:border-t-0 lg:border-x lg:px-12 lg:py-16";

const PR_STEPS = [
  "Commit submissions/<id>/ in your fork and open a pull request.",
  "CI verifies the bundle and a maintainer reviews it.",
  "On merge, the bundle is released into the signed catalogue, and install works everywhere.",
];

const CLI_CODE = CLI.map((g, i) => [`# ${i + 1}. ${g.note}`, ...g.cmds.map((c) => `$ ${c}`)].join("\n")).join("\n\n");

export function PublishPage() {
  return (
    <>
      {SKY ? (
        <PageHeader
          crumbs={[{ label: "Home", href: "/" }, { label: "App Store", href: LINKS.appStore }, { label: "Publish" }]}
          title={
            <>
              Publish an app. <span className="block text-mute">Agents do the rest.</span>
            </>
          }
          lede="Bring your existing app. Describe it once and we generate, sign and verify an agent-first adapter for it. Then our team reviews it onto the Pilot App Store, one command for any agent to install."
          aside={
            <Reveal delay={150} className="w-full lg:w-[460px] xl:w-[520px]">
              <Pipeline />
            </Reveal>
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button href="#submit">Publish your app now</Button>
            <GhostButton href="#cli">Use the command line</GhostButton>
          </div>
        </PageHeader>
      ) : (
      <header className="relative overflow-hidden border-b border-edge">
        <div aria-hidden className="absolute inset-x-0 top-6 h-[132px]">
          <NetworkCanvas lineAlpha={0.13} />
        </div>
        <div className="wrap relative grid grid-cols-1 gap-14 pt-[184px] pb-16 sm:pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-end lg:gap-16">
          <div className="max-w-[640px]">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "App Store", href: LINKS.appStore }, { label: "Publish" }]} />
            <h1 className="mt-5 text-[clamp(40px,5.6vw,72px)] leading-[1.02] font-medium tracking-[-0.035em] text-balance text-fg">
              Publish an app. <span className="block text-lime-ink">Agents do the rest.</span>
            </h1>
            <p className="mt-6 text-[17px] leading-[1.55] text-mute sm:text-[18px]">
              Bring your existing app. Describe it once and we generate, sign and verify an agent-first adapter for it. Then our
              team reviews it onto the Pilot App Store, one command for any agent to install.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Button href="#submit">Publish your app now</Button>
              <GhostButton href="#cli">Use the command line</GhostButton>
            </div>
          </div>
          <Reveal delay={150}>
            <Pipeline />
          </Reveal>
        </div>
      </header>
      )}

      {/* ---------------- Who does what ---------------- */}
      <section aria-labelledby="split-title" className="py-24 sm:py-32">
        <div className="wrap">
          <Reveal className={SKY ? "mx-auto max-w-[640px] text-center" : "max-w-[640px]"}>
            <h2 id="split-title" className={SKY ? SKY_H2 : H2}>
              You describe it. <span className={SKY ? "block text-mute" : "text-dim"}>We do the packaging.</span>
            </h2>
          </Reveal>
          {SKY ? (
            <Halves />
          ) : (
          <Reveal delay={80} className="mt-12 grid grid-cols-1 overflow-hidden rounded-[16px] border border-edge sm:mt-16 md:grid-cols-2">
            {(
              [
                ["What you bring", YOU],
                ["What we handle", US],
              ] as const
            ).map(([title, items], col) => (
              <div key={title} className={`p-6 sm:p-8 ${col ? "border-t border-edge bg-bg-deep md:border-t-0 md:border-l" : ""}`}>
                <p className="flex items-center gap-2.5 font-mono text-[12px] text-dim">
                  <span aria-hidden className={`size-2 ${col ? "bg-lime" : "border border-fg/50"}`} />
                  {title}
                </p>
                <ul className="mt-5 flex flex-col">
                  {items.map((it, i) => (
                    <li key={i} className="border-t border-edge py-4 text-[15px] leading-[1.55] text-mute">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Reveal>
          )}
        </div>
      </section>

      {/* ---------------- The form and the CLI route ---------------- */}
      {SKY ? (
        // Sky: two split sections stacked as on the home page's Cloud section (Figma 211:13852), text on paper and the
        // form, then the commands, on the hatching. They share the hairline between them.
        <div className="wrap">
          <SkyRule />
          <section id="submit" aria-labelledby="submit-title" className="scroll-mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="py-14 sm:py-20 lg:py-[100px] lg:pr-16">
                <Reveal className="lg:sticky lg:top-28">
                  <h2 id="submit-title" className={SKY_H2}>
                    Start your <span className="block text-mute">submission.</span>
                  </h2>
                  <p className={`mt-4 max-w-[380px] ${SKY_LEDE}`}>
                    Seven short steps. The live preview shows the <code className="font-mono text-[0.86em] text-fg">help</code> agents
                    will read and the commands they’ll run.
                  </p>
                  <p className="mt-6 max-w-[380px] text-[14.5px] leading-[1.55] text-mute">
                    Your draft stays in this browser until you submit. Questions first? Read the{" "}
                    <A href="/docs/app-store#publishing">publishing docs</A>.
                  </p>
                </Reveal>
              </div>
              <div className={`${HATCH_HALF} lg:py-[100px]`}>
                <Reveal delay={80} className="min-w-0">
                  <PublishForm />
                </Reveal>
              </div>
            </div>
          </section>
          <SkyRule />
          <section id="cli" aria-labelledby="cli-title" className="scroll-mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="flex flex-col justify-center py-14 sm:py-20 lg:py-[100px] lg:pr-16">
                <Reveal>
                  <h2 id="cli-title" className={SKY_H2}>
                    Prefer the <span className="block text-mute">command line?</span>
                  </h2>
                  <p className={`mt-4 max-w-[480px] ${SKY_LEDE}`}>
                    The form runs the same pipeline on Pilot’s server. To run it on your machine instead, use{" "}
                    <code className="font-mono text-[0.86em] text-fg">pilot-app</code> from{" "}
                    <a href="https://github.com/pilot-protocol/app-template" className="text-fg underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg">
                      pilot-protocol/app-template
                    </a>
                    , then open a pull request.
                  </p>
                  <NumberedList className="mt-10" items={PR_STEPS.map((t) => ({ key: t, title: t }))} />
                  <div className="mt-8">
                    <TextLink href="/docs/app-store#publishing">Publishing docs</TextLink>
                  </div>
                </Reveal>
              </div>
              <div className={`${HATCH_HALF} flex items-center`}>
                <Reveal delay={100} className="w-full min-w-0">
                  <CodePanel title="your machine · pilot-app" code={CLI_CODE} />
                </Reveal>
              </div>
            </div>
          </section>
          <SkyRule />
        </div>
      ) : (
        <>
        {/* ---------------- The form ---------------- */}
        <section id="submit" aria-labelledby="submit-title" className="scroll-mt-16 border-t border-edge py-24 sm:py-32">
          <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <h2 id="submit-title" className={H2}>
                Start your <span className={Q}>submission.</span>
              </h2>
              <p className="mt-5 max-w-[380px] text-[16px] leading-[1.55] text-mute">
                Seven short steps. The live preview shows the <code className="font-mono text-[14.5px] text-soft">help</code> agents
                will read and the commands they’ll run.
              </p>
              <p className="mt-6 max-w-[380px] text-[14px] leading-[1.55] text-dim">
                Your draft stays in this browser until you submit. Questions first? Read the <A href="/docs/app-store#publishing">publishing docs</A>.
              </p>
            </Reveal>
            <Reveal delay={80} className="min-w-0">
              <PublishForm />
            </Reveal>
          </div>
        </section>

        {/* ---------------- CLI route ---------------- */}
        <section id="cli" aria-labelledby="cli-title" className="pp-invert scroll-mt-16 py-24 sm:py-32">
          <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <Reveal>
              <h2 id="cli-title" className={H2}>
                Prefer the <span className={Q}>command line?</span>
              </h2>
              <p className="mt-5 max-w-[460px] text-[16px] leading-[1.55] text-mute sm:text-[17px]">
                The form runs the same pipeline on Pilot’s server. To run it on your machine instead, use{" "}
                <code className="font-mono text-[14.5px] text-soft">pilot-app</code> from{" "}
                <a href="https://github.com/pilot-protocol/app-template" className="text-fg underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg">
                  pilot-protocol/app-template
                </a>
                , then open a pull request.
              </p>
              <ol className="mt-8 flex flex-col border-t border-edge text-[15px] leading-[1.55] text-mute">
                {PR_STEPS.map(
                  (t, i) => (
                    <li key={t} className="grid grid-cols-[28px_minmax(0,1fr)] border-b border-edge py-3.5">
                      <span className="font-mono text-[12px] text-dim">{i + 1}</span>
                      <span>{t}</span>
                    </li>
                  ),
                )}
              </ol>
              <div className="mt-8">
                <TextLink href="/docs/app-store#publishing">Publishing docs</TextLink>
              </div>
            </Reveal>
            <Reveal delay={100} className="min-w-0">
              <div className="pp-island">
                <p className="flex h-10 items-center border-b border-edge px-4 font-mono text-[11.5px] text-dim">your machine · pilot-app</p>
                <pre className="no-scrollbar overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.75] text-soft">
                  {CLI.map((g, i) => (
                    <div key={g.note} className={i ? "mt-4" : ""}>
                      <div className="text-dim">
                        # {i + 1}. {g.note}
                      </div>
                      {g.cmds.map((c) => (
                        <div key={c} className="whitespace-pre">
                          <span className="text-lime select-none">$ </span>
                          {c}
                        </div>
                      ))}
                    </div>
                  ))}
                </pre>
              </div>
            </Reveal>
          </div>
        </section>
        </>
      )}
    </>
  );
}
