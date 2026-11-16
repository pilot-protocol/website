"use client";

import { Fragment, useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { LogoMark } from "@/components/logo";
import { HatchPanel, SKY_CARD, Segmented } from "@/components/sky/kit";
import { Reveal, TextLink } from "@/components/ui";
import { useInView, usePrefersReducedMotion } from "@/lib/hooks";
import { LINKS } from "@/lib/site";
import { DataGlyph, type DataKind } from "./glyphs";
import "./live.css";

/*
 * Live data (Figma 227:2155): "ask anything live", on the hatched showcase panel. Four real questions as tabs
 * over one ask bar. Picking one types it in, shows how your agent gets the answer (pilot-mom's recorded plan for
 * Paris; the direct call for the others), then the live answer arrives on the deep-blue card. The figures load
 * in the browser from the public sources these agents serve: Open-Meteo, Coinbase, the USGS and Where the ISS At.
 */

/* ---------------- Fetching ---------------- */

async function getJSON<T>(url: string): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) return (await res.json()) as T;
    } catch {
      // Network error: retry once, then give up.
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 1200));
  }
  throw new Error(`Could not load ${url}`);
}

type Source<T> = { data: T | null; status: "loading" | "ok" | "fail"; at: number };

/** Loads once `enabled`, then every `every` ms while that's set. Keeps the last good answer if a refresh fails. */
function useSource<T>(load: () => Promise<T>, enabled: boolean, every = 0): [Source<T>, () => void] {
  const [state, setState] = useState<Source<T>>({ data: null, status: "loading", at: 0 });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const run = () =>
      load().then(
        (data) => alive && setState({ data, status: "ok", at: Date.now() }),
        () => alive && setState((s) => (s.data ? s : { data: null, status: "fail", at: 0 })),
      );
    run();
    const id = every ? window.setInterval(run, every) : 0;
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [enabled, every, load, attempt]);
  const retry = useCallback(() => {
    setState({ data: null, status: "loading", at: 0 });
    setAttempt((n) => n + 1);
  }, []);
  return [state, retry];
}

/** A clock for "12 min ago". */
function useNow(every = 30_000) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, every);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [every]);
  return now;
}

const clock = (t: number) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function since(now: number, t: number) {
  const m = Math.max(0, Math.round((now - t) / 60_000));
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return `${h} hour${h === 1 ? "" : "s"} ago`;
}

/* ---------------- Sources ---------------- */

type Forecast = { date: string; code: number; max: number; min: number; rain: number; chance: number | null; wind: number; hourly: number[] };

function tomorrowInParis() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
  const day = new Date(`${today}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() + 1);
  return day.toISOString().slice(0, 10);
}

/* The same place, timezone and fields as pilot-mom's plan. */
async function loadForecast(): Promise<Forecast> {
  const day = tomorrowInParis();
  const query = new URLSearchParams({
    latitude: "48.8566",
    longitude: "2.3522",
    timezone: "Europe/Paris",
    start_date: day,
    end_date: day,
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",
    hourly: "temperature_2m",
  });
  const data = await getJSON<{ daily?: Record<string, (number | string | null)[]>; hourly?: { temperature_2m?: (number | null)[] } }>(
    `https://api.open-meteo.com/v1/forecast?${query}`,
  );
  const pick = (key: string) => data.daily?.[key]?.[0];
  const hourly = (data.hourly?.temperature_2m ?? []).filter((t): t is number => typeof t === "number");
  if (typeof pick("temperature_2m_max") !== "number" || hourly.length < 12) throw new Error("open-meteo: incomplete");
  return {
    date: String(pick("time") ?? day),
    code: Number(pick("weather_code") ?? 0),
    max: Number(pick("temperature_2m_max")),
    min: Number(pick("temperature_2m_min")),
    rain: Number(pick("precipitation_sum") ?? 0),
    chance: typeof pick("precipitation_probability_max") === "number" ? Number(pick("precipitation_probability_max")) : null,
    wind: Number(pick("wind_speed_10m_max") ?? 0),
    hourly,
  };
}

type Btc = { price: number; open: number | null; high: number | null; low: number | null; volume: number | null; closes: number[] };

/* coinbase-spot-price serves api.coinbase.com's spot price; the day's range and line come from Coinbase Exchange. */
async function loadBtc(): Promise<Btc> {
  const [spot, stats, candles] = await Promise.allSettled([
    getJSON<{ data: { amount: string } }>("https://api.coinbase.com/v2/prices/BTC-USD/spot"),
    getJSON<{ open: string; high: string; low: string; volume: string }>("https://api.exchange.coinbase.com/products/BTC-USD/stats"),
    // [time, low, high, open, close, volume], newest first.
    getJSON<number[][]>("https://api.exchange.coinbase.com/products/BTC-USD/candles?granularity=3600"),
  ]);
  if (spot.status !== "fulfilled") throw new Error("coinbase: no spot price");
  const s = stats.status === "fulfilled" ? stats.value : null;
  return {
    price: Number(spot.value.data.amount),
    open: s ? Number(s.open) : null,
    high: s ? Number(s.high) : null,
    low: s ? Number(s.low) : null,
    volume: s ? Number(s.volume) : null,
    closes: candles.status === "fulfilled" ? candles.value.slice(0, 24).map((c) => c[4]).reverse() : [],
  };
}

type Quake = { properties: { mag: number; place: string; time: number }; geometry: { coordinates: [number, number, number] } };
type Quakes = { metadata: { count: number }; features: Quake[] };
const loadQuakes = () => getJSON<Quakes>("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson");

type IssPoint = { latitude: number; longitude: number; altitude: number; velocity: number; visibility: string };
type Iss = { now: IssPoint; track: IssPoint[] };

/* Where it is now, and its ground track: ten positions 10 minutes apart, from 50 minutes ago to 40 ahead. */
async function loadIss(): Promise<Iss> {
  const t = Math.floor(Date.now() / 1000);
  const stamps = Array.from({ length: 10 }, (_, i) => t - 3000 + i * 600).join(",");
  const [now, track] = await Promise.allSettled([
    getJSON<IssPoint>("https://api.wheretheiss.at/v1/satellites/25544"),
    getJSON<IssPoint[]>(`https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${stamps}`),
  ]);
  if (now.status !== "fulfilled") throw new Error("wheretheiss: no position");
  return { now: now.value, track: track.status === "fulfilled" ? track.value : [] };
}

/* ---------------- The questions ---------------- */

type Ask = {
  /** The tab that picks it, and the shorter label it has on phones. */
  tab: string;
  short: string;
  /** What gets typed into the ask bar. */
  ask: string;
  host: string;
  /** Its glyph, the same one the agent has in the other sections. */
  kind: DataKind;
  /** The upstream the agent serves, as named in the failure state ("Couldn't reach …"). */
  source: string;
  /** The same, short, for the card's live tag. */
  tag: string;
  /** The /data body your agent sends; null for Paris, where the card shows pilot-mom's recorded plan instead. */
  call: string | null;
};

