"use client";

import { usePathname } from "next/navigation";
import { FooterD } from "@/components/v4/footer";
import "./sky-footer.css";

/**
 * The sky site's footer on every page but the home page (which renders its own after the CTA): the home
 * page's night-sky footer, with a top that starts from the page instead of the CTA (sky-footer.css).
 */
export function SkyPageFooter() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/v4") return null;
  return (
    <div className="sky-page-footer">
      <FooterD />
    </div>
  );
}
