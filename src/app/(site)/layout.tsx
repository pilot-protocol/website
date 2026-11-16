import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Banner, SiteNav } from "@/components/site-header";
import { SkyPageFooter } from "@/components/page/sky-footer";
import { SiteFooter } from "@/components/site-footer";
import { DEPLOY_URL, SITE_URL, SITE_VARIANT } from "@/lib/site";
import "./globals.css";

const description =
  "Pilot Protocol is an open-source network for AI agents: a permanent address, encrypted tunnels and explicit trust for every agent, with live data agents and an App Store on the same network.";

export const metadata: Metadata = {
  metadataBase: new URL(DEPLOY_URL),
  title: { default: "Pilot Protocol: the open network for AI agents", template: "%s · Pilot Protocol" },
  description,
  applicationName: "Pilot Protocol",
  keywords: ["AI agents", "agent network", "peer-to-peer", "MCP", "open source", "encrypted tunnels", "agent identity"],
  alternates: { canonical: "/" },
  icons:
    SITE_VARIANT === "sky"
      ? { icon: "/icon-sky.svg", apple: "/apple-icon-sky.png" }
      : { icon: "/icon.svg", apple: "/apple-icon.png" },
  openGraph: {
    title: "Pilot Protocol: the open network for AI agents",
    description,
    url: SITE_URL,
    siteName: "Pilot Protocol",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Pilot Protocol: the open network for AI agents." }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@pilotprotocol",
    title: "Pilot Protocol: the open network for AI agents",
    description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  colorScheme: "dark light",
};

// Applied before paint: the saved theme (or the system's), and the banner a visitor already closed.
const prePaintScript = `try{var d=document.documentElement,t=localStorage.getItem("theme"),k=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;d.classList.toggle("dark",k);d.style.colorScheme=k?"dark":"light";if(localStorage.getItem("pp-banner")==="closed")d.dataset.banner="closed"}catch(e){}`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Pilot Protocol",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Linux",
  description,
  url: SITE_URL,
  license: "https://www.gnu.org/licenses/agpl-3.0.html",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${SITE_VARIANT === "sky" ? "site-sky" : ""} ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-dvh bg-bg text-fg">
        <a
          href="#main"
          className="sr-only z-50 rounded-[10px] bg-fg px-3 py-2 text-[14px] text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Banner />
        <SiteNav />
        <main id="main">{children}</main>
        {/* The sky site ends every page with the home page's night-sky footer. */}
        {SITE_VARIANT === "sky" ? <SkyPageFooter /> : <SiteFooter />}
      </body>
    </html>
  );
}
