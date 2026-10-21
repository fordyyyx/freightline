import { existsSync } from "node:fs";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import {
  type ClippableGeometry,
  type BoundingBox,
  boundingBox,
  clipAndSimplify,
} from "./lib/map.ts";
import { parseConfig } from "./lib/config.ts";
import { type FeatureCollection } from "geojson";

const RAW_DIR = "data-raw";
const SOURCE_BASE =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson";
const MAP_MARGIN = 1.15;
const TOLERANCE = 0.0001;

async function downloadIfMissing(fileName: string): Promise<string> {
  const path = `${RAW_DIR}/${fileName}`;

  if (existsSync(path)) {
    console.log(`Using cached ${path}`);
    return path;
  }

  await mkdir(RAW_DIR, { recursive: true });

  console.log(`Downloading ${fileName}...`);
  const response = await fetch(`${SOURCE_BASE}/${fileName}`);
  if (!response.ok) {
    throw new Error(
      `Download failed for ${fileName}: ${response.status} ${response.statusText}`,
    );
  }

  await writeFile(path, await response.text());
  return path;
}

const landPath = await downloadIfMissing("ne_10m_land.geojson");
const coastlinePath = await downloadIfMissing("ne_10m_coastline.geojson");

const config = parseConfig(
  JSON.parse(await readFile("scripts/places.config.json", "utf8")),
);
const box = boundingBox(config.centre, config.radiusKm * MAP_MARGIN);

await buildLayer(landPath, "src/data/land.geojson", box);
await buildLayer(coastlinePath, "src/data/coastline.geojson", box);

async function buildLayer(
  inputPath: string,
  outputPath: string,
  box: BoundingBox,
): Promise<void> {
  const collection = JSON.parse(
    await readFile(inputPath, "utf8"),
  ) as FeatureCollection<ClippableGeometry>;
  const result = clipAndSimplify(collection, box, TOLERANCE);
  const text = JSON.stringify(result) + "\n";
  await writeFile(outputPath, text);
  console.log(
    `${outputPath}: ${result.features.length} features, ${Math.round(text.length / 1024)} KB`,
  );
}
