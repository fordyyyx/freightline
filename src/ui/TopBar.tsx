import type { Money } from "../engine/money.ts";
import { formatGameDate, formatMoney } from "./format.ts";

interface TopBarProps {
  companyName: string;
  cash: Money;
  calendarMinutes: number;
}

export default function TopBar({
  companyName,
  cash,
  calendarMinutes,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <span className="top-bar__company">{companyName}</span>
      <div className="top-bar__status">
        <span>{formatGameDate(calendarMinutes)}</span>
        <span>{formatMoney(cash)}</span>
      </div>
    </header>
  );
}
