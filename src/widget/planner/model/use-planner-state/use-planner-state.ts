import { useCallback, useMemo, useState } from 'react';
import { ALL_FILTER_VALUE, type TIdFilter } from '@planner/config/filters';
import type {
  IPaymentPlannerConfig,
  IPaymentPlannerRuntimeState,
} from '@planner/model/types';
import type {
  IFilterOverrides,
  IPlannerState,
} from '@planner/model/use-planner-state/types';

const NO_FILTER_OVERRIDES: IFilterOverrides = {
  providerId: null,
  billingCycleId: null,
  currencyIds: null,
};

const RESET_FILTER_OVERRIDES: IFilterOverrides = {
  providerId: ALL_FILTER_VALUE,
  billingCycleId: ALL_FILTER_VALUE,
  currencyIds: [],
};

/**
 * Interactive state the user changes inside the widget (slider, quick filters, row limit).
 *
 * It lives in the always-mounted widget, so a background refresh keeps it.
 * When the host edits the matching param, the override is dropped and the new
 * param wins — otherwise a stale slider position would shadow the setting.
 */
export function usePlannerState(config: IPaymentPlannerConfig): IPlannerState {
  const [selectedCountOverride, setSelectedCountOverride] = useState<number | null>(null);
  const [seenSelectedCount, setSeenSelectedCount] = useState(config.selectedCount);
  if (seenSelectedCount !== config.selectedCount) {
    setSeenSelectedCount(config.selectedCount);
    setSelectedCountOverride(null);
  }

  const [rowLimitOverride, setRowLimitOverride] = useState<number | null>(null);
  const [seenRowLimit, setSeenRowLimit] = useState(config.rowLimit);
  if (seenRowLimit !== config.rowLimit) {
    setSeenRowLimit(config.rowLimit);
    setRowLimitOverride(null);
  }
  const rowLimit = rowLimitOverride ?? config.rowLimit;
  const showMoreRows = useCallback(() => {
    setRowLimitOverride(
      (currentOverride) => (currentOverride ?? config.rowLimit) + config.rowLimit,
    );
  }, [config.rowLimit]);
  const collapseRows = useCallback(() => setRowLimitOverride(null), []);

  const [filterOverrides, setFilterOverrides] =
    useState<IFilterOverrides>(NO_FILTER_OVERRIDES);
  const configFiltersKey = `${config.providerId}|${config.billingCycleId}|${config.currencyIds.join(',')}`;
  const [seenConfigFiltersKey, setSeenConfigFiltersKey] = useState(configFiltersKey);
  if (seenConfigFiltersKey !== configFiltersKey) {
    setSeenConfigFiltersKey(configFiltersKey);
    setFilterOverrides(NO_FILTER_OVERRIDES);
  }

  const providerId = filterOverrides.providerId ?? config.providerId;
  const billingCycleId = filterOverrides.billingCycleId ?? config.billingCycleId;
  const currencyIds = filterOverrides.currencyIds ?? config.currencyIds;

  const setProviderId = useCallback((nextProviderId: TIdFilter) => {
    setFilterOverrides((current) => ({ ...current, providerId: nextProviderId }));
  }, []);
  const setBillingCycleId = useCallback((nextBillingCycleId: TIdFilter) => {
    setFilterOverrides((current) => ({
      ...current,
      billingCycleId: nextBillingCycleId,
    }));
  }, []);
  const toggleCurrency = useCallback(
    (toggledCurrencyId: number) => {
      setFilterOverrides((current) => {
        const currentCurrencyIds = current.currencyIds ?? config.currencyIds;
        const nextCurrencyIds = currentCurrencyIds.includes(toggledCurrencyId)
          ? currentCurrencyIds.filter((currencyId) => currencyId !== toggledCurrencyId)
          : [...currentCurrencyIds, toggledCurrencyId];
        return { ...current, currencyIds: nextCurrencyIds };
      });
    },
    [config.currencyIds],
  );
  const resetFilters = useCallback(() => {
    setFilterOverrides(RESET_FILTER_OVERRIDES);
  }, []);

  const runtimeState = useMemo<IPaymentPlannerRuntimeState>(
    () => ({
      selectedCountOverride: selectedCountOverride ?? undefined,
      providerIdOverride: filterOverrides.providerId ?? undefined,
      billingCycleIdOverride: filterOverrides.billingCycleId ?? undefined,
      currencyIdsOverride: filterOverrides.currencyIds ?? undefined,
      rowLimitOverride: rowLimitOverride ?? undefined,
    }),
    [selectedCountOverride, filterOverrides, rowLimitOverride],
  );

  const hasActiveFilters =
    providerId !== ALL_FILTER_VALUE ||
    billingCycleId !== ALL_FILTER_VALUE ||
    currencyIds.length > 0;

  return {
    runtimeState,
    providerId,
    billingCycleId,
    currencyIds,
    hasActiveFilters,
    rowLimit,
    showMoreRows,
    collapseRows,
    setSelectedCount: setSelectedCountOverride,
    setProviderId,
    setBillingCycleId,
    toggleCurrency,
    resetFilters,
  };
}
