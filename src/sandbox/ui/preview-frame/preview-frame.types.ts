import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import type {
  ICollectionDataResult,
  TWidgetSize,
} from '@platform/widget-types';

export interface IPreviewFrameProps {
  widgetSize: TWidgetSize;
  widgetParams: Record<string, unknown>;
  data: ICollectionDataResult<IProviderPaymentQueueRow>;
}
