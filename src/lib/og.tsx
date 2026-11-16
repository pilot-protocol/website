import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_VARIANT } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = "Pilot Protocol: the open network for AI agents.";

/*
 * Fonts and the logo live in public/ (og/*.ttf, brand/*.svg). At build time (prerendered cards)
 * they're read from disk; on Workers there's no filesystem, so per-post cards fetch them from
 * the Worker's own static assets.
 */
async function asset(path: string): Promise<ArrayBuffer> {
  try {
    const buf = await readFile(join(process.cwd(), "public", path));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  } catch {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const res = await (env as { ASSETS: { fetch: (u: string) => Promise<Response> } }).ASSETS.fetch(`https://assets.local/${path}`);
    return res.arrayBuffer();
  }
}

/** The share card: the hero's hairlines and packets, with the headline underneath. */
/** With a `title`, renders a page card (kicker + title) instead of the home headline. */
export async function renderOgImage(page?: { title: string; kicker: string }) {
  if (SITE_VARIANT === "sky") return renderSkyOgImage(page);
  const [sans, mono, logoSvg] = await Promise.all([asset("og/Geist-Medium.ttf"), asset("og/GeistMono-Regular.ttf"), asset("brand/pilot-protocol-logo.svg")]);
  const logo = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;
  // Page cards keep the network in a band above the title; the home card spreads it out.
  const lines = page ? [70, 104, 150, 196, 212] : [70, 128, 236, 330, 352];
  const packets: [number, number, number][] = [
    [0, 760, 8],
    [1, 160, 8],
    [1, 300, 8],
    [2, 470, 48],
    [2, 560, 8],
    [3, 1010, 8],
    [4, 120, 8],
  ];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#1a1a1a", position: "relative" }}>
        {lines.map((y) => (
          <div key={y} style={{ position: "absolute", left: 0, top: y, width: 1200, height: 1, background: "rgba(255,255,255,0.2)" }} />
        ))}
        {packets.map(([i, x, w]) => (
          <div key={`${i}-${x}`} style={{ position: "absolute", left: x, top: lines[i] - 4, width: w, height: 8, background: "#c6f24e" }} />
        ))}
        <div style={{ position: "absolute", left: 300, top: lines[1], width: 1, height: lines[3] - lines[1], background: "rgba(198,242,78,0.5)" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={181} height={36} alt="" style={{ position: "absolute", left: 72, top: 16 }} />
        {page ? (
          <div style={{ position: "absolute", left: 72, right: 72, top: 262, display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "Geist Mono", fontSize: 24, color: "#c6f24e" }}>{page.kicker}</span>
            <span
              style={{
                marginTop: 18,
                fontFamily: "Geist",
                fontSize: page.title.length > 70 ? 54 : 68,
                lineHeight: 1.04,
                letterSpacing: -2.2,
                color: "#f2f2ec",
              }}
            >
              {page.title}
            </span>
          </div>
        ) : (
          <div style={{ position: "absolute", left: 72, bottom: 64, display: "flex", flexDirection: "column", fontFamily: "Geist", fontSize: 96, lineHeight: 1, letterSpacing: -3.6 }}>
            <span style={{ color: "#f2f2ec" }}>The open network</span>
            <span style={{ color: "#c6f24e" }}>for agents.</span>
          </div>
        )}
        <div style={{ position: "absolute", right: 72, bottom: 72, fontFamily: "Geist Mono", fontSize: 22, color: "#9b9b93" }}>
          pilotprotocol.network
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Geist", data: sans, style: "normal", weight: 500 },
        { name: "Geist Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}

/* The sky site's card: the home page's sky, the P lockup, and the headline (or the page's title) in white. */
const P_MARK =
  "M6 24H0V12H6V24ZM12 0C15.3137 0 18 2.68629 18 6V12L17.9922 12.3086C17.8368 15.3767 15.3767 17.8368 12.3086 17.9922L12 18H6L12 12V6H6L0 12V6L6 0H12Z";

async function renderSkyOgImage(page?: { title: string; kicker: string }) {
  const [sans, semibold, mono] = await Promise.all([
    asset("og/Geist-Medium.ttf"),
    asset("og/Geist-SemiBold.ttf"),
    asset("og/GeistMono-Regular.ttf"),
  ]);
  const mark = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 24"><path fill="#ffffff" d="${P_MARK}"/></svg>`,
  ).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          // The sky from the horizon up: light at the top, the deep blue where the type sits.
          background: "linear-gradient(180deg, #5aa9ff 0%, #2f6bff 38%, #1440c4 70%, #0a2a9c 100%)",
        }}
      >
        <div style={{ position: "absolute", left: 72, top: 64, display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark} width={27} height={36} alt="" />
          <span style={{ marginLeft: 18, fontFamily: "Geist SemiBold", fontSize: 36, letterSpacing: -1.5, color: "#ffffff" }}>
            Pilot Protocol
          </span>
        </div>
        {page ? (
          <div style={{ position: "absolute", left: 72, right: 72, bottom: 132, display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "Geist", fontSize: 28, color: "rgba(255,255,255,0.72)" }}>{page.kicker}</span>
            <span
              style={{
                marginTop: 16,
                fontFamily: "Geist",
                fontSize: page.title.length > 70 ? 54 : 68,
                lineHeight: 1.04,
                letterSpacing: page.title.length > 70 ? -2.4 : -3,
                color: "#ffffff",
              }}
            >
              {page.title}
            </span>
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              left: 72,
              bottom: 120,
              display: "flex",
              flexDirection: "column",
              fontFamily: "Geist",
              fontSize: 112,
              lineHeight: 0.92,
              letterSpacing: -6,
              color: "#ffffff",
            }}
          >
            <span>The internet</span>
            <span>for agents.</span>
          </div>
        )}
        <div style={{ position: "absolute", right: 72, bottom: 64, fontFamily: "Geist Mono", fontSize: 22, color: "rgba(255,255,255,0.7)" }}>
          pilotprotocol.network
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Geist", data: sans, style: "normal", weight: 500 },
        { name: "Geist SemiBold", data: semibold, style: "normal", weight: 600 },
        { name: "Geist Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
