import type { CurrencyCode, Money } from "../engine/money.ts";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const moneyFormatters: Record<CurrencyCode, Intl.NumberFormat> = {
  GBP: new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }),
};

export function formatMoney(money: Money): string {
  return moneyFormatters[money.currency].format(money.amount / 100);
}

export function formatGameDate(calendarMinutes: number): string {
  const dateParts = dateFormatter.formatToParts(
    new Date(calendarMinutes * 60_000),
  );
  const p = Object.fromEntries(dateParts.map((p) => [p.type, p.value]));
  return `${p.weekday} ${p.day} ${p.month} ${p.year}, ${p.hour}:${p.minute}`;
}
