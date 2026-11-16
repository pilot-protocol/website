import { SHOTS } from "./assets";

/* eslint-disable @next/next/no-img-element */

/** A real Pilot Cloud screenshot inside the iPhone 16 Pro bezel (screen inset measured from the bezel art). */
export function Phone({ src, alt, className = "", priority }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={`relative aspect-[562/1128] ${className}`}>
      <img
        src={src}
        alt={alt}
        width={600}
        height={1304}
        loading={priority ? "eager" : "lazy"}
        className="absolute object-cover"
        style={{ left: "7.255%", top: "3.544%", width: "85.775%", height: "92.913%", borderRadius: "14% / 6.5%" }}
      />
      <img src={SHOTS.bezel} alt="" aria-hidden width={562} height={1128} className="pointer-events-none absolute inset-0 size-full select-none" />
    </div>
  );
}
