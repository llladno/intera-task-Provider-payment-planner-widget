import type { ReactNode } from 'react';
import type { ETextTone } from '@planner/ui/text/text.constants';

export interface ITextProps {
  children: ReactNode;
  tone?: ETextTone;
  /** Element to render; default `span`. */
  as?: 'span' | 'p' | 'li';
}
