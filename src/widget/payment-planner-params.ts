import {
  isRecord,
  readBoolean,
  readEnum,
  readString,
} from '../platform/widget-param-readers';
import {
  WIDGET_ROW_LIMITS,
  WIDGET_SIZES,
  type TWidgetRowLimit,
  type TWidgetSize,
} from '../platform/widget-types';

export const AMOUNT_FORMATS = ['grouped', 'plain'] as const;
export type TAmountFormat = (typeof AMOUNT_FORMATS)[number];

export const DEFAULT_SELECTED_COUNT = 10;
export const DEFAULT_ROW_LIMIT: TWidgetRowLimit = 10;
export const DEFAULT_DESCRIPTION = 'Provider Payment Planner';

export interface IPaymentPlannerConfig {
  /** Card header title (`params.description`, with fallback to `params.title` or `'Provider Payment Planner'`). */
  description: string;
  /** Optional card header subtitle (`params.subtitle`). */
  subtitle: string;
  /** Card width slot (`full` | `half` | `third` | `quarter`). */
  size: TWidgetSize;
  /** Number of top ranked invoices to include in the payment plan (`>= 0`, integer). Default: `10`. */
  selectedCount: number;
  /** Currency filter (`provider_currency_id[]`). Empty array means all currencies. */
  currencyIds: number[];
  /** Provider filter (`'all'` or a positive finite `provider_id`). Default: `'all'`. */
  providerId: number | 'all';
  /** Billing cycle filter (`'all'` or a finite `billing_cycle_id`). Default: `'all'`. */
  billingCycleId: number | 'all';
  /** Number formatting style (`'grouped'` with thousands separators or `'plain'`). Default: `'grouped'`. */
  amountFormat: TAmountFormat;
  /** Maximum rows displayed in the queue table (`10 | 25 | 50 | 100`, reads `rowLimit` or `maxRows`). Default: `10`. */
  rowLimit: TWidgetRowLimit;
  /** Whether to show matched customer bill information in row details. Default: `true`. */
  showCustomerBills: boolean;
  /** Whether to show per-provider breakdown. Default: `true`. */
  showProviderBreakdown: boolean;
  /** Whether to show top-level summary counters and currency totals. Default: `true`. */
  showSummary: boolean;
}

/**
 * The README types these params as numbers, so only real finite numbers count;
 * a string such as `'7'` is an error and takes the fallback.
 */
function toNumberParam(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readTrimmed(value: unknown): string {
  return readString(value).trim();
}

function readSelectedCount(value: unknown): number {
  const parsed = toNumberParam(value);
  return parsed === null
    ? DEFAULT_SELECTED_COUNT
    : Math.max(0, Math.round(parsed));
}

function readCurrencyIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const ids = new Set<number>();
  for (const item of value) {
    const id = toNumberParam(item);
    if (id !== null) {
      ids.add(id);
    }
  }
  return Array.from(ids);
}

/** A finite number, or `'all'` for `'all'`, a missing value or anything unusable. */
function readIdOrAll(value: unknown): number | 'all' {
  return toNumberParam(value) ?? 'all';
}

function asRowLimit(value: unknown): TWidgetRowLimit | null {
  const parsed = toNumberParam(value);
  return WIDGET_ROW_LIMITS.find((limit) => limit === parsed) ?? null;
}

/** `rowLimit` wins; the legacy `maxRows` is used when `rowLimit` is absent or not allowed. */
function readRowLimit(params: Record<string, unknown>): TWidgetRowLimit {
  return (
    asRowLimit(params.rowLimit) ??
    asRowLimit(params.maxRows) ??
    DEFAULT_ROW_LIMIT
  );
}

/**
 * Parses untyped widget `params` into a validated `IPaymentPlannerConfig` with all defaults applied.
 *
 * Rules:
 * 1. Never throw on malformed or missing fields — fall back to defaults.
 * 2. `description`: trimmed `params.description` or `params.title`, fallback `'Provider Payment Planner'`.
 * 3. `selectedCount`: non-negative integer (`Math.max(0, Math.round(n))`); if missing/invalid, fallback to `10`.
 * 4. `currencyIds`: unique finite numbers from `params.currencyIds`; empty array = all currencies.
 * 5. `rowLimit`: read `params.rowLimit` (or legacy `params.maxRows`); if not in `[10, 25, 50, 100]`, fallback to `10`.
 */
export function parsePaymentPlannerParams(
  params: Record<string, unknown> | undefined,
): IPaymentPlannerConfig {
  const p = isRecord(params) ? params : {};

  return {
    description:
      readTrimmed(p.description) ||
      readTrimmed(p.title) ||
      DEFAULT_DESCRIPTION,
    subtitle: readTrimmed(p.subtitle),
    size: readEnum(p.size, WIDGET_SIZES, 'full'),
    selectedCount: readSelectedCount(p.selectedCount),
    currencyIds: readCurrencyIds(p.currencyIds),
    providerId: readIdOrAll(p.providerId),
    billingCycleId: readIdOrAll(p.billingCycleId),
    amountFormat: readEnum(p.amountFormat, AMOUNT_FORMATS, 'grouped'),
    rowLimit: readRowLimit(p),
    showCustomerBills: readBoolean(p.showCustomerBills, true),
    showProviderBreakdown: readBoolean(p.showProviderBreakdown, true),
    showSummary: readBoolean(p.showSummary, true),
  };
}
