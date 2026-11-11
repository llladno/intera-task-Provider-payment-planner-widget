import { useCallback, useState } from 'react';
import { DEFAULT_SANDBOX_PARAMS } from '@sandbox/config/default-params';
import type { ISandboxParams } from '@sandbox/model/types';

export interface ISandboxParamsState {
  params: ISandboxParams;
  updateParam: <TKey extends keyof ISandboxParams>(
    paramKey: TKey,
    paramValue: ISandboxParams[TKey],
  ) => void;
  toggleCurrency: (currencyId: number) => void;
  resetParams: () => void;
}

/** State of the params panel. */
export function useSandboxParams(): ISandboxParamsState {
  const [params, setParams] = useState<ISandboxParams>(DEFAULT_SANDBOX_PARAMS);

  const updateParam = useCallback(
    <TKey extends keyof ISandboxParams>(
      paramKey: TKey,
      paramValue: ISandboxParams[TKey],
    ) => {
      setParams((currentParams) => ({ ...currentParams, [paramKey]: paramValue }));
    },
    [],
  );

  const toggleCurrency = useCallback((toggledCurrencyId: number) => {
    setParams((currentParams) => ({
      ...currentParams,
      currencyIds: currentParams.currencyIds.includes(toggledCurrencyId)
        ? currentParams.currencyIds.filter(
            (currencyId) => currencyId !== toggledCurrencyId,
          )
        : [...currentParams.currencyIds, toggledCurrencyId],
    }));
  }, []);

  const resetParams = useCallback(() => setParams(DEFAULT_SANDBOX_PARAMS), []);

  return { params, updateParam, toggleCurrency, resetParams };
}
