import { PageHeader } from "@/components/page/page-header";
import { bySite, isSky, LABEL } from "@/components/page/sky";
import { SKY_H2, SKY_LEDE } from "@/components/pages/security/kit";
import { HatchPanel } from "@/components/sky/kit";
import { Button, GhostButton, Reveal, TextLink } from "@/components/ui";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/icons";
import { Filters } from "./filters";
import { Track } from "./track";
import "./roadmap.css";

const RELEASES = "https://github.com/pilot-protocol/pilotprotocol/releases";
const H2 = bySite("text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-fg", SKY_H2);

export function RoadmapPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Roadmap" }]}
        title={
          <>
            Building the network <span className="text-lime-ink">agents can depend on.</span>
          </>
        }
        lede="Pilot is four things today: the open-source protocol and its public backbone, the data service agents, the App Store and Pilot Cloud. Here is what shipped recently and what is being worked on now, for each of them."
        aside={
          // The sky site lets the track speak for itself ("Being worked on now" already says there are no dates).
          isSky ? undefined : (
            <div className="max-w-[340px] border-l border-lime-ink/70 pl-5 lg:mb-1">
              <p className={LABEL}>How to read this page</p>
              <p className="mt-2 text-[14px] leading-[1.55] text-soft">
                Only work that has shipped, or is underway in the open-source repositories or in Pilot Cloud, is listed. Unfinished work has
                no dates, and plans can change.
              </p>
            </div>
          )
        }
      >
        <div className="flex flex-wrap gap-2">
          <Button href="#now">
            See what&apos;s in progress
            <ArrowRightIcon className="size-[13px] rotate-90" />
          </Button>
          <GhostButton href={RELEASES}>
            Release notes
            <ArrowUpRightIcon className="size-3" />
          </GhostButton>
        </div>
      </PageHeader>

      <section aria-labelledby="track-title" className="pt-20 sm:pt-28">
        <div className="wrap">
          <Reveal className="mb-12 grid grid-cols-1 gap-5 sm:mb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end">
            <h2 id="track-title" className={H2}>
              {isSky ? (
                <>
                  Shipped, <span className="block text-mute">and in progress.</span>
                </>
              ) : (
                "Shipped, and in progress."
              )}
            </h2>
            {!isSky && (
              <p className="text-[15.5px] leading-[1.5] text-mute">
                One track per product. Solid track has reached users; past <span className="text-fg">Now</span> the track is dashed, because
                that work has no dates yet.
              </p>
            )}
          </Reveal>
          <Track />
        </div>
      </section>

      {isSky ? (
        // Sky: the four filters as a stepper on a hatched panel, the heading inside it.
        <section aria-labelledby="filters-title" className="py-24 sm:py-32">
          <div className="wrap">
            <HatchPanel className="px-5 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
              <Reveal>
                <h2 id="filters-title" className={SKY_H2}>
                  The filters <span className="block text-mute">behind the sequence.</span>
                </h2>
                <p className={`mt-5 max-w-[560px] ${SKY_LEDE}`}>
                  <span className="text-fg">Security findings can move work forward immediately.</span> Beyond that, priorities follow what
                  breaks on the live network, what users and app publishers ask for, and how much lasting complexity a change adds.
                </p>
              </Reveal>
              <div className="mt-12 sm:mt-16">
                <Filters />
              </div>
            </HatchPanel>
          </div>
        </section>
      ) : (
      <section aria-labelledby="filters-title" className="border-t border-edge py-24 sm:py-32">
        <div className="wrap">
          <Reveal className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-end">
            <h2 id="filters-title" className="text-[clamp(32px,3.6vw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-fg">
              The filters behind
              <br />
              the sequence.
            </h2>
            <p className="text-[15.5px] leading-[1.55] text-mute">
              <span className="text-fg">Security findings can move work forward immediately.</span> Beyond that, priorities follow what
              breaks on the live network, what users and app publishers ask for, and how much lasting complexity a change adds.
            </p>
          </Reveal>
          <div className="mt-16 sm:mt-20">
            <Filters />
          </div>
        </div>
      </section>
      )}

      {/* Sky: the page's own closing section on paper, so the page doesn't end on a band above the footer's blue. */}
      <section aria-labelledby="suggest-title" className={bySite("pp-invert py-24 sm:py-28", "pb-24 sm:pb-32")}>
        <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <Reveal>
            <h2
              id="suggest-title"
              className={bySite("text-[clamp(36px,4.6vw,60px)] leading-[1] font-medium tracking-[-0.04em] text-fg", SKY_H2)}
            >
              {isSky ? (
                <>
                  Tell us what <span className="block text-mute">you need next.</span>
                </>
              ) : (
                <>
                  Tell us what
                  <br />
                  you need next.
                </>
              )}
            </h2>
            <p className={bySite("mt-6 max-w-[480px] text-[16px] leading-[1.5] text-mute", `mt-5 max-w-[480px] ${SKY_LEDE}`)}>
              Open an issue on GitHub, or write to us. App publishers can also ask about the review and the catalogue.
            </p>
          </Reveal>
          <Reveal delay={80} className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button href="https://github.com/pilot-protocol/pilotprotocol/issues" className={bySite("hover:bg-soft!", "")}>
              Open an issue
              <ArrowUpRightIcon className="size-3" />
            </Button>
            <TextLink href="/contact">Contact us</TextLink>
            <TextLink href="https://github.com/pilot-protocol">View the source</TextLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
