import {
  Fragment,
  useId,
  useState,
  type ChangeEvent,
  type ReactElement,
} from 'react';
import type {
  ICurrencyTotal,
  IProviderCurrencyBreakdownItem,
  IQueueBillItem,
} from './payment-planner-compute';
import {
  distributePercents,
  formatAmount,
  formatDate,
  formatPercent,
  pluralize,
} from './payment-planner-format';
import type { TAmountFormat } from './payment-planner-params';

const CLASS = 'dash-payment-planner';

const BILL_FORMS = ['счёт', 'счёта', 'счетов'] as const;
/** After "из": `из 21 счёта`, `из 32 счетов`. */
const BILL_FORMS_OF = ['счёта', 'счетов', 'счетов'] as const;
const CURRENCY_FORMS = ['валюта', 'валюты', 'валют'] as const;
const PROVIDER_FORMS = ['поставщик', 'поставщика', 'поставщиков'] as const;
const SHARE_COLORS = [
  'var(--chart-blue)',
  'var(--chart-orange)',
  'var(--chart-aqua)',
  'var(--chart-yellow)',
  'var(--chart-magenta)',
  'var(--chart-violet)',
] as const;

export { BILL_FORMS, BILL_FORMS_OF, CURRENCY_FORMS, PROVIDER_FORMS };

function shareColor(index: number): string {
  return SHARE_COLORS[index % SHARE_COLORS.length];
}

/* ------------------------------------------------------------------ */
/* Count control: slider + number input + − / + buttons                */
/* ------------------------------------------------------------------ */

interface ICountControlProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  /** `compact` hides the number input and the step buttons. */
  variant: 'full' | 'compact';
}

function clampCount(value: number, max: number): number {
  return Math.min(Math.max(0, Math.round(value)), max);
}

