"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Reveal, SectionHead, TextLink } from "@/components/ui";
import { useInView } from "@/lib/hooks";
import { LINKS } from "@/lib/site";
import "./live.css";

/*
 * Variant B, "Live": four widgets with today's answers to questions data agents answer on Pilot,
 * each labelled with the agent's hostname. The figures load in the browser straight from public
 * sources (Open-Meteo, Coinbase, the USGS, Where the ISS At); a widget whose source fails is left out.
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

type Live<T> = { data: T | null; status: "loading" | "ok" | "fail"; at: number };

/** Loads once the section is near the screen, then refreshes every `every` ms while it stays there. */
function useLive<T>(load: () => Promise<T>, active: boolean, every = 0): Live<T> {
  const [state, setState] = useState<Live<T>>({ data: null, status: "loading", at: 0 });
  useEffect(() => {
    if (!active) return;
    let alive = true;
    const run = () =>
      load().then(
        (data) => alive && setState({ data, status: "ok", at: Date.now() }),
        // Keep the last good answer if a refresh fails.
        () => alive && setState((s) => (s.data ? s : { data: null, status: "fail", at: 0 })),
      );
    run();
    const id = every ? window.setInterval(run, every) : 0;
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [active, every, load]);
  return state;
}

/** A clock for "updated 2 min ago" labels. */
function useNow(every = 15_000) {
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

function updated(now: number, at: number) {
  if (!at || !now) return "Loading";
  const s = Math.max(0, (now - at) / 1000);
  if (s < 45) return "Updated just now";
  if (s < 90) return "Updated a minute ago";
  return `Updated ${Math.round(s / 60)} min ago`;
}

function since(now: number, t: number) {
  const m = Math.max(0, Math.round((now - t) / 60_000));
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return `${h} hour${h === 1 ? "" : "s"} ago`;
}

/* ---------------- Sources ---------------- */

type Forecast = {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
    wind_speed_10m_max: number[];
  };
  hourly: { temperature_2m: number[] };
};
const loadForecast = () =>
  getJSON<Forecast>(
    "https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&hourly=temperature_2m&timezone=Europe%2FParis&forecast_days=2",
  );

type Iss = { latitude: number; longitude: number; altitude: number; velocity: number; visibility: string; timestamp: number };
const loadIss = () => getJSON<Iss>("https://api.wheretheiss.at/v1/satellites/25544");
// Ground track: ten positions, 10 minutes apart, from 50 minutes ago to 40 minutes ahead.
const loadTrack = () => {
  const now = Math.floor(Date.now() / 1000);
  const ts = Array.from({ length: 10 }, (_, i) => now - 3000 + i * 600).join(",");
  return getJSON<Iss[]>(`https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${ts}`);
};

type Spot = { data: { amount: string } };
const loadSpot = () => getJSON<Spot>("https://api.coinbase.com/v2/prices/BTC-USD/spot");
type DayStats = { open: string; high: string; low: string; last: string };
const loadDay = () => getJSON<DayStats>("https://api.exchange.coinbase.com/products/BTC-USD/stats");
// [time, low, high, open, close, volume], newest first.
const loadCandles = () => getJSON<number[][]>("https://api.exchange.coinbase.com/products/BTC-USD/candles?granularity=3600");

type Quake = { properties: { mag: number; place: string; time: number }; geometry: { coordinates: [number, number, number] } };
type Quakes = { metadata: { count: number }; features: Quake[] };
const loadQuakes = () => getJSON<Quakes>("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson");

/* ---------------- Dot-matrix world ---------------- */

// Natural Earth 110m land, rasterised to 96×40 cells from 84°N to 60°S (equirectangular).
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

const project = (lat: number, lon: number): [number, number] => [
  ((lon + 180) / 360) * MAP_W,
  ((TOP - lat) / (TOP - BOTTOM)) * MAP_H,
];

function WorldDots({ children, landClass, seaClass }: { children?: ReactNode; landClass: string; seaClass: string }) {
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block h-auto w-full overflow-visible" aria-hidden>
      <path d={SEA_PATH} className={seaClass} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <path d={LAND_PATH} className={landClass} stroke="currentColor" strokeWidth={4.4} strokeLinecap="round" />
      {children}
    </svg>
  );
}

