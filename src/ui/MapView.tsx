import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";
import type { FeatureCollection } from "geojson";
import landText from "../data/land.geojson?raw";
import { useGameStore } from "./store.ts";
import { depotTowns } from "../engine/world.ts";

const land = JSON.parse(landText) as FeatureCollection;

const START_ZOOM = 8;

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }

    const { game } = useGameStore.getState(); // state is only read once as v0.1 does not add depots mid game
    const depots = depotTowns(game);
    const [home] = depots;

    const map = L.map(container, {
      center: [home.lat, home.lon],
      zoom: START_ZOOM,
    });

    L.geoJSON(land, {
      style: {
        color: "#5b7d4a",
        weight: 1,
        fillColor: "#d9e8c3",
        fillOpacity: 1,
      },
    }).addTo(map);

    const depotTownIds = new Set(
      game.company.depots.map((depot) => depot.townId),
    );

    for (const town of game.towns) {
      if (depotTownIds.has(town.id)) {
        continue;
      }
      L.circleMarker([town.lat, town.lon], {
        radius: 5,
        color: "#2b2b2b",
        weight: 1.5,
        fillColor: "#ffffff",
        fillOpacity: 1,
      })
        .bindTooltip(town.name)
        .addTo(map);
    }

    for (const town of depots) {
      L.circleMarker([town.lat, town.lon], {
        radius: 8,
        color: "#2b2b2b",
        weight: 1.5,
        fillColor: "#f2a900",
        fillOpacity: 1,
      })
        .bindTooltip(`${town.name} (depot)`)
        .addTo(map);
    }

    return () => {
      map.remove();
    };
  }, []);

  return <div ref={containerRef} className="map" />;
}
