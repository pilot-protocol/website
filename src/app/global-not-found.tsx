import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import Link from "next/link";
import { SkyNotFound } from "@/components/page/sky-not-found";
import { SITE_VARIANT } from "@/lib/site";
import "./(site)/globals.css";

export const metadata: Metadata = { title: "Not found · Pilot Protocol" };

// The same pre-paint theme pick as the site layout: the saved theme, else the system's.
const themeScript = `try{var d=document.documentElement,t=localStorage.getItem("theme"),k=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;d.classList.toggle("dark",k);d.style.colorScheme=k?"dark":"light"}catch(e){}`;

/** Unmatched URLs anywhere (site or admin) land here; it renders outside both root layouts. */
export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`dark ${SITE_VARIANT === "sky" ? "site-sky" : ""} ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg text-fg">
        {SITE_VARIANT === "sky" ? (
          <SkyNotFound bare />
        ) : (
          <main className="flex min-h-dvh flex-col">
            <div className="relative h-[38vh] min-h-[200px]" aria-hidden>
              {[18, 46, 78].map((y, i) => (
                <div key={y} className="absolute inset-x-0 h-px bg-fg/15" style={{ top: `${y}%` }}>
                  <span className="absolute -top-1 size-2 rounded-[2px] bg-lime" style={{ left: `${[22, 61, 38][i]}%` }} />
                </div>
              ))}
            </div>
            <div className="wrap pb-16">
              <p className="font-mono text-[13px] text-dim">404 · no route to host</p>
              <h1 className="mt-4 text-[clamp(44px,7vw,76px)] leading-none font-medium tracking-[-0.035em] text-fg">
                This address <span className="text-lime-ink">isn&apos;t on the network.</span>
              </h1>
              <Link
                href="/"
                className="mt-10 inline-flex h-10 items-center rounded-[10px] bg-fg px-[13px] text-[14px] font-medium text-bg hover:bg-fg/88"
              >
                Back to Pilot Protocol
              </Link>
            </div>
          </main>
        )}
      </body>
    </html>
  );
}
