"use client";

import { useMemo, useState } from "react";
import { bySite, isSky } from "@/components/page/sky";
import { Segmented } from "@/components/sky/kit";
import type { PostSummary } from "@/lib/posts-types";
import { ArticleCard } from "./article-card";

export type { Topic } from "@/lib/topics";
import type { Topic } from "@/lib/topics";

/** Post grid with topic filters and a search box. Everything is already on the page; filtering is instant. */
export function ArticleIndex({ articles, topics }: { articles: PostSummary[]; topics: Topic[] }) {
  const [topic, setTopic] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const t = topics.find((x) => x.label === topic);
    const query = q.trim().toLowerCase();
    return articles.filter(
      (a) =>
        (!t || a.tags.some((tag) => t.tags.includes(tag))) &&
        (!query || `${a.title} ${a.description} ${a.tags.join(" ")}`.toLowerCase().includes(query)),
    );
  }, [articles, topics, topic, q]);

  const filtering = topic !== null || q.trim() !== "";
  const [first, ...rest] = list;

  return (
    <div>
      <div className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${bySite("border-b border-edge pb-6", "")}`}>
        {topics.length > 0 &&
          (isSky ? (
            // Sky site: the kit's segmented tabs (Figma 233:1195), filtering the grid below.
            <Segmented
              items={[{ id: "all", label: "All" }, ...topics.map((t) => ({ id: t.label, label: t.label }))]}
              value={topic ?? "all"}
              onChange={(id) => setTopic(id === "all" ? null : id)}
              label="Topics"
              layoutId="blog-topic"
              className="self-start"
            />
          ) : (
            <div role="group" aria-label="Topics" className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
              {[null, ...topics.map((t) => t.label)].map((label) => (
                <button
                  key={label ?? "all"}
                  type="button"
                  aria-pressed={topic === label}
                  onClick={() => setTopic(label)}
                  className="pressable shrink-0 rounded-[10px] border border-edge px-3 py-1.5 text-[13px] whitespace-nowrap text-mute hover:border-edge-3 hover:text-fg aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg"
                >
                  {label ?? "All"}
                </button>
              ))}
            </div>
          ))}
        <label
          className={`flex w-full items-center gap-2 md:w-[280px] ${bySite(
            "h-9 rounded-[10px] border border-edge px-3 focus-within:border-edge-3",
            "h-[52px] rounded-[8px] border border-(--sky-card-line) bg-card px-4 transition-[box-shadow,border-color] duration-200 focus-within:border-(--sky-fill) focus-within:shadow-[0_0_0_3px_var(--sky-tint)]",
          )}`}
        >
          <svg viewBox="0 0 24 24" className={bySite("size-3.5 text-dim", "size-4 shrink-0 text-mute")} aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="sr-only">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={articles.length > 1 ? `Search ${articles.length} posts` : "Search"}
            className={`w-full bg-transparent text-fg outline-none placeholder:text-dim ${bySite("text-[14px]", "text-[15px]")}`}
          />
        </label>
      </div>

      <p className={bySite("mt-6 font-mono text-[12px] text-dim", "mt-8 text-[13px] text-mute")} aria-live="polite">
        {filtering ? `${list.length} of ${articles.length}` : `${articles.length} ${articles.length === 1 ? "post" : "posts"}`}
      </p>

      {list.length === 0 ? (
        <p className="py-24 text-center text-[16px] text-mute">Nothing matches that. Try a different word.</p>
      ) : (
        <div className={`mt-6 flex flex-col ${bySite("gap-4", "gap-3")}`}>
          {!filtering && first && <ArticleCard a={first} large heading="h2" />}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${bySite("gap-4", "gap-3")}`}>
            {(filtering ? list : rest).map((a) => (
              <ArticleCard key={a.slug} a={a} heading="h2" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
