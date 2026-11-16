import type { Metadata } from "next";
import { SkillsPage } from "@/components/pages/skills/skills-page";

export const metadata: Metadata = {
  title: "Agent skills and integrations directory",
  description:
    "82 agent skills that teach an agent to use pilotctl: messaging, file transfer, trust, pub/sub, bridges and the service agents. Each installs from ClawHub in one command.",
  alternates: { canonical: "/for/skills" },
};

export default function Page() {
  return <SkillsPage />;
}
