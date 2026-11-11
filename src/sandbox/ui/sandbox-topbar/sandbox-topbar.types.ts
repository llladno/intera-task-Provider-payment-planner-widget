import type { EDataStateMode } from '@sandbox/config/data-state';
import type { EThemeMode } from '@sandbox/config/theme';
import type { TViewSizeMode } from '@sandbox/config/view-size';

export interface ISandboxTopbarProps {
  viewSizeMode: TViewSizeMode;
  onViewSizeModeChange: (viewSizeMode: TViewSizeMode) => void;
  dataStateMode: EDataStateMode;
  onDataStateModeChange: (dataStateMode: EDataStateMode) => void;
  themeMode: EThemeMode;
  onThemeModeChange: (themeMode: EThemeMode) => void;
}
