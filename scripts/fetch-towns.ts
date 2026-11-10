import { readFile, writeFile } from "node:fs/promises";
import { parseConfig } from "./lib/config.ts";
import { buildQuery, buildTowns, type WikidataRow } from "./lib/towns.ts";
import { snapToLand } from "./lib/coast.ts";
import type {
  FeatureCollection,
  Polygon,
  MultiPolygon,
  LineString,
  MultiLineString,
} from "geojson";

const CONFIG_PATH = "scripts/places.config.json";
const OUTPUT_PATH = "src/data/towns.json";
const ENDPOINT = "https://query.wikidata.org/sparql";
const USER_AGENT = "Freightline/0.1 (https://github.com/fordyyyx/freightline)";

const configText = await readFile(CONFIG_PATH, "utf8");
const config = parseConfig(JSON.parse(configText));

const query = buildQuery(config);

const params = new URLSearchParams({ query, format: "json" });
const response = await fetch(`${ENDPOINT}?${params}`, {
  headers: {
    Accept: "application/sparql-results+json",
    "User-Agent": USER_AGENT,
  },
});

if (!response.ok) {
  throw new Error(
    `Wikidata request failed: ${response.status} ${response.statusText}`,
  );
}

const data = (await response.json()) as {
  results: { bindings: WikidataRow[] };
};

const { towns, missingPopulation } = buildTowns(
  data.results.bindings,
  config.minPopulation,
);

const land = JSON.parse(
  await readFile("src/data/land.geojson", "utf8"),
) as FeatureCollection<Polygon | MultiPolygon>;

const coast = JSON.parse(
  await readFile("src/data/coastline.geojson", "utf8"),
) as FeatureCollection<LineString | MultiLineString>;

const snappedTowns = towns.map((town) => ({
  ...town,
  ...snapToLand(town, land, coast, {
    marginKm: config.coastMarginKm,
    maxSnapKm: config.maxSnapKm,
  }),
}));

const moved = snappedTowns.filter(
  (town, i) => town.lat !== towns[i].lat || town.lon !== towns[i].lon,
);

await writeFile(OUTPUT_PATH, JSON.stringify(snappedTowns, null, 2) + "\n");

console.log(`Moved ${moved.length} towns onto land:`);
for (const town of moved) {
  console.log(`  ${town.name}`);
}
console.log(`Wrote ${towns.length} towns to ${OUTPUT_PATH}`);
console.log(`Places with no population (${missingPopulation.length}):`);
for (const place of missingPopulation) {
  console.log(`  ${place}`);
}
