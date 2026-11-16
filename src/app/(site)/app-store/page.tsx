import type { Metadata } from "next";
import { AppStorePage } from "@/components/pages/app-store/app-store-page";

export const metadata: Metadata = {
  title: { absolute: "Agent App Store: Tools and Services | Pilot Protocol" },
  description:
    "Install agent apps on Pilot Protocol in one command: search, databases, sandboxes, payments and more. Discover, install, and call them as typed JSON services.",
  alternates: { canonical: "/app-store" },
};

export default function Page() {
  return <AppStorePage />;
}
