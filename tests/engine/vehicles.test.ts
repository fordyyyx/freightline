import { describe, it, expect } from "vitest";
import { findVehicleModel } from "../../src/engine/vehicles.ts";

describe("findVehicleModel", () => {
  it("returns the correct values for compact vans", () => {
    const compactVan = findVehicleModel("compactVan");

    expect(compactVan.capacityKg).toBe(750);
    expect(compactVan.price).toBe(350000);
  });

  it("returns the correct values for panel vans", () => {
    const panelVan = findVehicleModel("panelVan");

    expect(panelVan.capacityKg).toBe(1300);
    expect(panelVan.price).toBe(600000);
  });

  it("throws for an invalid vehicle id", () => {
    expect(() => findVehicleModel("lorry")).toThrow("Vehicle model not found");
  });

  it("throws for names inherited from objects", () => {
    expect(() => findVehicleModel("toString")).toThrow(
      "Vehicle model not found",
    );
  });
});
