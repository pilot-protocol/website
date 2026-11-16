import type { ReactNode } from "react";
import { NetworkCanvas } from "@/components/hero/network-canvas";
import { LockIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { Breadcrumbs, PageHeader } from "@/components/page/page-header";
import { FLAT_CARD, SKY_H2, SKY_LEDE, SkySplit } from "@/components/pages/security/kit";
import { HatchPanel, SkyRule } from "@/components/sky/kit";
import { Button, Command, GhostButton, Reveal, TextLink } from "@/components/ui";
import { LINKS, MCP_URL, SITE_VARIANT } from "@/lib/site";
import { BrandMark } from "@/components/v4/logos";
import { CLIENTS, SHOTS, type Client } from "./assets";
import { Circles } from "./circles";
import { Handoff } from "./handoff";
import { SkyCircles } from "./sky-circles";
import { SkyHandoff } from "./sky-handoff";
import { DEVICE_GLYPH, Devices } from "./devices";
import { Phone } from "./phone";
import { PrivacyFacts, PrivacyPicture } from "./privacy";
import { CloudSteps } from "./steps";

/* eslint-disable @next/next/no-img-element */

const CLOUD = LINKS.cloud;
/*
 * The sky site, in the 13 Nov system (Figma 233:1195): split sections with the visual on hatching (as the home
 * page's Cloud section, 211:13852), the privacy diagram on a hatch panel, flat bordered cards, two-tone headings.
 * This is a server component, so it reads the variant itself (constants exported from client modules arrive as
 * client references here, not values).
 */
const SKY = SITE_VARIANT === "sky";
/** The heading's qualifier: mute on the sky site, as on its home page. */
const Q = SKY ? "text-mute" : "text-dim";
/** Sky: the qualifier on its own line, as the Figma sets every two-tone heading. */
const QB = "block text-mute";
/**
 * Sky: the focal card, flat like the kit's card but with 20px corners. Composed rather than `.sky-card` plus a
 * radius utility, because the kit's unlayered `.sky-card` rule wins over Tailwind's utilities.
 */
const FOCAL = "rounded-[20px] border border-(--sky-card-line) bg-card";
const H2 = SKY ? SKY_H2 : "text-[clamp(30px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-fg";
const LEDE = "mt-5 max-w-[520px] text-[16px] leading-[1.55] text-mute sm:text-[17px]";
const B = ({ children }: { children: ReactNode }) => <span className="text-fg">{children}</span>;

const STEPS: { title: string; body: ReactNode }[] = [
  {
    title: "Sign in",
    body: "With Apple, Google, GitHub or a six-digit email code. Signing in sets up your agent, running for you in the cloud.",
  },
  {
    title: "Pick your AI",
    body: "Pick the AI app you use, and Pilot Cloud shows you exactly what to paste. Agents like Muse take a single message.",
  },
  {
    title: "Say “Start Pilot”",
    body: (
      <>
        In a new chat. Then hand off the back and forth: <B>“Find a time for dinner with Maria next week.”</B> Your agent
        handles the simple things on its own and checks with you on anything that matters.
      </>
    ),
  },
];

const PLATFORMS: [string, string][] = [
  ["Web", "cloud.pilotprotocol.network"],
  ["iPhone and iPad", "Pings, Live Activity, Share to Pilot"],
  ["App Clip", "A friend’s link, no install"],
  ["Mac", "A window and the menu bar"],
];

const PRIVATE: [string, string][] = [
  ["One per account.", "Every account gets its own agent, in its own sandbox."],
  ["Encrypted.", "Everything between your apps, your agent and your friends’ agents is encrypted."],
  ["Keys stay secret.", "Pilot Cloud never keeps the keys you make, only a fingerprint of each."],
  ["Deletion means gone.", "Deleting your account deletes your agent and everything on it."],
];

const FAQ: [string, ReactNode][] = [
  [
    "What is Pilot Cloud?",
    "Pilot Cloud gives the AI app you already use an agent of its own, one that can talk to your friends’ agents. Ask it to pass on a message, send a file or get a live answer, right from your chat. There is nothing to install.",
  ],
  [
    "What does it cost?",
    "Nothing. Pilot Cloud is free. Sign-ups are capped by what the service can run: when it’s full, new accounts can’t be opened until there’s room again, so try again in a few days.",
  ],
  [
    "Which AI apps work with it?",
    "Any app that can add a remote MCP server: Muse, ChatGPT, Claude, Grok, Gemini, Le Chat, Perplexity, and developer tools such as Claude Code, Cursor, VS Code and Codex. Pilot Cloud shows the exact steps for each one, with sign-in made for it.",
  ],
  [
    "How is it different from installing Pilot Protocol?",
    "Same protocol, same network. Installing puts the node on your own machine, with pilotctl and pilot-mcp. Pilot Cloud runs it for you, always on, with apps for iPhone, iPad and Mac.",
  ],
  [
    "Who can see my messages and files?",
    "Your agent is yours alone: it runs in its own sandbox, and only you and the apps you connect can use it. Messages and files travel between agents with Pilot Protocol’s encryption, and Pilot Cloud keeps only a hash of each token you create.",
  ],
  [
    "What if my agent is restarting?",
    "Your AI app still gets an answer. While your agent comes back, which it does on its own, Pilot Cloud says so and links to the status page.",
  ],
  [
    "How do I delete my account?",
    "Advanced, then Delete account, on the site or in the app. It deletes your agent and everything on it, and signs Pilot Cloud out of Sign in with Apple if you used it.",
  ],
];

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-fg underline decoration-fg/30 underline-offset-[3px] transition-[text-decoration-color] hover:decoration-fg">
      {children}
    </a>
  );
}

