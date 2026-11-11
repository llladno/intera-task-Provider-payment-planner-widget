import type { ReactNode } from 'react';

export interface ISectionProps {
  title: string;
  children: ReactNode;
  /** Right-hand side of the heading row (e.g. a currency switch). */
  aside?: ReactNode;
  /** Draws a bordered panel around the section. */
  isBoxed?: boolean;
}
