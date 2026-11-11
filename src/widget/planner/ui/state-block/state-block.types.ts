import type { ReactNode } from 'react';
import type { EStateBlockVariant } from '@planner/ui/state-block/state-block.constants';

export interface IStateBlockProps {
  title: string;
  text?: string;
  variant?: EStateBlockVariant;
  /** `alert` for errors, `status` otherwise. */
  role?: 'alert' | 'status';
  /** Optional action under the text. */
  children?: ReactNode;
}
