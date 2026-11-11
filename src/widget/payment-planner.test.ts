import { describe, expect, it } from 'vitest';
import mockData from '../data/mock-payment-queue.json';
import type { IProviderPaymentQueueRow } from '../types/provider-payment-queue';
import {
  computePaymentPlan,
  type IPaymentPlanResult,
} from './payment-planner-compute';
import { parsePaymentPlannerParams } from './payment-planner-params';

const rows = mockData as IProviderPaymentQueueRow[];

describe('parsePaymentPlannerParams', () => {
  it('returns default config when params are undefined', () => {
    const config = parsePaymentPlannerParams(undefined);
    expect(config.description).toBe('Provider Payment Planner');
    expect(config.selectedCount).toBe(10);
    expect(config.rowLimit).toBe(10);
    expect(config.amountFormat).toBe('grouped');
    expect(config.currencyIds).toEqual([]);
  });

  it('clamps negative selectedCount to 0', () => {
    const config = parsePaymentPlannerParams({ selectedCount: -5 });
    expect(config.selectedCount).toBe(0);
  });
});

describe('computePaymentPlan', () => {
  it('sorts by payment_rank ASC then provider_bill_id ASC and selects first N', () => {
    const config = parsePaymentPlannerParams({ selectedCount: 6 });
    const plan = computePaymentPlan(rows, config);
    // The README mentions 30 rows, but the shipped fixture holds 32.
    expect(plan.totalQueueCount).toBe(rows.length);
    expect(plan.totalQueueCount).toBe(32);
    expect(plan.effectiveSelectedCount).toBe(6);
    expect(
      plan.queueItems
        .slice(0, 6)
        .map((item) => item.row.provider_bill_id),
    ).toEqual([77602, 77604, 77606, 77608, 77610, 77612]);
  });

  it('flags invalid/missing amounts and excludes them from currency totals', () => {
    const config = parsePaymentPlannerParams({ selectedCount: 20 });
    const plan = computePaymentPlan(rows, config);
    // Bills 77630 (null) and 77638 (-1200) are within the first 20 rows
    expect(plan.invalidSelectedCount).toBe(2);
    const invalidBill = plan.queueItems.find(
      (item) => item.row.provider_bill_id === 77630,
    );
    expect(invalidBill?.hasInvalidAmount).toBe(true);
  });

  it('applies filters before slicing first N bills and clamps effectiveSelectedCount', () => {
    const config = parsePaymentPlannerParams({
      providerId: 1770, // Inmarsat Global Ltd (4 bills in mock data)
      selectedCount: 10,
    });
    const plan = computePaymentPlan(rows, config);
    expect(plan.totalQueueCount).toBe(4);
    expect(plan.effectiveSelectedCount).toBe(4);
  });
});

function makeRow(
  overrides: Partial<IProviderPaymentQueueRow>,
): IProviderPaymentQueueRow {
  return {
    payment_rank: 1,
    provider_id: 1,
    provider_code: 'P1',
    provider_name: 'Provider 1',
    provider_bill_id: 1,
    provider_bill_no: 'INV-1',
    provider_bill_code: 1,
    provider_recv_date: '2026-10-01',
    provider_total_due: 100,
    provider_currency_id: 643,
    provider_currency_name: 'RUB',
    billing_cycle_id: 10,
    billing_cycle_name: 'Cycle',
    customer_id: null,
    customer_code: null,
    customer_name: null,
    customer_inn: null,
    customer_bill_id: null,
    customer_bill_no: null,
    customer_bill_code: null,
    customer_total_due: null,
    ...overrides,
  } as IProviderPaymentQueueRow;
}

function totalOf(plan: IPaymentPlanResult, currencyName: string): number {
  return (
    plan.currencyTotals.find((c) => c.currencyName === currencyName)
      ?.totalAmount ?? Number.NaN
  );
}

