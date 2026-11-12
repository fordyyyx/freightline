import "./App.css";
import MapView from "./ui/MapView.tsx";
import TopBar from "./ui/TopBar.tsx";
import JobBoard from "./ui/JobBoard.tsx";
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
      <main className="app__main">
        <JobBoard />
        <MapView />
      </main>
    </div>
  );
}

export default App;
