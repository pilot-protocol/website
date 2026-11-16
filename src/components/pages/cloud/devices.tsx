import type { ReactNode } from "react";
import { PilotMarkP } from "@/components/logo";
import { BrandMark } from "@/components/v4/logos";
import { LINKS } from "@/lib/site";
import { SHOTS } from "./assets";
import { Phone } from "./phone";

/* eslint-disable @next/next/no-img-element */

/*
 * Sky: where Pilot Cloud runs, as the devices themselves. A MacBook with the Mac app's window on the desktop and
 * Pilot in the menu bar; an iPhone on the Inbox; the App Clip card a friend's link opens; and the address of the
 * website. Sizes are in container units, so the whole scene scales as one picture.
 */

const MENU = ["File", "Edit", "View", "Window", "Help"];

function MacBook() {
  return (
    <div className="absolute top-[1cqw] left-0 w-[84cqw] sm:top-[7cqw] sm:left-[3cqw] sm:w-[80cqw]">
      {/* The lid: a black bezel round the screen. */}
      <div className="rounded-t-[2.4cqw] bg-[#0c0c0e] p-[1.1cqw] pb-[1.5cqw] ring-1 ring-white/10">
        <div className="relative aspect-[16/10.2] overflow-hidden rounded-[0.9cqw] bg-[#3f7bff]">
          <img src="/v4/clouds-a.webp" alt="" aria-hidden width={1600} height={1067} className="absolute inset-0 size-full object-cover opacity-90" />
          {/* The menu bar, with Pilot's own item next to the clock. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 flex h-[3.4cqw] items-center gap-[1.6cqw] bg-white/75 px-[1.6cqw] text-[1.2cqw] leading-none text-[#111]"
          >
            <BrandMark brand="apple" className="size-[1.5cqw] text-[#111]" />
            <span className="font-semibold">Pilot Cloud</span>
            {MENU.map((m) => (
              <span key={m}>{m}</span>
            ))}
            <span className="ml-auto grid size-[2.3cqw] place-items-center rounded-[0.5cqw] bg-[#111]/12">
              <PilotMarkP className="h-[1.3cqw] w-auto" />
            </span>
            <span>Thu 9:41</span>
          </div>
          <img
            src={SHOTS.mac}
            alt="Pilot Cloud for Mac: the Overview, with your agent, the apps signed in to it, a friend request and what your agent did"
            width={1600}
            height={1069}
            loading="lazy"
            className="absolute top-[11%] left-[8%] w-[78%] rounded-[1cqw] shadow-[0_1.4cqw_3cqw_-1cqw_rgb(2_10_48/0.55)]"
          />
        </div>
      </div>
      {/* The base, with the notch to open it by. */}
      <div className="relative -mx-[5%] h-[1.7cqw] rounded-b-[1.6cqw] rounded-t-[0.3cqw] bg-[#d5d8de] shadow-[inset_0_-0.3cqw_0_rgb(0_0_0/0.12)]">
        <span className="absolute top-0 left-1/2 h-[0.55cqw] w-[13%] -translate-x-1/2 rounded-b-[0.6cqw] bg-[#b4b8c0]" />
      </div>
    </div>
  );
}

/** The App Clip card a friend sees when they scan your code. */
function AppClip({ flow = false }: { flow?: boolean }) {
  return (
    <a
      href={LINKS.cloud}
      aria-label="The App Clip card a friend's link opens: Pilot Cloud, be friends with @maria. Open Pilot Cloud"
      className={`${flow ? "relative w-full" : "absolute bottom-0 left-0 w-[max(250px,44cqw)]"} group/clip block rounded-[max(16px,2.8cqw)] bg-white p-[max(12px,2cqw)] text-[#141413] shadow-[0_1.6cqw_3.6cqw_-1.4cqw_rgb(2_10_48/0.6)] transition-transform duration-200 ease-(--ease-out) hover:-translate-y-0.5`}
    >
      <div className="flex items-center gap-[max(10px,1.6cqw)]">
        <span className="grid size-[max(38px,6.4cqw)] shrink-0 place-items-center rounded-[22%] bg-[#1f5bff] text-white">
          <PilotMarkP className="h-[44%] w-auto" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[max(13px,2.1cqw)] leading-[1.25] font-semibold tracking-[-0.01em]">Pilot Cloud</span>
          <span className="block text-[max(11.5px,1.8cqw)] leading-[1.3] text-[#696962]">Be friends with @maria</span>
        </span>
        <span className="rounded-full bg-[#1f5bff] px-[max(12px,1.9cqw)] py-[max(5px,0.8cqw)] text-[max(12px,1.8cqw)] leading-none font-semibold text-white transition-colors duration-200 group-hover/clip:bg-[#1a4fe0]">
          Open
        </span>
      </div>
      <div className="mt-[max(10px,1.5cqw)] flex items-center gap-[max(5px,0.8cqw)] border-t border-black/[0.07] pt-[max(8px,1.2cqw)] text-[max(10.5px,1.6cqw)] leading-none text-[#696962]">
        <svg viewBox="0 0 16 16" aria-hidden className="size-[max(11px,1.8cqw)]" fill="none" stroke="currentColor" strokeWidth={1.4}>
          <circle cx="8" cy="8" r="6.3" strokeDasharray="2.4 1.5" />
          <circle cx="8" cy="8" r="2.3" fill="currentColor" stroke="none" />
        </svg>
        App Clip
      </div>
    </a>
  );
}