describe('parsePaymentPlannerParams (edge cases)', () => {
  it('reads title as description fallback and trims text', () => {
    expect(parsePaymentPlannerParams({ title: '  Plan  ' }).description).toBe(
      'Plan',
    );
    expect(
      parsePaymentPlannerParams({ description: '   ', title: 'T' }).description,
    ).toBe('T');
    expect(parsePaymentPlannerParams({ subtitle: ' sub ' }).subtitle).toBe(
      'sub',
    );
  });

  it('falls back on unknown size, format and non-boolean flags', () => {
    const config = parsePaymentPlannerParams({
      size: 'huge',
      amountFormat: 'fancy',
      showSummary: 'yes',
      showCustomerBills: 0,
    });
    expect(config.size).toBe('full');
    expect(config.amountFormat).toBe('grouped');
    expect(config.showSummary).toBe(true);
    expect(config.showCustomerBills).toBe(true);
  });

  it('rounds selectedCount and falls back on garbage', () => {
    expect(parsePaymentPlannerParams({ selectedCount: 3.6 }).selectedCount).toBe(
      4,
    );
    // The README types selectedCount as a number: a numeric string is an error.
    expect(parsePaymentPlannerParams({ selectedCount: '7' }).selectedCount).toBe(
      10,
    );
    for (const bad of [Number.NaN, Infinity, 'abc', null, {}]) {
      expect(parsePaymentPlannerParams({ selectedCount: bad }).selectedCount).toBe(
        10,
      );
    }
  });

  it('deduplicates currencyIds and drops non-numbers', () => {
    expect(
      parsePaymentPlannerParams({
        currencyIds: [643, 840, 643, 'x', null, Number.NaN],
      }).currencyIds,
    ).toEqual([643, 840]);
    expect(parsePaymentPlannerParams({ currencyIds: 643 }).currencyIds).toEqual(
      [],
    );
    expect(
      parsePaymentPlannerParams({ currencyIds: ['643', 840] }).currencyIds,
    ).toEqual([840]);
  });

  it('reads provider/cycle ids as number or all', () => {
    const config = parsePaymentPlannerParams({
      providerId: 1770,
      billingCycleId: 'whatever',
    });
    expect(config.providerId).toBe(1770);
    expect(config.billingCycleId).toBe('all');
    expect(parsePaymentPlannerParams({ providerId: 'all' }).providerId).toBe(
      'all',
    );
    expect(parsePaymentPlannerParams({ providerId: '1770' }).providerId).toBe(
      'all',
    );
  });

  it('accepts only valid rowLimit and supports legacy maxRows', () => {
    expect(parsePaymentPlannerParams({ rowLimit: 50 }).rowLimit).toBe(50);
    expect(parsePaymentPlannerParams({ maxRows: 100 }).rowLimit).toBe(100);
    expect(parsePaymentPlannerParams({ rowLimit: 15 }).rowLimit).toBe(10);
    expect(
      parsePaymentPlannerParams({ rowLimit: 25, maxRows: 100 }).rowLimit,
    ).toBe(25);
    expect(
      parsePaymentPlannerParams({ rowLimit: 15, maxRows: 100 }).rowLimit,
    ).toBe(100);
    expect(parsePaymentPlannerParams({ rowLimit: '25' }).rowLimit).toBe(10);
  });
});

