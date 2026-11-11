import { useId, type ReactElement } from 'react';
import { LABELS } from '@planner/config/labels';
import { Button } from '@planner/ui/button/button';
import { EButtonVariant } from '@planner/ui/button/button.constants';
import { ChipList } from '@planner/ui/chip-list/chip-list';
import { Chip } from '@planner/ui/chip/chip';
import { CountControl } from '@planner/ui/count-control/count-control';
import { ECountControlVariant } from '@planner/ui/count-control/count-control.constants';
import {
  FilterField,
  FilterSelect,
} from '@planner/ui/filter-field/filter-field';
import type { IPlannerControlsProps } from '@planner/ui/planner-controls/planner-controls.types';
import '@planner/ui/planner-controls/planner-controls.css';

const BLOCK = 'dash-payment-planner-controls';

/** `full` size: the slider and the quick filters. */
export function PlannerControls({
  planner,
  filterOptions,
  selectedCount,
  queueCount,
}: IPlannerControlsProps): ReactElement {
  const currencyLabelId = useId();
  return (
    <div className={BLOCK}>
      <CountControl
        variant={ECountControlVariant.Full}
        value={selectedCount}
        max={queueCount}
        onChange={planner.setSelectedCount}
      />
      <div className={`${BLOCK}__filters`}>
        <FilterSelect
          label={LABELS.controls.provider}
          allLabel={LABELS.controls.allProviders}
          value={planner.providerId}
          options={filterOptions.providers}
          onChange={planner.setProviderId}
        />
        <FilterSelect
          label={LABELS.controls.billingCycle}
          allLabel={LABELS.controls.allBillingCycles}
          value={planner.billingCycleId}
          options={filterOptions.billingCycles}
          onChange={planner.setBillingCycleId}
        />
        <FilterField
          label={LABELS.controls.currencies}
          labelId={currencyLabelId}
          isWide
        >
          <ChipList labelledBy={currencyLabelId}>
            {filterOptions.currencies.map((currency) => (
              <Chip
                key={currency.id}
                isPressed={planner.currencyIds.includes(currency.id)}
                onClick={() => planner.toggleCurrency(currency.id)}
              >
                {currency.name}
              </Chip>
            ))}
            {planner.hasActiveFilters && (
              <Button variant={EButtonVariant.Link} onClick={planner.resetFilters}>
                {LABELS.controls.resetFilter}
              </Button>
            )}
          </ChipList>
        </FilterField>
      </div>
    </div>
  );
}
