import { isSky } from "@/components/page/sky";
import { topicOf } from "@/lib/topics";

/**
 * A generated cover for an article: the site's hairlines and lime packets,
 * laid out from a hash of the slug so every post gets its own, stable pattern.
 * Covers are artwork, like the OG images, so they stay dark in both themes.
 * On the sky site every post is a flight instead: a sky for its topic, a couple of clouds and the
 * home page's airliner with its contrail, all placed from the same hash.
 */

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10_000) / 10_000;
  };
}

export function ArticleCover({ seed, tags, label, className = "" }: { seed: string; tags?: string[]; label?: string; className?: string }) {
  if (isSky) return <SkyCover seed={seed} tags={tags} label={label} className={className} />;
  const r = hash(seed);
  const n = 4 + Math.floor(r() * 3);
  const lines = Array.from({ length: n }, (_, i) => Math.round(70 + ((i + 0.2 + r() * 0.6) / n) * 470));
  const packets = lines.flatMap((y, i) =>
    Array.from({ length: 1 + Math.floor(r() * 3) }, () => ({ x: Math.round(40 + r() * 1100), y, w: r() < 0.2 ? 48 : 8, i })),
  );
  const hop = lines.length > 1 ? { x: Math.round(160 + r() * 880), a: lines[0], b: lines[1 + Math.floor(r() * (lines.length - 1))] } : null;

  return (
    <svg viewBox="0 0 1200 630" className={`block h-auto w-full bg-[#141414] ${className}`} aria-hidden preserveAspectRatio="xMidYMid slice">
      {lines.map((y) => (
        <rect key={y} x="0" y={y} width="1200" height="1.5" fill="rgb(242 242 236 / 0.16)" />
      ))}
      {hop && (
        <>
          <rect x={hop.x + 5} y={hop.a} width="1.5" height={hop.b - hop.a} fill="rgb(198 242 78 / 0.5)" />
          <rect x={hop.x - 9} y={hop.b - 15} width="30" height="30" fill="none" stroke="rgb(198 242 78 / 0.45)" strokeWidth="1.5" />
        </>
      )}
      {packets.map((p, k) => (
        <g key={k}>
          <rect x={p.x - 160} y={p.y} width="160" height="1.5" fill="url(#trail)" />
          <rect x={p.x} y={p.y - 6} width={p.w * 1.5} height="12" fill="#c6f24e" />
        </g>
      ))}
      <defs>
        <linearGradient id="trail">
          <stop offset="0" stopColor="#c6f24e" stopOpacity="0" />
          <stop offset="1" stopColor="#c6f24e" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {label && (
        <text x="48" y="586" fill="rgb(242 242 236 / 0.45)" fontFamily="var(--font-geist-mono), monospace" fontSize="26">
          {label}
        </text>
      )}
    </svg>
  );
}

/* ---------------- Sky covers ---------------- */

/*
 * Each topic flies at its own time of day, so the blog grid reads by topic at a glance: networking at high noon,
 * security at night, MCP and agents in the home page's day (with a second airliner converging), shell.online in
 * the evening, tutorials in the morning, research at dawn. Each time of day has three skies, picked per post, so a
 * run of posts on one topic still varies. Posts outside the topics get a day sky.
 */
type Sky = { stops: string[]; night?: boolean; meet?: boolean };
type Family = { skies: string[][]; night?: boolean; meet?: boolean };
const FAMILIES: Record<string, Family> = {
  // High noon: bright, high blue.
  Networking: {
    skies: [
      ["#1a4fe6", "#4f9cff", "#9fcaff", "#e4f0ff"],
      ["#1544d6", "#3f8cff", "#8cc0ff", "#dcecff"],
      ["#2058f0", "#5fa6ff", "#b0d4ff", "#eef5ff"],
    ],
  },
  // Night, with stars.
  Security: {
    night: true,
    skies: [
      ["#020822", "#071a5a", "#123a9e", "#2d5cc4"],
      ["#030a1c", "#0a1d4f", "#1b3d8c", "#3e5fae"],
      ["#05061a", "#141a52", "#2e3f93", "#5a6fc0"],
    ],
  },
  // The home page's day, with a second airliner on a converging course.
  "MCP and agents": {
    meet: true,
    skies: [
      ["#0a2a9c", "#1f5bff", "#5aa9ff", "#b9dcff"],
      ["#0b2ca0", "#2f6bff", "#7db9ff", "#d7e9ff"],
      ["#08259a", "#1b52f0", "#4f9cff", "#aed4ff"],
    ],
  },
  // Evening: golden hour, sunset, blue hour.
  "shell.online": {
    skies: [
      ["#1a3fb8", "#4b7fe6", "#f2c08a", "#ffe2b8"],
      ["#0b1650", "#2f3aa6", "#9a6fc2", "#f0b28f"],
      ["#06103d", "#14287a", "#3a4fa8", "#8a8fd0"],
    ],
  },
  // Morning: soft and clear.
  Tutorials: {
    skies: [
      ["#0b2ca0", "#2f6bff", "#7db9ff", "#d7e9ff"],
      ["#1c49d0", "#5a93f0", "#a9cdf7", "#eaf3ff"],
      ["#123ab8", "#4a86f2", "#9ec6ff", "#f2f6ff"],
    ],
  },
  // Dawn: the first light warming the horizon.
  Research: {
    skies: [
      ["#0d2380", "#3d6be0", "#e7b9a2", "#ffe7c7"],
      ["#0a1c6b", "#2f5bc8", "#c7a6c6", "#ffd9c2"],
      ["#122a8f", "#4a78e8", "#f0c6a8", "#fff0d9"],
    ],
  },
};
const DAY: Family = { skies: [...FAMILIES.Networking.skies, ...FAMILIES["MCP and agents"].skies, ...FAMILIES.Tutorials.skies] };
const STOPS = [0, 0.44, 0.8, 1];

