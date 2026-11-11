import type { TAmountFormat } from '@planner/config/amount-format';
import type { IQueueBillItem } from '@planner/model/types';

export interface IQueueTableProps {
  /** Rows to show (already cut to the row limit). */
  items: readonly IQueueBillItem[];
  /** Length of the whole filtered queue. */
  totalCount: number;
  format: TAmountFormat;
  showCustomerBills: boolean;
  /** `billKey` of the open row; tied to the bill, not to its position in the queue. */
  expandedBillKey: string | null;
  onToggleBill: (billKey: string) => void;
  /** Rows added per "show more" click. */
  moreStep: number;
  canCollapse: boolean;
  onShowMore: () => void;
  onCollapse: () => void;
}

export interface IQueueTableRowProps {
  billItem: IQueueBillItem;
  format: TAmountFormat;
  showCustomerBills: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  /** Number of columns, for the details row to span. */
  columnCount: number;
}
