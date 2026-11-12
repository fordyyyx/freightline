import { useState } from "react";
import { useGameStore } from "./store.ts";
import { sortOffers } from "./sortOffers.ts";
import { findTown } from "../engine/world.ts";
import type { OfferSort } from "./sortOffers.ts";
import type { CargoType } from "../engine/jobs";
import { formatMoney, formatShortGameTime } from "./format.ts";
import { offerLoadedKm } from "../engine/offers.ts";

export default function JobBoard() {
  const board = useGameStore((store) => store.game.board);
  const towns = useGameStore((store) => store.game.towns);

  const [sortBy, setSortBy] = useState<OfferSort>("pay");

  const SORT_OPTIONS: readonly { sortBy: OfferSort; label: string }[] = [
    { sortBy: "pay", label: "Pay" },
    { sortBy: "distance", label: "Distance" },
    { sortBy: "deadline", label: "Deadline" },
  ];

  const CARGO_LABELS: Record<CargoType, string> = {
    parcels: "Parcels",
    groceries: "Groceries",
    furniture: "Furniture",
    buildingSupplies: "Building Supplies",
    electronics: "Electronics",
  };

  const offers = sortOffers(board, sortBy, towns);

  return (
    <div className="job-board">
      <div
        className="job-board-sort-by"
        role="group"
        aria-label="Job board sort"
      >
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            aria-pressed={option.sortBy === sortBy}
            onClick={() => setSortBy(option.sortBy)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="job-board-table">
        <table>
          <th>
            <td>Route</td>
            <td>Cargo</td>
            <td>Weight</td>
            <td>Pay</td>
            <td>Distance</td>
            <td>Deadline</td>
          </th>
          {offers.map((offer) => (
            <tr key={offer.id}>
              <td>{`${findTown(towns, offer.originTownId).name} -> ${findTown(towns, offer.destinationTownId).name}`}</td>
              <td>
                {`${CARGO_LABELS[offer.cargo]}` +
                  (offer.urgency === "express" ? " Express" : "")}
              </td>
              <td>{`${offer.weightKg} kg`}</td>
              <td>{`${formatMoney(offer.pay)}`}</td>
              <td>{`${Math.round(offerLoadedKm(towns, offer))} km`}</td>
              <td>{`${formatShortGameTime(offer.deadline)}`}</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
}
