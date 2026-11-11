import {
  ALL_FILTER_VALUE,
  DEFAULT_ROW_LIMIT,
  EAmountFormat,
} from '@/widget/payment-planner-params';
import type { ISandboxParams } from '@sandbox/model/types';

export const DEFAULT_SANDBOX_PARAMS: ISandboxParams = {
  description: 'Provider Payment Planner',
  subtitle: 'Enigma · provider-payment-queue',
  selectedCount: 14,
  currencyIds: [],
  providerId: ALL_FILTER_VALUE,
  billingCycleId: ALL_FILTER_VALUE,
  amountFormat: EAmountFormat.Grouped,
  rowLimit: DEFAULT_ROW_LIMIT,
  showCustomerBills: true,
  showProviderBreakdown: true,
  showSummary: true,
};