const ASKS: Ask[] = [
  { tab: "Paris weather tomorrow", short: "Paris weather", ask: "Weather in Paris tomorrow", host: "open-meteo-forecast", kind: "weather", source: "Open-Meteo", tag: "Open-Meteo", call: null },
  {
    tab: "Bitcoin price right now",
    short: "Bitcoin price",
    ask: "Bitcoin price right now",
    host: "coinbase-spot-price",
    kind: "price",
    source: "Coinbase",
    tag: "Coinbase",
    call: `/data {"currency_pair":"BTC-USD"}`,
  },
  { tab: "Latest earthquakes", short: "Earthquakes", ask: "Latest earthquakes", host: "usgs-earthquakes", kind: "quake", source: "the USGS", tag: "USGS", call: "/data" },
  { tab: "Where is the ISS?", short: "Where is the ISS?", ask: "Where is the ISS?", host: "iss-position", kind: "space", source: "Where the ISS At", tag: "Where the ISS At", call: "/data" },
];

/* pilot-mom's real reply to "weather in Paris tomorrow" (October 2026); the dates are left out. */
const MOM_FILTERS: [string, string][] = [
  ["latitude", "48.8566"],
  ["longitude", "2.3522"],
  ["timezone", "Europe/Paris"],
  ["daily", "temperature_2m_max,…"],
];

/* ---------------- Drawing helpers ---------------- */

