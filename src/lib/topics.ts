/* The blog's topics: the filter pills on /blog, and on the sky site the time of day on each post's cover. */

export type Topic = { label: string; tags: string[] };

export const TOPICS: Topic[] = [
  { label: "Networking", tags: ["networking", "p2p", "discovery", "architecture", "deep-dive", "nat-traversal", "overlay-networks"] },
  { label: "Security", tags: ["security", "end-to-end-encryption", "privacy", "trust", "sandbox", "network-security", "ml-security"] },
  { label: "MCP and agents", tags: ["mcp", "integration", "claude-code", "openclaw", "coding-agents", "ai-agents", "agents"] },
  { label: "shell.online", tags: ["shell-online", "terminal-sharing", "read-only-terminal"] },
  { label: "Tutorials", tags: ["tutorial", "guide", "how-to"] },
  { label: "Research", tags: ["research", "comparison"] },
];

// For a post's single topic (its cover), the most specific match wins: a shell.online post about security is a
// shell.online post. The pills above keep TOPICS' order.
const SPECIFICITY = ["shell.online", "Research", "Security", "MCP and agents", "Tutorials", "Networking"];

/** The most specific topic a post's tags fall under, or null. */
export function topicOf(tags: string[] = []): string | null {
  for (const label of SPECIFICITY) {
    const t = TOPICS.find((x) => x.label === label);
    if (t?.tags.some((tag) => tags.includes(tag))) return label;
  }
  return null;
}
