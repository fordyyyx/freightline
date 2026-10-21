import { readFile, writeFile } from "node:fs/promises";
import { parseConfig } from "./lib/config.ts";
import { buildQuery, buildTowns, type WikidataRow } from "./lib/towns.ts";

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
    Accept: "applications/sparql-results+json",
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
await writeFile(OUTPUT_PATH, JSON.stringify(towns, null, 2) + "\n");

console.log(`Wrote ${towns.length} towns to ${OUTPUT_PATH}`);
console.log(`Places with no population (${missingPopulation.length}):`);
for (const place of missingPopulation) {
  console.log(`  ${place}`);
}
