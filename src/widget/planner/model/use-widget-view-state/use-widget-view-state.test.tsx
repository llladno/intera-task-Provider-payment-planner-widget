// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@/test/setup-ui';
import { useWidgetViewState } from '@planner/model/use-widget-view-state/use-widget-view-state';

describe('useWidgetViewState', () => {
  it('starts with nothing open', () => {
    const { result } = renderHook(() => useWidgetViewState());
    expect(result.current.shareCurrencyId).toBeNull();
    expect(result.current.expandedBillKey).toBeNull();
    expect(result.current.isCurrencyListExpanded).toBe(false);
    expect(result.current.isDialogOpen).toBe(false);
  });

  it('toggles the open bill by its key', () => {
    const { result } = renderHook(() => useWidgetViewState());
    act(() => result.current.toggleExpandedBill('77602:90202'));
    expect(result.current.expandedBillKey).toBe('77602:90202');
    act(() => result.current.toggleExpandedBill('77604:90204'));
    expect(result.current.expandedBillKey).toBe('77604:90204');
    act(() => result.current.toggleExpandedBill('77604:90204'));
    expect(result.current.expandedBillKey).toBeNull();
  });

  it('remembers the chosen share currency', () => {
    const { result } = renderHook(() => useWidgetViewState());
    act(() => result.current.setShareCurrencyId(840));
    expect(result.current.shareCurrencyId).toBe(840);
  });

  it('toggles the expanded currency list and the dialog', () => {
    const { result } = renderHook(() => useWidgetViewState());
    act(() => result.current.toggleCurrencyList());
    expect(result.current.isCurrencyListExpanded).toBe(true);
    act(() => result.current.toggleCurrencyList());
    expect(result.current.isCurrencyListExpanded).toBe(false);

    act(() => result.current.openDialog());
    expect(result.current.isDialogOpen).toBe(true);
    act(() => result.current.closeDialog());
    expect(result.current.isDialogOpen).toBe(false);
  });
});
