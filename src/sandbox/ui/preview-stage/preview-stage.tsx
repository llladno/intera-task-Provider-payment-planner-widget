import type { ReactElement } from 'react';
import {
  ALL_SIZES_MODE,
  BOTTOM_ROW_SIZES,
  FULL_SIZE,
} from '@sandbox/config/view-size';
import { PreviewFrame } from '@sandbox/ui/preview-frame/preview-frame';
import type { IPreviewStageProps } from '@sandbox/ui/preview-stage/preview-stage.types';
import '@sandbox/ui/preview-stage/preview-stage.css';

const STAGE_BLOCK = 'sandbox-preview-stage';

export function PreviewStage({
  viewSizeMode,
  widgetParams,
  data,
}: IPreviewStageProps): ReactElement {
  if (viewSizeMode !== ALL_SIZES_MODE) {
    return (
      <section className={STAGE_BLOCK}>
        <PreviewFrame
          widgetSize={viewSizeMode}
          widgetParams={widgetParams}
          data={data}
        />
      </section>
    );
  }
  return (
    <section className={STAGE_BLOCK}>
      <div className={`${STAGE_BLOCK}__all-sizes`}>
        <PreviewFrame widgetSize={FULL_SIZE} widgetParams={widgetParams} data={data} />
        <div className={`${STAGE_BLOCK}__bottom-row`}>
          {BOTTOM_ROW_SIZES.map((bottomRowSize) => (
            <PreviewFrame
              key={bottomRowSize}
              widgetSize={bottomRowSize}
              widgetParams={widgetParams}
              data={data}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
