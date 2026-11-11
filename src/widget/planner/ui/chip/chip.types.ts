import type { ReactNode } from 'react';

export interface IChipProps {
  children: ReactNode;
  isPressed: boolean;
  onClick: () => void;
}
