import type {
  TAmountFormat,
  TIdFilter,
} from '@/widget/payment-planner-params';
import type { TWidgetRowLimit } from '@platform/widget-types';

/** The widget `params` the sandbox panel edits (names are the param keys). */
export interface ISandboxParams {
  description: string;
  subtitle: string;
  selectedCount: number;
  currencyIds: number[];
  providerId: TIdFilter;
  billingCycleId: TIdFilter;
  amountFormat: TAmountFormat;
  rowLimit: TWidgetRowLimit;
  showCustomerBills: boolean;
  showProviderBreakdown: boolean;
  showSummary: boolean;
}

export type TBooleanParamKey = {
  [K in keyof ISandboxParams]: ISandboxParams[K] extends boolean ? K : never;
}[keyof ISandboxParams];
