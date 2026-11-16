import type { CSSProperties, ReactNode } from "react";
import { PilotMarkP } from "@/components/logo";
import { BrandMark, type Brand } from "@/components/v4/logos";

/*
 * Sky-site marks for the compatibility, MCP, skills and publish pages: real brand marks on flat tiles, and a small
 * set of line icons (Nucleo's ui outline set on its 18px grid, 1.5px strokes) for the things that have no mark:
 * a laptop, a server, a firewall, a proxy, a lock. One tile style everywhere, so a diagram reads as one set.
 */

/* ---------------- Line icons ---------------- */

const ICONS = {
  // Nucleo ui · laptop
  laptop: (
    <>
      <path d="M4.25 14.75c-1.105 0-2-.895-2-2V4.75c0-1.105.895-2 2-2h9.5c1.105 0 2 .895 2 2v8c0 1.105-.895 2-2 2" />
      <path d="M.75 14.75h16.5" />
    </>
  ),
  // Nucleo ui · server
  server: (
    <>
      <rect x="1.75" y="2.75" width="14.5" height="5" rx="1.5" />
      <rect x="1.75" y="10.25" width="14.5" height="5" rx="1.5" />
      <circle cx="4.25" cy="5.25" r=".75" fill="currentColor" stroke="none" />
      <circle cx="6.75" cy="5.25" r=".75" fill="currentColor" stroke="none" />
      <circle cx="4.25" cy="12.75" r=".75" fill="currentColor" stroke="none" />
      <circle cx="6.75" cy="12.75" r=".75" fill="currentColor" stroke="none" />
    </>
  ),
  // Nucleo ui · cloud
  cloud: (
    <>
      <path d="M13.464 6.891c-.186-2.314-2.102-4.141-4.464-4.141-2.485 0-4.5 2.015-4.5 4.5 0 .35.049.686.124 1.013-1.597.067-2.874 1.374-2.874 2.987 0 1.657 1.343 3 3 3h7.75c2.071 0 3.75-1.679 3.75-3.75 0-1.736-1.185-3.182-2.786-3.609Z" />
      <path d="M9.705 8c.687-.767 1.684-1.25 2.795-1.25.333 0 .657.059.964.141" />
    </>
  ),
  // Nucleo ui · antenna (the beacon)
  antenna: (
    <>
      <circle cx="9" cy="7" r="2.25" />
      <path d="M4.581 2.581a6.25 6.25 0 0 0 0 8.838M13.419 11.419a6.25 6.25 0 0 0 0-8.838M9 9.25V15M12 15.25H6" />
    </>
  ),
  // Nucleo ui · shield-globe (a filtering network edge)
  firewall: (
    <>
      <path d="M15.25 5.688V4.48a.99.99 0 0 0-.695-.952L9.305 1.848a1 1 0 0 0-.61 0L3.445 3.528a.99.99 0 0 0-.695.952V11c0 1.619 1.337 2.861 2.774 3.73" />
      <circle cx="12.75" cy="12.75" r="4.5" />
      <ellipse cx="12.75" cy="12.75" rx="1.862" ry="4.5" />
      <path d="M8.25 12.75h9" />
    </>
  ),
  // Nucleo ui · terminal
  terminal: <path d="M2.75 14.25 8 9 2.75 3.75M9.5 14.25h5.75" />,
  // Nucleo ui · cube (a sandbox)
  cube: (
    <>
      <path d="M14.983 5.53 9 9 3.017 5.53M9 15.938V9" />
      <path d="M7.997 2.332 3.747 4.797a2 2 0 0 0-.997 1.73v4.946c0 .713.38 1.372.997 1.73l4.25 2.465c.621.36 1.386.36 2.007 0l4.25-2.465c.617-.358.997-1.017.997-1.73V6.527c0-.713-.38-1.372-.997-1.73l-4.25-2.465a2 2 0 0 0-2.007 0Z" />
    </>
  ),
  browser: (
    <>
      <rect x="1.75" y="2.75" width="14.5" height="12.5" rx="2" />
      <path d="M1.75 6.25h14.5" />
      <circle cx="4.25" cy="4.5" r=".6" fill="currentColor" stroke="none" />
      <circle cx="6.25" cy="4.5" r=".6" fill="currentColor" stroke="none" />
    </>
  ),
  lock: (
    <>
      <rect x="3.25" y="8.25" width="11.5" height="8" rx="2" />
      <path d="M5.75 8.25V5.5a3.25 3.25 0 0 1 6.5 0v2.75M9 11.5v1.5" />
    </>
  ),
  key: (
    <>
      <circle cx="5.75" cy="12.25" r="3.5" />
      <path d="M8.25 9.75 15.25 2.75M12.5 5.5l2 2M14 4l1.75 1.75" />
    </>
  ),
  shield: (
    <>
      <path d="M9 1.75 3.25 3.75v5c0 3.6 2.6 6.4 5.75 7.5 3.15-1.1 5.75-3.9 5.75-7.5v-5L9 1.75Z" />
      <path d="m6.5 9 1.75 1.75L11.75 7" />
    </>
  ),
  globe: (
    <>
      <circle cx="9" cy="9" r="7.25" />
      <ellipse cx="9" cy="9" rx="3" ry="7.25" />
      <path d="M1.75 9h14.5" />
    </>
  ),
  wifi: (
    <>
      <path d="M1.75 6.75a10.5 10.5 0 0 1 14.5 0M4.25 9.5a7 7 0 0 1 9.5 0M6.75 12.25a3.4 3.4 0 0 1 4.5 0" />
      <circle cx="9" cy="14.75" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  plane: <path d="M7.25 16.25 9 14.5l1.75 1.75M9 14.5V9.75l6.25 2.5v-1.5L9 6.75V3.5c0-.966-.25-1.75-.75-1.75S7.5 2.534 7.5 3.5v3.25L1.25 10.75v1.5L7.5 9.75v4.75" transform="translate(.75 0)" />,
  building: (
    <>
      <path d="M3.25 16.25V3.25c0-.828.672-1.5 1.5-1.5h5c.828 0 1.5.672 1.5 1.5v13M11.25 7.25h2.5c.552 0 1 .448 1 1v8M1.75 16.25h14.5" />
      <path d="M6 5h2M6 8h2M6 11h2" />
    </>
  ),
  proxy: (
    <>
      <rect x="5.75" y="3.75" width="6.5" height="10.5" rx="1.75" />
      <path d="M1.25 9h4.5M12.25 9h4.5M14.5 6.75 16.75 9l-2.25 2.25" />
    </>
  ),
  eye: (
    <>
      <path d="M1.75 9S4.5 3.75 9 3.75 16.25 9 16.25 9 13.5 14.25 9 14.25 1.75 9 1.75 9Z" />
      <circle cx="9" cy="9" r="2.25" />
    </>
  ),
  list: <path d="M6.75 4.75h8.5M6.75 9h8.5M6.75 13.25h8.5M3 4.75h.5M3 9h.5M3 13.25h.5" />,
  wall: (
    <>
      <rect x="1.75" y="2.75" width="14.5" height="12.5" rx="2" />
      <path d="M1.75 7h14.5M1.75 11h14.5M6.5 2.75V7M11.5 7v4M6.5 11v4.25" />
    </>
  ),
  timer: (
    <>
      <circle cx="9" cy="10" r="6.25" />
      <path d="M9 10V6.75M7 1.75h4" />
    </>
  ),
  mail: (
    <>
      <rect x="1.75" y="3.25" width="14.5" height="11.5" rx="2" />
      <path d="m2.25 4.75 6.75 5 6.75-5" />
    </>
  ),
  pen: <path d="M11.75 3.25l3 3-8.5 8.5-3.75.75.75-3.75 8.5-8.5ZM10.25 4.75l3 3" />,
  bag: (
    <>
      <path d="M3.25 6.25h11.5l-.75 9a1 1 0 0 1-1 .917H5a1 1 0 0 1-1-.917l-.75-9Z" />
      <path d="M6.25 8.25V4.75a2.75 2.75 0 0 1 5.5 0v3.5" />
    </>
  ),
  search: (
    <>
      <circle cx="7.75" cy="7.75" r="5" />
      <path d="m11.5 11.5 4.75 4.75" />
    </>
  ),
  chat: <path d="M9 2.25c4.004 0 7.25 2.574 7.25 5.75S13.004 13.75 9 13.75c-.69 0-1.357-.077-1.99-.22L3.25 15.75l.788-3.153C2.6 11.556 1.75 9.85 1.75 8c0-3.176 3.246-5.75 7.25-5.75Z" />,
  handshake: (
    <>
      <path d="m1.25 8.75 3-3 3 1 2-1.5 3.5 3.5a1.06 1.06 0 0 1-1.5 1.5L9 8.5" />
      <path d="M16.75 8.75l-3-3-2.25.75M4.25 9.75l3.25 3.25a1.06 1.06 0 0 0 1.5-1.5M7.25 11.75l1.5 1.5a1.06 1.06 0 0 0 1.5-1.5M9.75 11.25l.5.5a1.06 1.06 0 0 0 1.5-1.5" />
    </>
  ),
  broadcast: (
    <>
      <circle cx="9" cy="9" r="1.75" />
      <path d="M5.464 12.536a5 5 0 0 1 0-7.072M12.536 5.464a5 5 0 0 1 0 7.072M3.05 14.95a8.4 8.4 0 0 1 0-11.9M14.95 3.05a8.4 8.4 0 0 1 0 11.9" />
    </>
  ),
  book: (
    <>
      <path d="M2.75 14.25V3.75c0-.552.448-1 1-1h10.5v10.5H4.25a1.5 1.5 0 0 0 0 3h10" />
      <path d="M6.25 6.25h5M6.25 9h3" />
    </>
  ),
  plug: (
    <path d="M6.75 1.75v3.5M11.25 1.75v3.5M4.25 5.25h9.5v2.5a4.75 4.75 0 0 1-9.5 0v-2.5ZM9 12.5v3.75" />
  ),
  file: (
    <>
      <path d="M10.25 1.75H4.75a1.5 1.5 0 0 0-1.5 1.5v11.5a1.5 1.5 0 0 0 1.5 1.5h8.5a1.5 1.5 0 0 0 1.5-1.5V6.25l-4.5-4.5Z" />
      <path d="M10.25 1.75v4.5h4.5" />
    </>
  ),
  package: (
    <>
      <path d="M2.75 5.5 9 2.25l6.25 3.25v7L9 15.75 2.75 12.5v-7Z" />
      <path d="M2.75 5.5 9 8.75l6.25-3.25M9 8.75v7M5.75 3.9l6.25 3.25" />
    </>
  ),
  user: (
    <>
      <circle cx="9" cy="5.75" r="3" />
      <path d="M2.75 16c.6-3 3.2-4.75 6.25-4.75S14.65 13 15.25 16" />
    </>
  ),
  data: (
    <>
      <ellipse cx="9" cy="4.25" rx="6.25" ry="2.5" />
      <path d="M2.75 4.25v9.5c0 1.38 2.8 2.5 6.25 2.5s6.25-1.12 6.25-2.5v-9.5M2.75 9c0 1.38 2.8 2.5 6.25 2.5s6.25-1.12 6.25-2.5" />
    </>
  ),
  bolt: <path d="M10.25 1.75 3.75 10h5l-1 6.25L14.25 8h-5l1-6.25Z" />,
  radar: (
    <>
      <circle cx="9" cy="9" r="7.25" />
      <circle cx="9" cy="9" r="3.75" />
      <path d="M9 9l4.75-4.75" />
    </>
  ),
  gear: (
    <>
      <circle cx="9" cy="9" r="2.25" />
      <path d="M9 1.75v1.5M9 14.75v1.5M16.25 9h-1.5M3.25 9h-1.5M14.127 3.873l-1.06 1.06M4.933 13.067l-1.06 1.06M14.127 14.127l-1.06-1.06M4.933 4.933l-1.06-1.06" />
      <circle cx="9" cy="9" r="5" />
    </>
  ),
  link: <path d="M7.5 10.5a3 3 0 0 0 4.243 0l2.5-2.5a3 3 0 0 0-4.243-4.243l-.75.75M10.5 7.5a3 3 0 0 0-4.243 0l-2.5 2.5a3 3 0 0 0 4.243 4.243l.75-.75" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

/** A line icon on the 18px grid; size it with `className`. */
export function LineIcon({ name, className = "size-[18px]", strokeWidth = 1.5 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 18 18"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}

/* ---------------- Brand colours ---------------- */

/**
 * The colour each mark is drawn in on a tile (the brands' own, from Simple Icons' data). Marks that are black, or
 * too dark to read at night, have none and follow the text colour.
 */
const TINT: Partial<Record<Brand, string>> = {
  digitalocean: "#0080ff",
  heroku: "#6762a6",
  coolify: "#6b16ed",
  caprover: "#ed5b26",
  awslambda: "#ff9900",
  googlecloud: "#4285f4",
  netlify: "#05bdba",
  cloudflare: "#f38020",
  azure: "#0078d4",
  hetzner: "#d50c2d",
  linode: "#00a95c",
  kubernetes: "#326ce5",
  k3s: "#f2b800",
  openshift: "#ee0000",
  replit: "#f26207",
  gitpod: "#ff8a00",
  windows: "#0078d4",
  tmux: "#1bb91f",
  webassembly: "#654ff0",
  docker: "#2496ed",
  nginx: "#009639",
  fortinet: "#ee3124",
  paloalto: "#f04e23",
  discord: "#5865f2",
  go: "#00add8",
  debian: "#a81d33",
  amazons3: "#569a31",
};

/** A brand's mark in its own colour (or the text colour when it has none). */
export function TintedMark({ brand, className = "size-[18px]" }: { brand: Brand; className?: string }) {
  const tint = TINT[brand];
  return (
    <span className="flex text-fg" style={tint ? ({ color: tint } as CSSProperties) : undefined}>
      <BrandMark brand={brand} className={className} />
    </span>
  );
}

/* ---------------- Tiles ---------------- */

type TileSize = "sm" | "md" | "lg" | "xl";
const BOX: Record<TileSize, { box: string; mark: string; icon: string }> = {
  sm: { box: "size-7 rounded-[8px]", mark: "size-[15px]", icon: "size-[15px]" },
  md: { box: "size-9 rounded-[10px]", mark: "size-[19px]", icon: "size-[18px]" },
  lg: { box: "size-11 rounded-[12px]", mark: "size-[23px]", icon: "size-[21px]" },
  xl: { box: "size-14 rounded-[15px]", mark: "size-[29px]", icon: "size-[26px]" },
};

/**
 * One flat tile: white with a hairline edge (lifted charcoal at night), holding a brand mark, a line icon or the
 * Pilot P. `tone="pilot"` is the solid sky tile with the P; `off` greys it out (a platform where nothing runs).
 */
export function Tile({
  brand,
  icon,
  pilot = false,
  size = "md",
  off = false,
  accent = false,
  className = "",
  children,
}: {
  brand?: Brand;
  icon?: IconName;
  pilot?: boolean;
  size?: TileSize;
  off?: boolean;
  /** The icon in sky blue on a sky tint, for Pilot's own pieces. */
  accent?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const s = BOX[size];
  if (pilot)
    return (
      <span aria-hidden className={`grid shrink-0 place-items-center bg-(--sky-fill) text-white ${s.box} ${className}`}>
        <PilotMarkP className="h-[44%] w-auto" />
        {children}
      </span>
    );
  return (
    <span
      aria-hidden
      className={`relative grid shrink-0 place-items-center ring-1 ring-inset ${
        accent ? "bg-(--sky-tint) text-(--sky-accent) ring-(--sky-fill)/15" : "bg-card text-soft ring-(--sky-card-line) dark:bg-[color-mix(in_srgb,#fff_5%,var(--color-card))]"
      } ${off ? "opacity-55 grayscale" : ""} ${s.box} ${className}`}
    >
      {brand ? <TintedMark brand={brand} className={s.mark} /> : icon ? <LineIcon name={icon} className={s.icon} /> : null}
      {children}
    </span>
  );
}

/** Two or three marks for a row that names several vendors, overlapped like a stack of app icons. */
export function TileStack({ brands, size = "md", off = false }: { brands: Brand[]; size?: TileSize; off?: boolean }) {
  if (brands.length === 1) return <Tile brand={brands[0]} size={size} off={off} />;
  return (
    <span aria-hidden className="flex shrink-0">
      {brands.map((b, i) => (
        <Tile
          key={b}
          brand={b}
          size={size}
          off={off}
          className={`${i ? (size === "sm" ? "-ml-2" : "-ml-2.5") : ""} shadow-[0_0_0_2px_var(--color-card)]`}
        />
      ))}
    </span>
  );
}
