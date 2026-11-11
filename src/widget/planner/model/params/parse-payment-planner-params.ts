import { AMOUNT_FORMATS } from '@planner/config/amount-format';
import {
  DEFAULT_AMOUNT_FORMAT,
  DEFAULT_DESCRIPTION,
  DEFAULT_SHOW_CUSTOMER_BILLS,
  DEFAULT_SHOW_PROVIDER_BREAKDOWN,
  DEFAULT_SHOW_SUMMARY,
  DEFAULT_SIZE,
} from '@planner/config/defaults';
import { EPlannerParamKey } from '@planner/config/param-keys';
import {
  readCurrencyIds,
  readIdFilter,
  readRowLimit,
  readSelectedCount,
  readTrimmedText,
} from '@planner/model/params/read-param-values';
import type { IPaymentPlannerConfig } from '@planner/model/types';
import {
  isRecord,
  readBoolean,
  readEnum,
} from '@platform/widget-param-readers';
import { WIDGET_SIZES } from '@platform/widget-types';

/**
 * Parses untyped widget `params` into a validated `IPaymentPlannerConfig` with all defaults applied.
 *
 * Rules:
 * 1. Never throw on malformed or missing fields — fall back to defaults.
 * 2. `description`: trimmed `params.description` or `params.title`, fallback `'Provider Payment Planner'`.
 * 3. `selectedCount`: non-negative integer (`Math.max(0, Math.round(n))`); if missing/invalid, fallback to `10`.
 * 4. `currencyIds`: unique finite numbers from `params.currencyIds`; empty array = all currencies.
 * 5. `rowLimit`: read `params.rowLimit` (or legacy `params.maxRows`); if not in `[10, 25, 50, 100]`, fallback to `10`.
 */
export function parsePaymentPlannerParams(
  params: Record<string, unknown> | undefined,
): IPaymentPlannerConfig {
  const rawParams = isRecord(params) ? params : {};

  return {
    description:
      readTrimmedText(rawParams[EPlannerParamKey.Description]) ||
      readTrimmedText(rawParams[EPlannerParamKey.Title]) ||
      DEFAULT_DESCRIPTION,
    subtitle: readTrimmedText(rawParams[EPlannerParamKey.Subtitle]),
    size: readEnum(rawParams[EPlannerParamKey.Size], WIDGET_SIZES, DEFAULT_SIZE),
    selectedCount: readSelectedCount(rawParams[EPlannerParamKey.SelectedCount]),
    currencyIds: readCurrencyIds(rawParams[EPlannerParamKey.CurrencyIds]),
    providerId: readIdFilter(rawParams[EPlannerParamKey.ProviderId]),
    billingCycleId: readIdFilter(rawParams[EPlannerParamKey.BillingCycleId]),
    amountFormat: readEnum(
      rawParams[EPlannerParamKey.AmountFormat],
      AMOUNT_FORMATS,
      DEFAULT_AMOUNT_FORMAT,
    ),
    rowLimit: readRowLimit(rawParams),
    showCustomerBills: readBoolean(
      rawParams[EPlannerParamKey.ShowCustomerBills],
      DEFAULT_SHOW_CUSTOMER_BILLS,
    ),
    showProviderBreakdown: readBoolean(
      rawParams[EPlannerParamKey.ShowProviderBreakdown],
      DEFAULT_SHOW_PROVIDER_BREAKDOWN,
    ),
    showSummary: readBoolean(
      rawParams[EPlannerParamKey.ShowSummary],
      DEFAULT_SHOW_SUMMARY,
    ),
  };
}
