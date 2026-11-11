import {
  BELOW_ONE_PERCENT_LABEL,
  NUMBER_LOCALE,
  PERCENT_FRACTION_DIGITS,
  PERCENT_TOTAL,
} from '@planner/config/format-locale';

const percentFormatter = new Intl.NumberFormat(NUMBER_LOCALE, {
  minimumFractionDigits: 0,
  maximumFractionDigits: PERCENT_FRACTION_DIGITS,
});

export function formatPercent(percent: number): string {
  return `${percentFormatter.format(percent)}%`;
}

/**
 * A provider's share as text: the whole-percent value, except that a real (non-zero)
 * share which rounds to zero reads `<1%` instead of a misleading `0%`.
 */
export function formatShare(displayedPercent: number, exactPercent: number): string {
  return displayedPercent === 0 && exactPercent > 0
    ? BELOW_ONE_PERCENT_LABEL
    : formatPercent(displayedPercent);
}

/**
 * Whole-percent values for one currency's shares that add up to exactly 100
 * (largest remainder method): plain rounding of thirds would show 99.
 * `sharePercent` itself stays unrounded in the plan.
 */
export function distributePercents(shares: readonly number[]): number[] {
  const sharesTotal = Math.round(shares.reduce((sum, share) => sum + share, 0));
  const target = shares.length === 0 ? 0 : Math.min(sharesTotal, PERCENT_TOTAL);
  const wholeParts = shares.map((share) => Math.max(0, Math.floor(share)));
  let remainingUnits =
    target - wholeParts.reduce((sum, wholePart) => sum + wholePart, 0);
  const sharesByRemainder = shares
    .map((share, shareIndex) => ({
      shareIndex,
      remainder: share - Math.floor(share),
    }))
    .sort(
      (first, second) =>
        second.remainder - first.remainder ||
        first.shareIndex - second.shareIndex,
    );
  for (const { shareIndex } of sharesByRemainder) {
    if (remainingUnits <= 0) {
      break;
    }
    wholeParts[shareIndex] += 1;
    remainingUnits -= 1;
  }
  return wholeParts;
}
