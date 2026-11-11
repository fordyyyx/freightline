export const balance = {
  world: {
    roadFactor: 1.3,
    jobRadiusKm: 100,
  },
  time: {
    gameMinutesPerRealSecond: 2.4,
  },
  vehicles: {
    compactVan: {
      mode: "road",
      capacityKg: 750,
      speedKmh: 55,
      price: 350000,
      fuelLitresPer100Km: 7.5,
      maintenancePerKm: 6,
    },
    panelVan: {
      mode: "road",
      capacityKg: 1300,
      speedKmh: 52,
      price: 600000,
      fuelLitresPer100Km: 9.5,
      maintenancePerKm: 8,
    },
  },
} as const;
