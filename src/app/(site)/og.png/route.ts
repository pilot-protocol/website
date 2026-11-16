import { renderOgImage } from "@/lib/og";

// Rendered once at build time and exported as a plain /og.png file.
export const dynamic = "force-static";

export function GET() {
  return renderOgImage();
}
