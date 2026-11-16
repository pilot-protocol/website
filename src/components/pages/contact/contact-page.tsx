import { PageHeader } from "@/components/page/page-header";
import { isSky } from "@/components/page/sky";
import { Reveal } from "@/components/ui";
import { Router } from "./router";

export function ContactPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        title={
          <>
            Talk to the people <span className="text-lime-ink">behind Pilot.</span>
          </>
        }
        lede="Questions, app publishing, partnerships or press. Messages go straight to the founding team, and we reply by email."
      />
      {isSky ? (
        // Sky: the router is its own split section (topics on paper, the route and the message on the hatching).
        <div className="pt-12 pb-24 sm:pt-16 sm:pb-32">
          <Router />
        </div>
      ) : (
        <section aria-label="Write to us" className="py-16 sm:py-24">
          <div className="wrap">
            <Reveal>
              <Router />
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
