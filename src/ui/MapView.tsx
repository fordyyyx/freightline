import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FeatureCollection } from "geojson";
import landText from "../data/land.geojson?raw";

const land = JSON.parse(landText) as FeatureCollection;

const PLYMOUTH: L.LatLngTuple = [50.3755, -4.1427];
const START_ZOOM = 8;

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }

    const map = L.map(container, { center: PLYMOUTH, zoom: START_ZOOM });

    L.geoJSON(land, {
      style: {
        color: "#5b7d4a",
        weight: 1,
        fillColor: "d9e8c3",
        fillOpacity: 1,
      },
    }).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  return <div ref={containerRef} className="map" />;
}
