import type { TAmountFormat } from './payment-planner-params';

/*
 * Local on purpose: `platform/value-format.ts` has no `plain` / `compact` amount
 * variants, formats percents from fractions, and its `date` goes through
 * `new Date(iso)`, which can shift a `YYYY-MM-DD` day by the viewer's time zone.
 */
const CURRENCY_SYMBOLS: Readonly<Record<string, string>> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const NBSP = '\u00A0';
const DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/;

const groupedFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const groupedWholeFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
});
const percentFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function currencySymbol(currencyName: string): string {
  // Rows come from a data source: a missing currency name must not print "undefined".
  return typeof currencyName === 'string'
    ? (CURRENCY_SYMBOLS[currencyName] ?? currencyName)
    : '';
}

export interface IFormatAmountOptions {
  /** Drop the fraction (`1 248 500 ₽`) — for tight cards. Ignored when the value has kopecks. */
  compact?: boolean;
}

/**
 * Amount in one currency: `1 248 500,00 ₽` (`grouped`) or `1248500.00 ₽` (`plain`).
 * The number is never converted, only formatted.
 */
export function formatAmount(
  amount: number,
  currencyName: string,
  format: TAmountFormat,
  options: IFormatAmountOptions = {},
): string {
  const symbol = currencySymbol(currencyName);
  const isWhole = Number.isInteger(amount);
  const useWhole = options.compact === true && isWhole;
  let text: string;
  if (format === 'plain') {
    text = useWhole ? String(amount) : amount.toFixed(2);
  } else {
    text = (useWhole ? groupedWholeFormatter : groupedFormatter).format(amount);
  }
  return symbol === '' ? text : `${text}${NBSP}${symbol}`;
}

/**
 * Whole-percent values for one currency's shares that add up to exactly 100
 * (largest remainder method): plain rounding of `55.1 + 28.0 + 16.8` would show 99.
 * `sharePercent` itself stays unrounded in the plan.
 */
export function distributePercents(shares: readonly number[]): number[] {
  const total = Math.round(shares.reduce((sum, share) => sum + share, 0));
  const floors = shares.map((share) => Math.max(0, Math.floor(share)));
  let rest = total - floors.reduce((sum, value) => sum + value, 0);
  const byRemainder = shares
    .map((share, index) => ({ index, remainder: share - Math.floor(share) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (const { index } of byRemainder) {
    if (rest <= 0) {
      break;
    }
    floors[index] += 1;
    rest -= 1;
  }
  return floors;
}

export function formatPercent(value: number): string {
  return `${percentFormatter.format(value)}%`;
}

/** `2026-10-02` → `02.10.2026`; anything else is shown as received. */
export function formatDate(value: string): string {
  const match = DATE_PREFIX.exec(value);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
}

/** Russian plural form: `pluralize(2, ['счёт', 'счёта', 'счетов'])` → `счёта`. */
export function pluralize(
  count: number,
  forms: readonly [string, string, string],
): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) {
    return forms[2];
  }
  if (last === 1) {
    return forms[0];
  }
  if (last >= 2 && last <= 4) {
    return forms[1];
  }
  return forms[2];
}
