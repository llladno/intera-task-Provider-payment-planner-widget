import type { ReactElement } from 'react';
import { LABELS } from '@planner/config/labels';
import { MESSAGES } from '@planner/lib/messages';
import { Button } from '@planner/ui/button/button';
import { EButtonVariant } from '@planner/ui/button/button.constants';
import { CurrencySwitch } from '@planner/ui/currency-switch/currency-switch';
import { CurrencyTotals } from '@planner/ui/currency-totals/currency-totals';
import { ECurrencyTotalsLayout } from '@planner/ui/currency-totals/currency-totals.constants';
import { InvalidAmountNotice } from '@planner/ui/invalid-amount-notice/invalid-amount-notice';
import { Lead } from '@planner/ui/lead/lead';
import { ProviderStrip } from '@planner/ui/provider-strip/provider-strip';
import { Section } from '@planner/ui/section/section';
import type { IViewProps } from '@planner/ui/views/views.types';

/** `third` (M): `N / M` counter, all currencies, one stacked provider strip. */
export function ThirdView({
  config,
  plan,
  activeCurrencyId,
  activeShares,
  onCurrencyChange,
  onOpenQueue,
}: IViewProps): ReactElement {
  return (
    <>
      <Lead
        value={plan.effectiveSelectedCount}
        text={MESSAGES.slashTotalToPay(plan.totalQueueCount)}
      />
      <InvalidAmountNotice invalidCount={plan.invalidSelectedCount} />
      {config.showSummary && (
        <Section title={LABELS.sections.currencyTotals}>
          <CurrencyTotals
            totals={plan.currencyTotals}
            format={config.amountFormat}
            layout={ECurrencyTotalsLayout.TightGrid}
            isCompact
            showBillCount={false}
          />
        </Section>
      )}
      {config.showProviderBreakdown && activeShares.length > 0 && (
        <Section
          title={LABELS.sections.providersShort}
          aside={
            <CurrencySwitch
              totals={plan.currencyTotals}
              activeCurrencyId={activeCurrencyId}
              onChange={onCurrencyChange}
            />
          }
        >
          <ProviderStrip items={activeShares} />
        </Section>
      )}
      <Button variant={EButtonVariant.Link} onClick={onOpenQueue}>
        {LABELS.actions.openDetails}
      </Button>
    </>
  );
}
