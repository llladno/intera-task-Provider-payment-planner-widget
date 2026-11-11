import type {
  IPaymentPlannerConfig,
  IPaymentPlannerRuntimeState,
} from '@planner/model/types';
import { toFiniteNumber } from '@platform/to-finite-number';

export function resolveSelectedCount(
  config: IPaymentPlannerConfig,
  runtimeState: IPaymentPlannerRuntimeState | undefined,
): number {
  const requestedCount = toFiniteNumber(
    runtimeState?.selectedCountOverride ?? config.selectedCount,
  );
  return requestedCount === null ? 0 : Math.max(0, Math.round(requestedCount));
}

export function resolveRowLimit(
  config: IPaymentPlannerConfig,
  runtimeState: IPaymentPlannerRuntimeState | undefined,
): number {
  const overriddenLimit = toFiniteNumber(runtimeState?.rowLimitOverride);
  return overriddenLimit !== null && overriddenLimit > 0
    ? Math.round(overriddenLimit)
    : config.rowLimit;
}
