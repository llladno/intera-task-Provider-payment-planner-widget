import type { ReactElement } from 'react';
import { LABELS } from '@planner/config/labels';
import { formatAmount } from '@planner/lib/format/format-amount';
import { formatDate } from '@planner/lib/format/format-date';
import { joinClassNames } from '@planner/lib/join-class-names';
import { MESSAGES } from '@planner/lib/messages';
import { BillDetails } from '@planner/ui/bill-details/bill-details';
import type { IQueueTableRowProps } from '@planner/ui/queue-table/queue-table.types';
import { Text } from '@planner/ui/text/text';
import { ETextTone } from '@planner/ui/text/text.constants';
import { VisuallyHidden } from '@planner/ui/visually-hidden/visually-hidden';

const BLOCK = 'dash-payment-planner-queue-table';

export function QueueTableRow({
  billItem,
  format,
  showCustomerBills,
  isExpanded,
  onToggle,
  columnCount,
}: IQueueTableRowProps): ReactElement {
  const { row } = billItem;
  const rankMarkerModifier = billItem.hasInvalidAmount
    ? `${BLOCK}__cell--invalid-marker`
    : billItem.selected && `${BLOCK}__cell--selected-marker`;

  return (
    <>
      <tr
        className={joinClassNames(
          `${BLOCK}__row`,
          billItem.selected && `${BLOCK}__row--selected`,
          !billItem.selected && `${BLOCK}__row--dimmed`,
          billItem.hasInvalidAmount && `${BLOCK}__row--invalid`,
        )}
      >
        <td
          className={joinClassNames(
            `${BLOCK}__cell`,
            `${BLOCK}__cell--rank`,
            rankMarkerModifier,
          )}
        >
          {billItem.rank === null ? LABELS.table.noRank : MESSAGES.rank(billItem.rank)}
          <VisuallyHidden>
            {billItem.selected ? LABELS.table.inPlan : LABELS.table.outOfPlan}
          </VisuallyHidden>
        </td>
        <td className={`${BLOCK}__cell`}>
          <button
            type="button"
            className={`${BLOCK}__toggle`}
            aria-expanded={isExpanded}
            onClick={onToggle}
          >
            <span
              className={joinClassNames(
                `${BLOCK}__title`,
                isExpanded && `${BLOCK}__title--active`,
              )}
            >
              {row.provider_name}
            </span>
            <Text tone={ETextTone.Muted}>
              {MESSAGES.billNumber(row.provider_bill_no, row.provider_bill_id)}
            </Text>
          </button>
        </td>
        {showCustomerBills && (
          <td className={`${BLOCK}__cell`}>
            {billItem.hasCustomerBill ? (
              <>
                <span>{row.customer_bill_no}</span>
                {row.customer_name && (
                  <Text tone={ETextTone.Muted}>
                    {' · '}
                    {row.customer_name}
                  </Text>
                )}
              </>
            ) : (
              <Text tone={ETextTone.Muted}>{LABELS.table.noCustomerBill}</Text>
            )}
          </td>
        )}
        <td className={joinClassNames(`${BLOCK}__cell`, `${BLOCK}__cell--nowrap`)}>
          {formatDate(row.provider_recv_date)}
        </td>
        <td className={joinClassNames(`${BLOCK}__cell`, `${BLOCK}__cell--end`)}>
          {billItem.providerAmount !== null ? (
            formatAmount(billItem.providerAmount, row.provider_currency_name, format)
          ) : (
            <span
              role="img"
              aria-label={
                billItem.selected
                  ? LABELS.table.invalidAmountExcludedAria
                  : LABELS.table.invalidAmountAria
              }
            >
              <Text tone={ETextTone.Warning}>
                {billItem.selected
                  ? LABELS.table.invalidAmountExcluded
                  : LABELS.table.invalidAmount}
              </Text>
            </span>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className={`${BLOCK}__details-row`}>
          <td className={`${BLOCK}__cell`} colSpan={columnCount}>
            <BillDetails
              billItem={billItem}
              format={format}
              showCustomerBills={showCustomerBills}
            />
          </td>
        </tr>
      )}
    </>
  );
}
