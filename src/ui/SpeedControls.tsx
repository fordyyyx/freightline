import type { Speed } from "../engine/clock.ts";
import { useGameStore } from "./store.ts";
import "./SpeedControls.css";

const SPEED_OPTIONS: readonly { speed: Speed; label: string }[] = [
  { speed: 0, label: "Pause" },
  { speed: 1, label: "1x" },
  { speed: 2, label: "2x" },
  { speed: 4, label: "4x" },
];

export default function SpeedControls() {
  const speed = useGameStore((store) => store.speed);
  const setSpeed = useGameStore((store) => store.setSpeed);

  return (
    <div className="speed-controls" role="group" aria-label="Game speed">
      {SPEED_OPTIONS.map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={option.speed === speed}
          onClick={() => setSpeed(option.speed)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
