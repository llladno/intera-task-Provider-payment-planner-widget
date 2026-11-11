import type { ReactElement } from 'react';
import { LABELS } from '@planner/config/labels';
import { joinClassNames } from '@planner/lib/join-class-names';
import { MESSAGES } from '@planner/lib/messages';
import { Button } from '@planner/ui/button/button';
import { EButtonVariant } from '@planner/ui/button/button.constants';
import { QueueTableRow } from '@planner/ui/queue-table/queue-table-row';
import type { IQueueTableProps } from '@planner/ui/queue-table/queue-table.types';
import { Text } from '@planner/ui/text/text';
import { ETextTone } from '@planner/ui/text/text.constants';
import '@planner/ui/queue-table/queue-table.css';

const BLOCK = 'dash-payment-planner-queue-table';
const COLUMNS_WITH_CUSTOMER_BILL = 5;
const COLUMNS_WITHOUT_CUSTOMER_BILL = 4;

export function QueueTable({
  items,
  totalCount,
  format,
  showCustomerBills,
  expandedBillKey,
  onToggleBill,
  moreStep,
  canCollapse,
  onShowMore,
  onCollapse,
}: IQueueTableProps): ReactElement {
  const columnCount = showCustomerBills
    ? COLUMNS_WITH_CUSTOMER_BILL
    : COLUMNS_WITHOUT_CUSTOMER_BILL;
  const hiddenCount = totalCount - items.length;

  return (
    <div className={BLOCK}>
      <div className={`${BLOCK}__scroller`}>
        <table className={`${BLOCK}__table`}>
          <thead>
            <tr>
              <th scope="col" className={`${BLOCK}__head-cell`}>
                {LABELS.table.rank}
              </th>
              <th scope="col" className={`${BLOCK}__head-cell`}>
                {LABELS.table.providerBill}
              </th>
              {showCustomerBills && (
                <th scope="col" className={`${BLOCK}__head-cell`}>
                  {LABELS.table.customerBill}
                </th>
              )}
              <th scope="col" className={`${BLOCK}__head-cell`}>
                {LABELS.table.date}
              </th>
              <th
                scope="col"
                className={joinClassNames(`${BLOCK}__head-cell`, `${BLOCK}__head-cell--end`)}
              >
                {LABELS.table.amount}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((billItem) => (
              <QueueTableRow
                key={billItem.queuePosition}
                billItem={billItem}
                format={format}
                showCustomerBills={showCustomerBills}
                isExpanded={expandedBillKey === billItem.billKey}
                onToggle={() => onToggleBill(billItem.billKey)}
                columnCount={columnCount}
              />
            ))}
          </tbody>
        </table>
        {(hiddenCount > 0 || canCollapse) && (
          <div className={`${BLOCK}__note`}>
            <Text tone={ETextTone.Muted}>
              {MESSAGES.shown(items.length, totalCount)}
            </Text>
            {hiddenCount > 0 && (
              <Button variant={EButtonVariant.Link} onClick={onShowMore}>
                {MESSAGES.showMore(Math.min(moreStep, hiddenCount))}
              </Button>
            )}
            {canCollapse && (
              <Button variant={EButtonVariant.Link} onClick={onCollapse}>
                {LABELS.actions.collapse}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
