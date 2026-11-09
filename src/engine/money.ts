export type CurrencyCode = "GBP";

export interface Money {
  readonly amount: number; // whole minor units
  readonly currency: CurrencyCode;
}
