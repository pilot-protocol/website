import { KeyIcon } from "@/components/icons";
import { FLAT_CARD, SectionHead, SKY, Soft } from "@/components/pages/security/kit";
import { OperatorPicture } from "@/components/pages/self-hosting/operator-picture";
import { Reveal } from "@/components/ui";

const ROWS: [string, string, string][] = [
  ["Register, trust peers, send messages", "Anyone", "Whoever can reach your registry"],
  ["Create networks", "Operators only (admin token)", "You"],
  ["Roles, identity provider, policy, audit export, blueprints", "Operators only", "You"],
  ["Data service agents", "Reachable", "Not registered on your registry"],
  ["Who sees registry metadata", "Vulture Labs", "You"],
  ["Uptime, backups, upgrades", "Vulture Labs", "You"],
];

function Value({ v, mine }: { v: string; mine?: boolean }) {
  if (mine && v === "You")
    return (
      <span className="flex items-center gap-2.5 text-[15px] font-medium text-fg">
        <span aria-hidden className={SKY ? "size-2 rounded-full bg-(--sky-fill)" : "size-2 bg-lime"} />
        You
      </span>
    );
  return <span className="text-[15px] leading-[1.45] text-mute">{v}</span>;
}

function Operator({ name, by, holder, cmd, mine }: { name: string; by: string; holder: string; cmd: string; mine?: boolean }) {
  if (SKY) {
    return (
      <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
        <div>
          <p className="text-[17px] font-medium tracking-[-0.015em] text-fg">{name}</p>
          <p className="mt-1 text-[13px] text-mute">{by}</p>
        </div>
        <p
          className={`flex w-fit items-start gap-2 rounded-[9px] py-[5px] pr-2.5 pl-2 text-[12.5px] leading-[1.3] font-medium ${
            mine ? "bg-(--sky-fill) text-white" : "bg-fg/[0.06] text-soft"
          }`}
        >
          <KeyIcon className="mt-px size-3.5 shrink-0" />
          {holder}
        </p>
        {/* The exact commands are in "From source to first network"; on a phone the column is too narrow for a hostname. */}
        <code className="mt-auto hidden font-mono text-[12px] leading-[1.6] break-words text-fg sm:block">
          <span className="text-(--sky-accent) select-none">$ </span>
          {cmd}
        </code>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <div>
        <p className="text-[17px] font-medium tracking-[-0.015em] text-fg">{name}</p>
        <p className="mt-1 font-mono text-[12px] text-dim">{by}</p>
      </div>
      <p className={`flex items-center gap-2 font-mono text-[12px] ${mine ? "text-lime-ink" : "text-mute"}`}>
        <KeyIcon className="size-3.5" />
        {holder}
      </p>
      <code className="mt-auto block font-mono text-[11.5px] leading-[1.6] break-words text-soft">
        <span className="text-dim">$ </span>
        {cmd}
      </code>
    </div>
  );
}

export function SameProtocol() {
  return (
    <section aria-labelledby="operator-title" className={SKY ? "pt-14 pb-24 sm:pt-20 sm:pb-32" : "border-t border-edge py-24 sm:py-32"}>
      <div className="wrap">
        <SectionHead
          id="operator-title"
          kicker="Public backbone or your own"
          center={SKY}
          title={
            SKY ? (
              <>
                Same protocol, <span className="block text-mute">different operator.</span>
              </>
            ) : (
              <>
                Same protocol, <Soft>different operator.</Soft>
              </>
            )
          }
          lede="Daemons speak the same protocol to either registry. What changes is who holds the admin token and who sees the registry’s metadata."
        />

        <Reveal
          delay={80}
          className={`mt-14 overflow-hidden sm:mt-16 ${SKY ? `${FLAT_CARD} [--color-edge:var(--sky-card-line)]` : "rounded-[16px] border border-edge"}`}
        >
          {SKY && (
            <div className="border-b border-edge">
              <OperatorPicture />
            </div>
          )}
          <div className="grid grid-cols-2 border-b border-edge md:grid-cols-[minmax(0,4fr)_minmax(0,3fr)_minmax(0,3fr)]">
            <div className={`hidden items-end p-5 md:flex ${SKY ? "text-[13px] text-mute" : "font-mono text-[12px] text-dim"}`}>
              On each agent machine
            </div>
            <div className="border-r border-edge md:border-l">
              <Operator name="Public backbone" by="Run by Vulture Labs" holder="Admin token: its operators" cmd="pilotctl daemon start" />
            </div>
            <div className={SKY ? "bg-(--sky-tint)" : "bg-lime/[0.07]"}>
              <Operator
                mine
                name="Your registry"
                by="Run by you"
                holder="Admin token: you"
                cmd="pilotctl daemon start --registry registry.example.com:9000 --beacon registry.example.com:9001"
              />
            </div>
          </div>
          <ul>
            {ROWS.map(([topic, pub, yours]) => (
              <li
                key={topic}
                className="grid grid-cols-2 border-b border-edge last:border-b-0 md:grid-cols-[minmax(0,4fr)_minmax(0,3fr)_minmax(0,3fr)]"
              >
                <div className="col-span-2 px-4 pt-5 pb-1 text-[15.5px] leading-[1.4] font-medium text-fg sm:px-5 md:col-span-1 md:py-5">
                  {topic}
                </div>
                <div className="border-r border-edge px-4 pt-2 pb-5 sm:px-5 md:border-l md:py-5">
                  <Value v={pub} />
                </div>
                <div className={`px-4 pt-2 pb-5 sm:px-5 md:py-5 ${SKY ? "bg-(--sky-tint)" : "bg-lime/[0.07]"}`}>
                  <Value v={yours} mine />
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
