import { PilotMarkP } from "@/components/logo";
import { BrandMark, type Brand } from "@/components/v4/logos";

/*
 * What the service-agents diagrams are drawn with: the real marks of the upstream sources the agents wrap, a
 * service agent (a Pilot node: the sky-blue tile with the P), and your own agent (the real mark of an agent that
 * runs pilotctl). Marks sit on a light tile in both themes, as app icons do, so their own colours always read.
 */

/**
 * Which upstream each agent named on the page wraps, where that upstream has a mark of its own. Only where the
 * hostname and the page make the source plain (`openfda-*` calls openFDA, `nasa-power` NASA's POWER API).
 */
export const SOURCE_OF: Record<string, Brand> = {
  "nominatim-search": "openstreetmap",
  "google-maps-routes": "googlemaps",
  "wikidata-wbgetentities": "wikidata",
  "openfda-drug-label": "fda",
  "openfda-food-recall": "fda",
  "openfdadevice-recall": "fda",
  "gbif-occurrence": "gbif",
  "gbif-suggest": "gbif",
  "usgs-volcanic-activity": "usgs",
  "usgs-earthquakes": "usgs",
  "zenodo-records": "zenodo",
  "hn-top": "hackernews",
  "github-search-repos": "github",
  "homebrew-formulae": "homebrew",
  "bvg-berlin-departures": "bvg",
  "crossref-works": "crossref",
  "dblp-publ-search": "dblp",
  "nvd-cves": "nist",
  "nhl-api-live": "nhl",
  "wikipedia-summary": "wikipedia",
  "archive-org-search": "internetarchive",
  "nasa-apod": "nasa",
  "nasa-power": "nasa",
  "nhtsa-recalls": "nhtsa",
  "nhtsa-decodevin": "nhtsa",
  "nhtsa-complaints": "nhtsa",
  "open-meteo-forecast": "openmeteo",
  "open-meteo-air-quality": "openmeteo",
  "pypi-package": "pypi",
  "npm-package": "npm",
  "tfl-line-status": "tfl",
  "musicbrainz-artist": "musicbrainz",
  "itunes-search": "itunes",
};

/** Wordmarks need a wider tile than square marks: width over height. */
const WIDE: Partial<Record<Brand, number>> = { nhtsa: 1.9, usgs: 2.2, nist: 2, zenodo: 2, gbif: 1.8 };

/** A tile's width for its height. */
export const tileWidth = (b: Brand, h: number) => Math.round(h * (WIDE[b] ?? 1));

/** A source's mark on its light tile, `size` px tall (wordmarks get a wider tile). */
export function SourceTile({ brand, size = 40, className = "" }: { brand: Brand; size?: number; className?: string }) {
  const wide = (WIDE[brand] ?? 1) > 1;
  return (
    <span
      aria-hidden
      className={`sa-tile relative inline-grid shrink-0 place-items-center ${className}`}
      style={{ width: tileWidth(brand, size), height: size, borderRadius: Math.max(5, Math.round(size * 0.26)) }}
    >
      <span className="grid place-items-center" style={wide ? { width: "80%", height: "46%" } : { width: "62%", height: "62%" }}>
        <BrandMark brand={brand} className="size-full" />
      </span>
    </span>
  );
}

/** A service agent: a Pilot node, the sky-blue tile with the P. */
export function AgentTile({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`sa-agent-tile relative inline-grid shrink-0 place-items-center text-white ${className}`}
      style={{ width: size, height: size, borderRadius: Math.max(5, Math.round(size * 0.26)) }}
    >
      <PilotMarkP className="h-[44%] w-auto" />
    </span>
  );
}

/** An agent's own mark (Claude Code, Codex…) on the light tile. */
export function MarkTile({ brand, size = 40, className = "" }: { brand: Brand; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`sa-tile relative inline-grid shrink-0 place-items-center ${className}`}
      style={{ width: size, height: size, borderRadius: Math.max(5, Math.round(size * 0.26)) }}
    >
      <span className="grid size-[56%] place-items-center">
        <BrandMark brand={brand} className="size-full" />
      </span>
    </span>
  );
}

/** Wordmarks' width over height, for marks set at a fixed height. */
const ASPECT: Partial<Record<Brand, number>> = { nhtsa: 2.65, usgs: 3.68, nist: 3.79, zenodo: 2.73, gbif: 2.02 };

/** A source's mark, small, on its light chip (in running lists, such as the directory). */
export function SourceChip({ brand, className = "" }: { brand: Brand; className?: string }) {
  const a = ASPECT[brand];
  return (
    <span
      aria-hidden
      className={`sa-tile inline-grid h-5 shrink-0 place-items-center rounded-[5px] align-middle ${a ? "px-1" : "w-5"} ${className}`}
    >
      <span className="block" style={a ? { height: 10, width: Math.round(10 * a) } : { height: 13, width: 13 }}>
        <BrandMark brand={brand} className="size-full" />
      </span>
    </span>
  );
}