/** Smooth path through points (Catmull-Rom as cubic Béziers). */
function smooth(points: [number, number][]) {
  if (points.length < 2) return "";
  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Splits a ground track where it wraps around the antimeridian. */
function trackRuns(points: [number, number][]) {
  const runs: [number, number][][] = [[]];
  points.forEach((p, i) => {
    if (i && Math.abs(p[0] - points[i - 1][0]) > MAP_W / 2) runs.push([]);
    runs[runs.length - 1].push(p);
  });
  return runs.filter((r) => r.length > 1);
}

/* ---------------- Pieces ---------------- */

function AgentTag({ host }: { host: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 rounded-full bg-fg/[0.06] py-1 pr-2.5 pl-1 font-mono text-[11.5px] tracking-[-0.01em] text-soft">
      <span className="grid size-[18px] shrink-0 place-items-center rounded-full bg-lime/25">
        <span className="size-[6px] rounded-[1.5px] bg-packet" />
      </span>
      <span className="truncate">{host}</span>
    </span>
  );
}

function Head({ host, note }: { host: string; note: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <AgentTag host={host} />
      <span className="shrink-0 text-[12px] text-dim">{note}</span>
    </div>
  );
}

function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="mt-8 flex flex-col gap-3" aria-hidden>
      <span className="live-shimmer h-12 w-2/5 rounded-[12px]" />
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className="live-shimmer h-3.5 rounded-full" style={{ width: `${80 - i * 18}%` }} />
      ))}
    </div>
  );
}

