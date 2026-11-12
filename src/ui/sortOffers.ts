import type { JobOffer } from "../engine/jobs.ts";
import type { Town } from "../engine/world.ts";
import { offerLoadedKm } from "../engine/offers.ts";

export type OfferSort = "pay" | "distance" | "deadline";

export function sortOffers(
  offers: readonly JobOffer[],
  sortBy: OfferSort,
  towns: readonly Town[],
): JobOffer[] {
  return [...offers].sort(
    (a, b) => compareBy(sortBy, a, b, towns) || compareIds(a.id, b.id),
  );
}

function compareBy(
  sortBy: OfferSort,
  a: JobOffer,
  b: JobOffer,
  towns: readonly Town[],
) {
  switch (sortBy) {
    case "pay":
      return b.pay.amount - a.pay.amount;
    case "distance":
      return offerLoadedKm(towns, a) - offerLoadedKm(towns, b);
    case "deadline":
      return a.deadline - b.deadline;
  }
}

function compareIds(a: string, b: string) {
  return a.localeCompare(b, "en", { numeric: true });
}
