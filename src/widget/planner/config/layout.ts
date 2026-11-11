import type { TWidgetSize } from '@platform/widget-types';

/** Currency lines that fit into the `quarter` card before the rest is collapsed. */
export const QUARTER_VISIBLE_CURRENCIES = 2;
/** Provider rows shown in the `half` card. */
export const HALF_VISIBLE_PROVIDERS = 4;
/** Providers named in the legend under the `third` strip. */
export const STRIP_LEGEND_PROVIDERS = 3;
/** Sizes whose "open queue" / "open details" action opens the full view in a dialog. */
export const DIALOG_SIZES: readonly TWidgetSize[] = ['half', 'third'];
/** Size used inside the dialog. */
export const DIALOG_VIEW_SIZE: TWidgetSize = 'full';
/** Sizes that have room for the freshness label next to the dot. */
export const FRESHNESS_LABEL_SIZES: readonly TWidgetSize[] = ['full', 'half'];
