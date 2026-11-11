import { WIDGET_SIZES, type TWidgetSize } from '@platform/widget-types';

/** "Show all four sizes at once" mode. */
export const ALL_SIZES_MODE = 'all';
export type TViewSizeMode = TWidgetSize | typeof ALL_SIZES_MODE;

export const VIEW_SIZE_MODES: readonly TViewSizeMode[] = [
  ...WIDGET_SIZES,
  ALL_SIZES_MODE,
];

/** Sizes shown on the second row of the "all sizes" view (below `full`). */
export const BOTTOM_ROW_SIZES: readonly TWidgetSize[] = [
  'half',
  'third',
  'quarter',
];

/** Size used for the widget in "all sizes" mode, and its first row. */
export const FULL_SIZE: TWidgetSize = 'full';

export const SIZE_SLOT_LABELS: Readonly<Record<TWidgetSize, string>> = {
  full: 'XL · full (4/4 — ~880px)',
  half: 'L · half (1/2 — ~600px)',
  third: 'M · third (1/3 — ~400px)',
  quarter: 'S · quarter (1/4 — ~240px)',
};

export const VIEW_SIZE_BUTTON_LABELS: Readonly<Record<TViewSizeMode, string>> = {
  full: 'full',
  half: 'half',
  third: 'third',
  quarter: 'quarter',
  [ALL_SIZES_MODE]: 'Все 4',
};