/** Catmull-Rom through the points, as cubic Béziers. */
function smoothPath(points: [number, number][]) {
  return points.reduce((d, [x, y], i, p) => {
    if (i === 0) return `M${x.toFixed(2)} ${y.toFixed(2)}`;
    const [x0, y0] = p[i - 2] ?? p[i - 1];
    const [x1, y1] = p[i - 1];
    const [x3, y3] = p[i + 1] ?? [x, y];
    const c1 = [x1 + (x - x0) / 6, y1 + (y - y0) / 6];
    const c2 = [x - (x3 - x1) / 6, y - (y3 - y1) / 6];
    return `${d} C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }, "");
}

/** A series laid out in a 100×100 box: `top` and `bottom` are where the highest and lowest values land (in %). */
function layout(values: number[], lo: number, hi: number, top = 0, bottom = 100): [number, number][] {
  const span = Math.max(hi - lo, 1e-9);
  return values.map((v, i) => [(i / Math.max(values.length - 1, 1)) * 100, top + ((hi - v) / span) * (bottom - top)]);
}

const pct = ([x, y]: [number, number]): CSSProperties => ({ left: `${x}%`, top: `${y}%` });

/* Inside a card the answer settles in order once it's the one on show. */
const settle =
  "transition-[opacity,transform,filter] duration-500 ease-(--ease-out) data-[on=false]:translate-y-1.5 data-[on=false]:opacity-0 data-[on=false]:blur-[3px] data-[on=false]:duration-150 motion-reduce:transition-opacity motion-reduce:data-[on=false]:translate-y-0 motion-reduce:data-[on=false]:blur-none";
/* Chart labels and markers only fade (they're positioned with translate, which the settle would fight). */
const fade =
  "transition-opacity duration-500 ease-(--ease-out) data-[on=false]:opacity-0 data-[on=false]:duration-150 motion-reduce:transition-none";
const after = (ms: number) => ({ transitionDelay: `${ms}ms` });

/**
 * A curve over a soft fill, stretched over its parent, that draws itself when `on`. The path has pathLength=1 and a
 * non-scaling stroke, so a dash of 2 covers it as long as the box only ever shrinks: it's drawn 1000 units square.
 */
function Curve({ pts, on }: { pts: [number, number][]; on: boolean }) {
  const id = `lived-fill-${useId().replace(/[^\w-]/g, "")}`;
  const d = smoothPath(pts.map(([x, y]) => [x * 10, y * 10]));
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden className="absolute inset-0 size-full overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.2} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`${d} L1000 1000 L0 1000 Z`}
        fill={`url(#${id})`}
        data-on={on}
        className="transition-opacity delay-700 duration-700 ease-(--ease-out) data-[on=false]:opacity-0 data-[on=false]:delay-0 data-[on=false]:duration-150"
      />
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke="#ffffff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="[stroke-dasharray:2] data-[on=true]:animate-[lived-draw_1.4s_var(--ease-out)_200ms_both] motion-reduce:animate-none!"
        data-on={on}
        style={{ strokeDashoffset: on ? undefined : 2 }}
      />
    </svg>
  );
}

/* Natural Earth 110m land, rasterised to 96×40 cells from 84°N to 60°S (equirectangular). From variant B. */
const MAP_ROWS = [
  "0000007e3e00000000000000", "00002977ffe0180000100000", "000037e0ffe0000101fc0700", "0001f6f83fc000022fffff00",
  "8fffbb563e000fe7ffffffff", "07ffff4e38301ffffffffffe", "0e7ffe1808007bffffffff9c", "000fff0f000233fffffff830",
  "0003ffdf80053ffffffffc20", "0003fffc0000fffffffff800", "0001fffe0000ff3bfffff800", "0001fff80003b61bffffe400",
  "0001fff000070dfbfffe4400", "0000fff00002e03fffff1800", "00007fc00007f67fffff0000", "00003c200007fffbffff0000",
  "00001c00000fffbc3fff0000", "00000c90001fffff1e7c0000", "00000700000fffde0c708000", "000000c0000fffe808388000",
  "0000004c000ffffc08080000", "0000001f8007fff804000000", "0000001fc0001ff000320000", "0000001fe0003fe000161000",
  "0000003ffc001fe000108e80", "0000001ffe001fc000060400", "0000001ffc000fe000000000", "0000000ffc001fe000007208",
  "00000007f8001fc80000fe00", "00000007f8000f880001ff08", "00000007e0000f800003ff80", "00000007e0000f000001ff80",
  "00000007c000060000018f00", "000000078000000000000702", "0000000e0000000000000000", "000000060000000000000004",
  "0000000c0000000000000000", "0000000c0000000000000000", "000000060000000000000000", "000000000000000000000000",
];
const COLS = 96;
const CELL = 10;
const MAP_W = COLS * CELL;
const MAP_H = MAP_ROWS.length * CELL;
const TOP = 84;
const BOTTOM = -60;

const { land: LAND_PATH, sea: SEA_PATH } = (() => {
  let land = "";
  let sea = "";
  MAP_ROWS.forEach((hex, r) => {
    const bits = BigInt(`0x${hex}`).toString(2).padStart(COLS, "0");
    for (let c = 0; c < COLS; c++) {
      const dot = `M${c * CELL + CELL / 2} ${r * CELL + CELL / 2}h0`;
      if (bits[c] === "1") land += dot;
      else sea += dot;
    }
  });
  return { land, sea };
})();

const project = (lat: number, lon: number): [number, number] => [((lon + 180) / 360) * MAP_W, ((TOP - lat) / (TOP - BOTTOM)) * MAP_H];

function WorldDots({ children }: { children?: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block h-auto w-full overflow-visible" aria-hidden>
      <path d={SEA_PATH} className="text-white/[0.08]" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <path d={LAND_PATH} className="text-white/[0.32]" stroke="currentColor" strokeWidth={4.6} strokeLinecap="round" />
      {children}
    </svg>
  );
}

/**
 * A ground track as one unbroken line: each point is moved a whole map-width east or west where the track crosses
 * the antimeridian, then the lot is shifted so point `at` sits as close as it can to `x`.
 */
function unwrapTrack(points: [number, number][], at: number, x: number): [number, number][] {
  const out = points.map(([px, py]): [number, number] => [px, py]);
  const near = (v: number, to: number) => v + Math.round((to - v) / MAP_W) * MAP_W;
  for (let i = at + 1; i < out.length; i++) out[i][0] = near(out[i][0], out[i - 1][0]);
  for (let i = at - 1; i >= 0; i--) out[i][0] = near(out[i][0], out[i + 1][0]);
  const shift = out[at] ? near(out[at][0], x) - out[at][0] : 0;
  return out.map(([px, py]) => [px + shift, py]);
}

/* ---------------- The answer card ---------------- */

/*
 * All four answers share one build, so they read as one family: the agent that answered on a strip across the top,
 * then what was asked about (and its glyph), the headline figure, the picture (a chart or a map, set into a slightly
 * sunken well) and three details, or the latest few for the earthquakes.
 */

/** The deep-blue card every answer arrives in. */
function AnswerCard<T>({
  ask,
  label,
  src,
  retry,
  children,
}: {
  ask: Ask;
  label: string;
  src: Source<T>;
  retry: () => void;
  children: (data: T) => ReactNode;
}) {
  const { host, kind, source, tag } = ask;
  return (
    <figure aria-label={label} className="lived-card flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] text-white">
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 text-[12px] leading-4 sm:h-[52px] sm:px-6">
        <span className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-[7px] bg-white text-(--sky-deep)">
            <DataGlyph kind={kind} className="size-3.5" />
          </span>
          <span className="truncate font-mono text-[12.5px] text-white/85">{host}</span>
        </span>
        {src.status === "ok" && (
          <span className="flex shrink-0 items-center gap-1.5 text-white/70" title={`Fetched at ${clock(src.at)}`}>
            <span aria-hidden className="relative inline-flex size-1.5">
              <span className="absolute inset-0 rounded-full bg-white motion-safe:animate-[live-ping_2s_var(--ease-out)_infinite]" />
              <span className="relative size-1.5 rounded-full bg-white" />
            </span>
            <span>
              Live<span className="max-sm:hidden"> · {tag}</span>
            </span>
          </span>
        )}
      </div>
      {src.data ? (
        <div className="flex flex-1 flex-col p-4 pt-5 sm:p-6">{children(src.data)}</div>
      ) : src.status === "fail" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-[15px] leading-5 text-white/80">Couldn&apos;t reach {source} just now.</p>
          <button
            type="button"
            onClick={retry}
            className="pressable inline-flex h-9 shrink-0 items-center rounded-[10px] bg-white px-3.5 text-[13px] font-medium text-(--sky-deep) hover:bg-white/90"
          >
            Try again
          </button>
        </div>
      ) : (
        <div aria-hidden className="flex flex-1 flex-col p-4 pt-5 sm:p-6">
          <span className="lived-shimmer h-11 w-40 rounded-[10px]" />
          <span className="lived-shimmer mt-5 h-16 w-52 rounded-[12px]" />
          <span className="lived-shimmer mt-6 min-h-40 flex-1 rounded-[14px]" />
          <span className="mt-2.5 grid grid-cols-3 gap-2">
            <span className="lived-shimmer h-[68px] rounded-[12px]" />
            <span className="lived-shimmer h-[68px] rounded-[12px]" />
            <span className="lived-shimmer h-[68px] rounded-[12px]" />
          </span>
        </div>
      )}
    </figure>
  );
}

/** What the answer is about, and when; its glyph on the right. */
function Subject({ title, sub, glyph }: { title: string; sub: ReactNode; glyph: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[18px] leading-6 font-medium tracking-[-0.02em] sm:text-[19px]">{title}</p>
        <p className="mt-0.5 text-[13px] leading-5 text-white/65 sm:text-[13.5px]">{sub}</p>
      </div>
      <div aria-hidden className="-mt-1 -mr-1 shrink-0">
        {glyph}
      </div>
    </div>
  );
}

/** The headline figure, with what it means beside it (below it when there's no room). */
function Headline({ value, size = "text-[clamp(60px,15vw,80px)]", on, children }: { value: ReactNode; size?: string; on: boolean; children: ReactNode }) {
  return (
    <div data-on={on} style={after(120)} className={`mt-3 flex flex-wrap items-end gap-x-4 gap-y-3 sm:mt-4 ${settle}`}>
      <p className={`${size} leading-[0.8] font-medium tracking-[-0.055em]`}>{value}</p>
      <div className="min-w-[84px] flex-1 basis-0 pb-px">{children}</div>
    </div>
  );
}

/** The two lines beside a headline figure. */
function Gloss({ top, bottom }: { top: ReactNode; bottom: ReactNode }) {
  return (
    <>
      <p className="text-[15px] leading-5 font-medium">{top}</p>
      <p className="truncate text-[13px] leading-5 text-white/65">{bottom}</p>
    </>
  );
}

/** The sunken well a chart or map sits in. Grows to take the card's spare height. */
function Well({ on, delay, className = "", children }: { on: boolean; delay: number; className?: string; children: ReactNode }) {
  return (
    <div data-on={on} style={after(delay)} className={`lived-well mt-5 flex min-h-[176px] flex-1 flex-col sm:mt-6 sm:min-h-[196px] ${settle} ${className}`}>
      {children}
    </div>
  );
}

type Detail = { icon: IconName; label: string; value: ReactNode };

/** A unit after a figure, a step smaller and quieter. */
const unit = (n: ReactNode, u: string) => (
  <>
    {n}
    <span className="ml-[0.25em] text-[0.82em] font-normal text-white/70">{u}</span>
  </>
);

/** Three details in small tiles. */
function Details({ items, on, delay }: { items: Detail[]; on: boolean; delay: number }) {
  return (
    <dl className="mt-2 grid grid-cols-3 gap-2 sm:mt-2.5 sm:gap-2.5">
      {items.map(({ icon, label, value }, i) => (
        <div key={label} data-on={on} style={after(delay + i * 70)} className={`lived-tile min-w-0 px-2.5 py-2.5 sm:px-3.5 sm:py-3 ${settle}`}>
          <dt className="flex items-center gap-1.5 text-[12px] leading-4 text-white/65 sm:text-[12.5px]">
            <Icon name={icon} className="size-3.5 shrink-0 text-white/55 max-[420px]:hidden" />
            {label}
          </dt>
          <dd className="mt-1.5 truncate text-[15px] leading-5 font-medium tracking-[-0.01em] sm:text-[17px] sm:leading-6">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------------- Glyphs and icons ---------------- */

type IconName = "drop" | "umbrella" | "wind" | "clock" | "trend" | "bars" | "lat" | "lon" | "up";

/* 16px line icons for the detail tiles. */
const ICONS: Record<IconName, ReactNode> = {
  drop: <path d="M8 2.25c2.4 2.9 3.85 5 3.85 6.95a3.85 3.85 0 0 1-7.7 0C4.15 7.25 5.6 5.15 8 2.25Z" />,
  umbrella: <path d="M2.25 8.25a5.75 5.75 0 0 1 11.5 0H2.25ZM8 8.25v4.5a1.4 1.4 0 0 0 2.8 0M8 2.5v-.75" />,
  wind: <path d="M2 6.25h7.75a1.9 1.9 0 1 0-1.9-1.9M2 9.25h10a1.9 1.9 0 1 1-1.9 1.9M2 12.25h4" />,
  clock: (
    <>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 4.9V8l2.1 1.3" />
    </>
  ),
  trend: <path d="M2.25 5.25 6 9l2.5-2.5 5.25 5.25M10 11.75h3.75V8" />,
  bars: <path d="M3.5 13.25v-4M6.5 13.25v-8M9.5 13.25v-5.5M12.5 13.25v-9.5" />,
  lat: (
    <>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M2.25 8h11.5M3.4 5h9.2M3.4 11h9.2" />
    </>
  ),
  lon: (
    <>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 2.25c-2.2 1.9-2.2 9.6 0 11.5M8 2.25c2.2 1.9 2.2 9.6 0 11.5" />
    </>
  ),
  up: <path d="M8 13V3.25M4.75 6.5 8 3.25l3.25 3.25M3 13.25h10" />,
};

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

/* WMO weather codes, as Open-Meteo reports them. */
function describe(code: number): { label: string; kind: "sun" | "partly" | "cloud" | "fog" | "rain" | "snow" | "storm" } {
  if (code === 0) return { label: "Clear sky", kind: "sun" };
  if (code === 1) return { label: "Mainly clear", kind: "partly" };
  if (code === 2) return { label: "Partly cloudy", kind: "partly" };
  if (code === 3) return { label: "Overcast", kind: "cloud" };
  if (code === 45 || code === 48) return { label: "Fog", kind: "fog" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", kind: "rain" };
  if (code >= 61 && code <= 67) return { label: "Rain", kind: "rain" };
  if (code >= 71 && code <= 77) return { label: "Snow", kind: "snow" };
  if (code >= 80 && code <= 82) return { label: "Rain showers", kind: "rain" };
  if (code === 85 || code === 86) return { label: "Snow showers", kind: "snow" };
  if (code >= 95) return { label: "Thunderstorm", kind: "storm" };
  return { label: "Cloudy", kind: "cloud" };
}

const SUN = "#ffc94a";
const RAIN = "#a9d4ff";
const CLOUD = "M14.5 37h20a6.75 6.75 0 0 0 .9-13.44 10.25 10.25 0 0 0-19.6-2.36A8 8 0 0 0 14.5 37Z";

/** The condition, drawn filled: a warm sun, white clouds (a paler one behind when it's overcast), pale blue rain. */
function WeatherGlyph({ code, className = "" }: { code: number; className?: string }) {
  const { kind } = describe(code);
  const sun = (cx: number, cy: number, r: number, ray: number) => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={SUN} />
      <g stroke={SUN} strokeWidth={2.4} strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          const r1 = r + 3.5;
          const r2 = r + 3.5 + ray;
          return <path key={i} d={`M${(cx + r1 * Math.cos(a)).toFixed(2)} ${(cy + r1 * Math.sin(a)).toFixed(2)}L${(cx + r2 * Math.cos(a)).toFixed(2)} ${(cy + r2 * Math.sin(a)).toFixed(2)}`} />;
        })}
      </g>
    </g>
  );
  const lift = kind === "rain" || kind === "snow" || kind === "storm" || kind === "fog" ? -6 : 0;
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={`lived-glyph ${className}`}>
      {kind === "sun" && sun(24, 24, 8.5, 4.5)}
      {kind === "partly" && sun(17, 17, 6.5, 3.5)}
      {kind === "cloud" && <path d={CLOUD} transform="translate(12.5 -6) scale(0.78)" fill="#ffffff" fillOpacity={0.5} />}
      {kind !== "sun" && <path d={CLOUD} transform={kind === "partly" ? "translate(4 3)" : `translate(0 ${lift})`} fill="#ffffff" />}
      {kind === "rain" && <path d="M18 36.5l-2 5.5M25 36.5l-2 5.5M32 36.5l-2 5.5" stroke={RAIN} strokeWidth={2.6} strokeLinecap="round" />}
      {kind === "snow" && (
        <g fill="#ffffff">
          <circle cx="17" cy="38.5" r="2" />
          <circle cx="24" cy="42.5" r="2" />
          <circle cx="31" cy="38.5" r="2" />
        </g>
      )}
      {kind === "storm" && <path d="M25.5 30 19 39.5h5.5L21.5 47l9-11h-5.5l2.5-6Z" fill={SUN} />}
      {kind === "fog" && <path d="M12 37h24M16 42.5h18" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={2.6} strokeLinecap="round" />}
    </svg>
  );
}

/** Bitcoin's orange coin. */
function CoinGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="lived-glyph size-11 sm:size-12">
      <circle cx="24" cy="24" r="19" fill="#f7931a" />
      <g transform="rotate(14 24 24) translate(-1.5 0)" fill="none" stroke="#ffffff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.5 15.5v17M19.5 15.5h6a4 4 0 0 1 0 8h-6M19.5 23.5h7a4.5 4.5 0 0 1 0 9h-7M22 13v2.5M25.5 13v2.5M22 32.5V35M25.5 32.5V35" />
      </g>
    </svg>
  );
}