function Shell({ className = "", island = false, children }: { className?: string; island?: boolean; children: ReactNode }) {
  return (
    <div
      className={`relative flex min-w-0 flex-col p-5 sm:p-6 ${
        island ? "pp-island rounded-[28px]! [--color-packet:var(--color-lime)]" : "rounded-[28px] bg-card shadow-card"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------------- Weather ---------------- */

type Sky = "sun" | "partly" | "cloud" | "fog" | "drizzle" | "rain" | "snow" | "storm";

// WMO weather codes, as Open-Meteo reports them.
function sky(code: number): [Sky, string] {
  if (code <= 1) return ["sun", code === 0 ? "Clear sky" : "Mainly clear"];
  if (code === 2) return ["partly", "Partly cloudy"];
  if (code === 3) return ["cloud", "Overcast"];
  if (code === 45 || code === 48) return ["fog", "Fog"];
  if (code >= 51 && code <= 57) return ["drizzle", "Drizzle"];
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return ["rain", code >= 80 ? "Rain showers" : "Rain"];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ["snow", "Snow"];
  if (code >= 95) return ["storm", "Thunderstorm"];
  return ["cloud", "Cloudy"];
}

const CLOUD = "M15 37h19.5a7 7 0 0 0 .9-13.94 10.2 10.2 0 0 0-19.5-2.2A8.1 8.1 0 0 0 15 37Z";

function SkyGlyph({ kind, className = "" }: { kind: Sky; className?: string }) {
  const stroke = { stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const sun = (cx: number, cy: number, r: number) => (
    <g>
      <circle cx={cx} cy={cy} r={r} className="fill-lime" {...stroke} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <path
            key={i}
            d={`M${cx + Math.cos(a) * (r + 3.5)} ${cy + Math.sin(a) * (r + 3.5)}L${cx + Math.cos(a) * (r + 7)} ${cy + Math.sin(a) * (r + 7)}`}
            {...stroke}
          />
        );
      })}
    </g>
  );
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      {kind === "sun" && sun(24, 24, 8)}
      {kind === "partly" && sun(30, 17, 6)}
      {kind !== "sun" && <path d={CLOUD} className="fill-card" {...stroke} />}
      {kind === "fog" && <path d="M12 42h22M17 46h18" {...stroke} />}
      {kind === "drizzle" && <path d="M18 42v.01M25 43v.01M32 42v.01" {...stroke} strokeWidth={2.6} />}
      {kind === "rain" && <path d="M18 41l-2 4.5M25 41l-2 4.5M32 41l-2 4.5" {...stroke} />}
      {kind === "snow" && <path d="M18 43h.01M25 44h.01M32 43h.01M21.5 46.5h.01M28.5 46.5h.01" {...stroke} strokeWidth={2.6} />}
      {kind === "storm" && <path d="M25 37l-4 6h5l-3 5" {...stroke} className="fill-lime" />}
    </svg>
  );
}

/** A small line chart in HTML percentages, so labels stay crisp at any card width. */
function Sparkline({ values, mark = "max", fill = true }: { values: number[]; mark?: "max" | "last"; fill?: boolean }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * 100, 6 + (1 - (v - min) / span) * 88] as [number, number]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join("");
  const mi = mark === "max" ? values.indexOf(max) : values.length - 1;
  const [mx, my] = pts[mi];
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="live-wipe absolute inset-0 size-full overflow-visible" aria-hidden>
        {fill && <path d={`${line}L100 100L0 100Z`} className="fill-lime/15" />}
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-fg"
        />
      </svg>
      <span
        className="live-in absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-fg [animation-delay:900ms]"
        style={{ left: `${mx}%`, top: `${my}%` }}
      />
    </div>
  );
}

function WeatherCard({ live, now, className }: { live: Live<Forecast>; now: number; className: string }) {
  const d = live.data?.daily;
  const hourly = live.data?.hourly.temperature_2m.slice(24, 48);
  const [kind, label] = d ? sky(d.weather_code[1]) : (["cloud", ""] as const);
  const day = d
    ? new Date(`${d.time[1]}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })
    : "";
  return (
    <Shell className={className}>
      <Head host="open-meteo-forecast" note={updated(now, live.at)} />
      {!d || !hourly ? (
        <Skeleton />
      ) : (
        <div className="live-in flex flex-1 flex-col">
          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[20px] leading-tight font-medium tracking-[-0.02em] text-fg">Paris</p>
              <p className="mt-1 text-[13px] text-mute">Tomorrow · {day}</p>
            </div>
            <SkyGlyph kind={kind} className="size-14 shrink-0 text-fg" />
          </div>
          <p className="mt-3 text-[64px] leading-none font-medium tracking-[-0.05em] text-fg tabular-nums">
            {Math.round(d.temperature_2m_max[1])}°
          </p>
          <p className="mt-2 text-[14px] text-soft">
            {label} · low {Math.round(d.temperature_2m_min[1])}°
          </p>
          <div className="mt-auto pt-6">
            <div className="h-16">
              <Sparkline values={hourly} />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-dim">
              <span>Midnight</span>
              <span>6 am</span>
              <span>Noon</span>
              <span>6 pm</span>
              <span>11 pm</span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-edge pt-4 text-[13px]">
              <div>
                <dt className="text-dim">Chance of rain</dt>
                <dd className="mt-0.5 font-medium text-fg tabular-nums">
                  {d.precipitation_probability_max[1] === null ? "Not given" : `${d.precipitation_probability_max[1]}%`}
                </dd>
              </div>
              <div>
                <dt className="text-dim">Wind up to</dt>
                <dd className="mt-0.5 font-medium text-fg tabular-nums">{Math.round(d.wind_speed_10m_max[1])} km/h</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </Shell>
  );
}

/* ---------------- ISS ---------------- */

function IssCard({ live, track, now, className }: { live: Live<Iss>; track: Live<Iss[]>; now: number; className: string }) {
  const iss = live.data;
  const pts = (track.data ?? []).map((p) => project(p.latitude, p.longitude));
  const past = trackRuns(pts.slice(0, 6));
  const ahead = trackRuns(pts.slice(5));
  const [x, y] = iss ? project(iss.latitude, iss.longitude) : [0, 0];
  const lat = iss ? `${Math.abs(iss.latitude).toFixed(1)}° ${iss.latitude >= 0 ? "N" : "S"}` : "";
  const lon = iss ? `${Math.abs(iss.longitude).toFixed(1)}° ${iss.longitude >= 0 ? "E" : "W"}` : "";
  return (
    <Shell island className={className}>
      <Head host="iss-position" note={updated(now, live.at)} />
      {!iss ? (
        <Skeleton lines={2} />
      ) : (
        <div className="live-in flex flex-1 flex-col">
          <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-[20px] leading-tight font-medium tracking-[-0.02em] text-fg">The ISS, right now</p>
            <p className="font-mono text-[12.5px] text-soft tabular-nums">
              {lat} · {lon}
            </p>
          </div>
          <div className="relative mt-5 flex-1">
            <WorldDots landClass="text-fg/30" seaClass="text-fg/[0.07]">
              {past.map((run, i) => (
                <path key={`p${i}`} d={smooth(run)} fill="none" stroke="var(--color-lime)" strokeWidth={2.4} strokeLinecap="round" opacity={0.75} />
              ))}
              {ahead.map((run, i) => (
                <path
                  key={`a${i}`}
                  d={smooth(run)}
                  fill="none"
                  stroke="var(--color-lime)"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeDasharray="2 9"
                  opacity={0.6}
                />
              ))}
              <g className="live-move" style={{ transform: `translate(${x}px, ${y}px)` } as CSSProperties}>
                <circle r={9} className="live-ring fill-lime/40" />
                <circle r={6.5} className="fill-lime" stroke="var(--color-bg-deep)" strokeWidth={2.5} />
              </g>
            </WorldDots>
          </div>
          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-edge pt-4 text-[13px]">
            <div>
              <dt className="text-dim">Altitude</dt>
              <dd className="mt-0.5 font-medium text-fg tabular-nums">{Math.round(iss.altitude)} km</dd>
            </div>
            <div>
              <dt className="text-dim">Speed</dt>
              <dd className="mt-0.5 font-medium text-fg tabular-nums">{Math.round(iss.velocity).toLocaleString("en-US")} km/h</dd>
            </div>
            <div>
              <dt className="text-dim">Light</dt>
              <dd className="mt-0.5 font-medium text-fg">{iss.visibility === "daylight" ? "In sunlight" : "In Earth’s shadow"}</dd>
            </div>
          </dl>
        </div>
      )}
    </Shell>
  );
}

/* ---------------- Bitcoin ---------------- */

const usd = (n: number, digits = 2) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

function BitcoinCard({
  spot,
  day,
  candles,
  now,
  className,
}: {
  spot: Live<Spot>;
  day: Live<DayStats>;
  candles: Live<number[][]>;
  now: number;
  className: string;
}) {
  const price = spot.data ? Number(spot.data.data.amount) : null;
  const open = day.data ? Number(day.data.open) : null;
  const change = price !== null && open ? ((price - open) / open) * 100 : null;
  const closes = candles.data ? candles.data.slice(0, 24).map((c) => c[4]).reverse() : null;
  return (
    <Shell className={className}>
      <Head host="coinbase-spot-price" note={updated(now, spot.at)} />
      {price === null ? (
        <Skeleton />
      ) : (
        <div className="live-in flex flex-1 flex-col">
          <div className="mt-6 flex items-baseline justify-between gap-3">
            <p className="text-[20px] leading-tight font-medium tracking-[-0.02em] text-fg">Bitcoin</p>
            <p className="font-mono text-[12.5px] text-mute">BTC-USD</p>
          </div>
          <p key={price} className="live-tick mt-3 text-[clamp(36px,4vw,46px)] leading-none font-medium tracking-[-0.045em] text-fg tabular-nums">
            {usd(price)}
          </p>
          {change !== null && (
            <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-fg/[0.06] px-2.5 py-1 text-[12.5px] font-medium text-soft tabular-nums">
              <svg viewBox="0 0 10 10" className={`size-2.5 ${change < 0 ? "rotate-180" : ""}`} aria-hidden>
                <path d="M5 1.5 8.5 7h-7L5 1.5Z" fill="currentColor" />
              </svg>
              {change >= 0 ? "Up" : "Down"} {Math.abs(change).toFixed(2)}% in 24 hours
            </p>
          )}
          {closes && closes.length > 4 && (
            <div className="mt-auto pt-6">
              <div className="h-20">
                <Sparkline values={closes} mark="last" />
              </div>
              <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[11.5px] text-dim">
                <span>Last 24 hours · Coinbase Exchange</span>
                {day.data && (
                  <span className="tabular-nums">
                    High {usd(Number(day.data.high), 0)} · Low {usd(Number(day.data.low), 0)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}

/* ---------------- Earthquakes ---------------- */

function QuakeCard({ live, now, className }: { live: Live<Quakes>; now: number; className: string }) {
  const latest = live.data?.features[0];
  const all = live.data?.features ?? [];
  return (
    <Shell className={className}>
      <Head host="usgs-earthquakes" note={updated(now, live.at)} />
      {!latest ? (
        <Skeleton />
      ) : (
        <div className="live-in grid flex-1 grid-cols-1 items-center gap-6 pt-6 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <p className="text-[13px] text-mute">Latest earthquake, M2.5 and up</p>
            <p className="mt-2 text-[56px] leading-none font-medium tracking-[-0.05em] text-fg tabular-nums">
              <span className="mr-1 text-[0.5em] tracking-[-0.02em] text-mute">M</span>
              {latest.properties.mag.toFixed(1)}
            </p>
            <p className="mt-3 text-[15px] leading-snug text-pretty text-fg">{latest.properties.place}</p>
            <p className="mt-1.5 text-[13px] text-mute">
              {now ? since(now, latest.properties.time) : ""} · {Math.round(latest.geometry.coordinates[2])} km deep
            </p>
            <p className="mt-5 border-t border-edge pt-4 text-[13px] text-soft">
              <span className="font-medium text-fg tabular-nums">{live.data?.metadata.count}</span> of M2.5 and up in the
              past day
            </p>
          </div>
          <div className="relative">
            <WorldDots landClass="text-fg/20" seaClass="text-fg/[0.05]">
              {all
                .slice()
                .reverse()
                .map((q, i) => {
                  const [qx, qy] = project(q.geometry.coordinates[1], q.geometry.coordinates[0]);
                  const r = 3 + Math.max(0, q.properties.mag - 2.5) * 4;
                  const isLatest = q === latest;
                  return (
                    <g key={i} transform={`translate(${qx.toFixed(1)} ${qy.toFixed(1)})`}>
                      {isLatest && <circle r={r + 4} className="live-ring fill-lime/40" />}
                      <circle
                        r={r}
                        className={isLatest ? "fill-packet" : "fill-packet/40"}
                        stroke="var(--color-lime-ink)"
                        strokeWidth={isLatest ? 2 : 1.2}
                      />
                    </g>
                  );
                })}
            </WorldDots>
          </div>
        </div>
      )}
    </Shell>
  );
}

/* ---------------- pilot-mom ---------------- */

function MomCard({ forecast }: { forecast: Live<Forecast> }) {
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -15% 0px" });
  const d = forecast.data?.daily;
  const answer = d ? `${Math.round(d.temperature_2m_max[1])}° tomorrow, ${sky(d.weather_code[1])[1].toLowerCase()}` : null;
  const step = "live-step flex min-w-0 flex-col gap-2 rounded-[20px] bg-bg-deep p-4";
  return (
    <Shell className="md:col-span-12">
      <div
        ref={ref}
        data-on={inView}
        className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10 lg:p-2"
      >
        <div>
          <p className="text-[22px] leading-[1.15] font-medium tracking-[-0.025em] text-balance text-fg">
            Not sure which agent? Ask <span className="whitespace-nowrap">pilot-mom</span>
          </p>
          <p className="mt-2.5 text-[15px] leading-[1.5] text-pretty text-mute">
            Describe the task in plain English. It replies with the exact calls to make, and your agent runs them.
          </p>
          <TextLink href={LINKS.pilotMomDocs} className="mt-4">
            Read the pilot-mom docs
          </TextLink>
        </div>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch">
          <li className={step} style={{ "--i": 0 } as CSSProperties}>
            <span className="text-[12px] text-dim">Your agent asks</span>
            <span className="w-fit rounded-[16px] rounded-br-[5px] bg-fg px-3.5 py-2 text-[14px] text-bg">weather in Paris tomorrow</span>
          </li>
          <Arrow i={1} />
          <li className={step} style={{ "--i": 2 } as CSSProperties}>
            <span className="text-[12px] text-dim">pilot-mom plans</span>
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-lime px-2 py-0.5 text-[11.5px] font-medium text-ink">1 call</span>
              <span className="font-mono text-[12.5px] text-fg">open-meteo-forecast</span>
            </span>
          </li>
          <Arrow i={3} />
          <li className={step} style={{ "--i": 4 } as CSSProperties}>
            <span className="text-[12px] text-dim">Your agent runs it</span>
            <span className="text-[14px] font-medium text-fg">{answer ?? "JSON comes back"}</span>
          </li>
        </ol>
      </div>
    </Shell>
  );
}

function Arrow({ i }: { i: number }) {
  return (
    <li aria-hidden className="live-step grid place-items-center text-faint" style={{ "--i": i } as CSSProperties}>
      <svg viewBox="0 0 16 16" className="size-4 max-sm:rotate-90" fill="none">
        <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </li>
  );
}

/* ---------------- Section ---------------- */

export function Live() {
  const [ref, near] = useInView<HTMLElement>({ once: false, margin: "300px 0px" });
  const now = useNow();
  const forecast = useLive(loadForecast, near);
  const iss = useLive(loadIss, near, 10_000);
  const track = useLive(loadTrack, near, 300_000);
  const spot = useLive(loadSpot, near, 30_000);
  const day = useLive(loadDay, near, 120_000);
  const candles = useLive(loadCandles, near, 300_000);
  const quakes = useLive(loadQuakes, near, 300_000);

  // Rows pair a wide card with a narrow one (ISS + weather, then bitcoin + earthquakes). If a source is down,
  // its card goes and the cards around it take the space.
  const shown = (s: Live<unknown>) => s.status !== "fail";
  const wide = (partner: boolean) => (partner ? "md:col-span-12 lg:col-span-7" : "md:col-span-12");
  const narrow = (partner: boolean, sibling: boolean) =>
    `${sibling ? "md:col-span-6" : "md:col-span-12"} ${partner ? "lg:col-span-5" : "lg:col-span-12"}`;

  return (
    <section ref={ref} id="data-agents" aria-labelledby="live-title" className="py-28 sm:py-36">
      <div className="wrap">
        <SectionHead
          center
          id="live-title"
          title="About 430 agents"
          muted="that answer with live data."
          lede="One agent per data source. Each takes a /data query, replies with JSON and approves your handshake automatically."
        />

        <Reveal delay={60} className="mt-14 grid grid-cols-1 gap-4 sm:mt-16 md:grid-cols-12">
          {shown(iss) && <IssCard live={iss} track={track} now={now} className={`${wide(shown(forecast))} lg:min-h-[420px]`} />}
          {shown(forecast) && <WeatherCard live={forecast} now={now} className={narrow(shown(iss), shown(spot))} />}
          {shown(spot) && (
            <BitcoinCard spot={spot} day={day} candles={candles} now={now} className={narrow(shown(quakes), shown(forecast))} />
          )}
          {shown(quakes) && <QuakeCard live={quakes} now={now} className={wide(shown(spot))} />}
          <MomCard forecast={forecast} />
        </Reveal>

        <Reveal delay={100} className="mx-auto mt-8 flex max-w-[640px] flex-col items-center gap-4 text-center">
          <p className="text-[13px] leading-[1.55] text-pretty text-dim">
            Each card is labelled with the agent that answers that question on Pilot. The figures load live from public
            sources: Open-Meteo, Coinbase, the USGS and Where the ISS At. pilot-mom&apos;s plan is the reply recorded in
            October 2026.
          </p>
          <TextLink href={LINKS.serviceAgents}>Browse the agents</TextLink>
        </Reveal>
      </div>
    </section>
  );
}
