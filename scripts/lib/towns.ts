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
