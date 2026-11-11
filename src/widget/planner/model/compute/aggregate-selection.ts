import { fromMinorUnits, toMinorUnits } from '@planner/model/compute/money';
import type {
  ICurrencyTotal,
  IProviderCurrencyBreakdownItem,
  IQueueBillItem,
} from '@planner/model/types';

interface ICurrencyAccumulator {
  currencyId: number;
  currencyName: string;
  minorUnits: number;
  billCount: number;
  providerIds: Set<number>;
}

interface IProviderCurrencyAccumulator {
  providerId: number;
  providerName: string;
  currencyId: number;
  currencyName: string;
  minorUnits: number;
  billCount: number;
}

export interface ISelectionAggregate {
  currencyTotals: ICurrencyTotal[];
  providerBreakdown: IProviderCurrencyBreakdownItem[];
  selectedProviderCount: number;
  invalidSelectedCount: number;
  oldestSelectedRecvDate: string | null;
}

/**
 * Totals of the selected bills. Invalid amounts are counted in
 * `invalidSelectedCount` and never added to any sum; currencies are never mixed.
 */
export function aggregateSelection(
  queueItems: readonly IQueueBillItem[],
): ISelectionAggregate {
  const currencyAccumulators = new Map<number, ICurrencyAccumulator>();
  const pairAccumulators = new Map<string, IProviderCurrencyAccumulator>();
  const selectedProviderIds = new Set<number>();
  let invalidSelectedCount = 0;
  let oldestRecvDate: string | null = null;

  for (const queueItem of queueItems) {
    if (!queueItem.selected) {
      continue;
    }
    if (queueItem.hasInvalidAmount || queueItem.providerAmount === null) {
      invalidSelectedCount += 1;
      continue;
    }
    const { row } = queueItem;
    const billMinorUnits = toMinorUnits(queueItem.providerAmount);
    selectedProviderIds.add(row.provider_id);
    // ISO `YYYY-MM-DD` dates compare correctly as plain strings.
    if (
      row.provider_recv_date &&
      (oldestRecvDate === null || row.provider_recv_date < oldestRecvDate)
    ) {
      oldestRecvDate = row.provider_recv_date;
    }

    // Map keeps insertion order: currencies appear as first met in the queue.
    let currencyAccumulator = currencyAccumulators.get(row.provider_currency_id);
    if (!currencyAccumulator) {
      currencyAccumulator = {
        currencyId: row.provider_currency_id,
        currencyName: row.provider_currency_name,
        minorUnits: 0,
        billCount: 0,
        providerIds: new Set<number>(),
      };
      currencyAccumulators.set(row.provider_currency_id, currencyAccumulator);
    }
    currencyAccumulator.minorUnits += billMinorUnits;
    currencyAccumulator.billCount += 1;
    currencyAccumulator.providerIds.add(row.provider_id);

    const pairKey = `${row.provider_id}:${row.provider_currency_id}`;
    let pairAccumulator = pairAccumulators.get(pairKey);
    if (!pairAccumulator) {
      pairAccumulator = {
        providerId: row.provider_id,
        providerName: row.provider_name,
        currencyId: row.provider_currency_id,
        currencyName: row.provider_currency_name,
        minorUnits: 0,
        billCount: 0,
      };
      pairAccumulators.set(pairKey, pairAccumulator);
    }
    pairAccumulator.minorUnits += billMinorUnits;
    pairAccumulator.billCount += 1;
  }

  const currencyTotals: ICurrencyTotal[] = Array.from(
    currencyAccumulators.values(),
  ).map((accumulator) => ({
    currencyId: accumulator.currencyId,
    currencyName: accumulator.currencyName,
    totalAmount: fromMinorUnits(accumulator.minorUnits),
    billCount: accumulator.billCount,
    providerCount: accumulator.providerIds.size,
  }));

  const providerBreakdown: IProviderCurrencyBreakdownItem[] = Array.from(
    pairAccumulators.values(),
  ).map((pair) => {
    const currencyMinorUnits =
      currencyAccumulators.get(pair.currencyId)?.minorUnits ?? 0;
    return {
      providerId: pair.providerId,
      providerName: pair.providerName,
      currencyId: pair.currencyId,
      currencyName: pair.currencyName,
      billCount: pair.billCount,
      totalAmount: fromMinorUnits(pair.minorUnits),
      sharePercent:
        currencyMinorUnits > 0 ? (pair.minorUnits / currencyMinorUnits) * 100 : 0,
    };
  });
  // Array#sort is stable, so equal amounts keep first-seen order.
  providerBreakdown.sort(
    (firstPair, secondPair) => secondPair.totalAmount - firstPair.totalAmount,
  );

  return {
    currencyTotals,
    providerBreakdown,
    selectedProviderCount: selectedProviderIds.size,
    invalidSelectedCount,
    oldestSelectedRecvDate: oldestRecvDate,
  };
}
