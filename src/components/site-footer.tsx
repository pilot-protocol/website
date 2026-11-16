import { ArrowRightIcon, GitHubIcon, LinkedInLogo, XLogo } from "@/components/icons";
import { Logo } from "@/components/logo";
import { SmartLink } from "@/components/ui";
import { LINKS } from "@/lib/site";

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Protocol",
    links: [
      ["How it works", "/docs/concepts"],
      ["Quickstart", "/docs/getting-started"],
      ["Self-hosting", "/self-hosting"],
      ["Security", "/security"],
      ["SDKs & integration", "/docs/integration"],
      ["Peer-to-peer", "/for/p2p"],
      ["Compatibility", "/for/compatibility"],
    ],
  },
  {
    title: "Services",
    links: [
      ["Service agents", "/service-agents"],
      ["pilot-mom", "/docs/pilot-mom"],
      ["App Store", "/app-store"],
      ["Publish an app", "/publish"],
      ["Pilot for MCP clients", "/for/mcp"],
      ["Pilot Cloud", LINKS.cloud],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Documentation", "/docs/"],
      ["Learning center", "/learn/"],
      ["Blog", "/blog/"],
      ["Research", "/docs/research"],
      ["Wire specification", "/research/WHITEPAPER.pdf"],
      ["Agent skills", "/for/skills"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Roadmap", "/roadmap"],
      ["Company news", "/news/"],
      ["Press", "/press"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/privacy"],
      ["Cookies", "/cookies"],
      ["Terms of Service", "/terms"],
      ["Acceptable Use", "/aup"],
      ["Publisher Agreement", "/publisher-agreement"],
      ["Security disclosure", "/security/disclosure"],
    ],
  },
];

const SOCIAL = [
  { label: "GitHub", href: LINKS.githubOrg, icon: <GitHubIcon className="size-[18px]" /> },
  { label: "X", href: LINKS.x, icon: <XLogo className="size-[14px]" /> },
  { label: "LinkedIn", href: LINKS.linkedin, icon: <LinkedInLogo className="size-[15px]" /> },
];

export function SiteFooter() {
  return (
    <footer data-site-footer className="relative overflow-hidden bg-bg-deep">
      <div className="wrap pt-20 pb-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.3fr)_repeat(5,minmax(0,1fr))] lg:gap-8">
          <div>
            <Logo className="h-10 w-auto text-fg" />
            <p className="mt-4 text-[14px] text-mute">Pilot. Where agents go.</p>
            <ul className="mt-6 flex gap-1.5">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    className="pressable grid size-9 place-items-center rounded-[10px] bg-card text-soft shadow-tile hover:text-fg"
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="Footer" className="col-span-full grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-5">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[13px] font-medium text-fg">{col.title}</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <SmartLink href={href} className="text-[14px] text-mute transition-colors duration-200 hover:text-fg">
                        {label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <a
          href="/llms.txt"
          className="group mt-16 flex items-center justify-between rounded-[14px] bg-card px-5 py-4 font-mono text-[12px] text-soft shadow-tile transition-colors hover:text-fg"
        >
          <span>
            Plain text for agents <span className="ml-2 text-dim">/llms.txt</span>
          </span>
          <ArrowRightIcon className="size-3.5 text-lime-ink transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-1" />
        </a>

      </div>

      {/* The wordmark, set so it runs edge to edge and sinks below the fold of the page. */}
      <p
        aria-hidden
        className="pointer-events-none mt-12 pb-[1.2vw] text-center text-[16.4vw] leading-[0.8] font-medium tracking-[-0.06em] whitespace-nowrap text-fg select-none"
      >
        Pilot Protocol
      </p>
      <div className="wrap flex flex-col justify-between gap-2 pt-2 pb-8 font-mono text-[11.5px] text-dim sm:flex-row">
        <p>© 2026 Pilot Protocol · Built for agents</p>
        <p>Open source · AGPL-3.0</p>
      </div>
      {/* The network runs out under the page. */}
      <div aria-hidden className="relative h-14">
        <div className="absolute inset-x-0 top-3 h-px bg-edge-2" />
        <div className="absolute inset-x-0 top-10 h-px bg-edge-2" />
        <span className="absolute top-2 left-[23%] size-2 rounded-[2px] bg-lime" />
        <span className="absolute top-9 left-[61%] h-2 w-12 rounded-[2px] bg-lime" />
        <span className="absolute top-2 left-[88%] size-2 rounded-[2px] bg-lime" />
      </div>
    </footer>
  );
}
