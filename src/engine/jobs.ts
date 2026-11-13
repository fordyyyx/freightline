import { balance } from "./balance.ts";
import type { Money } from "./money.ts";

export type CargoType = keyof typeof balance.cargo;
export type Urgency = "standard" | "express";

const QUARTER_HOUR_MINUTES = 15;
const FLOAT_TOLERANCE = 1e-9; // stops Math.ceil rounding up because of float storage precision.

export interface JobPayInput {
  readonly loadedKm: number;
  readonly weightKg: number;
  readonly cargo: CargoType;
  readonly urgency: Urgency;
}

export function jobPay(input: JobPayInput): number {
  const basePay = balance.jobs.basePay;
  const payPerKm = balance.jobs.payPerKm;
  const loadedKm = input.loadedKm;

  const cargoMultiplier = balance.cargo[input.cargo].payMultiplier;
  const urgencyMultiplier =
    input.urgency === "express" ? balance.jobs.expressPayMultiplier : 1.0;
  const weightBonus =
    1 + (balance.jobs.weightBonusPerTonne * input.weightKg) / 1000;

  const pounds = Math.round(
    ((basePay + payPerKm * loadedKm) *
      cargoMultiplier *
      urgencyMultiplier *
      weightBonus) /
      100,
  );
  return pounds * 100;
}

export function estimatedJobMinutes(
  depotToOriginKm: number,
  loadedKm: number,
): number {
  const totalDistance = depotToOriginKm + loadedKm;
  const baseMinutes = (totalDistance / balance.jobs.referenceSpeedKmh) * 60;
  return (
    baseMinutes +
    balance.handling.loadingMinutes +
    balance.handling.unloadingMinutes
  );
}

export function jobEta(
  acceptedAt: number,
  emptyKm: number,
  loadedKm: number,
  speedKmh: number,
): number {
  return Math.ceil(
    acceptedAt +
      ((emptyKm + loadedKm) / speedKmh) * 60 +
      balance.handling.loadingMinutes +
      balance.handling.unloadingMinutes -
      FLOAT_TOLERANCE,
  );
}

export function jobDeadline(
  createdAt: number,
  estimateMinutes: number,
  slack: number,
): number {
  const baseDeadline = createdAt + estimateMinutes * slack;
  return (
    Math.ceil(baseDeadline / QUARTER_HOUR_MINUTES - FLOAT_TOLERANCE) *
    QUARTER_HOUR_MINUTES
  );
}

export interface JobOffer {
  readonly id: string;
  readonly originTownId: string;
  readonly destinationTownId: string;
  readonly cargo: CargoType;
  readonly weightKg: number;
  readonly urgency: Urgency;
  readonly pay: Money;
  readonly createdAt: number; // calendar minutes
  readonly expiresAt: number; // calendar minutes
  readonly deadline: number; // calendar minutes
}

export interface ActiveJob {
  readonly job: JobOffer;
  readonly vehicleId: string;
  readonly acceptedAt: number; // calendar minutes
  readonly eta: number; // calendar minutes
}