// The airliner (public/v4/cta-plane-1600.webp, nose right): its aspect, and where its tail sits in the image.
const PLANE_RATIO = 1769 / 1600;

const round = (n: number) => Math.round(n * 10) / 10;

/** One flight: a contrail in from the left edge, curving up to an airliner of the given width. */
function flight(r: () => number, width: number, band: [number, number]) {
  const start = { x: -60, y: round(band[0] + 250 + r() * 200) };
  const end = { x: round(560 + r() * 380), y: round(band[0] + r() * (band[1] - band[0])) };
  const c1 = { x: round(start.x + 320 + r() * 160), y: round(start.y - 30 - r() * 80) };
  const c2 = { x: round(end.x - 220 - r() * 140), y: round(end.y + 30 + r() * 70) };
  return {
    start,
    end,
    width,
    angle: round((Math.atan2(end.y - c2.y, end.x - c2.x) * 180) / Math.PI),
    d: `M${start.x} ${start.y}C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`,
  };
}

function Flight({ f, id, mirror }: { f: ReturnType<typeof flight>; id: string; mirror: boolean }) {
  const h = f.width * PLANE_RATIO;
  return (
    <g transform={mirror ? "translate(1200 0) scale(-1 1)" : undefined}>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={f.start.x} y1={f.start.y} x2={f.end.x} y2={f.end.y}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* The contrail: a soft spread under a bright core. */}
      <path d={f.d} fill="none" stroke={`url(#${id})`} strokeWidth={round(f.width * 0.12)} strokeLinecap="round" opacity="0.18" />
      <path d={f.d} fill="none" stroke={`url(#${id})`} strokeWidth={round(Math.max(2, f.width * 0.03))} strokeLinecap="round" />
      <g transform={`translate(${f.end.x} ${f.end.y}) rotate(${f.angle})`}>
        <image href="/v4/cta-plane-1600.webp" x={round(-f.width * 0.04)} y={round(-h * 0.505)} width={f.width} height={round(h)} />
      </g>
    </g>
  );
}

function SkyCover({ seed, tags, label, className }: { seed: string; tags?: string[]; label?: string; className: string }) {
  const r = hash(seed);
  const id = `sky-${seed.replace(/[^a-z0-9]/gi, "").slice(0, 40)}`;
  const topic = topicOf(tags);
  const family = (topic && FAMILIES[topic]) || DAY;
  const sky: Sky = { stops: family.skies[Math.floor(r() * family.skies.length)], night: family.night, meet: family.meet };

  // Near or far, and which way it flies.
  const near = r() < 0.5;
  const mirror = r() < 0.4;
  const main = flight(r, near ? 132 : 92, near ? [170, 300] : [130, 260]);
  // MCP and agents: a second, smaller airliner coming the other way, higher up.
  const second = sky.meet ? flight(r, 64, [90, 170]) : null;

  // Clouds near the horizon, and sometimes one higher up; at night they're faint.
  const dim = sky.night ? 0.3 : 1;
  const clouds = [
    { src: "/v4/clouds-a.webp", w: round(820 + r() * 360), x: round(-200 + r() * 700), y: round(330 + r() * 120), o: round((0.3 + r() * 0.2) * dim), flip: r() < 0.5 },
    ...(r() < 0.55
      ? [{ src: "/v4/clouds-b.webp", w: round(640 + r() * 300), x: round(500 + r() * 500), y: round(-160 + r() * 140), o: round((0.16 + r() * 0.14) * dim), flip: r() < 0.5 }]
      : []),
  ];

  // Night: stars in the upper sky, from the same hash.
  const stars = sky.night
    ? Array.from({ length: 46 }, () => ({ x: round(r() * 1200), y: round(r() * 380), s: round(0.7 + r() * 1.3), o: round(0.25 + r() * 0.6) }))
    : [];

  return (
    <svg viewBox="0 0 1200 630" className={`block h-auto w-full ${className}`} aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          {sky.stops.map((c, i) => (
            <stop key={i} offset={STOPS[i]} stopColor={c} />
          ))}
        </linearGradient>
      </defs>

      <rect width="1200" height="630" fill={`url(#${id}-sky)`} />
      {stars.map((st, i) => (
        <circle key={i} cx={st.x} cy={st.y} r={st.s} fill="#ffffff" opacity={st.o} />
      ))}
      {clouds.map((c, i) => (
        <image
          key={i}
          href={c.src}
          x={c.x}
          y={c.y}
          width={c.w}
          height={round(c.w * (1067 / 1600))}
          opacity={c.o}
          preserveAspectRatio="xMidYMid meet"
          transform={c.flip ? `translate(${round(2 * c.x + c.w)} 0) scale(-1 1)` : undefined}
        />
      ))}

      {second && <Flight f={second} id={`${id}-t2`} mirror={!mirror} />}
      <Flight f={main} id={`${id}-t1`} mirror={mirror} />

      {label && (
        <text x="48" y="586" fill="rgb(255 255 255 / 0.7)" fontFamily="var(--font-geist-sans), sans-serif" fontSize="26">
          {label}
        </text>
      )}
    </svg>
  );
}
