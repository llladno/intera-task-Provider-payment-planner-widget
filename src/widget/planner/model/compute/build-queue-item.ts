import type { IRankedRow } from '@planner/model/compute/types';
import type { IQueueBillItem } from '@planner/model/types';
import { toFiniteNumber } from '@platform/to-finite-number';

export function buildQueueItem(
  rankedRow: IRankedRow,
  queuePosition: number,
  effectiveSelectedCount: number,
): IQueueBillItem {
  const { row, rank } = rankedRow;
  const parsedProviderAmount = toFiniteNumber(row.provider_total_due);
  const hasInvalidAmount =
    parsedProviderAmount === null || parsedProviderAmount <= 0;
  const customerAmount = toFiniteNumber(row.customer_total_due);
  const customerBillNo = row.customer_bill_no;
  return {
    queuePosition,
    billKey: `${row.provider_bill_id}:${row.customer_bill_id ?? ''}`,
    row,
    rank,
    providerAmount: hasInvalidAmount ? null : parsedProviderAmount,
    hasInvalidAmount,
    selected: queuePosition <= effectiveSelectedCount,
    customerAmount,
    hasCustomerBill:
      typeof customerBillNo === 'string' &&
      customerBillNo.trim().length > 0 &&
      customerAmount !== null,
  };
}
