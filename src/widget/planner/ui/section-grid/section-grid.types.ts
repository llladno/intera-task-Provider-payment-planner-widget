import type { ReactNode } from 'react';

export interface ISectionGridProps {
  children: ReactNode;
  /** One column instead of two. */
  isSingleColumn?: boolean;
}
