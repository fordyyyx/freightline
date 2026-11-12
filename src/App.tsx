import "./App.css";
import MapView from "./ui/MapView.tsx";
import TopBar from "./ui/TopBar.tsx";
import { currentCalendarMinutes } from "./engine/time.ts";
import { useGameLoop } from "./ui/useGameLoop.ts";
import { useGameStore } from "./ui/store.ts";

function App() {
  useGameLoop();
  const game = useGameStore((store) => store.game);
  return (
    <div className="app">
      <TopBar
        companyName={game.company.name}
        cash={game.company.cash}
        calendarMinutes={currentCalendarMinutes(game)}
      />
      <MapView />
    </div>
  );
}

export default App;
