import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import type {
  ICollectionDataResult,
  TWidgetSize,
} from '@platform/widget-types';

export interface IPaymentPlannerWidgetProps {
  /** Raw widget configuration from dashboard YAML / parameter editor. */
  params?: Record<string, unknown>;
  /** Collection data envelope from INTERA runtime (`useCollectionData`). */
  data: ICollectionDataResult<IProviderPaymentQueueRow>;
  /** Optional explicit size override from the host container. */
  size?: TWidgetSize;
}
