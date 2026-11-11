import {
  DEFAULT_ROW_LIMIT,
  DEFAULT_SELECTED_COUNT,
} from '@planner/config/defaults';
import { ALL_FILTER_VALUE, type TIdFilter } from '@planner/config/filters';
import { EPlannerParamKey } from '@planner/config/param-keys';
import { readString } from '@platform/widget-param-readers';
import {
  WIDGET_ROW_LIMITS,
  type TWidgetRowLimit,
} from '@platform/widget-types';

/**
 * The README types these params as numbers, so only real finite numbers count;
 * a string such as `'7'` is an error and takes the fallback.
 */
export function readFiniteNumber(paramValue: unknown): number | null {
  return typeof paramValue === 'number' && Number.isFinite(paramValue)
    ? paramValue
    : null;
}

export function readTrimmedText(paramValue: unknown): string {
  return readString(paramValue).trim();
}

/** Rounded and clamped to `>= 0`; a missing or invalid value falls back to the default. */
export function readSelectedCount(paramValue: unknown): number {
  const parsedCount = readFiniteNumber(paramValue);
  return parsedCount === null
    ? DEFAULT_SELECTED_COUNT
    : Math.max(0, Math.round(parsedCount));
}

/** Unique finite numbers; anything else in the array is dropped. */
export function readCurrencyIds(paramValue: unknown): number[] {
  if (!Array.isArray(paramValue)) {
    return [];
  }
  const currencyIds = new Set<number>();
  for (const candidateId of paramValue) {
    const currencyId = readFiniteNumber(candidateId);
    if (currencyId !== null) {
      currencyIds.add(currencyId);
    }
  }
  return Array.from(currencyIds);
}

/** A finite id, or {@link ALL_FILTER_VALUE} for `'all'`, a missing value or anything unusable. */
export function readIdFilter(paramValue: unknown): TIdFilter {
  return readFiniteNumber(paramValue) ?? ALL_FILTER_VALUE;
}

function asAllowedRowLimit(paramValue: unknown): TWidgetRowLimit | null {
  const parsedLimit = readFiniteNumber(paramValue);
  return (
    WIDGET_ROW_LIMITS.find((allowedLimit) => allowedLimit === parsedLimit) ??
    null
  );
}

/** `rowLimit` wins; the legacy `maxRows` is used when `rowLimit` is absent or not allowed. */
export function readRowLimit(params: Record<string, unknown>): TWidgetRowLimit {
  return (
    asAllowedRowLimit(params[EPlannerParamKey.RowLimit]) ??
    asAllowedRowLimit(params[EPlannerParamKey.MaxRows]) ??
    DEFAULT_ROW_LIMIT
  );
}
