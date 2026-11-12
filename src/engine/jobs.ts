import { balance } from "./balance.ts";

export type CargoType = keyof typeof balance.cargo;
export type Urgency = "standard" | "express";

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
    input.urgency == "express" ? balance.jobs.expressPayMultiplier : 1.0;
  const weightBonus =
    1 + (balance.jobs.weightBonusPerTonne * input.weightKg) / 1000;

  const jobPay = Math.round(
    ((basePay + payPerKm * loadedKm) *
      cargoMultiplier *
      urgencyMultiplier *
      weightBonus) /
      100,
  );
  return jobPay * 100;
}