describe('computePaymentPlan (domain rules)', () => {
  it('aggregates strictly per currency and never mixes them', () => {
    const plan = computePaymentPlan(
      rows,
      parsePaymentPlannerParams({ selectedCount: 14 }),
    );
    expect(plan.effectiveSelectedCount).toBe(14);
    expect(plan.currencyTotals.map((c) => c.currencyName)).toEqual([
      'RUB',
      'USD',
      'EUR',
      'GBP',
    ]);
    const grand = plan.currencyTotals.reduce((n, c) => n + c.billCount, 0);
    expect(grand).toBe(14 - plan.invalidSelectedCount);
    expect(totalOf(plan, 'RUB')).toBe(
      240000 + 180000 + 120000 + 300000 + 170000 + 90000 + 148500,
    );
  });

  it('keeps invalid bills in the queue but out of every sum', () => {
    const plan = computePaymentPlan(
      rows,
      parsePaymentPlannerParams({ selectedCount: 20 }),
    );
    const nullBill = plan.queueItems.find(
      (i) => i.row.provider_bill_id === 77630,
    );
    const negativeBill = plan.queueItems.find(
      (i) => i.row.provider_bill_id === 77638,
    );
    expect(nullBill?.selected).toBe(true);
    expect(nullBill?.providerAmount).toBeNull();
    expect(negativeBill?.hasInvalidAmount).toBe(true);
    expect(plan.invalidSelectedCount).toBe(2);
    const billsInTotals = plan.currencyTotals.reduce(
      (n, c) => n + c.billCount,
      0,
    );
    expect(billsInTotals).toBe(18);
    expect(
      plan.providerBreakdown.some((b) => b.totalAmount <= 0),
    ).toBe(false);
  });

  it('treats a numeric string amount as valid and zero/garbage as invalid', () => {
    const plan = computePaymentPlan(
      [
        makeRow({ provider_bill_id: 1, provider_total_due: '148500' }),
        makeRow({ provider_bill_id: 2, provider_total_due: 0 }),
        makeRow({ provider_bill_id: 3, provider_total_due: 'n/a' }),
        makeRow({ provider_bill_id: 4, provider_total_due: '' }),
      ],
      parsePaymentPlannerParams({ selectedCount: 4 }),
    );
    expect(plan.invalidSelectedCount).toBe(3);
    expect(totalOf(plan, 'RUB')).toBe(148500);
  });

  it('shares inside each currency add up to 100', () => {
    const plan = computePaymentPlan(
      rows,
      parsePaymentPlannerParams({ selectedCount: 32 }),
    );
    for (const currency of plan.currencyTotals) {
      const shares = plan.providerBreakdown
        .filter((b) => b.currencyId === currency.currencyId)
        .reduce((n, b) => n + b.sharePercent, 0);
      expect(shares).toBeCloseTo(100, 9);
    }
  });

  it('sorts the provider breakdown by amount descending', () => {
    const plan = computePaymentPlan(
      rows,
      parsePaymentPlannerParams({ selectedCount: 32 }),
    );
    const rub = plan.providerBreakdown.filter((b) => b.currencyName === 'RUB');
    const amounts = rub.map((b) => b.totalAmount);
    expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
  });

  it('counts selected providers over valid selected bills only', () => {
    const plan = computePaymentPlan(
      [
        makeRow({ provider_id: 1, provider_bill_id: 1 }),
        makeRow({
          provider_id: 2,
          provider_bill_id: 2,
          provider_total_due: null,
        }),
      ],
      parsePaymentPlannerParams({ selectedCount: 2 }),
    );
    expect(plan.selectedProviderCount).toBe(1);
    expect(plan.invalidSelectedCount).toBe(1);
  });

  it('puts missing or invalid ranks last, ordered by bill id', () => {
    const plan = computePaymentPlan(
      [
        makeRow({ provider_bill_id: 5, payment_rank: null }),
        makeRow({ provider_bill_id: 4, payment_rank: 'oops' }),
        makeRow({ provider_bill_id: 9, payment_rank: '2' }),
        makeRow({ provider_bill_id: 8, payment_rank: 2 }),
        makeRow({ provider_bill_id: 7, payment_rank: 1 }),
      ],
      parsePaymentPlannerParams({ selectedCount: 5 }),
    );
    expect(plan.queueItems.map((i) => i.row.provider_bill_id)).toEqual([
      7, 8, 9, 4, 5,
    ]);
    expect(plan.queueItems.map((i) => i.queuePosition)).toEqual([1, 2, 3, 4, 5]);
  });

  it('keeps the original order when rank and bill id are equal', () => {
    const plan = computePaymentPlan(
      [
        makeRow({ provider_id: 2, provider_bill_id: 1, provider_code: 'B' }),
        makeRow({ provider_id: 1, provider_bill_id: 1, provider_code: 'A' }),
      ],
      parsePaymentPlannerParams({}),
    );
    expect(plan.queueItems.map((i) => i.row.provider_code)).toEqual(['B', 'A']);
  });

  it('applies provider, cycle and currency filters before the cut', () => {
    const byCurrency = computePaymentPlan(
      rows,
      parsePaymentPlannerParams({ currencyIds: [840], selectedCount: 3 }),
    );
    expect(byCurrency.queueItems.every((i) => i.row.provider_currency_id === 840)).toBe(true);
    expect(byCurrency.effectiveSelectedCount).toBe(3);
    expect(byCurrency.currencyTotals).toHaveLength(1);

    const byCycle = computePaymentPlan(
      rows,
      parsePaymentPlannerParams({ billingCycleId: 12, selectedCount: 100 }),
    );
    expect(byCycle.totalQueueCount).toBe(3);
    expect(byCycle.effectiveSelectedCount).toBe(3);
  });

  it('handles selectedCount 0, oversize and runtime overrides', () => {
    const zero = computePaymentPlan(
      rows,
      parsePaymentPlannerParams({ selectedCount: 0 }),
    );
    expect(zero.effectiveSelectedCount).toBe(0);
    expect(zero.currencyTotals).toEqual([]);
    expect(zero.queueItems.some((i) => i.selected)).toBe(false);

    const huge = computePaymentPlan(
      rows,
      parsePaymentPlannerParams({ selectedCount: 999 }),
    );
    expect(huge.effectiveSelectedCount).toBe(32);

    const overridden = computePaymentPlan(
      rows,
      parsePaymentPlannerParams({ selectedCount: 5 }),
      { selectedCountOverride: 8, providerIdOverride: 1760 },
    );
    expect(overridden.totalQueueCount).toBe(7);
    expect(overridden.effectiveSelectedCount).toBe(7);
  });

  it('limits visibleQueueItems by rowLimit but keeps the whole queue', () => {
    const plan = computePaymentPlan(
      rows,
      parsePaymentPlannerParams({ rowLimit: 10, selectedCount: 5 }),
    );
    expect(plan.visibleQueueItems).toHaveLength(10);
    expect(plan.queueItems).toHaveLength(32);
  });

  it('flags customer bills only with a number and a valid amount', () => {
    const plan = computePaymentPlan(
      [
        makeRow({
          provider_bill_id: 1,
          customer_bill_no: 'CB-1',
          customer_total_due: 10,
        }),
        makeRow({
          provider_bill_id: 2,
          customer_bill_no: '  ',
          customer_total_due: 10,
        }),
        makeRow({
          provider_bill_id: 3,
          customer_bill_no: 'CB-3',
          customer_total_due: null,
        }),
      ],
      parsePaymentPlannerParams({}),
    );
    expect(plan.queueItems.map((i) => i.hasCustomerBill)).toEqual([
      true,
      false,
      false,
    ]);
  });

  it('returns an empty plan for no rows', () => {
    const plan = computePaymentPlan([], parsePaymentPlannerParams({}));
    expect(plan.totalQueueCount).toBe(0);
    expect(plan.effectiveSelectedCount).toBe(0);
    expect(plan.currencyTotals).toEqual([]);
  });

  it('does not accumulate floating-point error', () => {
    const plan = computePaymentPlan(
      Array.from({ length: 10 }, (_, i) =>
        makeRow({ provider_bill_id: i + 1, provider_total_due: 0.1 }),
      ),
      parsePaymentPlannerParams({ selectedCount: 10 }),
    );
    expect(totalOf(plan, 'RUB')).toBe(1);
  });
});

describe('computePaymentPlan (row limit)', () => {
  it('lets the widget raise the visible rows without changing the queue', () => {
    const config = parsePaymentPlannerParams({ rowLimit: 10, selectedCount: 5 });
    const more = computePaymentPlan(rows, config, { rowLimitOverride: 25 });
    expect(more.visibleQueueItems).toHaveLength(25);
    expect(more.queueItems).toHaveLength(32);
    const beyond = computePaymentPlan(rows, config, { rowLimitOverride: 500 });
    expect(beyond.visibleQueueItems).toHaveLength(32);
  });
});
