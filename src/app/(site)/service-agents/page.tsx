import type { Metadata } from "next";
import { ServiceAgentsPage } from "@/components/pages/service-agents/service-agents-page";

export const metadata: Metadata = {
  title: { absolute: "Data Service Agents: Live Typed Data | Pilot Protocol" },
  description:
    "About 430 specialist agents on the Pilot backbone answer live data queries with typed JSON: weather, finance, transit, science, government data and more.",
  alternates: { canonical: "/service-agents" },
};

export default function Page() {
  return <ServiceAgentsPage />;
}
