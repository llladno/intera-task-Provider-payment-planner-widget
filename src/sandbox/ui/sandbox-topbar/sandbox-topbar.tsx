import type { ReactElement } from 'react';
import { DATA_STATE_MODES } from '@sandbox/config/data-state';
import { SANDBOX_LABELS } from '@sandbox/config/labels';
import { THEME_MODES } from '@sandbox/config/theme';
import {
  VIEW_SIZE_BUTTON_LABELS,
  VIEW_SIZE_MODES,
} from '@sandbox/config/view-size';
import type { ISandboxTopbarProps } from '@sandbox/ui/sandbox-topbar/sandbox-topbar.types';
import { SegmentedControl } from '@sandbox/ui/segmented-control/segmented-control';
import '@sandbox/ui/sandbox-topbar/sandbox-topbar.css';

const BLOCK = 'sandbox-topbar';

export function SandboxTopbar({
  viewSizeMode,
  onViewSizeModeChange,
  dataStateMode,
  onDataStateModeChange,
  themeMode,
  onThemeModeChange,
}: ISandboxTopbarProps): ReactElement {
  return (
    <header className={BLOCK}>
      <div className={`${BLOCK}__brand`}>
        <span className={`${BLOCK}__badge`}>{SANDBOX_LABELS.brand}</span>
        <span>{SANDBOX_LABELS.title}</span>
      </div>

      <div className={`${BLOCK}__toolbar`}>
        <div className={`${BLOCK}__group`}>
          <span className={`${BLOCK}__label`}>{SANDBOX_LABELS.toolbar.size}</span>
          <SegmentedControl
            options={VIEW_SIZE_MODES}
            value={viewSizeMode}
            onChange={onViewSizeModeChange}
            getOptionLabel={(sizeMode) => VIEW_SIZE_BUTTON_LABELS[sizeMode]}
          />
        </div>
        <div className={`${BLOCK}__group`}>
          <span className={`${BLOCK}__label`}>{SANDBOX_LABELS.toolbar.dataState}</span>
          <SegmentedControl
            options={DATA_STATE_MODES}
            value={dataStateMode}
            onChange={onDataStateModeChange}
          />
        </div>
        <div className={`${BLOCK}__group`}>
          <span className={`${BLOCK}__label`}>{SANDBOX_LABELS.toolbar.theme}</span>
          <SegmentedControl
            options={THEME_MODES}
            value={themeMode}
            onChange={onThemeModeChange}
          />
        </div>
      </div>
    </header>
  );
}
