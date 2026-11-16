import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";
import type { FeatureCollection } from "geojson";
import landText from "../data/land.geojson?raw";
import { useGameStore } from "./store.ts";
import { depotTowns } from "../engine/world.ts";
import { vehicleNextStop, vehiclePositionAt } from "../engine/dispatch.ts";
import { vanTooltipLines } from "./labels.ts";

const land = JSON.parse(landText) as FeatureCollection;

const START_ZOOM = 8;

function tooltipElement(lines: string[]): HTMLElement {
  const element = document.createElement("div");
  element.className = "van-tooltip";
  lines.forEach((text, i) => {
    const line = document.createElement("div");
    line.className = i === 0 ? "van-tooltip__title" : "van-tooltip__line";
    line.textContent = text;
    element.append(line);
  });
  return element;
}

const VAN_ICON = L.divIcon({
  className: "van-marker",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const vanMarkersRef = useRef(new Map<string, L.Marker>());
  const routeLinesRef = useRef(new Map<string, L.Polyline>());
  const game = useGameStore((store) => store.game);

  useEffect(() => {
    const container = containerRef.current;
    const vanMarkers = vanMarkersRef.current;
    const routeLines = routeLinesRef.current;
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
    mapRef.current = map;

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
      mapRef.current = null;
      vanMarkers.clear();
      routeLines.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map === null) {
      return;
    }
    for (const vehicle of game.company.vehicles) {
      const position = vehiclePositionAt(game, vehicle);
      const latLng: L.LatLngExpression = [position.lat, position.lon];
      const existing = vanMarkersRef.current.get(vehicle.id);
      const tooltipLines = vanTooltipLines(game, vehicle);
      if (existing === undefined) {
        const marker = L.marker(latLng, { icon: VAN_ICON })
          .bindTooltip(tooltipElement(tooltipLines))
          .addTo(map);
        vanMarkersRef.current.set(vehicle.id, marker);
      } else {
        existing.setLatLng(latLng);
        existing.setTooltipContent(tooltipElement(tooltipLines));
      }
      const nextStop = vehicleNextStop(game, vehicle);
      const points: L.LatLngExpression[] =
        nextStop === null ? [] : [latLng, [nextStop.lat, nextStop.lon]];
      const existingLine = routeLinesRef.current.get(vehicle.id);
      if (existingLine === undefined) {
        const line = L.polyline(points, {
          color: "#2b2b2b",
          weight: 2,
          dashArray: "6 6",
          interactive: false,
        }).addTo(map);
        routeLinesRef.current.set(vehicle.id, line);
      } else {
        existingLine.setLatLngs(points);
      }
    }
  }, [game]);

  return <div ref={containerRef} className="map" />;
}
