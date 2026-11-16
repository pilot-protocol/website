import { Reveal } from "@/components/ui";

/* The site's type, at the sizes the site actually sets it (values from the components that use them). */

const SCALE: { role: string; spec: string; sample: string; className: string }[] = [
  {
    role: "Display",
    spec: "Geist 500 · 56–148px · line 0.92 · tracking −0.05em",
    sample: "The internet for agents.",
    className: "text-[clamp(56px,10.5vw,148px)] leading-[0.92] font-medium tracking-[-0.05em]",
  },
  {
    role: "Page title",
    spec: "Geist 500 · 40–72px · line 1.02 · tracking −0.035em",
    sample: "Building the network agents can use.",
    className: "text-[clamp(40px,5.6vw,72px)] leading-[1.02] font-medium tracking-[-0.035em]",
  },
  {
    role: "Section",
    spec: "Geist 500 · 32–44px · line 1.05 · tracking −0.035em",
    sample: "One network, four ways in.",
    className: "text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em]",
  },
  {
    role: "Body",
    spec: "Geist 400 · 16–17px · line 1.5 · in mute",
    sample:
      "Pilot Protocol is an open-source network for AI agents: persistent identity and addressing, encrypted peer connectivity and explicit trust.",
    className: "max-w-[620px] text-[16px] leading-[1.5] text-mute sm:text-[17px]",
  },
  {
    role: "Caption",
    spec: "Geist Mono 400 · 11.5–13px · sentence case · in dim",
    sample: "Real output, recorded in October 2026.",
    className: "font-mono text-[12px] text-dim",
  },
];

export function Specimen() {
  return (
    <div className="flex flex-col gap-16">
      <Reveal className="grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-edge bg-edge md:grid-cols-2">
        <div className="flex flex-col justify-between gap-10 bg-bg p-6 sm:p-10">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[17px] font-medium text-fg">Geist</p>
            <p className="font-mono text-[11.5px] text-dim">400 · 500</p>
          </div>
          <p aria-hidden className="text-[clamp(120px,16vw,220px)] leading-[0.8] font-medium tracking-[-0.06em] text-fg">
            Aa
          </p>
          <p className="text-[15px] leading-[1.5] text-mute">
            Headings, body and buttons. Two weights only: regular and medium.
          </p>
        </div>
        <div className="flex flex-col justify-between gap-10 bg-bg p-6 sm:p-10">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-mono text-[17px] text-fg">Geist Mono</p>
            <p className="font-mono text-[11.5px] text-dim">400 · 500</p>
          </div>
          <p aria-hidden className="font-mono text-[clamp(120px,16vw,220px)] leading-[0.8] tracking-[-0.08em] text-fg">
            Aa
          </p>
          <p className="text-[15px] leading-[1.5] text-mute">
            Commands, addresses, labels and captions, in sentence case: <span className="font-mono text-[13.5px] text-fg">0:0000.0000.4BB9</span>
          </p>
        </div>
      </Reveal>

      <ol className="border-t border-edge">
        {SCALE.map((s, i) => (
          <Reveal
            as="li"
            key={s.role}
            delay={i * 40}
            className="grid grid-cols-1 gap-4 overflow-hidden border-b border-edge py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10"
          >
            <div>
              <p className="text-[15px] font-medium text-fg">{s.role}</p>
              <p className="mt-1 font-mono text-[11.5px] leading-[1.5] text-dim">{s.spec}</p>
            </div>
            <p className={`text-balance text-fg ${s.className}`}>{s.sample}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
