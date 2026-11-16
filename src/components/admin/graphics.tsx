import { LOGO_MARK_PATH, PilotMarkP } from "@/components/logo";
import { SITE_VARIANT } from "@/lib/site";

/* Payload admin branding: the Pilot Protocol mark on the login screen and in the nav (the P on the sky site). */

const sky = SITE_VARIANT === "sky";

export function AdminLogo() {
  if (sky) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 12, color: "#f2f2ec" }}>
        <PilotMarkP style={{ width: 24, height: 32, color: "#8ec1ff" }} className="" />
        <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.04em" }}>Pilot Protocol</span>
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 12, color: "#f2f2ec" }}>
      <svg viewBox="0 0 113 72" width={56} height={36} aria-hidden fill="#c6f24e">
        <path d={LOGO_MARK_PATH} />
      </svg>
      <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.03em" }}>Pilot Protocol</span>
    </span>
  );
}

export function AdminIcon() {
  if (sky) {
    return (
      <>
        {/* Payload's success colour (custom.css sets it to lime for the green site). */}
        <style>{":root{--theme-success-500:#5aa9ff}"}</style>
        <PilotMarkP style={{ width: 14, height: 18, color: "#8ec1ff" }} className="" />
      </>
    );
  }
  return (
    <svg viewBox="0 0 113 72" width={28} height={18} aria-hidden fill="#c6f24e">
      <path d={LOGO_MARK_PATH} />
    </svg>
  );
}
