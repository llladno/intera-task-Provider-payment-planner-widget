import {
  EAmountFormat,
  type TAmountFormat,
} from '@planner/config/amount-format';
import { CURRENCY_SYMBOLS, type ECurrencyCode } from '@planner/config/currency';
import {
  AMOUNT_FRACTION_DIGITS,
  NON_BREAKING_SPACE,
  NUMBER_LOCALE,
} from '@planner/config/format-locale';

const groupedFormatter = new Intl.NumberFormat(NUMBER_LOCALE, {
  minimumFractionDigits: AMOUNT_FRACTION_DIGITS,
  maximumFractionDigits: AMOUNT_FRACTION_DIGITS,
});
const groupedWholeFormatter = new Intl.NumberFormat(NUMBER_LOCALE, {
  maximumFractionDigits: 0,
});

/** Symbol of a known currency, the code of an unknown one, `''` for a missing name. */
export function currencySymbol(currencyName: string): string {
  // Rows come from a data source: a missing currency name must not print "undefined".
  if (typeof currencyName !== 'string') {
    return '';
  }
  return CURRENCY_SYMBOLS[currencyName as ECurrencyCode] ?? currencyName;
}

export interface IFormatAmountOptions {
  /** Drop the fraction (`1 248 500 ₽`) — for tight cards. Ignored when the value has kopecks. */
  compact?: boolean;
}

/*
 * Local on purpose: `platform/value-format.ts` has no `plain` / `compact` amount
 * variants, formats percents from fractions, and its `date` goes through
 * `new Date(iso)`, which can shift a `YYYY-MM-DD` day by the viewer's time zone.
 */

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
  const useWholeNumber = options.compact === true && Number.isInteger(amount);
  let numberText: string;
  if (format === EAmountFormat.Plain) {
    numberText = useWholeNumber
      ? String(amount)
      : amount.toFixed(AMOUNT_FRACTION_DIGITS);
  } else {
    const formatter = useWholeNumber ? groupedWholeFormatter : groupedFormatter;
    numberText = formatter.format(amount);
  }
  return symbol === '' ? numberText : `${numberText}${NON_BREAKING_SPACE}${symbol}`;
}
