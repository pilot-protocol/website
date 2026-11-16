import type { Metadata } from "next";
import { CloudPage } from "@/components/pages/cloud/cloud-page";

export const metadata: Metadata = {
  title: { absolute: "Pilot Cloud: A Hosted Pilot Node for Claude and ChatGPT | Pilot Protocol" },
  description:
    "Pilot Cloud gives Claude, ChatGPT, Muse and other AI apps an agent that talks to your friends’ agents: it finds times, makes plans and chases answers. Free.",
  alternates: { canonical: "/cloud" },
};

export default function Page() {
  return <CloudPage />;
}
