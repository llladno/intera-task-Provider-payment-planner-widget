import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import type { IRankedRow } from '@planner/model/compute/types';
import { toFiniteNumber } from '@platform/to-finite-number';

/** Valid finite ranks first (ascending); missing or invalid ranks last. */
function compareRanks(firstRank: number | null, secondRank: number | null): number {
  if (firstRank === null || secondRank === null) {
    if (firstRank === secondRank) {
      return 0;
    }
    return firstRank === null ? 1 : -1;
  }
  return firstRank - secondRank;
}

export function withRank(
  queueRow: IProviderPaymentQueueRow,
  sourceIndex: number,
): IRankedRow {
  return {
    row: queueRow,
    sourceIndex,
    rank: toFiniteNumber(queueRow.payment_rank),
  };
}

/**
 * `payment_rank` ascending → `provider_bill_id` ascending → original order.
 * Enigma numbers `payment_rank` per provider, so the bill id tie-break is what
 * makes the queue deterministic.
 */
export function compareQueueOrder(first: IRankedRow, second: IRankedRow): number {
  return (
    compareRanks(first.rank, second.rank) ||
    first.row.provider_bill_id - second.row.provider_bill_id ||
    first.sourceIndex - second.sourceIndex
  );
}
