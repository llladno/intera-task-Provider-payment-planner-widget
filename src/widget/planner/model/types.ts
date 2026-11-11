import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import type { TAmountFormat } from '@planner/config/amount-format';
import type { TIdFilter } from '@planner/config/filters';
import type { TWidgetRowLimit, TWidgetSize } from '@platform/widget-types';

/** Widget configuration after `parsePaymentPlannerParams` (all defaults applied). */
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
  /** Provider filter (`'all'` or a finite `provider_id`). Default: `'all'`. */
  providerId: TIdFilter;
  /** Billing cycle filter (`'all'` or a finite `billing_cycle_id`). Default: `'all'`. */
  billingCycleId: TIdFilter;
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

/** Processed invoice row in the sorted queue. */
export interface IQueueBillItem {
  /** 1-based position in the filtered & sorted queue. */
  queuePosition: number;
  /**
   * Stable identity of the bill (`provider_bill_id` + linked `customer_bill_id`), unlike
   * `queuePosition` it does not change when the queue is re-sorted, filtered or refreshed.
   * Rows with the same pair share a key (and are opened together).
   */
  billKey: string;
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
  providerIdOverride?: TIdFilter;
  /** Replaces `config.billingCycleId` (quick filter inside the widget). */
  billingCycleIdOverride?: TIdFilter;
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

/** One option of a quick-filter select / chip. */
export interface IFilterOption {
  id: number;
  name: string;
}

/** Everything the quick filters can offer, collected from the loaded rows. */
export interface IFilterOptions {
  providers: IFilterOption[];
  billingCycles: IFilterOption[];
  currencies: IFilterOption[];
}
