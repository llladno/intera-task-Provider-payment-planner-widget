import { toFiniteNumber } from '../platform/to-finite-number';
import type { IProviderPaymentQueueRow } from '../types/provider-payment-queue';
import type { IPaymentPlannerConfig } from './payment-planner-params';

/** Processed invoice row in the sorted queue. */
export interface IQueueBillItem {
  /** 1-based position in the filtered & sorted queue. */
  queuePosition: number;
  row: IProviderPaymentQueueRow;
  /** Numeric `payment_rank` (`null` if missing/invalid). */
  rank: number | null;
  /** Numeric `provider_total_due` (`null` if missing or `<= 0`). */
  providerAmount: number | null;
  /** `true` when `provider_total_due` is `null`, `<= 0`, or non-numeric. */
  hasInvalidAmount: boolean;
  /** `true` when `queuePosition <= effectiveSelectedCount`. */
  selected: boolean;
  /** Numeric `customer_total_due` (`null` if absent or non-numeric). */
  customerAmount: number | null;
  /** `true` when both `customer_bill_no` (non-empty) and a valid `customerAmount` are present. */
  hasCustomerBill: boolean;
}

/** Aggregated payment sum for a single currency across selected valid bills. */
export interface ICurrencyTotal {
  currencyId: number;
  currencyName: string;
  /** Total amount of selected valid bills in this currency. */
  totalAmount: number;
  /** Number of selected valid bills in this currency. */
  billCount: number;
  /** Number of unique providers in this currency among selected valid bills. */
  providerCount: number;
}

/** Per-provider payment share within a specific currency across selected valid bills. */
export interface IProviderCurrencyBreakdownItem {
  providerId: number;
  providerName: string;
  currencyId: number;
  currencyName: string;
  billCount: number;
  totalAmount: number;
  /** Share (`0..100`) of this provider's `totalAmount` within `currencyTotal.totalAmount`. */
  sharePercent: number;
}

/** Interactive UI overrides inside the widget (slider override, quick filter overrides). */
export interface IPaymentPlannerRuntimeState {
  /** Replaces `config.selectedCount` while the user drags the slider. */
  selectedCountOverride?: number;
  /** Replaces `config.providerId` (quick filter inside the widget). */
  providerIdOverride?: number | 'all';
  /** Replaces `config.billingCycleId` (quick filter inside the widget). */
  billingCycleIdOverride?: number | 'all';
  /** Replaces `config.currencyIds` (quick filter inside the widget). */
  currencyIdsOverride?: readonly number[];
  /** Replaces `config.rowLimit` ("show more" inside the widget). Any positive integer. */
  rowLimitOverride?: number;
}

export interface IPaymentPlanResult {
  /** Total bills in the filtered queue. */
  totalQueueCount: number;
  /** Clamped number of selected bills: `Math.min(Math.max(0, selectedCount), totalQueueCount)`. */
  effectiveSelectedCount: number;
  /** Number of unique providers across selected VALID bills (invalid bills are excluded). */
  selectedProviderCount: number;
  /** Count of selected bills that have `hasInvalidAmount === true` (excluded from sums). */
  invalidSelectedCount: number;
  /** Totals per currency for selected valid bills (never summing across currencies). */
  currencyTotals: ICurrencyTotal[];
  /** Provider breakdown per currency for selected valid bills, sorted by `totalAmount` descending. */
  providerBreakdown: IProviderCurrencyBreakdownItem[];
  /** Earliest `provider_recv_date` among selected valid bills (`null` when none). */
  oldestSelectedRecvDate: string | null;
  /** Full filtered and sorted queue. */
  queueItems: IQueueBillItem[];
  /** Queue sliced to `config.rowLimit` (or `rowLimitOverride`) for table display. */
  visibleQueueItems: IQueueBillItem[];
}

/** Amounts are accumulated in minor units so repeated additions do not drift. */
const MINOR_UNITS = 100;

function toMinor(amount: number): number {
  return Math.round(amount * MINOR_UNITS);
}

function fromMinor(minor: number): number {
  return minor / MINOR_UNITS;
}

function compareRank(a: number | null, b: number | null): number {
  if (a === null || b === null) {
    return a === b ? 0 : a === null ? 1 : -1;
  }
  return a - b;
}

