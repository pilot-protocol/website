import { Reveal } from "@/components/ui";

/* eslint-disable @next/next/no-img-element */

const BACKERS = [
  { name: "Version One", src: "/backers/versionone.webp", href: "https://versionone.vc/", w: 246 },
  { name: "Pioneer", src: "/backers/pioneer.webp", href: "https://www.pioneerfund.vc/", w: 238 },
  { name: "Night Capital", src: "/backers/nightcap.webp", href: "https://nightcapvc.com/", w: 258 },
  { name: "Todd & Rahul Capital", src: "/backers/toddandrahul.webp", href: "https://www.toddandrahulcapital.com/", w: 337 },
  { name: "Precursor", src: "/backers/precursor.webp", href: "https://precursorvc.com/", w: 257 },
];

export function Backers() {
  return (
    <section aria-label="Backed by" className="border-t border-edge">
      <Reveal className="wrap flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:gap-12">
        <p className="shrink-0 font-mono text-[12px] text-dim">Backed by</p>
        <ul className="grid flex-1 grid-cols-2 items-center gap-x-8 gap-y-6 sm:flex sm:flex-wrap sm:justify-between">
          {BACKERS.map((b) => (
            <li key={b.name}>
              <a href={b.href} className="block opacity-60 brightness-0 invert transition-opacity duration-300 hover:opacity-100" rel="noopener">
                <img src={b.src} alt={b.name} width={b.w / 2} height={28} loading="lazy" className="h-7 w-auto" />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