/** The website's address, as a browser shows it. It opens the website. */
function Browser({ flow = false }: { flow?: boolean }) {
  return (
    <a
      href={LINKS.cloud}
      aria-label="Open Pilot Cloud on the web, at cloud.pilotprotocol.network"
      className={`${flow ? "relative w-full" : "absolute top-0 right-[6cqw]"} flex transition-transform duration-200 ease-(--ease-out) hover:-translate-y-0.5 items-center gap-[max(8px,1.3cqw)] rounded-[max(12px,1.8cqw)] bg-white py-[max(7px,1.1cqw)] pr-[max(14px,2cqw)] pl-[max(10px,1.5cqw)] text-[max(11.5px,1.75cqw)] leading-none text-[#141413] shadow-[0_1.2cqw_3cqw_-1.2cqw_rgb(2_10_48/0.6)]`}
    >
      <span aria-hidden className="flex gap-[max(4px,0.6cqw)]">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} className="size-[max(7px,1.05cqw)] rounded-full" style={{ background: c }} />
        ))}
      </span>
      <span className="flex items-center gap-[max(5px,0.7cqw)] rounded-[max(7px,1cqw)] bg-black/[0.05] px-[max(8px,1.2cqw)] py-[max(5px,0.75cqw)]">
        <svg viewBox="0 0 16 16" aria-hidden className="size-[max(9px,1.4cqw)] text-[#696962]" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <rect x="3.2" y="7" width="9.6" height="7" rx="1.4" />
          <path d="M5.4 7V5.2a2.6 2.6 0 0 1 5.2 0V7" />
        </svg>
        cloud.pilotprotocol.network
      </span>
    </a>
  );
}

/**
 * The four places, together: Mac, iPhone, the App Clip card, the website. On phones the card and the address
 * leave the picture and sit under it at full size, so they stay readable.
 */
export function Devices() {
  return (
    <div className="w-full [container-type:inline-size]">
      <div className="relative aspect-[680/470] w-full sm:aspect-[680/545]">
        <MacBook />
        <div className="absolute right-0 bottom-0 w-[27cqw]">
          <Phone src={SHOTS.inbox} alt="Pilot Cloud for iPhone: the Inbox, with messages from friends" />
        </div>
        <div className="max-sm:hidden">
          <AppClip />
          <Browser />
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:hidden">
        <Browser flow />
        <AppClip flow />
      </div>
    </div>
  );
}

/* Line drawings of each place, for the list beside the picture. 24px, in the text colour. */
const dg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const DEVICE_GLYPH: Record<string, ReactNode> = {
  Web: (
    <svg {...dg} className="size-[22px]">
      <rect x="2.75" y="4.25" width="18.5" height="15.5" rx="2.5" />
      <path d="M2.75 8.75h18.5" />
      <circle cx="5.6" cy="6.5" r=".4" fill="currentColor" />
      <circle cx="7.4" cy="6.5" r=".4" fill="currentColor" />
      <path d="M9.5 13.5h5M9.5 16h3" />
    </svg>
  ),
  "iPhone and iPad": (
    <svg {...dg} className="size-[22px]">
      <rect x="2.75" y="3.25" width="13.5" height="17.5" rx="2.2" />
      <rect x="13.75" y="8.25" width="7.5" height="12.5" rx="1.8" fill="var(--color-bg)" />
      <path d="M16.6 18.6h1.8" />
    </svg>
  ),
  "App Clip": (
    <svg {...dg} className="size-[22px]">
      <circle cx="12" cy="12" r="8.6" strokeDasharray="3.2 2.1" />
      <circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  Mac: (
    <svg {...dg} className="size-[22px]">
      <rect x="4.25" y="4.75" width="15.5" height="10.5" rx="1.6" />
      <path d="M2.25 18.25h19.5M10.5 18.25l.5-1h2l.5 1" />
    </svg>
  ),
};
