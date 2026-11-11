import type { ReactElement } from 'react';
import type { IStatProps } from '@planner/ui/stat/stat.types';
import '@planner/ui/stat/stat.css';

const BLOCK = 'dash-payment-planner-stat';

export function Stat({ value, label }: IStatProps): ReactElement {
  return (
    <div className={BLOCK}>
      <span className={`${BLOCK}__value`}>{value}</span>
      <span className={`${BLOCK}__label`}>{label}</span>
    </div>
  );
}
