import type { ReactElement } from 'react';
import { joinClassNames } from '@planner/lib/join-class-names';
import { EButtonVariant } from '@planner/ui/button/button.constants';
import type { IButtonProps } from '@planner/ui/button/button.types';
import '@planner/ui/button/button.css';

const BLOCK = 'dash-payment-planner-button';

export function Button({
  variant = EButtonVariant.Default,
  className,
  ...buttonProps
}: IButtonProps): ReactElement {
  return (
    <button
      type="button"
      className={joinClassNames(
        BLOCK,
        variant === EButtonVariant.Icon && `${BLOCK}--icon`,
        variant === EButtonVariant.Link && `${BLOCK}--link`,
        className,
      )}
      {...buttonProps}
    />
  );
}