/** An epicentre: a point with two rings spreading from it. */
function QuakeGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="lived-glyph size-11 sm:size-12">
      <circle cx="24" cy="24" r="19" fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={2.4} />
      <circle cx="24" cy="24" r="11.5" fill="none" stroke="#ffffff" strokeOpacity={0.65} strokeWidth={2.4} />
      <circle cx="24" cy="24" r="5" fill="#ffffff" />
    </svg>
  );
}

/** The station: a truss, four solar wings and the modules in the middle. */
function StationGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="lived-glyph size-11 sm:size-12">
      <path d="M4 24h40M12 21.5v5M36 21.5v5" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" />
      <g fill="#ffffff" fillOpacity={0.88}>
        <rect x="7" y="9" width="10" height="12" rx="1.5" />
        <rect x="7" y="27" width="10" height="12" rx="1.5" />
        <rect x="31" y="9" width="10" height="12" rx="1.5" />
        <rect x="31" y="27" width="10" height="12" rx="1.5" />
      </g>
      <path d="M7 15h10M7 33h10M31 15h10M31 33h10" stroke="var(--sky-deep)" strokeOpacity={0.55} strokeWidth={1.2} />
      <rect x="19.5" y="17" width="9" height="14" rx="3" fill="#ffffff" />
    </svg>
  );
}

