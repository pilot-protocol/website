import type { Metadata } from "next";
import { P2PPage } from "@/components/pages/p2p/p2p-page";

export const metadata: Metadata = {
  title: "Direct peer-to-peer for AI agents",
  description:
    "Direct encrypted data paths for AI agents, with an explicit discovery registry and end-to-end encrypted relay fallback when NAT prevents a peer-to-peer tunnel.",
  alternates: { canonical: "/for/p2p" },
};

export default function Page() {
  return <P2PPage />;
}
