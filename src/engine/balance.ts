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
  jobs: {
    basePay: 2000,
    payPerKm: 80,
    weightBonusPerTonne: 0.3,
    expressPayMultiplier: 1.4,
    referenceSpeedKmh: 52,
    offerLifetimeMinutes: 480,
    minLoadedKm: 8,
    expressChance: 0.25,
    standardSlack: { min: 2.0, max: 3.0 },
    expressSlack: { min: 1.3, max: 1.6 },
  },
  handling: {
    loadingMinutes: 20,
    unloadingMinutes: 20,
  },
  cargo: {
    parcels: { minWeightKg: 50, maxWeightKg: 300, payMultiplier: 1.0 },
    groceries: { minWeightKg: 100, maxWeightKg: 600, payMultiplier: 1.0 },
    furniture: { minWeightKg: 200, maxWeightKg: 700, payMultiplier: 1.15 },
    buildingSupplies: {
      minWeightKg: 400,
      maxWeightKg: 1250,
      payMultiplier: 0.95,
    },
    electronics: { minWeightKg: 100, maxWeightKg: 400, payMultiplier: 1.25 },
  },
} as const;
