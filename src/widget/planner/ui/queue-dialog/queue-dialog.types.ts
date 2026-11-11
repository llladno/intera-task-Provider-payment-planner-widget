import type { ReactNode } from 'react';

export interface IQueueDialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}
