import type { ReactElement } from 'react';
import { ALL_FILTER_VALUE } from '@planner/config/filters';
import { joinClassNames } from '@planner/lib/join-class-names';
import type {
  IFilterFieldProps,
  IFilterSelectProps,
} from '@planner/ui/filter-field/filter-field.types';
import '@planner/ui/filter-field/filter-field.css';

const FIELD_BLOCK = 'dash-payment-planner-filter-field';

/** A label above a control (select, chip group). */
export function FilterField({
  label,
  children,
  isWide = false,
  labelId,
}: IFilterFieldProps): ReactElement {
  return (
    <div
      className={joinClassNames(FIELD_BLOCK, isWide && `${FIELD_BLOCK}--wide`)}
    >
      <span id={labelId}>{label}</span>
      {children}
    </div>
  );
}

/** Select with an "all" option; the label wraps the select so it names it. */
export function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
}: IFilterSelectProps): ReactElement {
  return (
    <label className={FIELD_BLOCK}>
      <span>{label}</span>
      <select
        className={`${FIELD_BLOCK}__select`}
        value={String(value)}
        onChange={(event) =>
          onChange(
            event.target.value === ALL_FILTER_VALUE
              ? ALL_FILTER_VALUE
              : Number(event.target.value),
          )
        }
      >
        <option value={ALL_FILTER_VALUE}>{allLabel}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
