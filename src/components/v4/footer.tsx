"use client";

import { motion } from "motion/react";
import { useSyncExternalStore, type CSSProperties, type SVGProps } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { SmartLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";
import { ctaShared, geometry, type Box } from "./cta";
import "./footer.css";

/*
 * Footer (Figma 210:12916): the CTA's sky carried on and brought back down to the page. It starts in the deep
 * blue the CTA ends on, lightens through the day sky and settles into the paper, where the wordmark fades out
 * and the airliner climbs away from it. On top: the plain-text pointer for agents, the links, the small print.
 *
 * On the home page the CTA sits directly above. While its airliner is still crossing, the CTA is part paper,
 * part sky, so the footer carries the same trail on (same shape, same geometry, moved by the same shared value)
 * and the plane's lower wing continues across the seam.
 */

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

/* ---------------- The sky ---------------- */

/** The CTA's box, or null when there's no CTA above (inner pages). */
function useCtaBox() {
  return useSyncExternalStore(
    (onChange) => ctaShared.box.on("change", onChange),
    () => ctaShared.box.get(),
    () => null,
  );
}

/**
 * The footer's sky. With a CTA above: paper ahead of the trail, the sky behind it (the CTA's shape where it
 * reaches below the seam, then the footer's own sky under it, moving with the trail). Without one: the sky.
 */
/* The trail's silhouette below the seam: the shape (whatever of it hangs below the CTA), then its straight body. */
const FOOTER_MASK = "url(/v4/cta-shape.svg), linear-gradient(#000, #000)";

/*
 * Under a CTA the footer starts this far up, overlapping the stage's last pixel. The stage is sticky and the two snap to
 * device pixels separately, so meeting edge to edge left a hairline of page showing between them on some screens.
 * Everything placed from the CTA's geometry measures from `box.h - SEAM`.
 */
const SEAM = 1;

function Sky({ box }: { box: Box | null }) {
  if (!box) return <div className="footer-d-sky absolute inset-0" />;
  const g = geometry(box);
  const top = box.h - SEAM;
  return (
    <>
      <div className="absolute inset-0 bg-bg" />
      <motion.div className="footer-d-moving absolute inset-y-0 left-0" style={{ x: ctaShared.trailX }}>
        {/*
          The CTA's sky carried on below the seam: the footer's sky, cut to the same silhouette (the part of the trail's
          shape that hangs below the CTA, then its body all the way down), so the two meet with no line and no change of
          colour.
        */}
        <span
          className="footer-d-sky absolute inset-y-0"
          style={
            {
              left: g.shapeLeft,
              width: g.shapeW,
              maskImage: FOOTER_MASK,
              WebkitMaskImage: FOOTER_MASK,
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: `0 ${g.shapeTop - top}px, 0 ${Math.max(0, g.shapeTop + g.shapeH - top - 2)}px`,
              WebkitMaskPosition: `0 ${g.shapeTop - top}px, 0 ${Math.max(0, g.shapeTop + g.shapeH - top - 2)}px`,
              maskSize: `${g.shapeW}px ${g.shapeH}px, ${g.bodyW}px 100%`,
              WebkitMaskSize: `${g.shapeW}px ${g.shapeH}px, ${g.bodyW}px 100%`,
            } as CSSProperties
          }
        />
      </motion.div>
    </>
  );
}

/** The CTA's airliner, below its section's edge: the part of the lower wing that reaches into the footer. */
function PlaneBelow({ box }: { box: Box }) {
  const g = geometry(box);
  return (
    <motion.img
      src="/v4/cta-plane.webp"
      srcSet="/v4/cta-plane-1600.webp 1600w, /v4/cta-plane.webp 3160w"
      sizes={`${Math.round(g.planeW)}px`}
      alt=""
      aria-hidden
      width={3160}
      height={3493}
      decoding="async"
      draggable={false}
      className="footer-d-moving pointer-events-none absolute top-0 left-0 z-10 max-w-none select-none"
      style={{ x: ctaShared.planeX, top: g.planeTop - (box.h - SEAM), width: g.planeW, height: g.planeH }}
    />
  );
}

/* ---------------- The airliner, climbing away from the wordmark ---------------- */

/*
 * The design's contrail: an arc of a large circle rising from the lower left to the plane at the wordmark's
 * top-left corner. It draws itself in when the footer comes into view; reduced motion shows it drawn.
 */
function Departure({ live }: { live: boolean }) {
  const reduced = usePrefersReducedMotion();
  const drawn = reduced || live;
  return (
    <div aria-hidden className="footer-d-departure pointer-events-none absolute" data-drawn={drawn}>
      {/* In the wordmark's corner's coordinates: the arc rises from below and left of it to the plane just above. */}
      <svg viewBox="0 0 400 380" className="absolute top-[-70px] left-[-360px] h-[380px] w-[400px] overflow-visible">
        <defs>
          <linearGradient id="footer-d-contrail" x1="20" y1="370" x2="380" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path
          className="footer-d-contrail"
          d="M20 370C64 222 206 78 378 24"
          pathLength={1}
          fill="none"
          stroke="url(#footer-d-contrail)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/v4/plane-small.webp" alt="" width={192} height={212} draggable={false} className="footer-d-plane absolute top-[-78px] left-[-8px] w-[52px]" />
    </div>
  );
}

/* ---------------- Social marks (exact paths from the design, 160:931) ---------------- */

function GitHubMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 1.3755 12.54 12.2490" width={12.54} height={12.25} fill="currentColor" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.2625 1.383C2.805 1.383 0 4.1955 0 7.6605C0 10.4355 1.7925 12.783 4.2825 13.6155C4.5975 13.668 4.71 13.4805 4.71 13.3155L4.7025 12.243C2.9625 12.618 2.595 11.403 2.595 11.403C2.31 10.6755 1.8975 10.4805 1.8975 10.4805C1.3275 10.0905 1.9425 10.098 1.9425 10.098C2.5725 10.143 2.9025 10.743 2.9025 10.743C3.4575 11.703 4.365 11.4255 4.725 11.268C4.785 10.863 4.9425 10.5855 5.1225 10.428C3.735 10.2705 2.2725 9.7305 2.2725 7.3305C2.2725 6.648 2.5125 6.0855 2.9175 5.6505C2.85 5.493 2.64 4.8555 2.9775 3.993C2.9775 3.993 3.5025 3.8205 4.7025 4.638C5.72855 4.35653 6.81145 4.35653 7.8375 4.638C9.0375 3.8205 9.5625 3.993 9.5625 3.993C9.9 4.8555 9.69 5.493 9.6225 5.6505C10.0275 6.0855 10.2675 6.648 10.2675 7.3305C10.2675 9.738 8.805 10.2705 7.41 10.428C7.635 10.623 7.8375 10.998 7.8375 11.583L7.83 13.308C7.83 13.473 7.9425 13.668 8.265 13.608C9.51162 13.1884 10.595 12.3878 11.362 11.3193C12.1291 10.2508 12.5411 8.96834 12.54 7.653C12.54 4.188 9.7425 1.3755 6.285 1.3755L6.2625 1.383Z"
      />
    </svg>
  );
}

function XMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="28.54 2.25 11.6667 10.5" width={11.67} height={10.5} fill="currentColor" aria-hidden {...props}>
      <path d="M37.7275 2.25H39.5183L35.61 6.71833L40.2067 12.75H36.6075L33.79 9.06333L30.5642 12.75H28.7733L32.9558 7.96667L28.54 2.25H32.2325L34.7817 5.61583L37.7275 2.25ZM37.0975 11.6883H38.0892L31.69 3.25917H30.6283L37.0975 11.6883Z" />
    </svg>
  );
}

function LinkedInMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="56.2067 0 15 15" width={15} height={15} fill="currentColor" aria-hidden {...props}>
      <path d="M68.9879 12.7812H66.7629V9.3C66.7629 8.46875 66.7504 7.4 65.6067 7.4C64.4504 7.4 64.2692 8.30625 64.2692 9.2375V12.7812H62.0504V5.625H64.1817V6.6H64.2129C64.5129 6.0375 65.2379 5.44375 66.3192 5.44375C68.5692 5.44375 68.9879 6.925 68.9879 8.85625V12.7812ZM59.5442 4.64375C59.3747 4.64375 59.2069 4.61037 59.0503 4.54551C58.8937 4.48065 58.7514 4.38558 58.6316 4.26573C58.5117 4.14589 58.4166 4.00361 58.3518 3.84703C58.2869 3.69044 58.2535 3.52261 58.2535 3.35312C58.2535 3.18364 58.2869 3.01581 58.3518 2.85922C58.4166 2.70264 58.5117 2.56036 58.6316 2.44052C58.7514 2.32067 58.8937 2.2256 59.0503 2.16074C59.2069 2.09588 59.3747 2.0625 59.5442 2.0625C59.8865 2.0625 60.2147 2.19848 60.4568 2.44052C60.6988 2.68255 60.8348 3.01083 60.8348 3.35312C60.8348 3.69542 60.6988 4.0237 60.4568 4.26573C60.2147 4.50777 59.8865 4.64375 59.5442 4.64375ZM60.6567 12.7812H58.4317V5.625H60.6567V12.7812ZM70.0942 0H57.3129C56.7004 0 56.2067 0.48125 56.2067 1.08125V13.9188C56.2067 14.5188 56.7004 15 57.3129 15H70.0942C70.7067 15 71.2067 14.5188 71.2067 13.9188V1.08125C71.2067 0.48125 70.7067 0 70.0942 0Z" />
    </svg>
  );
}

