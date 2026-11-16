import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

// Full-text search over the docs, used by the Fumadocs search dialog (⌘K).
export const { GET } = createFromSource(source, { language: "english" });
