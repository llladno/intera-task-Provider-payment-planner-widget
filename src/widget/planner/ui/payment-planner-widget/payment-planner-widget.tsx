import type { ReactElement } from 'react';
import { LABELS } from '@planner/config/labels';
import {
  DIALOG_SIZES,
  DIALOG_VIEW_SIZE,
  FRESHNESS_LABEL_SIZES,
} from '@planner/config/layout';
import { joinClassNames } from '@planner/lib/join-class-names';
import { MESSAGES } from '@planner/lib/messages';
import { usePaymentPlanner } from '@planner/model/use-payment-planner/use-payment-planner';
import { useWidgetViewState } from '@planner/model/use-widget-view-state/use-widget-view-state';
import { Notice } from '@planner/ui/notice/notice';
import type { IPaymentPlannerWidgetProps } from '@planner/ui/payment-planner-widget/payment-planner-widget.types';
import { QueueDialog } from '@planner/ui/queue-dialog/queue-dialog';
import { Skeleton } from '@planner/ui/skeleton/skeleton';
import { StateBlock } from '@planner/ui/state-block/state-block';
import { EStateBlockVariant } from '@planner/ui/state-block/state-block.constants';
import { PlannerView } from '@planner/ui/views/planner-view';
import type { IViewProps } from '@planner/ui/views/views.types';
import { FreshnessMark } from '@platform/freshness-mark';
import { WidgetHeader } from '@platform/widget-card';
import { widgetCardClass } from '@platform/widget-card-class';
import '@planner/ui/payment-planner-widget/payment-planner-widget.css';

const BLOCK = 'dash-payment-planner';

export function PaymentPlannerWidget({
  params,
  data,
  size,
}: IPaymentPlannerWidgetProps): ReactElement {
  const viewState = useWidgetViewState();
  const {
    config,
    effectiveSize,
    planner,
    queueRows,
    plan,
    filterOptions,
    activeCurrencyId,
    activeShares,
  } = usePaymentPlanner(params, data, size, viewState.shareCurrencyId);

  const isRefreshing = data.loading && data.loaded;
  // Not loaded and not failed: loading or idle — never shown as "empty".
  const isAwaitingData = !data.loaded && data.error === null;
  const canOpenDialog =
    !isAwaitingData &&
    queueRows.length > 0 &&
    DIALOG_SIZES.includes(effectiveSize);

  // The dialog unmounts when it cannot be shown; forget that it was open so it
  // does not pop up again by itself when it can be mounted next time.
  if (!canOpenDialog && viewState.isDialogOpen) {
    viewState.closeDialog();
  }

  const viewProps: IViewProps = {
    config,
    plan,
    planner,
    filterOptions,
    sourceRowCount: queueRows.length,
    activeCurrencyId,
    activeShares,
    onCurrencyChange: viewState.setShareCurrencyId,
    expandedBillKey: viewState.expandedBillKey,
    onToggleBill: viewState.toggleExpandedBill,
    isCurrencyListExpanded: viewState.isCurrencyListExpanded,
    onToggleCurrencyList: viewState.toggleCurrencyList,
    onOpenQueue: viewState.openDialog,
  };

  const header = (
    <WidgetHeader
      title={config.description}
      subtitle={config.subtitle}
      aside={
        <>
          {isRefreshing && (
            <span className={`${BLOCK}__refresh`} role="status">
              {LABELS.header.refreshing}
            </span>
          )}
          {data.loaded || data.stale ? (
            <FreshnessMark
              source="rows"
              stale={data.stale}
              lastSuccessAt={data.lastSuccessAt}
              showLabel={FRESHNESS_LABEL_SIZES.includes(effectiveSize)}
            />
          ) : null}
        </>
      }
    />
  );

  // A failed refresh keeps the last data on screen, so it is shown with the data
  // and with the empty state alike.
  const refreshFailedNotice =
    data.error !== null ? (
      <Notice role="alert" message={MESSAGES.refreshFailed(data.error)} />
    ) : null;

  let content: ReactElement;
  if (isAwaitingData) {
    content = <Skeleton />;
  } else if (data.error !== null && !data.loaded) {
    content = (
      <StateBlock
        variant={EStateBlockVariant.Error}
        role="alert"
        title={LABELS.states.errorTitle}
        text={data.error}
      />
    );
  } else if (queueRows.length === 0) {
    content = (
      <>
        {refreshFailedNotice}
        <StateBlock
          title={LABELS.states.emptyTitle}
          text={LABELS.states.emptyHint}
        />
      </>
    );
  } else {
    content = (
      <>
        {refreshFailedNotice}
        <PlannerView size={effectiveSize} viewProps={viewProps} />
      </>
    );
  }

  return (
    <article
      className={joinClassNames(
        BLOCK,
        `${BLOCK}--${effectiveSize}`,
        widgetCardClass(),
      )}
      data-size={effectiveSize}
      aria-busy={isAwaitingData || isRefreshing}
    >
      {header}
      <div className={`${BLOCK}__content`}>{content}</div>
      {canOpenDialog && (
        <QueueDialog
          isOpen={viewState.isDialogOpen}
          title={config.description}
          onClose={viewState.closeDialog}
        >
          <PlannerView size={DIALOG_VIEW_SIZE} viewProps={viewProps} />
        </QueueDialog>
      )}
    </article>
  );
}
