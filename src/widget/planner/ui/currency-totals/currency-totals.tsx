import type { ReactElement } from 'react';
import { LABELS } from '@planner/config/labels';
import { formatAmount } from '@planner/lib/format/format-amount';
import { joinClassNames } from '@planner/lib/join-class-names';
import { MESSAGES } from '@planner/lib/messages';
import { ECurrencyTotalsLayout } from '@planner/ui/currency-totals/currency-totals.constants';
import type { ICurrencyTotalsProps } from '@planner/ui/currency-totals/currency-totals.types';
import { Text } from '@planner/ui/text/text';
import { ETextTone } from '@planner/ui/text/text.constants';
import '@planner/ui/currency-totals/currency-totals.css';

const BLOCK = 'dash-payment-planner-currency-totals';

/** One amount per currency — currencies are never added together. */
export function CurrencyTotals({
  totals,
  format,
  layout = ECurrencyTotalsLayout.List,
  isCompact = false,
  showBillCount = true,
}: ICurrencyTotalsProps): ReactElement {
  if (totals.length === 0) {
    return (
      <Text as="p" tone={ETextTone.Muted}>
        {LABELS.states.noValidTotals}
      </Text>
    );
  }
  const isGrid = layout !== ECurrencyTotalsLayout.List;
  return (
    <ul
      className={joinClassNames(
        BLOCK,
        isGrid && `${BLOCK}--grid`,
        layout === ECurrencyTotalsLayout.TightGrid && `${BLOCK}--tight`,
      )}
    >
      {totals.map((currencyTotal) => (
        <li
          key={currencyTotal.currencyId}
          className={joinClassNames(`${BLOCK}__item`, isGrid && `${BLOCK}__item--stacked`)}
        >
          <span
            className={joinClassNames(
              `${BLOCK}__amount`,
              isCompact && `${BLOCK}__amount--compact`,
            )}
            title={currencyTotal.currencyName}
          >
            {formatAmount(
              currencyTotal.totalAmount,
              currencyTotal.currencyName,
              format,
              { compact: isCompact },
            )}
          </span>
          {showBillCount && (
            <span className={`${BLOCK}__meta`}>
              {MESSAGES.billsCount(currencyTotal.billCount)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
