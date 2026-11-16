import { Chivo_Mono } from "next/font/google";
import { Reveal } from "@/components/ui";

/*
 * Backed by (Figma 180:488): five grey tiles holding the backer logos, 164px tall at full width, every one
 * rounded 8px on all four corners and set 12px apart.
 * Logos scale with the tile (cqw against its 241px design width) and never overflow it.
 *
 * Each logo is the firm's own artwork used as a mask and filled with currentColor, so all five are
 * one ink and follow the theme: Precursor's SVG, and the others' official rasters reduced to alpha
 * masks at 112px tall (3x the display size). w and h are the mask's intrinsic size (viewBox or pixels).
 * Todd & Rahul Capital has no logo; their site sets the name in Chivo Mono, so it is set the same way.
 * size is tuned per logo so the five carry the same optical weight.
 */

const chivoMono = Chivo_Mono({ weight: "600", subsets: ["latin"], display: "swap" });

type Backer = { name: string; href: string; size: string; logo?: { src: string; w: number; h: number } };

const BACKERS: Backer[] = [
  {
    name: "Version One",
    href: "https://versionone.vc/",
    size: "h-[min(24px,9.95cqw)]",
    logo: { src: "/v4/backers/versionone.png", w: 711, h: 112 },
  },
  {
    name: "Pioneer",
    href: "https://www.pioneerfund.vc/",
    size: "h-[min(18.5px,7.7cqw)]",
    logo: { src: "/v4/backers/pioneer.png", w: 890, h: 112 },
  },
  {
    name: "Night Capital",
    href: "https://nightcapvc.com/",
    size: "h-[min(27px,11.2cqw)]",
    logo: { src: "/v4/backers/nightcapital.png", w: 687, h: 112 },
  },
  { name: "Todd & Rahul Capital", href: "https://www.toddandrahulcapital.com/", size: "text-[min(17px,7.05cqw)]" },
  {
    name: "Precursor",
    href: "https://precursorvc.com/",
    size: "h-[min(32px,13.3cqw)]",
    logo: { src: "/v4/backers/precursor.svg", w: 800, h: 165.08 },
  },
];

export function BackersD() {
  return (
    <section id="backers" aria-labelledby="backers-title">
      <Reveal className="wrap flex flex-col items-center gap-6 pt-16 pb-12 sm:pt-20 lg:py-[88px]">
        <h2 id="backers-title" className="text-[16px] leading-[21px] tracking-[-0.15px] text-soft/80 sm:text-[18px]">
          Backed by
        </h2>
        <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-6 lg:grid-cols-5">
          {BACKERS.map((b, k) => (
            <li key={b.name} className={`${k < 3 ? "sm:col-span-2" : "sm:col-span-3"} lg:col-span-1 ${k === 4 ? "max-sm:col-span-2" : ""}`}>
              <a
                href={b.href}
                rel="noopener"
                className={`@container flex h-[104px] items-center justify-center rounded-[8px] bg-(--sky-tile) text-fg transition-[background-color] duration-200 ease-[ease] outline-(--sky-accent) pointer-fine:hover:bg-fg/[0.08] focus-visible:outline-2 focus-visible:-outline-offset-2 sm:h-[128px] lg:aspect-[241/164] lg:h-auto`}
              >
                {b.logo ? (
                  <span
                    role="img"
                    aria-label={b.name}
                    className={`${b.size} max-w-[90%] bg-current mask-contain mask-center mask-no-repeat`}
                    style={{ aspectRatio: `${b.logo.w} / ${b.logo.h}`, maskImage: `url(${b.logo.src})` }}
                  />
                ) : (
                  <span className={`${chivoMono.className} ${b.size} leading-none font-semibold tracking-[-0.01em] whitespace-nowrap`}>
                    {b.name}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
