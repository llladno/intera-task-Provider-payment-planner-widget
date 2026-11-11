import type { ReactElement } from 'react';
import { joinClassNames } from '@planner/lib/join-class-names';
import { EStateBlockVariant } from '@planner/ui/state-block/state-block.constants';
import type { IStateBlockProps } from '@planner/ui/state-block/state-block.types';
import '@planner/ui/state-block/state-block.css';

const BLOCK = 'dash-payment-planner-state-block';

/** Empty and error placeholders inside the card. */
export function StateBlock({
  title,
  text,
  variant = EStateBlockVariant.Info,
  role = 'status',
  children,
}: IStateBlockProps): ReactElement {
  return (
    <div
      className={joinClassNames(
        BLOCK,
        variant === EStateBlockVariant.Error && `${BLOCK}--error`,
      )}
      role={role}
    >
      <strong
        className={joinClassNames(
          `${BLOCK}__title`,
          variant === EStateBlockVariant.Error && `${BLOCK}__title--error`,
        )}
      >
        {title}
      </strong>
      {text !== undefined && <p className={`${BLOCK}__text`}>{text}</p>}
      {children}
    </div>
  );
}
