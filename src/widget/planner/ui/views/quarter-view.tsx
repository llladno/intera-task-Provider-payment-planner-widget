import type { ReactElement } from 'react';
import { LABELS } from '@planner/config/labels';
import { QUARTER_VISIBLE_CURRENCIES } from '@planner/config/layout';
import { MESSAGES } from '@planner/lib/messages';
import { Button } from '@planner/ui/button/button';
import { EButtonVariant } from '@planner/ui/button/button.constants';
import { CurrencyTotals } from '@planner/ui/currency-totals/currency-totals';
import { InvalidAmountNotice } from '@planner/ui/invalid-amount-notice/invalid-amount-notice';
import { Lead } from '@planner/ui/lead/lead';
import { OverflowHint } from '@planner/ui/overflow-hint/overflow-hint';
import { Section } from '@planner/ui/section/section';
import type { IViewProps } from '@planner/ui/views/views.types';

/**
 * `quarter` (S): the count and the first currencies. Currencies that do not fit
 * are announced ("+ ещё 2 валюты") and can be expanded — never hidden silently.
 */
export function QuarterView({
  config,
  plan,
  isCurrencyListExpanded,
  onToggleCurrencyList,
}: IViewProps): ReactElement {
  const allTotals = plan.currencyTotals;
  const shownTotals = isCurrencyListExpanded
    ? allTotals
    : allTotals.slice(0, QUARTER_VISIBLE_CURRENCIES);
  const hiddenTotals = isCurrencyListExpanded
    ? []
    : allTotals.slice(QUARTER_VISIBLE_CURRENCIES);
  const hasOverflow = allTotals.length > QUARTER_VISIBLE_CURRENCIES;

  return (
    <>
      <Lead
        isCompact
        value={plan.effectiveSelectedCount}
        text={MESSAGES.toPayOfTotal(plan.totalQueueCount)}
      />
      <InvalidAmountNotice invalidCount={plan.invalidSelectedCount} />
      {config.showSummary && (
        <Section title={MESSAGES.currenciesInPlan(allTotals.length)}>
          <CurrencyTotals
            totals={shownTotals}
            format={config.amountFormat}
            isCompact
            showBillCount={false}
          />
          {hiddenTotals.length > 0 && (
            <OverflowHint
              message={MESSAGES.moreCurrencies(
                hiddenTotals.length,
                hiddenTotals.map((currencyTotal) => currencyTotal.currencyName).join(', '),
              )}
            />
          )}
          {hasOverflow && (
            <Button
              variant={EButtonVariant.Link}
              aria-expanded={isCurrencyListExpanded}
              onClick={onToggleCurrencyList}
            >
              {isCurrencyListExpanded
                ? LABELS.actions.collapseCurrencies
                : LABELS.actions.allCurrencies}
            </Button>
          )}
        </Section>
      )}
    </>
  );
}
