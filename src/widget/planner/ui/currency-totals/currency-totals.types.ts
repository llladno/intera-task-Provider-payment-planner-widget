import type { TAmountFormat } from '@planner/config/amount-format';
import type { ICurrencyTotal } from '@planner/model/types';
import type { ECurrencyTotalsLayout } from '@planner/ui/currency-totals/currency-totals.constants';

export interface ICurrencyTotalsProps {
  totals: readonly ICurrencyTotal[];
  format: TAmountFormat;
  layout?: ECurrencyTotalsLayout;
  /** Whole amounts without kopecks and a smaller font, for narrow cards. */
  isCompact?: boolean;
  showBillCount?: boolean;
}
