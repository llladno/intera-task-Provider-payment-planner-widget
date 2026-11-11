import { ISO_DATE_PATTERN } from '@planner/config/format-locale';

/** `2026-10-02` → `02.10.2026`; anything else is shown as received. */
export function formatDate(isoDate: string): string {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (!match) {
    return isoDate;
  }
  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
}
