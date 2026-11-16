/*
 * The sky site's split section (kit, Figma 218:22895 / 211:13852): text on plain paper in one half, the visual on
 * hatching in the other, a 1px divider between them, and full-width hairlines (SkyRule) above and below the section.
 * Plain strings so server and client components can both use them; kit.css (loaded with the kit) draws the hatching.
 */

/** The two halves, in the design's 611 : 589 proportion. Stacked below 1024px. */
export const SPLIT = "wrap grid grid-cols-1 lg:grid-cols-[minmax(0,611fr)_minmax(0,589fr)]";
/** The text half when it's on the left. */
export const SPLIT_TEXT = "flex min-w-0 flex-col justify-center py-16 sm:py-20 lg:py-[100px] lg:pr-[71px]";
/** The text half when it's on the right. */
export const SPLIT_TEXT_END = "flex min-w-0 flex-col justify-center py-16 sm:py-20 lg:py-[100px] lg:pl-[88px]";
/** The hatched half, framed on both sides (one of them is the divider). */
export const SPLIT_ART =
  "sky-hatch-bg sky-frame flex min-w-0 items-center justify-center border-x px-4 py-10 max-lg:border-t sm:px-10 sm:py-14 lg:px-10 lg:py-[72px]";

/** Section headings: the claim in ink, the qualifier in mute (kit). */
export const H2 = "text-[clamp(34px,4.2vw,48px)] leading-[1.1] font-medium tracking-[-0.043em] text-balance text-fg";
/** The lede under a heading. */
export const LEDE = "text-[17px] leading-[1.55] tracking-[-0.024em] text-pretty text-mute sm:text-[18px] sm:leading-[27px]";
