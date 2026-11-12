import { balance } from "./balance.ts";

export type CargoType = keyof typeof balance.cargo;
export type Urgency = "standard" | "express";
