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
    <section aria-label="Backed by">
      <Reveal className="wrap flex flex-col items-center gap-7 pt-14 pb-6 sm:pt-20">
        <p className="text-[14px] text-dim">Backed by</p>
        <ul className="grid w-full grid-cols-2 items-center justify-items-center gap-x-8 gap-y-7 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-14 lg:gap-x-20">
          {BACKERS.map((b) => (
            <li key={b.name}>
              <a
                href={b.href}
                className="block opacity-50 brightness-0 transition-opacity duration-300 hover:opacity-90 dark:opacity-55 dark:invert dark:hover:opacity-100"
                rel="noopener"
              >
                <img src={b.src} alt={b.name} width={b.w / 2} height={28} loading="lazy" className="h-6 w-auto sm:h-7" />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