interface IPreparedRow {
  row: IProviderPaymentQueueRow;
  index: number;
  rank: number | null;
}

function matchesScope(
  row: IProviderPaymentQueueRow,
  providerId: number | 'all',
  billingCycleId: number | 'all',
  currencyIds: readonly number[],
): boolean {
  return (
    (providerId === 'all' || row.provider_id === providerId) &&
    (billingCycleId === 'all' || row.billing_cycle_id === billingCycleId) &&
    (currencyIds.length === 0 || currencyIds.includes(row.provider_currency_id))
  );
}

function resolveSelectedCount(
  config: IPaymentPlannerConfig,
  runtimeState: IPaymentPlannerRuntimeState | undefined,
): number {
  const raw = toFiniteNumber(
    runtimeState?.selectedCountOverride ?? config.selectedCount,
  );
  return raw === null ? 0 : Math.max(0, Math.round(raw));
}

function resolveRowLimit(
  config: IPaymentPlannerConfig,
  runtimeState: IPaymentPlannerRuntimeState | undefined,
): number {
  const override = toFiniteNumber(runtimeState?.rowLimitOverride);
  return override !== null && override > 0
    ? Math.round(override)
    : config.rowLimit;
}

function buildQueueItem(
  prepared: IPreparedRow,
  position: number,
  effectiveSelectedCount: number,
): IQueueBillItem {
  const { row, rank } = prepared;
  const parsedAmount = toFiniteNumber(row.provider_total_due);
  const hasInvalidAmount = parsedAmount === null || parsedAmount <= 0;
  const customerAmount = toFiniteNumber(row.customer_total_due);
  const customerBillNo = row.customer_bill_no;
  return {
    queuePosition: position,
    row,
    rank,
    providerAmount: hasInvalidAmount ? null : parsedAmount,
    hasInvalidAmount,
    selected: position <= effectiveSelectedCount,
    customerAmount,
    hasCustomerBill:
      typeof customerBillNo === 'string' &&
      customerBillNo.trim().length > 0 &&
      customerAmount !== null,
  };
}

interface ICurrencyAccumulator {
  currencyId: number;
  currencyName: string;
  minor: number;
  billCount: number;
  providerIds: Set<number>;
}

interface IBreakdownAccumulator {
  providerId: number;
  providerName: string;
  currencyId: number;
  currencyName: string;
  minor: number;
  billCount: number;
}

function aggregate(items: readonly IQueueBillItem[]): {
  currencyTotals: ICurrencyTotal[];
  providerBreakdown: IProviderCurrencyBreakdownItem[];
  selectedProviderCount: number;
  invalidSelectedCount: number;
  oldestSelectedRecvDate: string | null;
} {
  const currencies = new Map<number, ICurrencyAccumulator>();
  const pairs = new Map<string, IBreakdownAccumulator>();
  const providers = new Set<number>();
  let invalidSelectedCount = 0;
  let oldest: string | null = null;

  for (const item of items) {
    if (!item.selected) {
      continue;
    }
    if (item.hasInvalidAmount || item.providerAmount === null) {
      invalidSelectedCount += 1;
      continue;
    }
    const { row } = item;
    const minor = toMinor(item.providerAmount);
    providers.add(row.provider_id);
    // ISO `YYYY-MM-DD` dates compare correctly as plain strings.
    if (row.provider_recv_date && (oldest === null || row.provider_recv_date < oldest)) {
      oldest = row.provider_recv_date;
    }

    // Map preserves insertion order: currencies appear as first met in the queue.
    let currency = currencies.get(row.provider_currency_id);
    if (!currency) {
      currency = {
        currencyId: row.provider_currency_id,
        currencyName: row.provider_currency_name,
        minor: 0,
        billCount: 0,
        providerIds: new Set<number>(),
      };
      currencies.set(row.provider_currency_id, currency);
    }
    currency.minor += minor;
    currency.billCount += 1;
    currency.providerIds.add(row.provider_id);

    const pairKey = `${row.provider_id}:${row.provider_currency_id}`;
    let pair = pairs.get(pairKey);
    if (!pair) {
      pair = {
        providerId: row.provider_id,
        providerName: row.provider_name,
        currencyId: row.provider_currency_id,
        currencyName: row.provider_currency_name,
        minor: 0,
        billCount: 0,
      };
      pairs.set(pairKey, pair);
    }
    pair.minor += minor;
    pair.billCount += 1;
  }

  const currencyTotals: ICurrencyTotal[] = Array.from(currencies.values()).map(
    (c) => ({
      currencyId: c.currencyId,
      currencyName: c.currencyName,
      totalAmount: fromMinor(c.minor),
      billCount: c.billCount,
      providerCount: c.providerIds.size,
    }),
  );

  const providerBreakdown: IProviderCurrencyBreakdownItem[] = Array.from(
    pairs.values(),
  ).map((pair) => {
    const currencyMinor = currencies.get(pair.currencyId)?.minor ?? 0;
    return {
      providerId: pair.providerId,
      providerName: pair.providerName,
      currencyId: pair.currencyId,
      currencyName: pair.currencyName,
      billCount: pair.billCount,
      totalAmount: fromMinor(pair.minor),
      sharePercent: currencyMinor > 0 ? (pair.minor / currencyMinor) * 100 : 0,
    };
  });
  // Array#sort is stable, so equal amounts keep first-seen order.
  providerBreakdown.sort((a, b) => b.totalAmount - a.totalAmount);

  return {
    currencyTotals,
    providerBreakdown,
    selectedProviderCount: providers.size,
    invalidSelectedCount,
    oldestSelectedRecvDate: oldest,
  };
}

