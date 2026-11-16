import type { Metadata } from "next";
import { PublishPage } from "@/components/pages/publish/publish-page";

export const metadata: Metadata = {
  title: { absolute: "Publish Agent Apps in the Pilot Protocol App Store | Pilot Protocol" },
  description:
    "Publish your app on the Pilot Protocol App Store. We build, sign, and verify an agent-first adapter; you describe it once.",
  alternates: { canonical: "/publish" },
};

export default function Page() {
  return <PublishPage />;
}