export function CountControl({
  value,
  max,
  onChange,
  variant,
}: ICountControlProps): ReactElement {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  // Show the typed text only while it still matches the selection; a clamped
  // or externally changed value must not leave a stale number in the field.
  const shown =
    draft !== null && (draft.trim() === '' || Number(draft) === value)
      ? draft
      : String(value);

  const commitDraft = (text: string): void => {
    setDraft(text);
    if (text.trim() === '') {
      return;
    }
    const parsed = Number(text);
    if (Number.isFinite(parsed)) {
      onChange(clampCount(parsed, max));
    }
  };

  const onRange = (event: ChangeEvent<HTMLInputElement>): void => {
    setDraft(null);
    onChange(clampCount(Number(event.target.value), max));
  };

  const step = (delta: number): void => {
    setDraft(null);
    onChange(clampCount(value + delta, max));
  };

  const range = (
    <input
      id={`${id}-range`}
      className={`${CLASS}__range`}
      type="range"
      min={0}
      max={Math.max(max, 0)}
      step={1}
      value={value}
      disabled={max === 0}
      aria-label="Количество счетов к оплате"
      aria-valuetext={`${value} из ${max}`}
      style={{ ['--fill' as string]: max > 0 ? `${(value / max) * 100}%` : '0%' }}
      onChange={onRange}
    />
  );

  if (variant === 'compact') {
    return (
      <div className={`${CLASS}__count ${CLASS}__count--compact`}>
        {range}
      </div>
    );
  }

  return (
    <div className={`${CLASS}__count`}>
      <label className={`${CLASS}__count-label`} htmlFor={`${id}-number`}>
        Счетов к оплате
      </label>
      <div className={`${CLASS}__stepper`}>
        <button
          type="button"
          className={`${CLASS}__btn ${CLASS}__btn--icon`}
          aria-label="Уменьшить количество счетов"
          disabled={value <= 0}
          onClick={() => step(-1)}
        >
          −
        </button>
        <input
          id={`${id}-number`}
          className={`${CLASS}__number`}
          type="number"
          inputMode="numeric"
          min={0}
          max={max}
          value={shown}
          disabled={max === 0}
          onChange={(event) => commitDraft(event.target.value)}
          onBlur={() => setDraft(null)}
        />
        <button
          type="button"
          className={`${CLASS}__btn ${CLASS}__btn--icon`}
          aria-label="Увеличить количество счетов"
          disabled={value >= max}
          onClick={() => step(1)}
        >
          +
        </button>
        <span className={`${CLASS}__count-total`}>/ {max}</span>
      </div>
      {range}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Currency totals                                                     */
/* ------------------------------------------------------------------ */

interface ICurrencyTotalsProps {
  totals: readonly ICurrencyTotal[];
  format: TAmountFormat;
  /** `compact` drops kopecks for whole amounts; `rows` lists one currency per line. */
  compact?: boolean;
  showBillCount?: boolean;
}

export function CurrencyTotalsList({
  totals,
  format,
  compact = false,
  showBillCount = true,
}: ICurrencyTotalsProps): ReactElement {
  if (totals.length === 0) {
    return (
      <p className={`${CLASS}__muted`}>
        В плане нет счетов с корректной суммой.
      </p>
    );
  }
  return (
    <ul className={`${CLASS}__totals`}>
      {totals.map((total) => (
        <li key={total.currencyId} className={`${CLASS}__total`}>
          <span
            className={`${CLASS}__total-amount`}
            title={`${total.currencyName}`}
          >
            {formatAmount(total.totalAmount, total.currencyName, format, {
              compact,
            })}
          </span>
          {showBillCount && (
            <span className={`${CLASS}__total-meta`}>
              {total.billCount} {pluralize(total.billCount, BILL_FORMS)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Currency switch + provider shares                                   */
/* ------------------------------------------------------------------ */

interface ICurrencySwitchProps {
  totals: readonly ICurrencyTotal[];
  activeId: number | null;
  onChange: (currencyId: number) => void;
}

export function CurrencySwitch({
  totals,
  activeId,
  onChange,
}: ICurrencySwitchProps): ReactElement | null {
  if (totals.length <= 1) {
    return null;
  }
  return (
    <div
      className={`${CLASS}__chips`}
      role="group"
      aria-label="Валюта распределения"
    >
      {totals.map((total) => (
        <button
          key={total.currencyId}
          type="button"
          className={`${CLASS}__chip`}
          aria-pressed={total.currencyId === activeId}
          onClick={() => onChange(total.currencyId)}
        >
          {total.currencyName}
        </button>
      ))}
    </div>
  );
}

interface IProviderSharesProps {
  items: readonly IProviderCurrencyBreakdownItem[];
  format: TAmountFormat;
  /** Max rows to render; the rest is summarised as "+ ещё N". */
  limit?: number;
}

export function ProviderShares({
  items,
  format,
  limit,
}: IProviderSharesProps): ReactElement {
  if (items.length === 0) {
    return <p className={`${CLASS}__muted`}>Нет данных по поставщикам.</p>;
  }
  // Rounded over the whole currency, then cut, so the shown shares stay consistent.
  const percents = distributePercents(items.map((item) => item.sharePercent));
  const shown = limit === undefined ? items : items.slice(0, limit);
  const hidden = items.length - shown.length;
  return (
    <ul className={`${CLASS}__shares`}>
      {shown.map((item, index) => (
        <li key={item.providerId} className={`${CLASS}__share`}>
          <div className={`${CLASS}__share-head`}>
            <span className={`${CLASS}__share-name`} title={item.providerName}>
              {item.providerName}{' '}
              <span className={`${CLASS}__muted`}>({item.billCount})</span>
            </span>
            <span className={`${CLASS}__share-value`}>
              {formatAmount(item.totalAmount, item.currencyName, format, {
                compact: true,
              })}{' '}
              · {formatPercent(percents[index])}
            </span>
          </div>
          <div
            className={`${CLASS}__bar`}
            role="img"
            aria-label={`${item.providerName}: ${formatPercent(percents[index])} от суммы в ${item.currencyName}`}
          >
            <span
              className={`${CLASS}__bar-fill`}
              style={{
                width: `${Math.min(100, item.sharePercent)}%`,
                background: shareColor(index),
              }}
            />
          </div>
        </li>
      ))}
      {hidden > 0 && (
        <li className={`${CLASS}__muted`}>
          + ещё {hidden} {pluralize(hidden, PROVIDER_FORMS)}
        </li>
      )}
    </ul>
  );
}

/** One stacked bar for a currency — the compact form of {@link ProviderShares}. */
export function ProviderStrip({
  items,
}: {
  items: readonly IProviderCurrencyBreakdownItem[];
}): ReactElement | null {
  if (items.length === 0) {
    return null;
  }
  const percents = distributePercents(items.map((item) => item.sharePercent));
  return (
    <div className={`${CLASS}__strip-wrap`}>
      <div className={`${CLASS}__strip`} role="list">
        {items.map((item, index) => (
          <span
            key={item.providerId}
            role="listitem"
            className={`${CLASS}__strip-seg`}
            style={{
              flexGrow: item.sharePercent,
              background: shareColor(index),
            }}
            title={`${item.providerName}: ${formatPercent(percents[index])}`}
            aria-label={`${item.providerName}: ${formatPercent(percents[index])}`}
          />
        ))}
      </div>
      <ul className={`${CLASS}__legend`}>
        {items.slice(0, 3).map((item, index) => (
          <li key={item.providerId} className={`${CLASS}__legend-item`}>
            <span
              className={`${CLASS}__legend-dot`}
              style={{ background: shareColor(index) }}
              aria-hidden="true"
            />
            <span className={`${CLASS}__legend-name`}>{item.providerName}</span>
            <span className={`${CLASS}__muted`}>
              {formatPercent(percents[index])}
            </span>
          </li>
        ))}
        {items.length > 3 && (
          <li className={`${CLASS}__muted`}>+ ещё {items.length - 3}</li>
        )}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Queue table + bill details                                          */
/* ------------------------------------------------------------------ */

interface IQueueTableProps {
  items: readonly IQueueBillItem[];
  totalCount: number;
  format: TAmountFormat;
  showCustomerBills: boolean;
  /** `queuePosition` of the open row — a provider bill id is not unique per row. */
  expandedPosition: number | null;
  onToggle: (queuePosition: number) => void;
  /** Rows added per "show more" click; `canCollapse` shows the way back. */
  moreStep: number;
  canCollapse: boolean;
  onShowMore: () => void;
  onCollapse: () => void;
}

function rankLabel(item: IQueueBillItem): string {
  return item.rank === null ? '—' : `#${item.rank}`;
}

function BillDetails({
  item,
  format,
  showCustomerBills,
}: {
  item: IQueueBillItem;
  format: TAmountFormat;
  showCustomerBills: boolean;
}): ReactElement {
  const { row } = item;
  const rawAmount =
    row.provider_total_due === null || row.provider_total_due === ''
      ? 'не указана'
      : String(row.provider_total_due);
  const hasCustomerNo =
    typeof row.customer_bill_no === 'string' &&
    row.customer_bill_no.trim() !== '';

  return (
    <div className={`${CLASS}__details`}>
      <section>
        <h5 className={`${CLASS}__details-title`}>Счёт поставщика</h5>
        <dl className={`${CLASS}__dl`}>
          <dt>Номер</dt>
          <dd>
            {row.provider_bill_no} (#{row.provider_bill_id})
          </dd>
          <dt>Поставщик</dt>
          <dd>
            {row.provider_name} · {row.provider_code}
          </dd>
          <dt>Получен</dt>
          <dd>{formatDate(row.provider_recv_date)}</dd>
          <dt>Цикл</dt>
          <dd>{row.billing_cycle_name}</dd>
          <dt>Сумма</dt>
          <dd>
            {item.providerAmount !== null ? (
              formatAmount(
                item.providerAmount,
                row.provider_currency_name,
                format,
              )
            ) : (
              <span className={`${CLASS}__warn-text`}>
                некорректная ({rawAmount}), исключена из итогов
              </span>
            )}
          </dd>
        </dl>
      </section>
      {showCustomerBills && (
        <section>
          <h5 className={`${CLASS}__details-title`}>Клиентский счёт</h5>
          {item.hasCustomerBill && item.customerAmount !== null ? (
            <dl className={`${CLASS}__dl`}>
              <dt>Номер</dt>
              <dd>{row.customer_bill_no}</dd>
              <dt>Клиент</dt>
              <dd>
                {row.customer_name ?? '—'}
                {row.customer_code ? ` · ${row.customer_code}` : ''}
              </dd>
              {row.customer_inn && (
                <>
                  <dt>ИНН</dt>
                  <dd>{row.customer_inn}</dd>
                </>
              )}
              <dt>Сумма</dt>
              <dd>
                {formatAmount(
                  item.customerAmount,
                  row.provider_currency_name,
                  format,
                )}
              </dd>
              {row.customer_comments && (
                <>
                  <dt>Комментарий</dt>
                  <dd>{row.customer_comments}</dd>
                </>
              )}
            </dl>
          ) : (
            <p className={`${CLASS}__muted`}>
              {hasCustomerNo
                ? 'Данные клиентского счёта неполные: сумма не указана или некорректна.'
                : 'Связанный клиентский счёт отсутствует.'}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

export function QueueTable({
  items,
  totalCount,
  format,
  showCustomerBills,
  expandedPosition,
  onToggle,
  moreStep,
  canCollapse,
  onShowMore,
  onCollapse,
}: IQueueTableProps): ReactElement {
  const columns = showCustomerBills ? 5 : 4;
  return (
    <div className={`${CLASS}__table-wrap`}>
      <table className={`${CLASS}__table`}>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Поставщик / счёт</th>
            {showCustomerBills && <th scope="col">Клиентский счёт</th>}
            <th scope="col">Дата</th>
            <th scope="col" className={`${CLASS}__num`}>
              Сумма
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const { row } = item;
            const expanded = expandedPosition === item.queuePosition;
            const rowClass = [
              `${CLASS}__row`,
              item.selected ? `${CLASS}__row--selected` : '',
              item.hasInvalidAmount ? `${CLASS}__row--invalid` : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <Fragment key={item.queuePosition}>
                <tr className={rowClass}>
                  <td className={`${CLASS}__rank`}>
                    {rankLabel(item)}
                    <span className={`${CLASS}__sr`}>
                      {item.selected ? ', в плане оплаты' : ', вне плана'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${CLASS}__row-btn`}
                      aria-expanded={expanded}
                      onClick={() => onToggle(item.queuePosition)}
                    >
                      <span className={`${CLASS}__row-title`}>
                        {row.provider_name}
                      </span>
                      <span className={`${CLASS}__muted`}>
                        {row.provider_bill_no} (#{row.provider_bill_id})
                      </span>
                    </button>
                  </td>
                  {showCustomerBills && (
                    <td>
                      {item.hasCustomerBill ? (
                        <>
                          <span>{row.customer_bill_no}</span>
                          {row.customer_name && (
                            <span className={`${CLASS}__muted`}>
                              {' · '}
                              {row.customer_name}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className={`${CLASS}__muted`}>—</span>
                      )}
                    </td>
                  )}
                  <td className={`${CLASS}__nowrap`}>
                    {formatDate(row.provider_recv_date)}
                  </td>
                  <td className={`${CLASS}__num`}>
                    {item.providerAmount !== null ? (
                      formatAmount(
                        item.providerAmount,
                        row.provider_currency_name,
                        format,
                      )
                    ) : (
                      <span className={`${CLASS}__warn-text`} role="img" aria-label="Некорректная сумма, исключена из итогов">
                        ⚠ Некорректная сумма (исключена)
                      </span>
                    )}
                  </td>
                </tr>
                {expanded && (
                  <tr className={`${CLASS}__details-row`}>
                    <td colSpan={columns}>
                      <BillDetails
                        item={item}
                        format={format}
                        showCustomerBills={showCustomerBills}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      {(items.length < totalCount || canCollapse) && (
        <div className={`${CLASS}__table-note`}>
          <span className={`${CLASS}__muted`}>
            Показано {items.length} из {totalCount}
          </span>
          {items.length < totalCount && (
            <button
              type="button"
              className={`${CLASS}__link`}
              onClick={onShowMore}
            >
              Показать ещё {Math.min(moreStep, totalCount - items.length)}
            </button>
          )}
          {canCollapse && (
            <button
              type="button"
              className={`${CLASS}__link`}
              onClick={onCollapse}
            >
              Свернуть
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notices and data states                                             */
/* ------------------------------------------------------------------ */

export function InvalidNotice({
  count,
}: {
  count: number;
}): ReactElement | null {
  if (count <= 0) {
    return null;
  }
  return (
    <p className={`${CLASS}__notice ${CLASS}__notice--warn`} role="status">
      ⚠ Исключено некорректных: {count}{' '}
      <span className={`${CLASS}__notice-hint`}>
        (сумма не указана или ≤ 0)
      </span>
    </p>
  );
}

export function PlannerSkeleton({
  size,
}: {
  size: string;
}): ReactElement {
  return (
    <div
      className={`${CLASS}__skeleton`}
      data-size={size}
      role="status"
      aria-live="polite"
      aria-label="Загрузка очереди платежей"
    >
      <span className={`${CLASS}__skeleton-line ${CLASS}__skeleton-line--lg`} />
      <span className={`${CLASS}__skeleton-line`} />
      <span className={`${CLASS}__skeleton-line ${CLASS}__skeleton-line--short`} />
      <span className={`${CLASS}__skeleton-block`} />
    </div>
  );
}

export function ErrorState({ message }: { message: string }): ReactElement {
  return (
    <div className={`${CLASS}__state ${CLASS}__state--error`} role="alert">
      <strong>Не удалось загрузить очередь платежей</strong>
      <p>{message}</p>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactElement;
}): ReactElement {
  return (
    <div className={`${CLASS}__state`} role="status">
      <strong>{title}</strong>
      {hint && <p>{hint}</p>}
      {action}
    </div>
  );
}
