"use client";

import type * as PageTree from "fumadocs-core/page-tree";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRightIcon, GitHubIcon } from "@/components/icons";
import { bySite } from "@/components/page/sky";
import { LINKS } from "@/lib/site";

/* The docs sidebar, drawn in the site's own style. Fumadocs keeps the tree, scrolling and the mobile drawer. */

export function DocsSidebarItem({ item }: { item: PageTree.Item }) {
  const pathname = usePathname();
  const active = pathname === item.url || pathname === `${item.url}/`;
  return (
    <Link
      href={item.url}
      data-active={active}
      aria-current={active ? "page" : undefined}
      className="group/item relative flex items-center rounded-[9px] py-[7px] pr-2.5 pl-3 text-[14px] leading-[1.35] text-mute transition-[background-color,color] duration-150 hover:bg-fg/[0.045] hover:text-fg data-[active=true]:bg-card data-[active=true]:font-medium data-[active=true]:text-fg data-[active=true]:shadow-tile"
    >
      <span
        aria-hidden
        className="absolute top-1/2 left-0 h-3.5 w-[3px] -translate-x-[5px] -translate-y-1/2 rounded-full bg-packet opacity-0 transition-opacity duration-200 group-data-[active=true]/item:opacity-100"
      />
      {item.name}
    </Link>
  );
}

export function DocsSidebarSeparator({ item }: { item: PageTree.Separator }) {
  return (
    <p className="mt-6 mb-1.5 px-3 text-[12.5px] font-medium tracking-[-0.005em] text-dim first:mt-1">{item.name}</p>
  );
}

export function DocsSidebarFooter() {
  return (
    <div className={`flex items-center gap-1 border-t border-edge px-3 text-[13px] text-mute ${bySite("pt-3 pb-1", "pt-4 pb-2")}`}>
      <a
        href="/llms.txt"
        className="rounded-[8px] px-2 py-1.5 transition-colors hover:bg-fg/[0.05] hover:text-fg"
        title="The docs as plain text, for agents"
      >
        llms.txt
      </a>
      <a
        href={LINKS.github}
        className="flex items-center gap-1.5 rounded-[8px] px-2 py-1.5 transition-colors hover:bg-fg/[0.05] hover:text-fg"
      >
        <GitHubIcon className="size-4" />
        GitHub
        <ArrowUpRightIcon className="size-2.5 opacity-60" />
      </a>
    </div>
  );
}