/* ---------------- The four answers ---------------- */

const hourName = (h: number) => (h === 0 || h === 24 ? "12 am" : h === 12 ? "Noon" : h < 12 ? `${h} am` : `${h - 12} pm`);

/**
 * Tomorrow's temperature, hour by hour. Every third hour is labelled on wider cards (every sixth on phones) and the
 * day's peak gets its own marker, so the labels beside it step aside.
 */
function HourlyChart({ temps, on }: { temps: number[]; on: boolean }) {
  const hi = Math.max(...temps);
  const lo = Math.min(...temps);
  const peak = temps.indexOf(hi);
  const pts = layout(temps, lo, Math.max(hi, lo + 1), 6, 80);
  const ticks = Array.from({ length: Math.ceil(temps.length / 3) }, (_, k) => k * 3).flatMap((h) => {
    const wide = Math.abs(h - peak) >= 2;
    const narrow = h % 6 === 0 && Math.abs(h - peak) >= 4;
    if (!wide && !narrow) return [];
    return [{ h, cls: wide && narrow ? "" : wide ? "max-sm:hidden" : "sm:hidden" }];
  });
  return (
    <>
      <div className="relative min-h-[120px] flex-1">
        <div className="absolute inset-x-0 top-9 bottom-0">
          {ticks.map(({ h, cls }) => (
            <span key={h} aria-hidden className={`absolute inset-y-0 w-px bg-white/[0.07] ${cls}`} style={{ left: `${pts[h][0]}%` }} />
          ))}
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/15" />
          <Curve pts={pts} on={on} />
          <span
            aria-hidden
            data-on={on}
            style={{ ...pct(pts[peak]), ...after(1300) }}
            className={`absolute bottom-0 w-px -translate-x-1/2 bg-white/45 ${fade}`}
          />
          {ticks.map(({ h, cls }) => (
            <span key={h} data-on={on} style={{ ...pct(pts[h]), ...after(1100 + h * 20) }} className={`absolute ${cls} ${fade}`}>
              <span className="absolute size-[5px] -translate-1/2 rounded-full bg-white/80" />
              <span className="absolute bottom-[7px] left-0 -translate-x-1/2 text-[12px] leading-4 font-medium text-white/80">
                {Math.round(temps[h])}°
              </span>
            </span>
          ))}
          <span data-on={on} style={{ ...pct(pts[peak]), ...after(1350) }} className={`absolute ${fade}`}>
            <span className="lived-pin absolute size-[11px] -translate-1/2 rounded-full bg-white" />
            <span className="absolute bottom-[11px] left-0 -translate-x-1/2 rounded-full bg-white px-[7px] text-[12.5px] leading-[20px] font-semibold text-(--sky-deep)">
              {Math.round(hi)}°
            </span>
          </span>
        </div>
      </div>
      <div aria-hidden className="relative mt-2 h-4 text-[11.5px] leading-4 text-white/55">
        {ticks.map(({ h, cls }) => (
          <span key={h} className={`absolute whitespace-nowrap ${h === 0 ? "" : "-translate-x-1/2"} ${cls}`} style={{ left: `${pts[h][0]}%` }}>
            {hourName(h)}
          </span>
        ))}
        <span className="absolute -translate-x-1/2 font-medium whitespace-nowrap text-white" style={{ left: `${pts[peak][0]}%` }}>
          {hourName(peak)}
        </span>
      </div>
    </>
  );
}