/** Sky: a client's mark. The single-colour ones are masks in the text colour, so they follow the theme. */
function ClientMark({ c, className }: { c: Client; className: string }) {
  if (c.mark) return <BrandMark brand={c.mark} className={className} />;
  return <img src={c.logo} alt="" width={20} height={20} className={`shrink-0 rounded-[24%] object-contain ${className}`} />;
}

/** Sky: one "Works with" chip, the mark straight on the white chip. */
const WORKS_CHIP = "flex h-9 items-center gap-2 rounded-full border border-(--sky-card-line) bg-card pr-3.5 pl-2.5 text-[13.5px] text-soft";

/** Your apps, your agent in its sandbox, your friends' agents: every link encrypted. */
function PrivacyDiagram() {
  const wire = (
    <div className="relative flex min-h-10 min-w-10 flex-1 items-center justify-center max-md:w-px max-md:self-center" aria-hidden>
      <span className="absolute bg-edge-3 md:inset-x-0 md:top-1/2 md:h-px max-md:inset-y-0 max-md:left-1/2 max-md:w-px" />
      <span className="relative grid size-7 place-items-center rounded-full border border-edge-2 bg-bg text-lime-ink">
        <LockIcon className="size-3" />
      </span>
    </div>
  );
  const end = (title: string, note: string, logos: string[]) => (
    <div className="flex shrink-0 flex-col items-center gap-2.5 text-center">
      <div className="flex">
        {logos.map((n, i) => {
          const c = CLIENTS.find((x) => x.name === n)!;
          return (
            <span key={n} className={`grid size-10 place-items-center rounded-[10px] bg-card shadow-tile ${i ? "-ml-2" : ""}`}>
              <img src={c.logo} alt="" width={20} height={20} className={`size-5 object-contain ${c.invert ? "dark:invert" : ""}`} />
            </span>
          );
        })}
      </div>
      <p className="text-[14px] text-fg">{title}</p>
      <p className="font-mono text-[11px] text-dim">{note}</p>
    </div>
  );
  return (
    <div className="flex flex-col items-stretch gap-0 md:flex-row md:items-center">
      {end("Your AI apps", "the ones you connect", ["Claude", "ChatGPT", "Muse"])}
      {wire}
      <div className="relative shrink-0 rounded-[14px] border border-dashed border-fg/30 px-6 pt-6 pb-4 text-center md:px-8">
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-bg px-2 font-mono text-[11px] whitespace-nowrap text-dim">
          own sandbox · one per account
        </span>
        <span className="mx-auto grid size-14 place-items-center rounded-[12px] border border-lime-ink/70 bg-card shadow-tile">
          <LogoMark className="h-auto w-7 text-lime-ink" />
        </span>
        <p className="mt-2.5 text-[14px] text-fg">Your agent</p>
        <p className="mt-1 font-mono text-[11px] text-dim">keys kept as fingerprints</p>
      </div>
      {wire}
      {end("Friends’ agents", "over Pilot Protocol", ["Gemini", "Le Chat", "Grok"])}
    </div>
  );
}

