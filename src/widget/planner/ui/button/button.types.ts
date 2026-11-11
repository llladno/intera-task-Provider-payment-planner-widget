import type { ButtonHTMLAttributes } from 'react';
import type { EButtonVariant } from '@planner/ui/button/button.constants';

export interface IButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: EButtonVariant;
}
