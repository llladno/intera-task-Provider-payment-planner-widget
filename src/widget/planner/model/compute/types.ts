import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import type { TIdFilter } from '@planner/config/filters';

/** The three filters that narrow the queue before the first N bills are taken. */
export interface IQueueScope {
  providerId: TIdFilter;
  billingCycleId: TIdFilter;
  /** Empty = all currencies. */
  currencyIds: readonly number[];
}

/** A row with its parsed rank and its position in the source array (for stable sorting). */
export interface IRankedRow {
  row: IProviderPaymentQueueRow;
  sourceIndex: number;
  rank: number | null;
}
