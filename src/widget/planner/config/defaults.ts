import { EAmountFormat } from '@planner/config/amount-format';
import { ALL_FILTER_VALUE } from '@planner/config/filters';
import type { TWidgetRowLimit, TWidgetSize } from '@platform/widget-types';

export const DEFAULT_DESCRIPTION = 'Provider Payment Planner';
export const DEFAULT_SUBTITLE = '';
export const DEFAULT_SIZE: TWidgetSize = 'full';
export const DEFAULT_SELECTED_COUNT = 10;
export const DEFAULT_ROW_LIMIT: TWidgetRowLimit = 10;
export const DEFAULT_AMOUNT_FORMAT = EAmountFormat.Grouped;
export const DEFAULT_PROVIDER_ID = ALL_FILTER_VALUE;
export const DEFAULT_BILLING_CYCLE_ID = ALL_FILTER_VALUE;
export const DEFAULT_SHOW_CUSTOMER_BILLS = true;
export const DEFAULT_SHOW_PROVIDER_BREAKDOWN = true;
export const DEFAULT_SHOW_SUMMARY = true;
