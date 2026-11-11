import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import type { ICollectionDataResult } from '@platform/widget-types';
import type { TViewSizeMode } from '@sandbox/config/view-size';

export interface IPreviewStageProps {
  viewSizeMode: TViewSizeMode;
  /** Raw `params` for the widget (the size is added by the stage). */
  widgetParams: Record<string, unknown>;
  data: ICollectionDataResult<IProviderPaymentQueueRow>;
}
