import { useState } from "react";
import { useGameStore } from "./store.ts";
import { sortOffers } from "./sortOffers.ts";
import { findTown } from "../engine/world.ts";
import type { OfferSort } from "./sortOffers.ts";
import { CARGO_LABELS } from "./labels.ts";
import { formatMoney, formatShortGameTime } from "./format.ts";
import { offerLoadedKm } from "../engine/offers.ts";
import DispatchPanel from "./DispatchPanel.tsx";
import ActiveJobs from "./ActiveJobs.tsx";
import "./JobBoard.css";

const SORT_OPTIONS: readonly { sortBy: OfferSort; label: string }[] = [
  { sortBy: "pay", label: "Pay" },
  { sortBy: "distance", label: "Distance" },
  { sortBy: "deadline", label: "Deadline" },
];

export default function JobBoard() {
  const board = useGameStore((store) => store.game.board);
  const towns = useGameStore((store) => store.game.towns);

  const [sortBy, setSortBy] = useState<OfferSort>("pay");

  const offers = sortOffers(board, sortBy, towns);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = board.find((offer) => offer.id === selectedId);

  return (
    <div className="job-board">
      <div className="job-board__sort" role="group" aria-label="Job board sort">
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
      <div className="job-board__table">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Cargo</th>
              <th className="job-board__number">Pay</th>
              <th className="job-board__number">Distance</th>
              <th className="job-board__number">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 && (
              <tr>
                <td colSpan={5}>No jobs available right now</td>
              </tr>
            )}
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td>
                  <button
                    type="button"
                    className="job-board__select"
                    aria-pressed={offer.id === selectedId}
                    onClick={() => setSelectedId(offer.id)}
                  >{`${findTown(towns, offer.originTownId).name} → ${findTown(towns, offer.destinationTownId).name}`}</button>
                </td>
                <td>
                  {CARGO_LABELS[offer.cargo]}{" "}
                  {offer.urgency === "express" && (
                    <span className="job-board__express">Express</span>
                  )}
                  <span className="job-board__weight">{`${offer.weightKg} kg`}</span>
                </td>
                <td className="job-board__number">{formatMoney(offer.pay)}</td>
                <td className="job-board__number">{`${Math.round(offerLoadedKm(towns, offer))} km`}</td>
                <td className="job-board__number">
                  {formatShortGameTime(offer.deadline)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selected && (
          <DispatchPanel
            key={selected.id}
            offer={selected}
            onDone={() => setSelectedId(null)}
          />
        )}
        <ActiveJobs />
      </div>
    </div>
  );
}
