import type { ReactElement } from 'react';
import { LABELS } from '@planner/config/labels';
import { formatDate } from '@planner/lib/format/format-date';
import { Button } from '@planner/ui/button/button';
import { EButtonVariant } from '@planner/ui/button/button.constants';
import { CurrencySwitch } from '@planner/ui/currency-switch/currency-switch';
import { CurrencyTotals } from '@planner/ui/currency-totals/currency-totals';
import { InvalidAmountNotice } from '@planner/ui/invalid-amount-notice/invalid-amount-notice';
import { PlannerControls } from '@planner/ui/planner-controls/planner-controls';
import { ProviderShares } from '@planner/ui/provider-shares/provider-shares';
import { QueueTable } from '@planner/ui/queue-table/queue-table';
import { SectionGrid } from '@planner/ui/section-grid/section-grid';
import { Section } from '@planner/ui/section/section';
import { StatGrid } from '@planner/ui/stat-grid/stat-grid';
import { Stat } from '@planner/ui/stat/stat';
import { StateBlock } from '@planner/ui/state-block/state-block';
import type { IViewProps } from '@planner/ui/views/views.types';

/** `full` (XL): stats, controls, totals, provider shares and the queue table. */
export function FullView({
  config,
  plan,
  planner,
  filterOptions,
  sourceRowCount,
  activeCurrencyId,
  activeShares,
  onCurrencyChange,
  expandedBillKey,
  onToggleBill,
}: IViewProps): ReactElement {
  const isQueueEmptyForFilters = plan.totalQueueCount === 0 && sourceRowCount > 0;
  const showsAnyPanel = config.showSummary || config.showProviderBreakdown;
  const showsBothPanels = config.showSummary && config.showProviderBreakdown;

  return (
    <>
      {config.showSummary && (
        <StatGrid>
          <Stat value={plan.totalQueueCount} label={LABELS.stats.queueCount} />
          <Stat
            value={plan.effectiveSelectedCount}
            label={LABELS.stats.selectedCount}
          />
          <Stat
            value={plan.selectedProviderCount}
            label={LABELS.stats.providerCount}
          />
          {plan.oldestSelectedRecvDate && (
            <Stat
              value={formatDate(plan.oldestSelectedRecvDate)}
              label={LABELS.stats.oldestBill}
            />
          )}
        </StatGrid>
      )}

      <InvalidAmountNotice invalidCount={plan.invalidSelectedCount} />

      <PlannerControls
        planner={planner}
        filterOptions={filterOptions}
        selectedCount={plan.effectiveSelectedCount}
        queueCount={plan.totalQueueCount}
      />

      {isQueueEmptyForFilters ? (
        <StateBlock
          title={LABELS.states.filteredEmptyTitle}
          text={LABELS.states.filteredEmptyHint}
        >
          <Button variant={EButtonVariant.Default} onClick={planner.resetFilters}>
            {LABELS.controls.resetFilters}
          </Button>
        </StateBlock>
      ) : (
        <>
          {showsAnyPanel && (
            <SectionGrid isSingleColumn={!showsBothPanels}>
              {config.showSummary && (
                <Section title={LABELS.sections.currencyTotals} isBoxed>
                  <CurrencyTotals
                    totals={plan.currencyTotals}
                    format={config.amountFormat}
                  />
                </Section>
              )}
              {config.showProviderBreakdown && (
                <Section
                  title={LABELS.sections.providers}
                  isBoxed
                  aside={
                    <CurrencySwitch
                      totals={plan.currencyTotals}
                      activeCurrencyId={activeCurrencyId}
                      onChange={onCurrencyChange}
                    />
                  }
                >
                  <ProviderShares items={activeShares} format={config.amountFormat} />
                </Section>
              )}
            </SectionGrid>
          )}

          <QueueTable
            items={plan.visibleQueueItems}
            totalCount={plan.totalQueueCount}
            format={config.amountFormat}
            showCustomerBills={config.showCustomerBills}
            expandedBillKey={expandedBillKey}
            onToggleBill={onToggleBill}
            moreStep={config.rowLimit}
            canCollapse={planner.rowLimit > config.rowLimit}
            onShowMore={planner.showMoreRows}
            onCollapse={planner.collapseRows}
          />
        </>
      )}
    </>
  );
}
