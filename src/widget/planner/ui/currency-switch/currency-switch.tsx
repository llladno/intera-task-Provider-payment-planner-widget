import type { ReactElement } from 'react';
import { LABELS } from '@planner/config/labels';
import { ChipList } from '@planner/ui/chip-list/chip-list';
import { Chip } from '@planner/ui/chip/chip';
import type { ICurrencySwitchProps } from '@planner/ui/currency-switch/currency-switch.types';

/** Picks the currency whose provider shares are shown; hidden when there is only one. */
export function CurrencySwitch({
  totals,
  activeCurrencyId,
  onChange,
}: ICurrencySwitchProps): ReactElement | null {
  if (totals.length <= 1) {
    return null;
  }
  return (
    <ChipList label={LABELS.sections.currencySwitchAria}>
      {totals.map((currencyTotal) => (
        <Chip
          key={currencyTotal.currencyId}
          isPressed={currencyTotal.currencyId === activeCurrencyId}
          onClick={() => onChange(currencyTotal.currencyId)}
        >
          {currencyTotal.currencyName}
        </Chip>
      ))}
    </ChipList>
  );
}
