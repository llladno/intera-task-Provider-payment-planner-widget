import type { ReactElement } from 'react';
import { PERCENT_TOTAL } from '@planner/config/format-locale';
import { LABELS } from '@planner/config/labels';
import { HALF_VISIBLE_PROVIDERS } from '@planner/config/layout';
import { formatDate } from '@planner/lib/format/format-date';
import { formatPercent } from '@planner/lib/format/format-percent';
import { MESSAGES } from '@planner/lib/messages';
import { Button } from '@planner/ui/button/button';
import { EButtonVariant } from '@planner/ui/button/button.constants';
import { CountControl } from '@planner/ui/count-control/count-control';
import { ECountControlVariant } from '@planner/ui/count-control/count-control.constants';
import { CurrencySwitch } from '@planner/ui/currency-switch/currency-switch';
import { CurrencyTotals } from '@planner/ui/currency-totals/currency-totals';
import { ECurrencyTotalsLayout } from '@planner/ui/currency-totals/currency-totals.constants';
import { InvalidAmountNotice } from '@planner/ui/invalid-amount-notice/invalid-amount-notice';
import { Lead } from '@planner/ui/lead/lead';
import { ProviderShares } from '@planner/ui/provider-shares/provider-shares';
import { Section } from '@planner/ui/section/section';
import { Text } from '@planner/ui/text/text';
import { ETextTone } from '@planner/ui/text/text.constants';
import type { IViewProps } from '@planner/ui/views/views.types';

/** `half` (L): N of M with a slider, all currencies, provider shares. */
export function HalfView({
  config,
  plan,
  planner,
  activeCurrencyId,
  activeShares,
  onCurrencyChange,
  onOpenQueue,
}: IViewProps): ReactElement {
  const selectedShare = Math.round(
    (plan.effectiveSelectedCount / plan.totalQueueCount) * PERCENT_TOTAL,
  );
  const leadText = config.showSummary
    ? `${MESSAGES.billsOfTotal(plan.totalQueueCount)} · ${MESSAGES.providersCount(plan.selectedProviderCount)}`
    : MESSAGES.billsOfTotal(plan.totalQueueCount);

  return (
    <>
      <Lead
        value={plan.effectiveSelectedCount}
        text={leadText}
        share={plan.totalQueueCount > 0 ? formatPercent(selectedShare) : undefined}
      />
      <CountControl
        variant={ECountControlVariant.Compact}
        value={plan.effectiveSelectedCount}
        max={plan.totalQueueCount}
        onChange={planner.setSelectedCount}
      />
      <InvalidAmountNotice invalidCount={plan.invalidSelectedCount} />
      {config.showSummary && (
        <Section title={LABELS.sections.currencyTotalsToPay}>
          <CurrencyTotals
            totals={plan.currencyTotals}
            format={config.amountFormat}
            layout={ECurrencyTotalsLayout.Grid}
          />
          {plan.oldestSelectedRecvDate && (
            <Text as="p" tone={ETextTone.Muted}>
              {MESSAGES.oldestBillOn(formatDate(plan.oldestSelectedRecvDate))}
            </Text>
          )}
        </Section>
      )}
      {config.showProviderBreakdown && activeShares.length > 0 && (
        <Section
          title={LABELS.sections.providerShares}
          aside={
            <CurrencySwitch
              totals={plan.currencyTotals}
              activeCurrencyId={activeCurrencyId}
              onChange={onCurrencyChange}
            />
          }
        >
          <ProviderShares
            items={activeShares}
            format={config.amountFormat}
            limit={HALF_VISIBLE_PROVIDERS}
          />
        </Section>
      )}
      <Button variant={EButtonVariant.Link} onClick={onOpenQueue}>
        {LABELS.actions.openQueue}
      </Button>
    </>
  );
}
