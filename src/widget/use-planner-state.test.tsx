// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../test/setup-ui';
import {
  parsePaymentPlannerParams,
  type IPaymentPlannerConfig,
} from './payment-planner-params';
import { usePlannerState } from './use-planner-state';

function configOf(params: Record<string, unknown>): IPaymentPlannerConfig {
  return parsePaymentPlannerParams(params);
}

function setup(initial: Record<string, unknown> = {}) {
  return renderHook(
    ({ config }: { config: IPaymentPlannerConfig }) => usePlannerState(config),
    { initialProps: { config: configOf(initial) } },
  );
}

describe('usePlannerState', () => {
  it('starts without overrides', () => {
    const { result } = setup({ providerId: 1760, currencyIds: [643] });
    expect(result.current.runtimeState.selectedCountOverride).toBeUndefined();
    expect(result.current.runtimeState.providerIdOverride).toBeUndefined();
    expect(result.current.providerId).toBe(1760);
    expect(result.current.currencyIds).toEqual([643]);
    expect(result.current.rowLimit).toBe(10);
  });

  it('keeps the slider override until the selectedCount param changes', () => {
    const { result, rerender } = setup({ selectedCount: 5 });
    act(() => result.current.setSelectedCount(12));
    expect(result.current.runtimeState.selectedCountOverride).toBe(12);

    // A new params object with the same value is not an edit.
    rerender({ config: configOf({ selectedCount: 5 }) });
    expect(result.current.runtimeState.selectedCountOverride).toBe(12);

    rerender({ config: configOf({ selectedCount: 8 }) });
    expect(result.current.runtimeState.selectedCountOverride).toBeUndefined();
  });

  it('toggles currencies on top of the configured ones', () => {
    const { result } = setup({ currencyIds: [643] });
    act(() => result.current.toggleCurrency(840));
    expect(result.current.currencyIds).toEqual([643, 840]);
    act(() => result.current.toggleCurrency(643));
    expect(result.current.currencyIds).toEqual([840]);
    expect(result.current.runtimeState.currencyIdsOverride).toEqual([840]);
  });

  it('reports active filters and resets them to "all"', () => {
    const { result } = setup();
    expect(result.current.hasActiveFilters).toBe(false);
    act(() => result.current.setProviderId(1762));
    act(() => result.current.setBillingCycleId(12));
    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.runtimeState.providerIdOverride).toBe(1762);

    act(() => result.current.resetFilters());
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.providerId).toBe('all');
    expect(result.current.currencyIds).toEqual([]);
  });

  it('drops filter overrides when a filter param is edited', () => {
    const { result, rerender } = setup();
    act(() => result.current.setProviderId(1762));
    rerender({ config: configOf({ providerId: 1770 }) });
    expect(result.current.providerId).toBe(1770);
    expect(result.current.runtimeState.providerIdOverride).toBeUndefined();
  });

  it('grows and collapses the row limit in rowLimit steps', () => {
    const { result, rerender } = setup({ rowLimit: 10 });
    act(() => result.current.showMoreRows());
    act(() => result.current.showMoreRows());
    expect(result.current.rowLimit).toBe(30);
    expect(result.current.runtimeState.rowLimitOverride).toBe(30);

    act(() => result.current.collapseRows());
    expect(result.current.rowLimit).toBe(10);

    act(() => result.current.showMoreRows());
    rerender({ config: configOf({ rowLimit: 25 }) });
    expect(result.current.rowLimit).toBe(25);
  });
});
