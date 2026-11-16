import type { Metadata } from "next";
import { LegalPage } from "@/components/page/legal-page";

export const metadata: Metadata = {
  title: "Publisher Release Agreement",
  description: "The agreement every publisher signs when submitting an app to the Pilot app store: a license to use the app and publisher name in the store and on the website.",
  alternates: { canonical: "/publisher-agreement" },
};

export default function Page() {
  return <LegalPage slug="publisher-agreement" />;
}
