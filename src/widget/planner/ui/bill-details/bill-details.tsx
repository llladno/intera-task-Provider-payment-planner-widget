import type { ReactElement } from 'react';
import { LABELS } from '@planner/config/labels';
import { formatAmount } from '@planner/lib/format/format-amount';
import { formatDate } from '@planner/lib/format/format-date';
import { MESSAGES } from '@planner/lib/messages';
import type { IBillDetailsProps } from '@planner/ui/bill-details/bill-details.types';
import { Text } from '@planner/ui/text/text';
import { ETextTone } from '@planner/ui/text/text.constants';
import '@planner/ui/bill-details/bill-details.css';

const BLOCK = 'dash-payment-planner-bill-details';

function rawAmountText(rawAmount: unknown): string {
  return rawAmount === null || rawAmount === ''
    ? LABELS.details.amountMissing
    : String(rawAmount);
}

/** Opened under a table row: the provider bill and, optionally, its customer bill. */
export function BillDetails({
  billItem,
  format,
  showCustomerBills,
}: IBillDetailsProps): ReactElement {
  const { row } = billItem;
  const hasCustomerBillNumber =
    typeof row.customer_bill_no === 'string' && row.customer_bill_no.trim() !== '';

  return (
    <div className={BLOCK}>
      <section>
        <h5 className={`${BLOCK}__title`}>{LABELS.details.providerBill}</h5>
        <dl className={`${BLOCK}__list`}>
          <dt className={`${BLOCK}__term`}>{LABELS.details.number}</dt>
          <dd className={`${BLOCK}__definition`}>
            {MESSAGES.billNumber(row.provider_bill_no, row.provider_bill_id)}
          </dd>
          <dt className={`${BLOCK}__term`}>{LABELS.details.provider}</dt>
          <dd className={`${BLOCK}__definition`}>
            {row.provider_name} · {row.provider_code}
          </dd>
          <dt className={`${BLOCK}__term`}>{LABELS.details.received}</dt>
          <dd className={`${BLOCK}__definition`}>
            {formatDate(row.provider_recv_date)}
          </dd>
          <dt className={`${BLOCK}__term`}>{LABELS.details.billingCycle}</dt>
          <dd className={`${BLOCK}__definition`}>{row.billing_cycle_name}</dd>
          <dt className={`${BLOCK}__term`}>{LABELS.details.amount}</dt>
          <dd className={`${BLOCK}__definition`}>
            {billItem.providerAmount !== null ? (
              formatAmount(billItem.providerAmount, row.provider_currency_name, format)
            ) : (
              <Text tone={ETextTone.Warning}>
                {MESSAGES.invalidAmountDetail(
                  rawAmountText(row.provider_total_due),
                  billItem.selected,
                )}
              </Text>
            )}
          </dd>
        </dl>
      </section>
      {showCustomerBills && (
        <section>
          <h5 className={`${BLOCK}__title`}>{LABELS.details.customerBill}</h5>
          {billItem.hasCustomerBill && billItem.customerAmount !== null ? (
            <dl className={`${BLOCK}__list`}>
              <dt className={`${BLOCK}__term`}>{LABELS.details.number}</dt>
              <dd className={`${BLOCK}__definition`}>{row.customer_bill_no}</dd>
              <dt className={`${BLOCK}__term`}>{LABELS.details.customer}</dt>
              <dd className={`${BLOCK}__definition`}>
                {row.customer_name ?? LABELS.table.noCustomerBill}
                {row.customer_code ? ` · ${row.customer_code}` : ''}
              </dd>
              {row.customer_inn && (
                <>
                  <dt className={`${BLOCK}__term`}>{LABELS.details.inn}</dt>
                  <dd className={`${BLOCK}__definition`}>{row.customer_inn}</dd>
                </>
              )}
              <dt className={`${BLOCK}__term`}>{LABELS.details.amount}</dt>
              <dd className={`${BLOCK}__definition`}>
                {formatAmount(
                  billItem.customerAmount,
                  row.provider_currency_name,
                  format,
                )}
              </dd>
              {row.customer_comments && (
                <>
                  <dt className={`${BLOCK}__term`}>{LABELS.details.comment}</dt>
                  <dd className={`${BLOCK}__definition`}>{row.customer_comments}</dd>
                </>
              )}
            </dl>
          ) : (
            <Text as="p" tone={ETextTone.Muted}>
              {hasCustomerBillNumber
                ? LABELS.details.customerBillIncomplete
                : LABELS.details.customerBillMissing}
            </Text>
          )}
        </section>
      )}
    </div>
  );
}
