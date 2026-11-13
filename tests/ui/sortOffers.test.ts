import { describe, it, expect } from "vitest";
import { sortOffers } from "../../src/ui/sortOffers.ts";
import type { Town } from "../../src/engine/world.ts";
import { makeOffer } from "../helpers/offers.ts";

const townA: Town = {
  lat: 50,
  lon: -4,
  id: "A",
  name: "townA",
  countryCode: "GB",
  population: 5000,
};
const townB: Town = {
  lat: 50.1,
  lon: -4,
  id: "B",
  name: "townB",
  countryCode: "GB",
  population: 6000,
};
const townC = {
  lat: 50.2,
  lon: -4,
  id: "C",
  name: "townC",
  countryCode: "GB",
  population: 7000,
};

const towns = [townA, townB, townC];

describe("sortOffers", () => {
  it("sorts by pay with highest first", () => {
    const highOffer = makeOffer({ pay: { amount: 10000, currency: "GBP" } });
    const standardOffer = makeOffer({ id: "job-2" });
    const offers = [standardOffer, highOffer];
    const sorted = sortOffers(offers, "pay", towns);

    expect(sorted).toEqual([highOffer, standardOffer]);
  });

  it("sorts by distance with shortest first", () => {
    const shortOffer = makeOffer({ originTownId: "A", destinationTownId: "B" });
    const longOffer = makeOffer({ originTownId: "A", destinationTownId: "C" });
    const offers = [longOffer, shortOffer];
    const sorted = sortOffers(offers, "distance", towns);

    expect(sorted).toEqual([shortOffer, longOffer]);
  });

  it("sorts by deadline with earliest first", () => {
    const closeOffer = makeOffer({ deadline: 20 });
    const farOffer = makeOffer({ deadline: 200 });
    const offers = [farOffer, closeOffer];
    const sorted = sortOffers(offers, "deadline", towns);

    expect(sorted).toEqual([closeOffer, farOffer]);
  });

  it("sorts by id when tied on sort category", () => {
    const lowOffer = makeOffer({ id: "job-1" });
    const highOffer = makeOffer({ id: "job-6" });
    const offers = [highOffer, lowOffer];
    const sorted = sortOffers(offers, "pay", towns);

    expect(sorted).toEqual([lowOffer, highOffer]);
  });

  it("sorts ids correctly when crossing tens barrier", () => {
    const nineOffer = makeOffer({ id: "job-9" });
    const tenOffer = makeOffer({ id: "job-10" });
    const offers = [tenOffer, nineOffer];
    const sorted = sortOffers(offers, "pay", towns);

    expect(sorted).toEqual([nineOffer, tenOffer]);
  });

  it("does not change the original array", () => {
    const lowOffer = makeOffer({ id: "job-1" });
    const highOffer = makeOffer({ id: "job-6" });
    const offers = [highOffer, lowOffer];
    sortOffers(offers, "pay", towns);

    expect(offers).toEqual([highOffer, lowOffer]);
  });
});
