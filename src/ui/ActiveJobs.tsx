import { useGameStore } from "./store.ts";
import { findTown } from "../engine/world.ts";
import { STATUS_LABELS, vehicleLabel } from "./labels.ts";
import { findVehicle } from "../engine/vehicles.ts";
import { formatShortGameTime } from "./format.ts";
import "./ActiveJobs.css";

export default function ActiveJobs() {
  const activeJobs = useGameStore((store) => store.game.activeJobs);
  const vehicles = useGameStore((store) => store.game.company.vehicles);
  const towns = useGameStore((store) => store.game.towns);

  return (
    <section className="active-jobs" aria-labelledby="active-jobs-heading">
      <h2 id="active-jobs-heading">In progress</h2>
      <table>
        <thead>
          <tr>
            <th>Route</th>
            <th>Van</th>
            <th>Status</th>
            <th className="job-board__number">ETA</th>
          </tr>
        </thead>
        <tbody>
          {activeJobs.map((active) => {
            const vehicle = findVehicle(vehicles, active.vehicleId);
            return (
              <tr>
                <td>{`${findTown(towns, active.job.originTownId).name} → ${findTown(towns, active.job.destinationTownId).name}`}</td>
                <td>{vehicleLabel(vehicle)}</td>
                <td>{STATUS_LABELS[vehicle.status]}</td>
                <td className="job-board__number">
                  {formatShortGameTime(active.eta)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
