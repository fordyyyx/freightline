import type { Coordinates } from "./distance.ts";

export interface Town extends Coordinates {
  readonly id: string;
  readonly name: string;
  readonly countryCode: string;
  readonly population: number;
}
