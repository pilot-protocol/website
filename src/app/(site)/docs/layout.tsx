import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { CSSProperties } from "react";
import { DocsSidebarFooter, DocsSidebarItem, DocsSidebarSeparator } from "@/components/docs/sidebar";
import { LogoMark } from "@/components/logo";
import { source } from "@/lib/source";
// The sky kit's card, hairline and stepper classes (used by the docs home and docs.css on the sky site).
import "@/components/sky/kit.css";
import "./docs.css";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <RootProvider theme={{ enabled: false }} search={{ options: { api: "/api/search" } }}>
      {/* The site header (64px, sticky) sits above the docs; Fumadocs offsets its sticky parts by this. */}
      <div style={{ "--fd-banner-height": "64px" } as CSSProperties} className="docs-shell">
        <DocsLayout
          tree={source.getPageTree()}
          nav={{
            title: (
              <span className="flex items-center gap-2 text-[14px] font-medium tracking-[-0.01em] text-fg">
                <LogoMark className="h-[11px] w-auto text-lime-ink" />
                Documentation
              </span>
            ),
            url: "/docs",
          }}
          themeSwitch={{ enabled: false }}
          sidebar={{
            defaultOpenLevel: 1,
            collapsible: false,
            components: { Item: DocsSidebarItem, Separator: DocsSidebarSeparator },
            footer: <DocsSidebarFooter />,
          }}
        >
          {children}
        </DocsLayout>
      </div>
    </RootProvider>
  );
}
