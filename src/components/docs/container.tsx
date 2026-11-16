"use client";

import type { ComponentProps } from "react";
import { useDocsPage } from "fumadocs-ui/layouts/docs/page";

/*
 * Fumadocs' page container with a <div> where it has a <main>: the site layout already wraps every page in
 * <main id="main">, and a page must have exactly one. Same classes and data attributes as fumadocs-ui's own slot.
 */
export function DocsContainer({ className = "", children, ...props }: ComponentProps<"article">) {
  const { full } = useDocsPage();
  return (
    <div className="grid [grid-area:main] justify-items-center" data-layout-main="">
      <article
        id="nd-page"
        data-layout-content=""
        data-full={full}
        {...props}
        className={`flex w-full min-w-0 flex-col gap-4 px-4 py-6 md:px-6 md:pt-8 xl:px-8 xl:pt-14 md:in-data-[sidebar-collapsed=true]:pt-16 xl:in-data-[sidebar-collapsed=true]:pt-14 ${full ? "max-w-[1168px]" : "max-w-[900px]"} ${className}`}
      >
        {children}
      </article>
    </div>
  );
}
