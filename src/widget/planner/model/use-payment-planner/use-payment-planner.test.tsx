// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import mockData from '@/data/mock-payment-queue.json';
import '@/test/setup-ui';
import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import type { ICollectionDataResult } from '@platform/widget-types';
import { buildSortedQueue } from '@planner/model/compute/build-sorted-queue';
import { usePaymentPlanner } from '@planner/model/use-payment-planner/use-payment-planner';

vi.mock('@planner/model/compute/build-sorted-queue', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@planner/model/compute/build-sorted-queue')>();
  return { ...original, buildSortedQueue: vi.fn(original.buildSortedQueue) };
});

const queueRows = mockData as IProviderPaymentQueueRow[];
const readyData: ICollectionDataResult<IProviderPaymentQueueRow> = {
  items: queueRows,
  loading: false,
  loaded: true,
  error: null,
  stale: false,
  lastSuccessAt: null,
};

describe('usePaymentPlanner', () => {
  it('re-sorts the queue only when the filters or the rows change, not on slider moves', () => {
    const params = { selectedCount: 5 };
    const { result } = renderHook(() =>
      usePaymentPlanner(params, readyData, undefined, null),
    );
    const sortCallsAfterMount = vi.mocked(buildSortedQueue).mock.calls.length;
    expect(sortCallsAfterMount).toBeGreaterThan(0);

    act(() => result.current.planner.setSelectedCount(9));
    expect(result.current.plan.effectiveSelectedCount).toBe(9);
    act(() => result.current.planner.setSelectedCount(3));
    expect(result.current.plan.effectiveSelectedCount).toBe(3);
    expect(vi.mocked(buildSortedQueue).mock.calls.length).toBe(sortCallsAfterMount);

    act(() => result.current.planner.setProviderId(1760));
    expect(vi.mocked(buildSortedQueue).mock.calls.length).toBeGreaterThan(
      sortCallsAfterMount,
    );
    expect(result.current.plan.totalQueueCount).toBe(7);
  });

  it('picks the first currency of the plan unless another is chosen', () => {
    const { result, rerender } = renderHook(
      ({ chosenCurrencyId }: { chosenCurrencyId: number | null }) =>
        usePaymentPlanner({ selectedCount: 14 }, readyData, undefined, chosenCurrencyId),
      { initialProps: { chosenCurrencyId: null as number | null } },
    );
    expect(result.current.activeCurrencyId).toBe(643);
    rerender({ chosenCurrencyId: 840 });
    expect(result.current.activeCurrencyId).toBe(840);
    expect(
      result.current.activeShares.every((share) => share.currencyId === 840),
    ).toBe(true);
    // A currency that is not in the plan falls back to the first one.
    rerender({ chosenCurrencyId: 999 });
    expect(result.current.activeCurrencyId).toBe(643);
  });

  it('lets the size prop win over params.size and tolerates a non-array items', () => {
    const { result } = renderHook(() =>
      usePaymentPlanner(
        { size: 'third' },
        { ...readyData, items: undefined } as unknown as typeof readyData,
        'quarter',
        null,
      ),
    );
    expect(result.current.effectiveSize).toBe('quarter');
    expect(result.current.queueRows).toEqual([]);
  });
});
