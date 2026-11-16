import type { Metadata } from "next";
import { SelfHostingPage } from "@/components/pages/self-hosting/self-hosting-page";

export const metadata: Metadata = {
  title: "Self-hosting: run your own Pilot registry",
  description:
    "Run the open-source Pilot registry and beacon yourself for private networks, roles, OIDC/JWT validation, network policy, audit export and blueprints.",
  alternates: { canonical: "/self-hosting" },
};

export default function Page() {
  return <SelfHostingPage />;
}
