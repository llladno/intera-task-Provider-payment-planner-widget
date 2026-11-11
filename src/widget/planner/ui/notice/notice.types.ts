export interface INoticeProps {
  message: string;
  /** Dimmed explanation after the message. */
  hint?: string;
  /** `alert` interrupts screen readers; `status` is polite. */
  role?: 'alert' | 'status';
}
