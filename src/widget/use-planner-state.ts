import { useCallback, useMemo, useState } from 'react';
import type { IPaymentPlannerRuntimeState } from './payment-planner-compute';
import type { IPaymentPlannerConfig } from './payment-planner-params';

interface IFilterOverrides {
  providerId: number | 'all' | null;
  billingCycleId: number | 'all' | null;
  currencyIds: number[] | null;
}

const NO_FILTER_OVERRIDES: IFilterOverrides = {
  providerId: null,
  billingCycleId: null,
  currencyIds: null,
};

export interface IPlannerState {
  /** Overrides to pass to `computePaymentPlan`. */
  runtimeState: IPaymentPlannerRuntimeState;
  /** Currently applied filters (override, else config). */
  providerId: number | 'all';
  billingCycleId: number | 'all';
  currencyIds: readonly number[];
  hasActiveFilters: boolean;
  /** Rows shown in the table: `config.rowLimit` plus what "show more" added. */
  rowLimit: number;
  showMoreRows: () => void;
  collapseRows: () => void;
  setSelectedCount: (value: number) => void;
  setProviderId: (value: number | 'all') => void;
  setBillingCycleId: (value: number | 'all') => void;
  toggleCurrency: (currencyId: number) => void;
  resetFilters: () => void;
}

/**
 * Interactive state the user changes inside the widget (slider, quick filters).
 *
 * It lives in the always-mounted widget, so a background refresh keeps it.
 * When the host edits the matching param, the override is dropped and the new
 * param wins — otherwise a stale slider position would shadow the setting.
 */
export function usePlannerState(config: IPaymentPlannerConfig): IPlannerState {
  const [countOverride, setCountOverride] = useState<number | null>(null);
  const [countKey, setCountKey] = useState(config.selectedCount);
  if (countKey !== config.selectedCount) {
    setCountKey(config.selectedCount);
    setCountOverride(null);
  }

  const [rowLimitOverride, setRowLimitOverride] = useState<number | null>(null);
  const [rowLimitKey, setRowLimitKey] = useState(config.rowLimit);
  if (rowLimitKey !== config.rowLimit) {
    setRowLimitKey(config.rowLimit);
    setRowLimitOverride(null);
  }
  const rowLimit = rowLimitOverride ?? config.rowLimit;
  const showMoreRows = useCallback(() => {
    setRowLimitOverride((prev) => (prev ?? config.rowLimit) + config.rowLimit);
  }, [config.rowLimit]);
  const collapseRows = useCallback(() => setRowLimitOverride(null), []);

  const [filters, setFilters] = useState<IFilterOverrides>(NO_FILTER_OVERRIDES);
  const filterKey = `${config.providerId}|${config.billingCycleId}|${config.currencyIds.join(',')}`;
  const [seenFilterKey, setSeenFilterKey] = useState(filterKey);
  if (seenFilterKey !== filterKey) {
    setSeenFilterKey(filterKey);
    setFilters(NO_FILTER_OVERRIDES);
  }

  const providerId = filters.providerId ?? config.providerId;
  const billingCycleId = filters.billingCycleId ?? config.billingCycleId;
  const currencyIds = filters.currencyIds ?? config.currencyIds;

  const setProviderId = useCallback((value: number | 'all') => {
    setFilters((prev) => ({ ...prev, providerId: value }));
  }, []);
  const setBillingCycleId = useCallback((value: number | 'all') => {
    setFilters((prev) => ({ ...prev, billingCycleId: value }));
  }, []);
  const toggleCurrency = useCallback(
    (currencyId: number) => {
      setFilters((prev) => {
        const current = prev.currencyIds ?? config.currencyIds;
        const next = current.includes(currencyId)
          ? current.filter((id) => id !== currencyId)
          : [...current, currencyId];
        return { ...prev, currencyIds: next };
      });
    },
    [config.currencyIds],
  );
  const resetFilters = useCallback(() => {
    setFilters({
      providerId: 'all',
      billingCycleId: 'all',
      currencyIds: [],
    });
  }, []);

  const runtimeState = useMemo<IPaymentPlannerRuntimeState>(
    () => ({
      selectedCountOverride: countOverride ?? undefined,
      providerIdOverride: filters.providerId ?? undefined,
      billingCycleIdOverride: filters.billingCycleId ?? undefined,
      currencyIdsOverride: filters.currencyIds ?? undefined,
      rowLimitOverride: rowLimitOverride ?? undefined,
    }),
    [countOverride, filters, rowLimitOverride],
  );

  const hasActiveFilters =
    providerId !== 'all' || billingCycleId !== 'all' || currencyIds.length > 0;

  return {
    runtimeState,
    providerId,
    billingCycleId,
    currencyIds,
    hasActiveFilters,
    rowLimit,
    showMoreRows,
    collapseRows,
    setSelectedCount: setCountOverride,
    setProviderId,
    setBillingCycleId,
    toggleCurrency,
    resetFilters,
  };
}
