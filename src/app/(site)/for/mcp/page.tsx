import type { Metadata } from "next";
import { McpPage } from "@/components/pages/mcp/mcp-page";

export const metadata: Metadata = {
  title: "MCP + Pilot Protocol: use Pilot from any MCP client",
  description:
    "MCP gives agents tools. Pilot gives agents each other. pilot-mcp and Pilot Cloud put a Pilot node behind MCP tools for Claude Code, Cursor, ChatGPT and more.",
  alternates: { canonical: "/for/mcp" },
};

export default function Page() {
  return <McpPage />;
}
