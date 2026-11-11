import type { ICurrencyTotal } from '@planner/model/types';

export interface ICurrencySwitchProps {
  totals: readonly ICurrencyTotal[];
  /** Currency whose provider shares are shown. */
  activeCurrencyId: number | null;
  onChange: (currencyId: number) => void;
}
