const MS_PER_MIN = 60_000;

export function toCalendarMinutes(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const epochMs = Date.UTC(year, month - 1, day, hour, minute); // Date.UTC counts months from 0
  return epochMs / MS_PER_MIN;
}
