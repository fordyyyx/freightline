import "./App.css";
import MapView from "./ui/MapView.tsx";
import TopBar from "./ui/TopBar.tsx";
import towns from "./data/towns.json";
import { plymouthSandbox } from "./engine/scenarios.ts";
import { createGame, currentCalendarMinutes } from "./engine/state.ts";

const game = createGame(plymouthSandbox, towns);

function App() {
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
