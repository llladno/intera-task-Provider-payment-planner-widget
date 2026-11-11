import type { ReactElement } from 'react';
import { PaymentPlannerWidget } from '@/widget/payment-planner';
import { SIZE_SLOT_LABELS } from '@sandbox/config/view-size';
import type { IPreviewFrameProps } from '@sandbox/ui/preview-frame/preview-frame.types';
import '@sandbox/ui/preview-frame/preview-frame.css';

const BLOCK = 'sandbox-preview-frame';

/** One card in a slot as wide as the real dashboard slot of that size. */
export function PreviewFrame({
  widgetSize,
  widgetParams,
  data,
}: IPreviewFrameProps): ReactElement {
  return (
    <div className={`${BLOCK} ${BLOCK}--${widgetSize}`}>
      <div className={`${BLOCK}__label`}>{SIZE_SLOT_LABELS[widgetSize]}</div>
      <PaymentPlannerWidget
        params={{ ...widgetParams, size: widgetSize }}
        data={data}
        size={widgetSize}
      />
    </div>
  );
}