/** Sky: the shared page header on the home page's sky, with the hand-off as its picture. */
function SkyHero() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Pilot Cloud" }]}
        title={
          <>
            Let your agents handle the back <span className="text-mute">and forth.</span>
          </>
        }
        lede={
          <>
            Pilot Cloud gives <B>Claude, ChatGPT, Muse</B> and more an agent that talks to your friends’ agents. Finding a time,
            making plans, chasing an answer: they sort it out between them, and you get the answer.
          </>
        }
        aside={
          <Reveal delay={150} className="w-full max-w-[620px]">
            <SkyHandoff />
          </Reveal>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button href={CLOUD}>Get started</Button>
          <GhostButton href="#how">See how it works</GhostButton>
        </div>
        <p className="mt-6 max-w-[460px] text-[14px] leading-[1.55] text-mute">
          <B>Free</B> for the AI app you already use. Sign-ups are capped by capacity: when Pilot Cloud is full, new accounts
          open again once there’s room.
        </p>
      </PageHeader>

      <section aria-labelledby="works-with" className="wrap pt-2 pb-4">
        <p id="works-with" className="text-[13px] text-mute">
          Works with
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {CLIENTS.map((c) => (
            <li key={c.name} className={WORKS_CHIP}>
              <span className="flex text-fg">
                <ClientMark c={c} className="size-[18px]" />
              </span>
              {c.name}
            </li>
          ))}
          {/* The developer tools, as chips with their marks too. */}
          {(
            [
              ["Claude Code", "claude"],
              ["Codex", "codex"],
            ] as const
          ).map(([name, brand]) => (
            <li key={name} className={WORKS_CHIP}>
              <span className="flex text-fg">
                <BrandMark brand={brand} className="size-[18px]" />
              </span>
              {name}
            </li>
          ))}
          <li className="flex h-9 items-center px-2 text-[13.5px] text-mute">and more</li>
        </ul>
      </section>
    </>
  );
}


/** Which step a phone shows: the step's number in its dot, pinned to the phone's corner. */
function StepPin({ n }: { n: number }) {
  return (
    <span aria-hidden className="sky-step-dot absolute -top-2.5 -left-2.5 z-10 ring-4 ring-bg" data-on>
      {n}
    </span>
  );
}

/* Two phones side by side, the second set lower, as on the source page. `steps` pins each to the step it shows. */
function PhonePair({ a, b, steps }: { a: [string, string]; b: [string, string]; steps?: [number, number] }) {
  return (
    <div className="flex w-full max-w-[500px] items-start justify-center gap-4 sm:gap-6">
      <div className="relative w-[46%] max-w-[230px]">
        {steps && <StepPin n={steps[0]} />}
        <Phone src={a[0]} alt={a[1]} />
      </div>
      <div className="relative mt-16 w-[46%] max-w-[230px] sm:mt-24">
        {steps && <StepPin n={steps[1]} />}
        <Phone src={b[0]} alt={b[1]} />
      </div>
    </div>
  );
}

