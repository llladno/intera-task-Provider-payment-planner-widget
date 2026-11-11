import type { TAmountFormat } from '@planner/config/amount-format';
import type { IQueueBillItem } from '@planner/model/types';

export interface IBillDetailsProps {
  billItem: IQueueBillItem;
  format: TAmountFormat;
  /** Show the linked customer bill (`config.showCustomerBills`). */
  showCustomerBills: boolean;
}
