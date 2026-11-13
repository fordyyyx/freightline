import { acceptBlockedReason, eligibleVehicles } from "../engine/dispatch.ts";
import type { AcceptBlock } from "../engine/dispatch.ts";
import { useGameStore } from "./store.ts";
import type { JobOffer } from "../engine/jobs.ts";
import { vehicleLabel } from "./labels.ts";
import { useState } from "react";
import "./DispatchPanel.css";

interface DispatchPanelProps {
  offer: JobOffer;
  onDone: () => void;
}

const BLOCK_REASONS: Record<AcceptBlock, string> = {
  noIdleVan: "No idle van",
  tooHeavy: "Too heavy for any idle van",
};

export default function DispatchPanel({ offer, onDone }: DispatchPanelProps) {
  const game = useGameStore((store) => store.game);
  const vans = eligibleVehicles(game, offer);
  const [chosenId, setChosenId] = useState<string | null>(
    vans[0]?.vehicle.id ?? null,
  );
  const blocked = acceptBlockedReason(game, offer);

  function accept() {
    if (chosenId === null) {
      return;
    }
    useGameStore.getState().acceptJob(offer.id, chosenId);
    onDone();
  }

  return (
    <div className="dispatch-panel">
      {blocked !== null ? (
        <p className="dispatch-panel__reason">{BLOCK_REASONS[blocked]}</p>
      ) : (
        <fieldset className="dispatch-panel__vans">
          <legend>Choose a van</legend>
          {vans.map(({ vehicle, emptyKm }) => (
            <label key={vehicle.id}>
              <input
                type="radio"
                name="van"
                value={vehicle.id}
                checked={vehicle.id === chosenId}
                onChange={() => setChosenId(vehicle.id)}
              />
              {vehicleLabel(vehicle)}, {Math.round(emptyKm)} km away
            </label>
          ))}
        </fieldset>
      )}

      <button type="button" disabled={blocked !== null} onClick={accept}>
        Accept
      </button>
    </div>
  );
}