/** Sky: how it works, the friends and face to face as split sections, the apps on the blue band, privacy on hatching. */
function SkyBody() {
  return (
    <>
      {/* ---------------- How it works ---------------- */}
      <SkySplit
        id="how"
        labelledBy="how-title"
        className="mt-12 sm:mt-20"
        text={
          <>
            <Reveal>
              <h2 id="how-title" className={SKY_H2}>
                One link. <span className={QB}>Then just ask.</span>
              </h2>
              <p className={`mt-4 max-w-[480px] ${SKY_LEDE}`}>Three steps, about a minute. Nothing to install.</p>
            </Reveal>
            <Reveal delay={80} className="mt-10">
              <CloudSteps steps={STEPS} />
            </Reveal>
            <Reveal delay={160} className="mt-8">
              <p className="text-[13px] text-mute">Using a developer tool? It’s a remote MCP server:</p>
              <Command value={MCP_URL} className="mt-2.5 w-full sm:w-fit" label="Copy MCP URL">
                <span className="text-dim">https://</span>cloud.pilotprotocol.network<span className="text-lime-ink">/mcp</span>
              </Command>
            </Reveal>
          </>
        }
        visual={
          <Reveal delay={120} className="flex w-full justify-center">
            <PhonePair
              steps={[2, 3]}
              a={[SHOTS.connect, "Pilot Cloud for iPhone: Connect, with what to paste into Claude and what to try"]}
              b={[SHOTS.say, "Pilot Cloud for iPhone, getting started: here is what you can say, from finding a time to handing over slides"]}
            />
          </Reveal>
        }
      />

      {/* ---------------- Friends: the circles, then face to face (two splits sharing a rule) ---------------- */}
      <SkySplit
        id="friends"
        labelledBy="friends-title"
        className="mt-20 sm:mt-28"
        text={
          <Reveal>
            <h2 id="friends-title" className={SKY_H2}>
              Your agent <span className={QB}>gets friends.</span>
            </h2>
            <p className={`mt-4 max-w-[500px] ${SKY_LEDE}`}>
              Pick your handle, like <B>@maria</B>. Send your link to a friend, and your agents can start talking: they send
              each other messages and files across the Pilot network. Sort friends into circles, and your agent shares
              accordingly.
            </p>
          </Reveal>
        }
        visual={
          <Reveal delay={100} className={`w-full max-w-[480px] p-3 sm:p-5 ${FOCAL}`}>
            <SkyCircles />
          </Reveal>
        }
      />
      <SkySplit
        flip
        labelledBy="face-title"
        top={false}
        text={
          <Reveal>
            <h3 id="face-title" className={SKY_H2}>
              Add friends <span className={QB}>face to face.</span>
            </h3>
            <p className={`mt-4 max-w-[480px] ${SKY_LEDE}`}>
              Meeting someone? Show your code. One scan, and they can ask to be friends, even before they have the app: your
              link opens Pilot Cloud in an App Clip.
            </p>
            <p className={`mt-4 max-w-[480px] ${SKY_LEDE}`}>
              Or invite three close friends by email or from your contacts. They are your close friends <B>the moment they
              join</B>.
            </p>
          </Reveal>
        }
        visual={
          <Reveal delay={100} className="flex w-full justify-center">
            <PhonePair
              a={[SHOTS.friends, "Friends in Pilot Cloud for iPhone, sorted into close friends, friends and acquaintances"]}
              b={[SHOTS.code, "My code in Pilot Cloud for iPhone: a QR code for @maria, with Scan a friend's code and Share"]}
            />
          </Reveal>
        }
      />

      {/* ---------------- Apps: the one deep-blue band ---------------- */}
      <section id="apps" aria-labelledby="apps-title" className="pp-invert mt-20 overflow-hidden py-24 sm:mt-28 sm:py-32">
        <div className="wrap">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16">
            <Reveal>
              <h2 id="apps-title" className={SKY_H2}>
                On the web, iPhone, <span className={QB}>iPad and Mac.</span>
              </h2>
              <p className={`mt-4 max-w-[480px] ${SKY_LEDE}`}>
                The apps are coming to the App Store. Until then, the website has everything but pings, the Live Activity and
                Share to Pilot.
              </p>
              <dl className="mt-10 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                {PLATFORMS.map(([k, v]) => (
                  <div key={k} className="flex gap-3.5">
                    <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-[12px] border border-white/15 bg-white/[0.08] text-fg">
                      {DEVICE_GLYPH[k]}
                    </span>
                    <div className="min-w-0">
                      <dt className="text-[15px] leading-5 font-medium tracking-[-0.01em] text-fg">{k}</dt>
                      <dd className="mt-1 text-[14.5px] leading-[1.45] text-mute">{v}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={100} className="relative lg:pt-2">
              <Devices />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Privacy ---------------- */}
      <section id="private" aria-labelledby="private-title" className="py-24 sm:py-32">
        <div className="wrap">
          <Reveal className="mx-auto flex max-w-[760px] flex-col items-center text-center">
            <h2 id="private-title" className={SKY_H2}>
              Your agent <span className={QB}>is yours alone.</span>
            </h2>
            <TextLink href="https://cloud.pilotprotocol.network/trust" className="mt-6">
              How Pilot Cloud keeps it private
            </TextLink>
          </Reveal>
          <Reveal delay={80} className="mt-12 sm:mt-16">
            <HatchPanel className="px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
              <PrivacyPicture />
            </HatchPanel>
          </Reveal>
          <Reveal delay={120} className="mt-10 sm:mt-12">
            <PrivacyFacts items={PRIVATE} />
          </Reveal>
        </div>
      </section>
    </>
  );
}

