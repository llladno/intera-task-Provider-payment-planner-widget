import type { ReactElement } from 'react';
import { PERCENT_TOTAL } from '@planner/config/format-locale';
import { LABELS } from '@planner/config/labels';
import { SHARE_COLORS } from '@planner/config/share-colors';
import { formatAmount } from '@planner/lib/format/format-amount';
import {
  distributePercents,
  formatShare,
} from '@planner/lib/format/format-percent';
import { MESSAGES } from '@planner/lib/messages';
import type { IProviderSharesProps } from '@planner/ui/provider-shares/provider-shares.types';
import { Text } from '@planner/ui/text/text';
import { ETextTone } from '@planner/ui/text/text.constants';
import '@planner/ui/provider-shares/provider-shares.css';

const BLOCK = 'dash-payment-planner-provider-shares';

export function ProviderShares({
  items,
  format,
  limit,
}: IProviderSharesProps): ReactElement {
  if (items.length === 0) {
    return (
      <Text as="p" tone={ETextTone.Muted}>
        {LABELS.states.noProviderData}
      </Text>
    );
  }
  // Rounded over the whole currency, then cut, so the shown shares stay consistent.
  const displayedPercents = distributePercents(
    items.map((item) => item.sharePercent),
  );
  const shownItems = limit === undefined ? items : items.slice(0, limit);
  const hiddenCount = items.length - shownItems.length;

  return (
    <ul className={BLOCK}>
      {shownItems.map((item, itemIndex) => {
        const percentText = formatShare(displayedPercents[itemIndex], item.sharePercent);
        return (
          <li key={item.providerId} className={`${BLOCK}__item`}>
            <div className={`${BLOCK}__head`}>
              <span className={`${BLOCK}__name`} title={item.providerName}>
                {item.providerName}{' '}
                <Text tone={ETextTone.Muted}>({item.billCount})</Text>
              </span>
              <span className={`${BLOCK}__value`}>
                {formatAmount(item.totalAmount, item.currencyName, format, {
                  compact: true,
                })}{' '}
                · {percentText}
              </span>
            </div>
            <div
              className={`${BLOCK}__bar`}
              role="img"
              aria-label={MESSAGES.shareAria(
                item.providerName,
                percentText,
                item.currencyName,
              )}
            >
              <span
                className={`${BLOCK}__bar-fill`}
                style={{
                  width: `${Math.min(PERCENT_TOTAL, item.sharePercent)}%`,
                  background: SHARE_COLORS[itemIndex % SHARE_COLORS.length],
                }}
              />
            </div>
          </li>
        );
      })}
      {hiddenCount > 0 && (
        <Text as="li" tone={ETextTone.Muted}>
          {MESSAGES.moreProviders(hiddenCount)}
        </Text>
      )}
    </ul>
  );
}
