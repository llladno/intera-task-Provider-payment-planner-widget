import { useEffect, useMemo, useState, type ReactElement } from 'react';
import mockQueue from '@/data/mock-payment-queue.json';
import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import { collectFilterOptions } from '@/widget/payment-planner-filters';
import { EDataStateMode } from '@sandbox/config/data-state';
import { EThemeMode, THEME_ATTRIBUTE } from '@sandbox/config/theme';
import type { TViewSizeMode } from '@sandbox/config/view-size';
import { buildDataEnvelope } from '@sandbox/lib/build-data-envelope';
import { useSandboxParams } from '@sandbox/model/use-sandbox-params';
import { ParamsPanel } from '@sandbox/ui/params-panel/params-panel';
import { PreviewStage } from '@sandbox/ui/preview-stage/preview-stage';
import { SandboxTopbar } from '@sandbox/ui/sandbox-topbar/sandbox-topbar';
import '@sandbox/sandbox-app.css';

const queueRows = mockQueue as IProviderPaymentQueueRow[];

/** Interactive playground: pick the card size, the data state, the theme and every param. */
export function SandboxApp(): ReactElement {
  const [themeMode, setThemeMode] = useState(EThemeMode.Light);
  const [viewSizeMode, setViewSizeMode] = useState<TViewSizeMode>('full');
  const [dataStateMode, setDataStateMode] = useState(EDataStateMode.Ready);
  const paramsState = useSandboxParams();

  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, themeMode);
  }, [themeMode]);

  const filterOptions = useMemo(() => collectFilterOptions(queueRows), []);
  const dataEnvelope = useMemo(
    () => buildDataEnvelope(dataStateMode, queueRows),
    [dataStateMode],
  );
  // A new object only when a param changes, so the widget keeps its own state.
  const widgetParams = useMemo<Record<string, unknown>>(
    () => ({ ...paramsState.params }),
    [paramsState.params],
  );

  return (
    <div className="sandbox-app">
      <SandboxTopbar
        viewSizeMode={viewSizeMode}
        onViewSizeModeChange={setViewSizeMode}
        dataStateMode={dataStateMode}
        onDataStateModeChange={setDataStateMode}
        themeMode={themeMode}
        onThemeModeChange={setThemeMode}
      />
      <main className="sandbox-app__body">
        <PreviewStage
          viewSizeMode={viewSizeMode}
          widgetParams={widgetParams}
          data={dataEnvelope}
        />
        <ParamsPanel
          paramsState={paramsState}
          queueSize={queueRows.length}
          providers={filterOptions.providers}
          currencies={filterOptions.currencies}
          billingCycles={filterOptions.billingCycles}
        />
      </main>
    </div>
  );
}