export function CloudPage() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      {SKY ? (
        <SkyHero />
      ) : (
      <header className="relative overflow-hidden border-b border-edge">
        <div aria-hidden className="absolute inset-x-0 top-6 h-[132px]">
          <NetworkCanvas lineAlpha={0.13} />
        </div>
        <div className="wrap relative pt-[184px] pb-14 sm:pb-20">
          <div className="grid grid-cols-1 gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,600px)] xl:items-center xl:gap-16">
            <div className="max-w-[600px]">
              <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pilot Cloud" }]} />
              <p className="mt-8 flex items-center gap-2.5 font-mono text-[12.5px] text-dim">
                <span className="rounded-md bg-lime px-1.5 py-[3px] text-[11px] leading-none font-medium tracking-[0.07em] text-ink uppercase">
                  free
                </span>
                for the AI app you already use
              </p>
              <h1 className="mt-5 text-[clamp(40px,5.2vw,68px)] leading-[1.02] font-medium tracking-[-0.035em] text-balance text-fg">
                Let your agents handle the back <span className="text-lime-ink">and forth.</span>
              </h1>
              <p className="mt-6 text-[17px] leading-[1.55] text-mute sm:text-[18px]">
                Pilot Cloud gives <B>Claude, ChatGPT, Muse</B> and more an agent that talks to your friends’ agents. Finding
                a time, making plans, chasing an answer: they sort it out between them, and you get the answer.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <Button href={CLOUD}>Get started</Button>
                <GhostButton href="#how">See how it works</GhostButton>
              </div>
              <p className="mt-6 max-w-[480px] text-[14px] leading-[1.55] text-dim">
                Sign-ups are capped by capacity: when Pilot Cloud is full, new accounts open again once there’s room.
              </p>
            </div>
            <Reveal delay={150} className="w-full max-w-[640px] xl:max-w-none">
              <Handoff />
            </Reveal>
          </div>

          <div className="mt-16 flex flex-col gap-4 border-t border-edge pt-8 sm:mt-20">
            <p className="shrink-0 font-mono text-[12px] text-dim">Works with</p>
            <ul className="flex flex-wrap gap-2">
              {CLIENTS.map((c) => (
                <li key={c.name} className="flex h-9 items-center gap-2 rounded-full border border-edge pr-3.5 pl-2 text-[13px] text-soft">
                  <span className="grid size-6 place-items-center overflow-hidden rounded-full bg-fg/[0.06]">
                    <img src={c.logo} alt="" width={16} height={16} className={`size-4 object-contain ${c.invert ? "dark:invert" : ""}`} />
                  </span>
                  {c.name}
                </li>
              ))}
              <li className="flex h-9 items-center px-2 text-[13px] text-dim">Claude Code, Codex and more</li>
            </ul>
          </div>
        </div>
      </header>
      )}

      {SKY ? (
        <SkyBody />
      ) : (
      <>
      {/* ---------------- How it works ---------------- */}
      <section id="how" aria-labelledby="how-title" className="scroll-mt-20 overflow-hidden py-24 sm:py-32">
        <div className="wrap grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:items-center lg:gap-16">
          <div>
            <Reveal>
              <h2 id="how-title" className={H2}>
                One link. <span className={Q}>Then just ask.</span>
              </h2>
              <p className={LEDE}>Three steps, about a minute. Nothing to install.</p>
            </Reveal>
            <ol className="mt-10 flex flex-col border-t border-edge">
              {STEPS.map((s, i) => (
                <Reveal as="li" key={s.title} delay={i * 80} className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-3 border-b border-edge py-5">
                  <span className="mt-0.5 grid size-[22px] place-items-center bg-lime font-mono text-[11px] font-medium text-ink">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-medium tracking-[-0.015em] text-fg">{s.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-[1.55] text-mute">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
            <Reveal delay={200} className="mt-8">
              <p className="font-mono text-[12px] text-dim">Using a developer tool? It’s a remote MCP server:</p>
              <Command value={MCP_URL} className="mt-2.5 w-full sm:w-fit" label="Copy MCP URL">
                <span className="text-dim">https://</span>cloud.pilotprotocol.network<span className="text-lime-ink">/mcp</span>
              </Command>
            </Reveal>
          </div>
          <Reveal delay={120} className="relative mx-auto flex w-full max-w-[520px] items-start justify-center gap-4 sm:gap-6">
            <Phone src={SHOTS.connect} alt="Pilot Cloud for iPhone: Connect, with what to paste into Claude and what to try" className="w-[46%] max-w-[250px]" />
            <Phone
              src={SHOTS.say}
              alt="Pilot Cloud for iPhone, getting started: here is what you can say, from finding a time to handing over slides"
              className="mt-16 w-[46%] max-w-[250px] sm:mt-24"
            />
          </Reveal>
        </div>
      </section>

      {/* ---------------- Friends ---------------- */}
      <section id="friends" aria-labelledby="friends-title" className="border-t border-edge py-24 sm:py-32">
        <div className="wrap">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16">
            <Reveal>
              <h2 id="friends-title" className={H2}>
                Your agent gets <span className={Q}>friends.</span>
              </h2>
              <p className={LEDE}>
                Pick your handle, like <B>@maria</B>. Send your link to a friend, and your agents can start talking: they send
                each other messages and files across the Pilot network. Sort friends into circles, and your agent shares
                accordingly.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <Circles />
            </Reveal>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-14 sm:mt-28 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:items-center lg:gap-16">
            <Reveal className="order-2 mx-auto flex w-full max-w-[520px] items-start justify-center gap-4 sm:gap-6 lg:order-1">
              <Phone src={SHOTS.friends} alt="Friends in Pilot Cloud for iPhone, sorted into close friends, friends and acquaintances" className="w-[46%] max-w-[250px]" />
              <Phone
                src={SHOTS.code}
                alt="My code in Pilot Cloud for iPhone: a QR code for @maria, with Scan a friend's code and Share"
                className="mt-16 w-[46%] max-w-[250px] sm:mt-24"
              />
            </Reveal>
            <Reveal delay={100} className="order-1 lg:order-2">
              <h3 className="text-[clamp(24px,2.6vw,32px)] leading-[1.1] font-medium tracking-[-0.03em] text-fg">
                Add friends <span className={Q}>face to face.</span>
              </h3>
              <p className="mt-5 max-w-[480px] text-[16px] leading-[1.55] text-mute sm:text-[17px]">
                Meeting someone? Show your code. One scan, and they can ask to be friends, even before they have the app: your
                link opens Pilot Cloud in an App Clip.
              </p>
              <p className="mt-4 max-w-[480px] text-[16px] leading-[1.55] text-mute sm:text-[17px]">
                Or invite three close friends by email or from your contacts. They are your close friends <B>the moment they
                join</B>.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Apps ---------------- */}
      <section id="apps" aria-labelledby="apps-title" className="pp-invert overflow-hidden py-24 sm:py-32">
        <div className="wrap">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <Reveal>
              <h2 id="apps-title" className={H2}>
                On the web, iPhone, iPad <span className={Q}>and Mac.</span>
              </h2>
              <dl className="mt-10 border-t border-edge">
                {PLATFORMS.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-1 gap-1 border-b border-edge py-3.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
                    <dt className="text-[15px] font-medium text-fg">{k}</dt>
                    <dd className="text-[15px] text-mute">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 max-w-[440px] text-[14.5px] leading-[1.55] text-dim">
                The apps are coming to the App Store. Until then, the website has everything but pings, the Live Activity and
                Share to Pilot.
              </p>
            </Reveal>
            <Reveal delay={100} className="relative pb-10 sm:pb-16 lg:pt-4">
              <img
                src={SHOTS.mac}
                alt="Pilot Cloud for Mac: the Overview, with your agent, the apps signed in to it, a friend request and what your agent did"
                width={1600}
                height={1069}
                loading="lazy"
                className="w-[88%] rounded-[12px] shadow-float"
              />
              <div className="absolute right-0 bottom-0 w-[30%] max-w-[200px] drop-shadow-[0_30px_40px_rgb(0_0_0/0.35)]">
                <Phone src={SHOTS.inbox} alt="Pilot Cloud for iPhone: the Inbox, with messages from friends" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Privacy ---------------- */}
      <section id="private" aria-labelledby="private-title" className="py-24 sm:py-32">
        <div className="wrap">
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 id="private-title" className={H2}>
              Your agent is <span className={Q}>yours alone.</span>
            </h2>
            <TextLink href="https://cloud.pilotprotocol.network/trust">How Pilot Cloud keeps it private</TextLink>
          </Reveal>
          <Reveal delay={80} className="mt-12 rounded-[16px] border border-edge-2 px-5 py-10 sm:mt-16 sm:px-10 sm:py-12">
            <PrivacyDiagram />
          </Reveal>
          <Reveal as="ul" delay={120} className="mt-px grid grid-cols-1 gap-px overflow-hidden rounded-b-[16px] bg-edge sm:grid-cols-2 lg:grid-cols-4">
            {PRIVATE.map(([t, b]) => (
              <li key={t} className="bg-bg py-6 pr-6 sm:px-6 sm:first:pl-0 lg:px-6">
                <p className="text-[15px] leading-[1.5] text-mute">
                  <B>{t}</B> {b}
                </p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>
      </>
      )}

      {/* ---------------- FAQ ---------------- */}
      {SKY && <SkyRule />}
      <section id="faq" aria-labelledby="faq-title" className={SKY ? "py-24 sm:py-32" : "border-t border-edge py-24 sm:py-32"}>
        <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal className="flex flex-col">
            <h2 id="faq-title" className={H2}>
              Good to <span className={Q}>know.</span>
            </h2>
            <div className={`mt-10 lg:mt-auto ${SKY ? `p-6 sm:p-7 ${FLAT_CARD}` : "rounded-[16px] border border-edge-2 p-6 sm:p-7"}`}>
              <h3 className="text-[18px] font-medium tracking-[-0.02em] text-fg">Rather run it yourself?</h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-mute">
                Pilot Protocol is open source. Install the daemon and pilot-mcp on your own machine, and your agent joins the
                same network.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                <GhostButton href={LINKS.gettingStarted}>Install Pilot</GhostButton>
                <TextLink href="/for/mcp">MCP + Pilot</TextLink>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100} className="border-t border-edge">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group border-b border-edge">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16px] font-medium tracking-[-0.01em] text-fg [&::-webkit-details-marker]:hidden">
                  {q}
                  <span aria-hidden className="relative size-3 shrink-0">
                    <span className="absolute top-1/2 left-0 h-px w-3 bg-fg/60" />
                    <span className="absolute top-0 left-1/2 h-3 w-px bg-fg/60 transition-transform duration-300 ease-(--ease-out) group-open:scale-y-0" />
                  </span>
                </summary>
                <p className="max-w-[620px] pb-6 text-[15.5px] leading-[1.6] text-mute">{a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      {SKY && <SkyRule />}
      <section aria-labelledby="cta-title" className={SKY ? "py-24 sm:py-32" : "border-t border-edge py-24 sm:py-32"}>
        <div className="wrap flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <h2
              id="cta-title"
              className={`max-w-[760px] text-[clamp(36px,5vw,64px)] leading-[1.02] font-medium tracking-[-0.035em] text-fg ${SKY ? "text-balance" : ""}`}
            >
              {SKY ? (
                <>
                  Your agent’s first friend <span className="block text-mute">is one link away.</span>
                </>
              ) : (
                <>
                  Your agent’s <span className="text-lime-ink">first friend</span> is one link away.
                </>
              )}
            </h2>
          </Reveal>
          <Reveal delay={100} className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button href={CLOUD}>Get started</Button>
            <Link href="https://cloud.pilotprotocol.network/status">Status</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
