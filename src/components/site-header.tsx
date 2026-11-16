"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUpRightIcon, DownloadIcon, GitHubIcon, MenuIcon, XIcon } from "@/components/icons";
import { LogoInline, LogoSky } from "@/components/logo";
import { NavIcon } from "@/components/sky/nav-icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui";
import { useRepo } from "@/lib/github";
import { LINKS, NAV, SITE_VARIANT } from "@/lib/site";

export function Banner() {
  const pathname = usePathname();
  function close() {
    document.documentElement.dataset.banner = "closed";
    try {
      localStorage.setItem("pp-banner", "closed");
    } catch {}
  }

  // The sky home page (and its /v4 preview on the green site): the strip is the top of the hero's own sky.
  const skyHome = pathname === "/v4" || (SITE_VARIANT === "sky" && pathname === "/");

  // The sky site: a calm strip of the deep sky above the page's own sky.
  if (SITE_VARIANT === "sky" || skyHome) {
    return (
      <div
        role="region"
        aria-label="Announcement"
        className={`site-banner-sky relative z-50 flex h-[39px] items-center justify-center px-11 text-white in-data-[banner=closed]:hidden ${skyHome ? "site-banner-home" : ""}`}
      >
        <a
          href={LINKS.cloud}
          className="group flex min-w-0 items-center gap-2.5 rounded-[6px] text-[13.5px] leading-none font-medium tracking-[-0.01em] outline-white"
        >
          <span className="shrink-0 rounded-full bg-white/16 px-2 py-[3px] text-[12px] leading-4 font-medium">New</span>
          <span className="truncate">
            Try Pilot Cloud
            <span className="hidden font-normal text-white/75 sm:inline">: add Pilot to Claude, ChatGPT or any MCP client</span>
          </span>
          <ArrowUpRightIcon className="size-[11px] shrink-0 text-white/75 transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
        <button
          type="button"
          onClick={close}
          aria-label="Dismiss announcement"
          className="pressable absolute right-2 grid size-8 place-items-center rounded-full text-white/70 outline-white hover:bg-white/10 hover:text-white"
        >
          <XIcon className="size-[12px]" />
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="relative z-50 flex h-[39px] items-center justify-center bg-lime px-10 text-ink in-data-[banner=closed]:hidden"
    >
      <a
        href={LINKS.cloud}
        className="group flex min-w-0 items-center gap-3 text-[14px] leading-none font-medium tracking-[-0.01em]"
      >
        <span className="rounded-[5px] bg-ink px-[5px] py-[5px] font-mono text-[11px] leading-none font-medium tracking-[0.06em] text-paper">
          NEW
        </span>
        <span className="truncate">
          Try Pilot Cloud<span className="hidden sm:inline">: add Pilot to Claude, ChatGPT or any MCP client</span>
        </span>
        <ArrowUpRightIcon className="size-3 shrink-0 transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
      <button
        type="button"
        onClick={close}
        aria-label="Dismiss announcement"
        className="pressable absolute right-2 grid size-8 place-items-center rounded-full hover:bg-ink/10"
      >
        <XIcon className="size-[13px]" />
      </button>
    </div>
  );
}

function formatStars(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K` : String(n);
}

/** The star count, shared and cached (src/lib/github.ts): always a number, never just "GitHub". */
function useGitHubStars() {
  return useRepo().stars;
}

export function SiteNav() {
  const pathname = usePathname();
  const isCurrent = (href: string) => href !== "/" && (pathname === href || pathname.startsWith(`${href}/`));
  // Each home page variant has its own install section.
  const skyHome = pathname === "/v4" || (SITE_VARIANT === "sky" && pathname === "/");
  const installHref =
    pathname === "/" || pathname === "/v0" || pathname === "/v2" || pathname === "/v3" || pathname === "/v4"
      ? "#get-started"
      : "/#get-started";
  // Variant D: the header sits on the sky (white, transparent) until the page scrolls.
  const sky = skyHome;
  // The sky site uses the "P" logo everywhere; the green site only on its sky variant.
  const skyLogo = SITE_VARIANT === "sky" || sky;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const stars = useGitHubStars();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      data-scrolled={scrolled || open}
      data-open={open}
      data-sky={sky}
      // With the menu open the bar is solid paper, one sheet with the menu below it (no hero or page showing through).
      className={`sticky top-0 z-40 border-b border-transparent transition-[background-color,backdrop-filter,border-color] duration-300 data-[scrolled=true]:border-edge ${
        // On the sky site the bar is nearly solid once scrolled, so the blue hero can't tint it lavender.
        open ? "bg-bg" : "bg-bg/0 data-[scrolled=true]:bg-bg/80 data-[scrolled=true]:backdrop-blur-xl sky:data-[scrolled=true]:bg-bg/[0.94]"
      }`}
    >
      <nav aria-label="Main" className="wrap flex h-16 items-center justify-between gap-6">
        <Link href={pathname === "/v4" ? "/v4" : "/"} className="shrink-0 text-fg" aria-label="Pilot Protocol home">
          {skyLogo ? (
            <LogoSky className="max-sm:[&>span:last-child]:text-[20px]" />
          ) : (
            <LogoInline className="h-[21px] w-auto sm:h-[22px]" />
          )}
        </Link>

        <ul className="hidden items-center lg:flex">
          {NAV.map((item) => (
            <li key={item.label} className="group/nav relative">
              <Link
                href={item.href}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                className="flex items-center gap-1.5 px-3 py-[23px] text-[14px] leading-[17px] whitespace-nowrap text-fg/85 transition-colors duration-200 hover:text-fg aria-[current=page]:text-fg xl:px-6 sky:transition-[color,background-color] sky:group-hover/nav:bg-fg/[0.08] sky:aria-[current=page]:bg-fg/[0.08]"
              >
                {item.label}
                {item.children && (
                  <svg viewBox="0 0 10 6" className="size-2 text-fg/50 transition-transform duration-200 group-hover/nav:rotate-180" aria-hidden>
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  </svg>
                )}
              </Link>
              {item.children && (
                <div className="invisible absolute top-full left-2 z-50 w-[320px] translate-y-1 opacity-0 sky:left-0 sky:w-[324px] transition-[opacity,translate,visibility] duration-200 ease-(--ease-out) group-focus-within/nav:visible group-focus-within/nav:translate-y-0 group-focus-within/nav:opacity-100 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
                  <ul className="rounded-xl border border-edge bg-card p-1.5 shadow-float sky:flex sky:flex-col sky:gap-1.5 sky:rounded-[12px] sky:p-2">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          className="group/item flex flex-col rounded-[10px] px-3 py-2.5 transition-colors duration-150 hover:bg-fg/[0.05] sky:p-2"
                        >
                          {SITE_VARIANT === "sky" ? (
                            <span className="flex items-center gap-4">
                              <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-fg/[0.07] text-fg transition-colors duration-150 group-hover/item:bg-fg/[0.1]">
                                <NavIcon href={c.href} className="size-[17px]" />
                              </span>
                              <span className="flex min-w-0 flex-col gap-1 leading-[1.1]">
                                <span className="text-[14px] tracking-[-0.01em] text-fg">{c.label}</span>
                                <span className="text-[13px] text-mute">{c.note}</span>
                              </span>
                            </span>
                          ) : (
                            <>
                              <span className="flex items-center gap-2 text-[14px] text-fg">
                                <span aria-hidden className="size-1.5 rounded-[2px] bg-edge-3 transition-colors group-hover/item:bg-lime" />
                                {c.label}
                              </span>
                              <span className="mt-0.5 pl-3.5 text-[13px] text-mute">{c.note}</span>
                            </>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <a
            href={LINKS.github}
            aria-label={`Pilot Protocol on GitHub, ${stars} stars`}
            className="pressable hidden h-10 items-center gap-1 rounded-[10px] px-3 text-[13px] text-soft hover:bg-fg/[0.06] hover:text-fg sm:flex lg:hidden xl:flex"
          >
            <GitHubIcon className="size-6 text-mute" />
            <span className="min-w-[33px] tabular-nums">{formatStars(stars)}</span>
          </a>
          <ThemeToggle className="mr-1" />
          <Button href={installHref} className="max-sm:hidden">
            Install
            <DownloadIcon className="size-[13px]" />
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="pressable -mr-2 grid size-10 place-items-center rounded-full text-fg hover:bg-fg/[0.06] lg:hidden"
          >
            <MenuIcon
              className="col-start-1 row-start-1 size-[18px] transition-[opacity,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0"
              data-hidden={open}
            />
            <XIcon
              className="col-start-1 row-start-1 size-[16px] transition-[opacity,transform] duration-200 ease-(--ease-out) data-[hidden=true]:scale-75 data-[hidden=true]:opacity-0"
              data-hidden={!open}
            />
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        data-open={open}
        inert={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-40 h-[calc(100dvh-64px)] bg-bg opacity-0 transition-opacity duration-200 ease-out data-[open=true]:opacity-100 data-[open=false]:pointer-events-none lg:hidden"
      >
        <div className="wrap flex h-full flex-col pt-6 pb-8">
          {/* One sheet: the main links large, Protocol's pages in two quiet columns under it. No arrows; every row is a link. */}
          <ul className="-mt-2 flex flex-col overflow-y-auto">
            {NAV.map((item, i) => (
              <li
                key={item.label}
                style={{ "--i": i } as CSSProperties}
                className="translate-y-2 border-b border-edge opacity-0 transition-[opacity,transform] duration-500 ease-(--ease-out) [transition-delay:calc(var(--i)*35ms)] in-data-[open=true]:translate-y-0 in-data-[open=true]:opacity-100"
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className="block py-3.5 text-[22px] leading-tight font-medium tracking-[-0.03em] text-fg"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <ul className="-mt-1 grid grid-cols-2 gap-x-4 pb-3.5">
                    {item.children
                      .filter((c) => c.href !== item.href)
                      .map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            onClick={() => setOpen(false)}
                            aria-current={isCurrent(c.href) ? "page" : undefined}
                            className="block py-1.5 text-[16px] leading-6 tracking-[-0.01em] text-mute transition-colors duration-150 hover:text-fg aria-[current=page]:text-fg"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex gap-2">
            <Button href={installHref} onClick={() => setOpen(false)} className="flex-1">
              Install Pilot
              <DownloadIcon className="size-[13px]" />
            </Button>
            <a
              href={LINKS.github}
              className="pressable grid size-10 place-items-center rounded-[10px] bg-card text-fg shadow-tile"
              aria-label="GitHub"
            >
              <GitHubIcon className="size-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
