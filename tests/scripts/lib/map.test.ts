import { boundingBox } from "../../../scripts/lib/map.ts";
import { describe, it, expect } from "vitest";

describe("boundingBox", () => {
  it("extends latitude equally north and south", () => {
    const centre = { lat: 50.3755, lon: -4.1427 };

    const [, minLat, , maxLat] = boundingBox(centre, 100);

    expect(minLat).toBeCloseTo(49.4772, 3);
    expect(maxLat).toBeCloseTo(51.2738, 3);
  });

  it("extends longitude further than latitude away from the equator", () => {
    const centre = { lat: 50.3755, lon: -4.1427 };

    const [minLon, , maxLon] = boundingBox(centre, 100);

    expect(minLon).toBeCloseTo(-5.5512, 3);
    expect(maxLon).toBeCloseTo(-2.7342, 3);
  });

  it("extends latitude and longitude equally at the equator", () => {
    const centre = { lat: 0, lon: 0 };

    const [minLon, minLat, maxLon, maxLat] = boundingBox(centre, 100);

    expect(minLon).toBeCloseTo(-0.8983, 3);
    expect(minLat).toBeCloseTo(-0.8983, 3);
    expect(maxLon).toBeCloseTo(0.8983, 3);
    expect(maxLat).toBeCloseTo(0.8983, 3);
  });

  it("centres the box on the input", () => {
    const centre = { lat: 50.3755, lon: -4.1427 };

    const [minLon, minLat, maxLon, maxLat] = boundingBox(centre, 100);

    expect((minLat + maxLat) / 2).toBeCloseTo(50.3755, 3);
    expect((minLon + maxLon) / 2).toBeCloseTo(-4.1427, 3);
  });

  it("stores the minimums before the maximums", () => {
    const centre = { lat: 50.3755, lon: -4.1427 };

    const [minLon, minLat, maxLon, maxLat] = boundingBox(centre, 100);

    expect(minLon).toBeLessThan(maxLon);
    expect(minLat).toBeLessThan(maxLat);
  });

  it("caps latitude at the pole", () => {
    const centre = { lat: 89.5, lon: 0 };

    const [, , , maxLat] = boundingBox(centre, 100);

    expect(maxLat).toBe(90);
  });

  it("rejects a box that reaches past |180| near the pole", () => {
    const centre = { lat: 89.8, lon: 0 };

    expect(() => boundingBox(centre, 100)).toThrow(
      "Play area crosses the 180 degree meridian, which is not supported yet",
    );
  });

  it("rejects a box that crosses the 180 degree meridian", () => {
    const centre = { lat: -17.7, lon: 179.4 };

    expect(() => boundingBox(centre, 100)).toThrow(
      "Play area crosses the 180 degree meridian, which is not supported yet",
    );
  });
});