const SOCIAL = [
  { label: "Pilot Protocol on GitHub", href: LINKS.githubOrg, Icon: GitHubMark },
  { label: "Pilot Protocol on X", href: LINKS.x, Icon: XMark },
  { label: "Pilot Protocol on LinkedIn", href: LINKS.linkedin, Icon: LinkedInMark },
];

/* ---------------- Footer ---------------- */

export function FooterD() {
  const [ref, live] = useInView<HTMLElement>({ once: false, margin: "0px" });
  const [departRef, departed] = useInView<HTMLDivElement>({ margin: "0px 0px -10% 0px" });
  const box = useCtaBox();
  return (
    <footer ref={ref} className="footer-d relative isolate overflow-hidden text-white" data-live={live} style={box ? { marginTop: -SEAM } : undefined}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <Sky box={box} />
        <div className="footer-d-ground absolute inset-x-0 bottom-0" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v4/clouds-a.webp" alt="" className="footer-d-cloud footer-d-cloud-a absolute" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v4/clouds-b.webp" alt="" className="footer-d-cloud footer-d-cloud-b absolute" />
      </div>

      <div className="wrap relative pt-24 sm:pt-28">
        <a
          href="/llms.txt"
          className="footer-d-llms pressable group flex items-center justify-between gap-4 rounded-[10px] p-4 font-mono text-[14px] leading-[18px] outline-white focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-[16px]"
        >
          <span className="flex min-w-0 items-center gap-2 font-medium">
            <span className="truncate text-soft">Plain text for agents</span>
            <span className="shrink-0 text-dim">/llms.txt</span>
          </span>
          <span className="flex shrink-0 items-center gap-4 self-stretch">
            <span aria-hidden className="w-px self-stretch bg-edge-2" />
            <ArrowRightIcon className="size-[13px] text-fg transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5" />
          </span>
        </a>

        <nav aria-label="Footer" className="mt-14 grid grid-cols-2 gap-x-6 gap-y-11 sm:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[16px] leading-[19.5px] text-white">{col.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <SmartLink
                      href={href}
                      className="footer-d-link rounded-[3px] text-[15px] leading-[21px] tracking-[-0.15px] text-white/80 outline-white focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-[16px]"
                    >
                      {label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-14 flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] leading-[21px] text-white/85">© 2026 Pilot Protocol · Built for agents</p>
          <div className="flex items-center gap-4">
            <ul className="flex h-[15px] items-center gap-4">
              {SOCIAL.map(({ label, href, Icon }) => (
                <li key={label} className="flex">
                  <a
                    href={href}
                    aria-label={label}
                    rel="noopener"
                    className="footer-d-link -m-2 flex rounded-[6px] p-2 text-white/85 outline-white focus-visible:outline-2"
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
            <span aria-hidden className="h-[18px] w-px bg-white/30" />
            <p className="text-[15px] leading-[21px] text-white/85">Open source · AGPL-3.0</p>
          </div>
        </div>
      </div>

      {/* The wordmark, fading into the page, with the airliner climbing away from its top-left corner. */}
      <div ref={departRef} className="relative mx-auto mt-24 w-fit">
        <Departure live={departed} />
        <p aria-hidden className="footer-d-wordmark relative -mb-[0.16em] select-none">
          Pilot Protocol
        </p>
      </div>
      {box && <PlaneBelow box={box} />}
    </footer>
  );
}
