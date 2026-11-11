import type { ReactElement } from 'react';
import { STRIP_LEGEND_PROVIDERS } from '@planner/config/layout';
import { SHARE_COLORS } from '@planner/config/share-colors';
import {
  distributePercents,
  formatShare,
} from '@planner/lib/format/format-percent';
import { MESSAGES } from '@planner/lib/messages';
import type { IProviderStripProps } from '@planner/ui/provider-strip/provider-strip.types';
import { Text } from '@planner/ui/text/text';
import { ETextTone } from '@planner/ui/text/text.constants';
import '@planner/ui/provider-strip/provider-strip.css';

const BLOCK = 'dash-payment-planner-provider-strip';

/** One stacked bar for a currency — the compact form of the provider shares. */
export function ProviderStrip({ items }: IProviderStripProps): ReactElement | null {
  if (items.length === 0) {
    return null;
  }
  const displayedPercents = distributePercents(
    items.map((item) => item.sharePercent),
  );
  const legendItems = items.slice(0, STRIP_LEGEND_PROVIDERS);
  return (
    <div className={BLOCK}>
      <div className={`${BLOCK}__bar`} role="list">
        {items.map((item, itemIndex) => {
          const shareText = `${item.providerName}: ${formatShare(displayedPercents[itemIndex], item.sharePercent)}`;
          return (
            <span
              key={item.providerId}
              role="listitem"
              className={`${BLOCK}__segment`}
              style={{
                flexGrow: item.sharePercent,
                background: SHARE_COLORS[itemIndex % SHARE_COLORS.length],
              }}
              title={shareText}
              aria-label={shareText}
            />
          );
        })}
      </div>
      <ul className={`${BLOCK}__legend`}>
        {legendItems.map((item, itemIndex) => (
          <li key={item.providerId} className={`${BLOCK}__legend-item`}>
            <span
              className={`${BLOCK}__legend-dot`}
              style={{ background: SHARE_COLORS[itemIndex % SHARE_COLORS.length] }}
              aria-hidden="true"
            />
            <span className={`${BLOCK}__legend-name`}>{item.providerName}</span>
            <Text tone={ETextTone.Muted}>
              {formatShare(displayedPercents[itemIndex], item.sharePercent)}
            </Text>
          </li>
        ))}
        {items.length > STRIP_LEGEND_PROVIDERS && (
          <Text as="li" tone={ETextTone.Muted}>
            {MESSAGES.moreCount(items.length - STRIP_LEGEND_PROVIDERS)}
          </Text>
        )}
      </ul>
    </div>
  );
}
