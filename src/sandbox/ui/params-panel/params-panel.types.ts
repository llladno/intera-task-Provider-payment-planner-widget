import type { IFilterOption } from '@/widget/payment-planner-filters';
import type { ISandboxParamsState } from '@sandbox/model/use-sandbox-params';

export interface IParamsPanelProps {
  paramsState: ISandboxParamsState;
  /** Rows in the mock queue — the maximum of the count slider. */
  queueSize: number;
  providers: readonly IFilterOption[];
  currencies: readonly IFilterOption[];
  billingCycles: readonly IFilterOption[];
}
