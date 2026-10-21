const QID_PATTERN = /^Q\d+$/;

export function qidFromUri(url: string): string {
  const index = url.lastIndexOf("/");
  const id = url.slice(index + 1);

  if (!QID_PATTERN.test(id)) {
    throw new Error(`Not a wikidata entity URI: ${url}`);
  }
  return id;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export function parsePoint(point: string): Coordinates {
  const coords = point.slice(point.indexOf("(") + 1, -1);
  const splitCoords = coords.split(" ");
  if (
    splitCoords.length !== 2 ||
    splitCoords[0] === "" ||
    splitCoords[1] === ""
  ) {
    throw new Error(`Not a valid coordinate point: ${point}`);
  }
  const latitude = Number(splitCoords[1]);
  const longitude = Number(splitCoords[0]);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error(`Not a valid coordinate point: ${point}`);
  }
  if (latitude < -90 || latitude > 90) {
    throw new Error(`Latitude out of range: ${point}`);
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error(`Longitude out of range: ${point}`);
  }
  return { lat: latitude, lon: longitude };
}

export interface PopulationFigure {
  population: number;
  date?: string;
}

export function latestPopulation(pops: PopulationFigure[]): number | undefined {
  if (pops.length === 0) {
    return undefined;
  }
  let latestDate = "0000-00-00";
  let pop = 0;
  for (const figure of pops) {
    if (figure.date !== undefined && figure.date > latestDate) {
      latestDate = figure.date;
      pop = figure.population;
    }
  }
  if (latestDate === "0000-00-00") {
    for (const figure of pops) {
      if (figure.population > pop) {
        pop = figure.population;
      }
    }
  }
  return pop;
}

export interface WikidataValue {
  value: string;
}

export interface WikidataRow {
  place: WikidataValue;
  placeLabel: WikidataValue;
  location: WikidataValue;
  countryCode?: WikidataValue;
  population?: WikidataValue;
  popDate?: WikidataValue;
}

export interface Town {
  id: string;
  name: string;
  countryCode: string;
  lat: number;
  lon: number;
  population: number;
}

export function buildTowns(
  rows: WikidataRow[],
  minPopulation: number,
): { towns: Town[]; missingPopulation: string[] } {
  const groups = new Map<string, WikidataRow[]>();
  const missingPopulation: string[] = [];
  const towns: Town[] = [];

  for (const row of rows) {
    const qnum = qidFromUri(row.place.value);
    let group = groups.get(qnum);
    if (group === undefined) {
      group = [];
      groups.set(qnum, group);
    }
    group.push(row);
  }
  for (const [qid, placeRows] of groups) {
    const first = placeRows[0];
    if (first === undefined) {
      throw new Error(`Empty group for ${qid}`);
    }
    const label = first.placeLabel.value;
    const location = first.location.value;
    const countryCode = first.countryCode?.value;

    const figures: PopulationFigure[] = [];
    for (const row of placeRows) {
      const population = row.population?.value;
      if (population !== undefined) {
        const value = Number(population);
        if (Number.isNaN(value)) {
          continue;
        }
        figures.push({
          population: Number(population),
          date: row.popDate?.value,
        });
      }
    }
    const pop = latestPopulation(figures);
    if (pop === undefined) {
      missingPopulation.push(`${label} (${qid})`);
    } else if (pop >= minPopulation) {
      if (countryCode === undefined) {
        throw new Error(`No country code for ${label} (${qid})`);
      }
      if (QID_PATTERN.test(label)) {
        throw new Error(`Place has no name (${qid})`);
      }
      const { lat, lon } = parsePoint(location);
      towns.push({
        id: qid,
        name: label,
        countryCode,
        lat,
        lon,
        population: pop,
      });
    }
  }
  towns.sort((a, b) => b.population - a.population);

  return { towns, missingPopulation };
}
