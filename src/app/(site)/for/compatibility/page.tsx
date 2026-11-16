import type { Metadata } from "next";
import { CompatibilityPage } from "@/components/pages/compatibility/compatibility-page";

export const metadata: Metadata = {
  title: "Deployment compatibility by environment",
  description:
    "Per-environment deployment modes for pilot-daemon. UDP transport vs single-port-443 compat mode across PaaS, serverless, Kubernetes, agent sandboxes and VMs.",
  alternates: { canonical: "/for/compatibility" },
};

export default function Page() {
  return <CompatibilityPage />;
}