/**
 * Pure computation of the provider payment plan from `provider-payment-queue` rows.
 *
 * Must NOT depend on React or DOM APIs.
 *
 * Key domain rules:
 * 1. Scope filters (`providerId`, `billingCycleId`, `currencyIds`) are applied BEFORE sorting and selecting
 *    the first `selectedCount` bills.
 * 2. Sorting order:
 *    - `payment_rank` ascending (valid finite ranks first; missing/invalid ranks last),
 *    - `provider_bill_id` ascending as tie-breaker (since Enigma partitions `payment_rank` by `provider_id`),
 *    - original array index (stable order).
 * 3. Selection: `effectiveSelectedCount = Math.min(Math.max(0, selectedCount), filteredQueue.length)`.
 *    The first `effectiveSelectedCount` items in the sorted queue have `selected = true`.
 * 4. Invalid amounts: if `toFiniteNumber(row.provider_total_due)` is `null` or `<= 0`, mark
 *    `hasInvalidAmount = true`. Never treat invalid amounts as `0` in aggregates — exclude them from
 *    `currencyTotals` and `providerBreakdown` and increment `invalidSelectedCount` when selected.
 * 5. Never sum amounts across different currencies.
 */
export function computePaymentPlan(
  rows: readonly IProviderPaymentQueueRow[],
  config: IPaymentPlannerConfig,
  runtimeState?: IPaymentPlannerRuntimeState,
): IPaymentPlanResult {
  const providerId = runtimeState?.providerIdOverride ?? config.providerId;
  const billingCycleId =
    runtimeState?.billingCycleIdOverride ?? config.billingCycleId;
  const currencyIds = runtimeState?.currencyIdsOverride ?? config.currencyIds;

  const sorted: IPreparedRow[] = rows
    .map((row, index) => ({
      row,
      index,
      rank: toFiniteNumber(row.payment_rank),
    }))
    .filter(({ row }) =>
      matchesScope(row, providerId, billingCycleId, currencyIds),
    )
    .sort(
      (a, b) =>
        compareRank(a.rank, b.rank) ||
        a.row.provider_bill_id - b.row.provider_bill_id ||
        a.index - b.index,
    );

  const totalQueueCount = sorted.length;
  const effectiveSelectedCount = Math.min(
    resolveSelectedCount(config, runtimeState),
    totalQueueCount,
  );

  const queueItems = sorted.map((prepared, i) =>
    buildQueueItem(prepared, i + 1, effectiveSelectedCount),
  );

  return {
    totalQueueCount,
    effectiveSelectedCount,
    ...aggregate(queueItems),
    queueItems,
    visibleQueueItems: queueItems.slice(
      0,
      resolveRowLimit(config, runtimeState),
    ),
  };
}
