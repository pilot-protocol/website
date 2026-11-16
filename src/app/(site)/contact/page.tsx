import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/contact/contact-page";

export const metadata: Metadata = {
  title: "Contact: questions, partnerships and press",
  description:
    "Contact Pilot Protocol with questions, app publishing, partnerships, press inquiries or corrections. Email founders@pilotprotocol.network, or press@pilotprotocol.network for press.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <ContactPage />;
}
