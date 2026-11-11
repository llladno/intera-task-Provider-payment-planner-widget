import type { ReactElement } from 'react';
import type { ISegmentedControlProps } from '@sandbox/ui/segmented-control/segmented-control.types';
import '@sandbox/ui/segmented-control/segmented-control.css';

const BLOCK = 'sandbox-segmented-control';

export function SegmentedControl<TOption extends string>({
  options,
  value,
  onChange,
  getOptionLabel = (option) => option,
}: ISegmentedControlProps<TOption>): ReactElement {
  return (
    <div className={BLOCK}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`${BLOCK}__button ${option === value ? `${BLOCK}__button--active` : ''}`.trim()}
          onClick={() => onChange(option)}
        >
          {getOptionLabel(option)}
        </button>
      ))}
    </div>
  );
}
