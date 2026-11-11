import type { TAmountFormat } from '@planner/config/amount-format';
import type { IProviderCurrencyBreakdownItem } from '@planner/model/types';

export interface IProviderSharesProps {
  /** Providers of ONE currency, sorted by amount. */
  items: readonly IProviderCurrencyBreakdownItem[];
  format: TAmountFormat;
  /** Max rows to render; the rest is summarised as "+ ещё N". */
  limit?: number;
}