function WeatherAnswer({ f, on }: { f: Forecast; on: boolean }) {
  const { label } = describe(f.code);
  const day = new Date(`${f.date}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" });
  return (
    <>
      <Subject title="Paris" sub={`Tomorrow · ${day}`} glyph={<WeatherGlyph code={f.code} className="size-[58px] sm:size-16" />} />
      <Headline value={`${Math.round(f.max)}°`} on={on}>
        <Gloss top={label} bottom={`High ${Math.round(f.max)}° · Low ${Math.round(f.min)}°`} />
      </Headline>
      <Well on={on} delay={200} className="px-4 pt-3 pb-3 sm:px-5 sm:pb-3.5">
        <HourlyChart temps={f.hourly} on={on} />
      </Well>
      <Details
        on={on}
        delay={900}
        items={[
          { icon: "drop", label: "Rain", value: unit(f.rain.toFixed(1), "mm") },
          { icon: "umbrella", label: "Chance", value: f.chance === null ? "–" : `${f.chance}%` },
          { icon: "wind", label: "Wind", value: unit(Math.round(f.wind), "km/h") },
        ]}
      />
    </>
  );
}

const usd = (n: number, digits = 2) => `$${n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

/** The last 24 hours of hourly closes, between the day's high and low. */
function PriceChart({ b, on }: { b: Btc; on: boolean }) {
  const hi = Math.max(b.high ?? -Infinity, ...b.closes);
  const lo = Math.min(b.low ?? Infinity, ...b.closes);
  const pts = layout(b.closes, lo, hi);
  const last = pts[pts.length - 1];
  return (
    <>
      <div className="flex min-h-[120px] flex-1 gap-3 sm:gap-4">
        <div className="relative my-2.5 flex-1">
          <span aria-hidden className="lived-guide absolute inset-x-0 top-0" />
          <span aria-hidden className="lived-guide absolute inset-x-0 bottom-0" />
          <Curve pts={pts} on={on} />
          <span data-on={on} style={{ ...pct(last), ...after(1500) }} className={`absolute ${fade}`}>
            <span className="lived-ring absolute size-[11px] -translate-1/2 rounded-full bg-white/40" />
            <span className="lived-pin absolute size-[11px] -translate-1/2 rounded-full bg-white" />
          </span>
        </div>
        <div className="relative my-2.5 w-14 shrink-0 text-right text-[11.5px] leading-4 sm:w-[84px]">
          <p className="-translate-y-1/2 whitespace-nowrap">
            <span className="text-white/55 max-sm:hidden">High </span>
            <span className="font-medium">{usd(hi, 0)}</span>
          </p>
          <p className="absolute right-0 bottom-0 translate-y-1/2 whitespace-nowrap">
            <span className="text-white/55 max-sm:hidden">Low </span>
            <span className="font-medium">{usd(lo, 0)}</span>
          </p>
        </div>
      </div>
      <div aria-hidden className="mt-1.5 mr-[68px] flex justify-between text-[11.5px] leading-4 text-white/55 sm:mr-[100px]">
        <span>24 h ago</span>
        <span>12 h ago</span>
        <span className="font-medium text-white">Now</span>
      </div>
    </>
  );
}

function BtcAnswer({ b, on }: { b: Btc; on: boolean }) {
  const delta = b.open ? b.price - b.open : null;
  const change = b.open && delta !== null ? (delta / b.open) * 100 : null;
  const [whole, cents] = usd(b.price).split(".");
  return (
    <>
      <Subject title="Bitcoin" sub="BTC-USD" glyph={<CoinGlyph />} />
      <Headline
        on={on}
        size="text-[clamp(48px,12.5vw,72px)]"
        value={
          <>
            {whole}
            <span className="text-[0.5em] tracking-[-0.03em] text-white/60">.{cents}</span>
          </>
        }
      >
        {change !== null && (
          <Gloss
            top={
              <span data-dir={change < 0 ? "down" : "up"} className="lived-change inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[13px] leading-4 font-medium">
                <svg viewBox="0 0 10 10" className={`size-2 ${change < 0 ? "rotate-180" : ""}`} aria-hidden>
                  <path d="M5 1.5 8.5 7.5h-7L5 1.5Z" fill="currentColor" />
                </svg>
                <span className="sr-only">{change < 0 ? "Down" : "Up"}</span>
                {Math.abs(change).toFixed(2)}%
              </span>
            }
            bottom="In the past 24 hours"
          />
        )}
      </Headline>
      <Well on={on} delay={200} className="px-4 pt-2 pb-3 sm:px-5 sm:pb-3.5">
        {b.closes.length > 4 ? <PriceChart b={b} on={on} /> : null}
      </Well>
      <Details
        on={on}
        delay={900}
        items={[
          { icon: "clock", label: "Open", value: b.open === null ? "–" : usd(b.open, 0) },
          { icon: "trend", label: "Change", value: delta === null ? "–" : `${delta < 0 ? "−" : "+"}${usd(Math.abs(delta), 0)}` },
          {
            icon: "bars",
            label: "Volume",
            value: b.volume === null ? "–" : unit(b.volume.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 }), "BTC"),
          },
        ]}
      />
    </>
  );
}

function QuakeAnswer({ q, on, now }: { q: Quakes; on: boolean; now: number }) {
  const recent = q.features.slice(0, 3);
  if (!recent.length) return <p className="mt-auto text-[14px] text-white/80">No earthquakes of M2.5 and up in the past day.</p>;
  const strongest = q.features.reduce((a, f) => (f.properties.mag > a.properties.mag ? f : a));
  return (
    <>
      <Subject title="Earthquakes" sub="M2.5 and up, worldwide" glyph={<QuakeGlyph />} />
      <Headline value={q.metadata.count} on={on}>
        <Gloss top="In the past day" bottom={`Strongest M${strongest.properties.mag.toFixed(1)} · ${strongest.properties.place || "unknown place"}`} />
      </Headline>
      <Well on={on} delay={200} className="items-center justify-center px-3 py-4 sm:px-6 sm:py-5">
        <div className="w-full max-w-[420px]">
          <WorldDots>
            {q.features
              .slice()
              .reverse()
              .map((f, i) => {
                const [x, y] = project(f.geometry.coordinates[1], f.geometry.coordinates[0]);
                const r = 4 + Math.max(0, f.properties.mag - 2.5) * 4.5;
                const listed = recent.includes(f);
                return (
                  <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
                    {f === recent[0] && <circle r={r + 6} className="lived-ring fill-white/40" />}
                    <circle r={r} className={listed ? "fill-white" : "fill-(--sky-200) opacity-55"} stroke="var(--sky-deep)" strokeOpacity={0.35} strokeWidth={2} />
                  </g>
                );
              })}
          </WorldDots>
        </div>
      </Well>
      <ul className="lived-tile mt-2 px-3 sm:mt-2.5 sm:px-3.5">
        {recent.map((f, i) => (
          <li
            key={`${f.properties.time}-${i}`}
            data-on={on}
            style={after(900 + i * 70)}
            className={`flex items-center gap-3 border-white/[0.08] py-2 not-first:border-t sm:h-[42px] sm:py-0 ${settle}`}
          >
            <span className="grid h-6 w-10 shrink-0 place-items-center rounded-[7px] bg-white/[0.14] text-[12.5px] font-semibold">
              <span>
                <span className="sr-only">Magnitude </span>
                {f.properties.mag.toFixed(1)}
              </span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3">
              <span className="min-w-0 flex-1 truncate text-[13.5px] leading-5 sm:text-[14px]">{f.properties.place || "Unknown place"}</span>
              <span className="shrink-0 text-[12px] leading-4 text-white/60 tabular-nums sm:text-[12.5px]">{now ? since(now, f.properties.time) : ""}</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * The ISS map follows the station: the world repeats sideways and the view is centred on it, so the map always fills
 * its well (the whole world on wide cards, about half of it on phones). The track runs from 50 minutes ago (solid)
 * to 40 minutes ahead (dotted).
 */
function IssMap({ iss }: { iss: Iss }) {
  const id = `lived-iss-${useId().replace(/[^\w-]/g, "")}`;
  const [x, y] = project(iss.now.latitude, iss.now.longitude);
  // The track's sixth point is "now": solid behind it, dotted ahead. The world repeats; the track is drawn once.
  const at = Math.min(5, iss.track.length - 1);
  const pts = unwrapTrack(
    iss.track.map((t) => project(t.latitude, t.longitude)),
    at,
    x,
  );
  return (
    <svg
      viewBox={`${(x - MAP_W / 2).toFixed(1)} 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className="absolute inset-0 size-full"
    >
      <defs>
        <g id={id} fill="none" stroke="#ffffff" strokeLinecap="round">
          <path d={SEA_PATH} strokeOpacity={0.08} strokeWidth={2} />
          <path d={LAND_PATH} strokeOpacity={0.32} strokeWidth={4.6} />
        </g>
      </defs>
      {[-MAP_W, 0, MAP_W].map((dx) => (
        <use key={dx} href={`#${id}`} x={dx} />
      ))}
      {at > 0 && (
        <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeWidth={4}>
          <path d={smoothPath(pts.slice(0, at + 1))} strokeOpacity={0.85} />
          {pts.length > at + 1 && <path d={smoothPath(pts.slice(at))} strokeOpacity={0.55} strokeDasharray="0.5 11" />}
        </g>
      )}
      <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
        <circle r={14} className="lived-ring fill-white/40" />
        <circle r={10} className="fill-white" stroke="var(--lived-well)" strokeWidth={5} />
      </g>
    </svg>
  );
}

function IssAnswer({ iss, on }: { iss: Iss; on: boolean }) {
  const p = iss.now;
  return (
    <>
      <Subject title="International Space Station" sub={`Right now · ${p.visibility === "daylight" ? "in sunlight" : "in Earth's shadow"}`} glyph={<StationGlyph />} />
      <Headline value={Math.round(p.velocity).toLocaleString("en-US")} on={on}>
        <Gloss top="km/h" bottom="Orbital speed" />
      </Headline>
      <Well on={on} delay={200} className="relative overflow-hidden">
        <IssMap iss={iss} />
      </Well>
      <Details
        on={on}
        delay={800}
        items={[
          { icon: "lat", label: "Latitude", value: `${Math.abs(p.latitude).toFixed(1)}° ${p.latitude >= 0 ? "N" : "S"}` },
          { icon: "lon", label: "Longitude", value: `${Math.abs(p.longitude).toFixed(1)}° ${p.longitude >= 0 ? "E" : "W"}` },
          { icon: "up", label: "Altitude", value: unit(Math.round(p.altitude), "km") },
        ]}
      />
    </>
  );
}

/* ---------------- How your agent gets it ---------------- */

/**
 * The trace above the answer: who planned it and the one call it makes. For Paris that's pilot-mom's recorded
 * reply (the call and filters exactly as it sent them); for the others, the command your agent runs.
 */
function PlanLine({ index }: { index: number }) {
  const a = ASKS[index];
  const mom = a.call === null;
  return (
    <div className="lived-plan flex h-full flex-col rounded-[14px] px-4 py-3 sm:px-5 sm:py-3.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] leading-5">
        {mom ? (
          <>
            <span aria-hidden className="grid size-[22px] shrink-0 place-items-center rounded-full bg-(--sky-deep) text-white">
              <LogoMark className="size-[11px]" />
            </span>
            <span className="font-medium text-fg">pilot-mom</span>
            <span className="text-mute">
              <span className="text-dim">·</span> 1 call <span className="text-dim">·</span>
            </span>
            <span className="rounded-full bg-(--sky-tint) px-2 text-[12px] leading-5 font-medium text-(--sky-accent)">achievable</span>
            <span className="ml-auto text-[12px] text-dim max-[440px]:w-full max-[440px]:pl-[30px]">Recorded reply · Oct 2026</span>
          </>
        ) : (
          <>
            <span aria-hidden className="grid size-[22px] shrink-0 place-items-center rounded-full bg-fg text-bg">
              <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
                <path d="M3 3.5 5.5 6 3 8.5M6.5 8.5H9" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-medium text-fg">Your agent</span>
            <span className="text-mute">
              <span className="text-dim">·</span> 1 call
            </span>
          </>
        )}
      </div>
      <div className="lived-plan-rule mt-3 flex flex-1 items-center gap-2.5 pt-3">
        <span
          aria-hidden
          className="grid size-[22px] shrink-0 place-items-center self-start rounded-[6px] bg-(--sky-tint) font-mono text-[11px] text-(--sky-accent) max-sm:hidden"
        >
          1
        </span>
        {mom ? (
          <div className="min-w-0 text-[12.5px] leading-5">
            <p className="font-mono text-fg">
              send-message <span className="text-dim">→</span> {a.host}
            </p>
            <p className="mt-0.5 flex flex-wrap gap-x-3.5 gap-y-0.5 text-mute">
              {MOM_FILTERS.map(([k, v]) => (
                <span key={k} className="whitespace-nowrap">
                  {k} <span className="font-mono text-[12px] text-soft">{v}</span>
                </span>
              ))}
            </p>
          </div>
        ) : (
          <div className="min-w-0 font-mono text-[12.5px] leading-5 [overflow-wrap:break-word]">
            <p className="text-fg">
              <span className="text-dim">pilotctl</span> send-message <span className="whitespace-nowrap">{a.host}</span>
            </p>
            <p className="mt-0.5 text-soft">
              <span className="text-dim">--data</span>{" "}
              {`'${a.call}'`.split(" ").map((part, i) => (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span className="whitespace-nowrap">{part}</span>
                </Fragment>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- The ask ---------------- */

const TYPE_MS = 34;
const HOLD_MS = 6500;

type Run = { id: number; index: number };

function Asker() {
  const [nearRef, near] = useInView<HTMLDivElement>({ margin: "500px 0px 500px 0px" });
  const [viewRef, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px 0px -25% 0px" });
  const reduced = usePrefersReducedMotion();
  const now = useNow();

  const [weather, retryWeather] = useSource(loadForecast, near);
  const [btc, retryBtc] = useSource(loadBtc, near, inView ? 30_000 : 0);
  const [quakes, retryQuakes] = useSource(loadQuakes, near, inView ? 300_000 : 0);
  const [iss, retryIss] = useSource(loadIss, near, inView ? 15_000 : 0);

  // What's on screen. Static first answer until the motion version takes over.
  const [active, setActive] = useState(0);
  const chipsRef = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState(ASKS[0].ask.length);
  const [plan, setPlan] = useState(0);
  const [shown, setShown] = useState(0);
  const [dim, setDim] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [landed, setLanded] = useState(true);
  const [run, setRun] = useState<Run | null>(null);
  const [auto, setAuto] = useState(true);
  const [primed, setPrimed] = useState(false);

  // On the way in (motion allowed), clear the bar so the first question can type itself.
  useEffect(() => {
    if (!near || reduced || primed) return;
    const id = window.setTimeout(() => {
      setPrimed(true);
      setTyped(0);
      setPlan(-1);
      setShown(-1);
      setLanded(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [near, reduced, primed]);

  // Start once it's properly in view.
  useEffect(() => {
    if (!inView || reduced || !primed || run) return;
    const id = window.setTimeout(() => setRun({ id: 1, index: 0 }), 300);
    return () => window.clearTimeout(id);
  }, [inView, reduced, primed, run]);

  // Play one question: type it, send it, show how the agent gets it, then the answer.
  useEffect(() => {
    if (!run) return;
    const a = ASKS[run.index];
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    if (reduced) {
      at(0, () => {
        setActive(run.index);
        setTyped(a.ask.length);
        setPlan(run.index);
        setShown(run.index);
        setDim(false);
        setPressed(false);
        setLanded(true);
      });
    } else {
      at(0, () => {
        setActive(run.index);
        setTyped(0);
        setPlan(-1);
        setDim(true);
        setPressed(false);
        setLanded(false);
      });
      for (let k = 1; k <= a.ask.length; k++) at(160 + k * TYPE_MS, () => setTyped(k));
      const sent = 160 + a.ask.length * TYPE_MS + 280;
      at(sent, () => setPressed(true));
      at(sent + 150, () => {
        setPressed(false);
        setPlan(run.index);
      });
      at(sent + 850, () => {
        setShown(run.index);
        setDim(false);
        setLanded(true);
      });
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [run, reduced]);

  // Keep cycling while it's in view, until someone picks a question.
  useEffect(() => {
    if (!auto || !inView || reduced || !landed || !run) return;
    const id = window.setTimeout(() => setRun({ id: run.id + 1, index: (run.index + 1) % ASKS.length }), HOLD_MS);
    return () => window.clearTimeout(id);
  }, [auto, inView, reduced, landed, run]);

  // On phones the tabs are one scrolling row: keep the active one in view by scrolling the row only.
  useEffect(() => {
    const row = chipsRef.current?.querySelector<HTMLElement>(".sky-seg");
    const chip = row?.children[active] as HTMLElement | undefined;
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return;
    const left = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2;
    row.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  }, [active, reduced]);

  const pick = (index: number) => {
    setAuto(false);
    setPrimed(true);
    setRun((r) => ({ id: (r?.id ?? 0) + 1, index }));
  };

  const q = ASKS[active];
  const typing = typed < q.ask.length || !landed;

  const cards = [
    <AnswerCard key="w" ask={ASKS[0]} label="Paris tomorrow, live from Open-Meteo" src={weather} retry={retryWeather}>
      {(f) => <WeatherAnswer f={f} on={shown === 0} />}
    </AnswerCard>,
    <AnswerCard key="b" ask={ASKS[1]} label="Bitcoin price, live from Coinbase" src={btc} retry={retryBtc}>
      {(b) => <BtcAnswer b={b} on={shown === 1} />}
    </AnswerCard>,
    <AnswerCard key="q" ask={ASKS[2]} label="Latest earthquakes, live from the USGS" src={quakes} retry={retryQuakes}>
      {(d) => <QuakeAnswer q={d} on={shown === 2} now={now} />}
    </AnswerCard>,
    <AnswerCard key="i" ask={ASKS[3]} label="The ISS position, live from Where the ISS At" src={iss} retry={retryIss}>
      {(d) => <IssAnswer iss={d} on={shown === 3} />}
    </AnswerCard>,
  ];

  return (
    <div ref={nearRef} className="mx-auto w-full max-w-[790px]">
      <div ref={chipsRef}>
        <Segmented
          items={ASKS.map((a) => ({
            id: a.host,
            label: (
              <>
                <span className="sm:hidden">{a.short}</span>
                <span className="max-sm:hidden">{a.tab}</span>
              </>
            ),
          }))}
          value={q.host}
          onChange={(host) => pick(ASKS.findIndex((a) => a.host === host))}
          label="Questions to ask"
          layoutId="lived-tab"
          panelId="lived-answer"
          className="lived-seg"
        />
      </div>

      <div ref={viewRef} id="lived-answer" role="tabpanel" aria-label={q.ask}>
        {/* The ask bar shows the question being sent; the tabs above choose one, and send asks it again, live. */}
        <div className={`mt-4 flex h-16 items-center gap-3 pr-2.5 pl-5 select-none sm:pl-6 ${SKY_CARD}`}>
          <p aria-hidden className="min-w-0 flex-1 truncate text-[17px] tracking-[-0.034em] text-fg sm:text-[18px]">
            {q.ask.slice(0, typed)}
            <span
              className={`ml-px inline-block h-[1.15em] w-[1.5px] translate-y-[3px] rounded-full bg-(--sky-fill) ${typing ? "caret-blink" : "opacity-0"}`}
            />
          </p>
          <button
            type="button"
            onClick={() => pick(active)}
            aria-label={`Ask again: ${q.ask}`}
            data-pressed={pressed}
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-[12px] bg-(--sky-deep) text-white transition-transform duration-150 ease-(--ease-out) outline-offset-2 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-(--sky-fill) active:scale-[0.92] data-[pressed=true]:scale-[0.92]"
          >
            <svg viewBox="0 0 16 16" aria-hidden className="size-4" fill="none">
              <path d="M8 13V3.5M3.5 7.5 8 3l4.5 4.5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* How your agent gets the answer. All four share one cell, so the height never jumps. */}
        <div className="mx-auto mt-3 grid max-w-[680px]">
          {ASKS.map((a, i) => (
            <div
              key={a.host}
              aria-hidden={plan !== i}
              data-on={plan === i}
              className="col-start-1 row-start-1 grid transition-[opacity,transform,filter] duration-500 ease-(--ease-out) data-[on=false]:pointer-events-none data-[on=false]:translate-y-1 data-[on=false]:opacity-0 data-[on=false]:blur-[2px] data-[on=false]:duration-150 motion-reduce:transition-opacity motion-reduce:data-[on=false]:translate-y-0 motion-reduce:data-[on=false]:blur-none"
            >
              <PlanLine index={i} />
            </div>
          ))}
        </div>

        {/* The live answer: the cards share one cell too, sized by the tallest. */}
        <div className="mx-auto mt-3 grid min-h-[380px] max-w-[680px]">
          {cards.map((card, i) => {
            const state = i === shown ? (dim ? "dim" : "on") : "off";
            return (
              <div
                key={i}
                data-state={state}
                aria-hidden={state === "off"}
                inert={state === "off"}
                className="col-start-1 row-start-1 grid origin-top transition-[opacity,transform,filter] ease-(--ease-out) data-[state=dim]:opacity-40 data-[state=dim]:blur-[2px] data-[state=dim]:duration-300 data-[state=off]:pointer-events-none data-[state=off]:translate-y-2 data-[state=off]:scale-[0.98] data-[state=off]:opacity-0 data-[state=off]:blur-[4px] data-[state=off]:duration-200 data-[state=on]:duration-700 motion-reduce:transition-opacity motion-reduce:data-[state=dim]:blur-none motion-reduce:data-[state=off]:translate-y-0 motion-reduce:data-[state=off]:scale-100 motion-reduce:data-[state=off]:blur-none"
              >
                {card}
              </div>
            );
          })}
        </div>
        <p className="sr-only" aria-live="polite">
          {shown >= 0 ? `${ASKS[shown].ask}: answered by ${ASKS[shown].host}.` : ""}
        </p>
      </div>

      <p className="mt-8 flex justify-center sm:mt-10">
        <TextLink href={LINKS.pilotMomDocs}>How pilot-mom works</TextLink>
      </p>
    </div>
  );
}

/* ---------------- Section ---------------- */

export function LiveD() {
  return (
    <section id="data-agents" aria-labelledby="data-title" className="overflow-x-clip pt-16 pb-20 sm:pt-[72px] sm:pb-24 lg:pb-[104px]">
      <div className="wrap">
        <HatchPanel className="px-4 pt-12 pb-10 sm:px-10 sm:pt-16 sm:pb-14 lg:pt-[70px] lg:pb-[64px]">
          <Reveal className="mx-auto max-w-[800px] text-center">
            <h2
              id="data-title"
              className="text-[clamp(32px,4.6vw,48px)] leading-[1.1] font-medium tracking-[-0.0625em] text-balance text-fg"
            >
              <span className="block">Tomorrow&apos;s weather in Paris.</span>
              <span className="block">The price of Bitcoin right now.</span>
              <span className="block text-mute">About 430 data agents answer live.</span>
            </h2>
          </Reveal>

          <Reveal delay={100} className="mt-10 sm:mt-12">
            <Asker />
          </Reveal>
        </HatchPanel>
      </div>
    </section>
  );
}
