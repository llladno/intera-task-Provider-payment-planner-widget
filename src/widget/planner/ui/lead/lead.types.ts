export interface ILeadProps {
  /** The big number. */
  value: number;
  /** Muted text next to (or under) it. */
  text: string;
  /** Right-aligned accent text, e.g. `44%`. */
  share?: string;
  /** Stacked, smaller variant for the narrowest card. */
  isCompact?: boolean;
}
