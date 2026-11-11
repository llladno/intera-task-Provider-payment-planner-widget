import type { ReactElement } from 'react';
import { joinClassNames } from '@planner/lib/join-class-names';
import type { ILeadProps } from '@planner/ui/lead/lead.types';
import '@planner/ui/lead/lead.css';

const BLOCK = 'dash-payment-planner-lead';

export function Lead({
  value,
  text,
  share,
  isCompact = false,
}: ILeadProps): ReactElement {
  return (
    <div className={joinClassNames(BLOCK, isCompact && `${BLOCK}--compact`)}>
      <span
        className={joinClassNames(
          `${BLOCK}__value`,
          isCompact && `${BLOCK}__value--compact`,
        )}
      >
        {value}
      </span>
      <span className={`${BLOCK}__text`}>{text}</span>
      {share !== undefined && <span className={`${BLOCK}__share`}>{share}</span>}
    </div>
  );
}
