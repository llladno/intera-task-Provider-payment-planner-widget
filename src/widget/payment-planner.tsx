import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { FreshnessMark } from '../platform/freshness-mark';
import { WidgetHeader } from '../platform/widget-card';
import { widgetCardClass } from '../platform/widget-card-class';
import type { ICollectionDataResult, TWidgetSize } from '../platform/widget-types';
import type { IProviderPaymentQueueRow } from '../types/provider-payment-queue';
import {
  computePaymentPlan,
  type IPaymentPlanResult,
  type IProviderCurrencyBreakdownItem,
} from './payment-planner-compute';
import { formatDate, pluralize } from './payment-planner-format';
import {
  parsePaymentPlannerParams,
  type IPaymentPlannerConfig,
} from './payment-planner-params';
import {
  BILL_FORMS_OF,
  CURRENCY_FORMS,
  CountControl,
  CurrencySwitch,
  CurrencyTotalsList,
  EmptyState,
  ErrorState,
  InvalidNotice,
  PROVIDER_FORMS,
  PlannerSkeleton,
  ProviderShares,
  ProviderStrip,
  QueueTable,
} from './payment-planner-parts';
import { usePlannerState, type IPlannerState } from './use-planner-state';
import './payment-planner.css';

const CLASS = 'dash-payment-planner';
/** How many currency lines fit into the `quarter` card before the rest is collapsed. */
const QUARTER_VISIBLE_CURRENCIES = 2;
const NO_ITEMS: readonly IProviderPaymentQueueRow[] = [];
/** Provider rows shown in the `half` card. */
const HALF_VISIBLE_PROVIDERS = 4;

export interface IPaymentPlannerWidgetProps {
  /** Raw widget configuration from dashboard YAML / parameter editor. */
  params?: Record<string, unknown>;
  /** Collection data envelope from INTERA runtime (`useCollectionData`). */
  data: ICollectionDataResult<IProviderPaymentQueueRow>;
  /** Optional explicit size override from the host container. */
  size?: TWidgetSize;
}

interface IFilterOption {
  id: number;
  name: string;
}

interface IFilterOptions {
  providers: IFilterOption[];
  cycles: IFilterOption[];
  currencies: IFilterOption[];
}

function collectOptions(
  rows: readonly IProviderPaymentQueueRow[],
): IFilterOptions {
  const providers = new Map<number, string>();
  const cycles = new Map<number, string>();
  const currencies = new Map<number, string>();
  for (const row of rows) {
    providers.set(row.provider_id, row.provider_name ?? `#${row.provider_id}`);
    cycles.set(
      row.billing_cycle_id,
      row.billing_cycle_name ?? `#${row.billing_cycle_id}`,
    );
    currencies.set(
      row.provider_currency_id,
      row.provider_currency_name ?? `#${row.provider_currency_id}`,
    );
  }
  const toOptions = (map: Map<number, string>): IFilterOption[] =>
    Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name, 'ru'),
    );
  return {
    providers: toOptions(providers),
    cycles: toOptions(cycles),
    currencies: toOptions(currencies),
  };
}

interface IViewProps {
  layout: TWidgetSize;
  config: IPaymentPlannerConfig;
  plan: IPaymentPlanResult;
  planner: IPlannerState;
  options: IFilterOptions;
  sourceCount: number;
  activeCurrencyId: number | null;
  /** Provider breakdown of the active currency. */
  activeShares: readonly IProviderCurrencyBreakdownItem[];
  onCurrencyChange: (currencyId: number) => void;
  expandedPosition: number | null;
  onTogglePosition: (queuePosition: number) => void;
  quarterExpanded: boolean;
  onToggleQuarter: () => void;
  onOpenQueue: () => void;
}

function Stat({
  value,
  label,
}: {
  value: ReactNode;
  label: string;
}): ReactElement {
  return (
    <div className={`${CLASS}__stat`}>
      <span className={`${CLASS}__stat-value`}>{value}</span>
      <span className={`${CLASS}__stat-label`}>{label}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }): ReactElement {
  return <h5 className={`${CLASS}__section-title`}>{children}</h5>;
}

function FullView(props: IViewProps): ReactElement {
  const { config, plan, planner, options, sourceCount, activeShares } = props;
  const filtersEmptied = plan.totalQueueCount === 0 && sourceCount > 0;
  const currencyFilterId = useId();

  return (
    <>
      {config.showSummary && (
        <div className={`${CLASS}__stats`}>
          <Stat value={plan.totalQueueCount} label="счетов в очереди" />
          <Stat value={plan.effectiveSelectedCount} label="выбрано к оплате" />
          <Stat value={plan.selectedProviderCount} label="поставщиков в плане" />
          {plan.oldestSelectedRecvDate && (
            <Stat
              value={formatDate(plan.oldestSelectedRecvDate)}
              label="старейший счёт"
            />
          )}
        </div>
      )}

      <InvalidNotice count={plan.invalidSelectedCount} />

      <div className={`${CLASS}__controls`}>
        <CountControl
          variant="full"
          value={plan.effectiveSelectedCount}
          max={plan.totalQueueCount}
          onChange={planner.setSelectedCount}
        />
        <div className={`${CLASS}__filters`}>
          <label className={`${CLASS}__field`}>
            <span>Поставщик</span>
            <select
              className={`${CLASS}__select`}
              value={String(planner.providerId)}
              onChange={(e) =>
                planner.setProviderId(
                  e.target.value === 'all' ? 'all' : Number(e.target.value),
                )
              }
            >
              <option value="all">Все поставщики</option>
              {options.providers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>
          <label className={`${CLASS}__field`}>
            <span>Биллинговый цикл</span>
            <select
              className={`${CLASS}__select`}
              value={String(planner.billingCycleId)}
              onChange={(e) =>
                planner.setBillingCycleId(
                  e.target.value === 'all' ? 'all' : Number(e.target.value),
                )
              }
            >
              <option value="all">Все циклы</option>
              {options.cycles.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>
          <div className={`${CLASS}__field`}>
            <span id={currencyFilterId}>Валюты</span>
            <div
              className={`${CLASS}__chips`}
              role="group"
              aria-labelledby={currencyFilterId}
            >
              {options.currencies.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`${CLASS}__chip`}
                  aria-pressed={planner.currencyIds.includes(o.id)}
                  onClick={() => planner.toggleCurrency(o.id)}
                >
                  {o.name}
                </button>
              ))}
              {planner.hasActiveFilters && (
                <button
                  type="button"
                  className={`${CLASS}__link`}
                  onClick={planner.resetFilters}
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {filtersEmptied ? (
        <EmptyState
          title="По выбранным фильтрам очередь пуста"
          hint="Измените поставщика, цикл или валюты."
          action={
            <button
              type="button"
              className={`${CLASS}__btn`}
              onClick={planner.resetFilters}
            >
              Сбросить фильтры
            </button>
          }
        />
      ) : (
        <>
          {(config.showSummary || config.showProviderBreakdown) && (
            <div
              className={`${CLASS}__panels`}
              data-single={
                config.showSummary && config.showProviderBreakdown
                  ? 'false'
                  : 'true'
              }
            >
              {config.showSummary && (
                <section className={`${CLASS}__panel`}>
                  <SectionTitle>Сумма по валютам</SectionTitle>
                  <CurrencyTotalsList
                    totals={plan.currencyTotals}
                    format={config.amountFormat}
                  />
                </section>
              )}
              {config.showProviderBreakdown && (
                <section className={`${CLASS}__panel`}>
                  <div className={`${CLASS}__panel-head`}>
                    <SectionTitle>По поставщикам</SectionTitle>
                    <CurrencySwitch
                      totals={plan.currencyTotals}
                      activeId={props.activeCurrencyId}
                      onChange={props.onCurrencyChange}
                    />
                  </div>
                  <ProviderShares
                    items={activeShares}
                    format={config.amountFormat}
                  />
                </section>
              )}
            </div>
          )}

          <QueueTable
            items={plan.visibleQueueItems}
            totalCount={plan.totalQueueCount}
            format={config.amountFormat}
            showCustomerBills={config.showCustomerBills}
            expandedPosition={props.expandedPosition}
            onToggle={props.onTogglePosition}
            moreStep={config.rowLimit}
            canCollapse={planner.rowLimit > config.rowLimit}
            onShowMore={planner.showMoreRows}
            onCollapse={planner.collapseRows}
          />
        </>
      )}
    </>
  );
}

function HalfView(props: IViewProps): ReactElement {
  const { config, plan, planner, activeShares } = props;
  return (
    <>
      <div className={`${CLASS}__lead`}>
        <span className={`${CLASS}__big`}>{plan.effectiveSelectedCount}</span>
        <span className={`${CLASS}__lead-text`}>
          из {plan.totalQueueCount}{' '}
          {pluralize(plan.totalQueueCount, BILL_FORMS_OF)}
          {config.showSummary && (
            <>
              {' · '}
              {plan.selectedProviderCount}{' '}
              {pluralize(plan.selectedProviderCount, PROVIDER_FORMS)}
            </>
          )}
        </span>
        {plan.totalQueueCount > 0 && (
          <span className={`${CLASS}__lead-share`}>
            {Math.round(
              (plan.effectiveSelectedCount / plan.totalQueueCount) * 100,
            )}
            %
          </span>
        )}
      </div>
      <CountControl
        variant="compact"
        value={plan.effectiveSelectedCount}
        max={plan.totalQueueCount}
        onChange={planner.setSelectedCount}
      />
      <InvalidNotice count={plan.invalidSelectedCount} />
      {config.showSummary && (
        <section>
          <SectionTitle>Сумма к оплате по валютам</SectionTitle>
          <CurrencyTotalsList
            totals={plan.currencyTotals}
            format={config.amountFormat}
          />
          {plan.oldestSelectedRecvDate && (
            <p className={`${CLASS}__muted`}>
              Старейший счёт: {formatDate(plan.oldestSelectedRecvDate)}
            </p>
          )}
        </section>
      )}
      {config.showProviderBreakdown && activeShares.length > 0 && (
        <section>
          <div className={`${CLASS}__panel-head`}>
            <SectionTitle>Доли поставщиков</SectionTitle>
            <CurrencySwitch
              totals={plan.currencyTotals}
              activeId={props.activeCurrencyId}
              onChange={props.onCurrencyChange}
            />
          </div>
          <ProviderShares
            items={activeShares}
            format={config.amountFormat}
            limit={HALF_VISIBLE_PROVIDERS}
          />
        </section>
      )}
      <button
        type="button"
        className={`${CLASS}__btn ${CLASS}__btn--link`}
        onClick={props.onOpenQueue}
      >
        Открыть очередь платежей →
      </button>
    </>
  );
}

function ThirdView(props: IViewProps): ReactElement {
  const { config, plan, activeShares } = props;
  return (
    <>
      <div className={`${CLASS}__lead`}>
        <span className={`${CLASS}__big`}>{plan.effectiveSelectedCount}</span>
        <span className={`${CLASS}__lead-text`}>
          / {plan.totalQueueCount} к оплате
        </span>
      </div>
      <InvalidNotice count={plan.invalidSelectedCount} />
      {config.showSummary && (
        <section>
          <SectionTitle>Сумма по валютам</SectionTitle>
          <CurrencyTotalsList
            totals={plan.currencyTotals}
            format={config.amountFormat}
            compact
            showBillCount={false}
          />
        </section>
      )}
      {config.showProviderBreakdown && activeShares.length > 0 && (
        <section>
          <div className={`${CLASS}__panel-head`}>
            <SectionTitle>Поставщики</SectionTitle>
            <CurrencySwitch
              totals={plan.currencyTotals}
              activeId={props.activeCurrencyId}
              onChange={props.onCurrencyChange}
            />
          </div>
          <ProviderStrip items={activeShares} />
        </section>
      )}
      <button
        type="button"
        className={`${CLASS}__btn ${CLASS}__btn--link`}
        onClick={props.onOpenQueue}
      >
        Открыть детали →
      </button>
    </>
  );
}

function QuarterView(props: IViewProps): ReactElement {
  const { config, plan } = props;
  const totals = plan.currencyTotals;
  const hidden = props.quarterExpanded
    ? []
    : totals.slice(QUARTER_VISIBLE_CURRENCIES);
  const shown = props.quarterExpanded
    ? totals
    : totals.slice(0, QUARTER_VISIBLE_CURRENCIES);
  return (
    <>
      <div className={`${CLASS}__lead ${CLASS}__lead--stack`}>
        <span className={`${CLASS}__big`}>{plan.effectiveSelectedCount}</span>
        <span className={`${CLASS}__lead-text`}>
          из {plan.totalQueueCount} к оплате
        </span>
      </div>
      <InvalidNotice count={plan.invalidSelectedCount} />
      {config.showSummary && (
        <section>
          <SectionTitle>
            Валют в плане: {totals.length}
          </SectionTitle>
          <CurrencyTotalsList
            totals={shown}
            format={config.amountFormat}
            compact
            showBillCount={false}
          />
          {hidden.length > 0 && (
            <p className={`${CLASS}__more`}>
              + ещё {hidden.length} {pluralize(hidden.length, CURRENCY_FORMS)} (
              {hidden.map((t) => t.currencyName).join(', ')})
            </p>
          )}
          {totals.length > QUARTER_VISIBLE_CURRENCIES && (
            <button
              type="button"
              className={`${CLASS}__btn ${CLASS}__btn--link`}
              aria-expanded={props.quarterExpanded}
              onClick={props.onToggleQuarter}
            >
              {props.quarterExpanded ? 'Свернуть ↑' : 'Все валюты →'}
            </button>
          )}
        </section>
      )}
    </>
  );
}

function PlannerView(props: IViewProps): ReactElement {
  switch (props.layout) {
    case 'half':
      return <HalfView {...props} />;
    case 'third':
      return <ThirdView {...props} />;
    case 'quarter':
      return <QuarterView {...props} />;
    default:
      return <FullView {...props} />;
  }
}

interface IQueueDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Modal with the full planner — the target of "Открыть очередь" / "Открыть детали". */
function QueueDialog({
  open,
  title,
  onClose,
  children,
}: IQueueDialogProps): ReactElement {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`${CLASS}__dialog`}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {open && (
        <div className={`${CLASS} ${CLASS}__dialog-body`} data-size="full">
          <div className={`${CLASS}__dialog-head`}>
            <h4 className="dash-card__title">{title}</h4>
            <button
              type="button"
              className={`${CLASS}__btn`}
              onClick={onClose}
              autoFocus
            >
              Закрыть
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function PaymentPlannerWidget({
  params,
  data,
  size,
}: IPaymentPlannerWidgetProps): ReactElement {
  const config = useMemo(() => parsePaymentPlannerParams(params), [params]);
  const effectiveSize = size ?? config.size;

  const planner = usePlannerState(config);
  const [shareCurrencyId, setShareCurrencyId] = useState<number | null>(null);
  const [expandedPosition, setExpandedPosition] = useState<number | null>(null);
  const [quarterExpanded, setQuarterExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // The envelope comes from the runtime; never trust `items` to be an array.
  const items = Array.isArray(data.items) ? data.items : NO_ITEMS;
  const plan = useMemo(
    () => computePaymentPlan(items, config, planner.runtimeState),
    [items, config, planner.runtimeState],
  );
  const options = useMemo(() => collectOptions(items), [items]);

  const activeCurrencyId =
    plan.currencyTotals.find((t) => t.currencyId === shareCurrencyId)
      ?.currencyId ??
    plan.currencyTotals[0]?.currencyId ??
    null;
  const activeShares = useMemo(
    () =>
      plan.providerBreakdown.filter(
        (item) => item.currencyId === activeCurrencyId,
      ),
    [plan.providerBreakdown, activeCurrencyId],
  );

  const refreshing = data.loading && data.loaded;
  const initialLoading = data.loading && !data.loaded;
  // Not loaded, not failed: either loading or idle — never show "empty" for it.
  const awaitingData = !data.loaded && data.error === null;

  const viewProps = (layout: TWidgetSize): IViewProps => ({
    layout,
    config,
    plan,
    planner,
    options,
    sourceCount: items.length,
    activeCurrencyId,
    activeShares,
    onCurrencyChange: setShareCurrencyId,
    expandedPosition,
    onTogglePosition: (position) =>
      setExpandedPosition((prev) => (prev === position ? null : position)),
    quarterExpanded,
    onToggleQuarter: () => setQuarterExpanded((prev) => !prev),
    onOpenQueue: () => setDialogOpen(true),
  });

  const header = (
    <WidgetHeader
      title={config.description}
      subtitle={config.subtitle}
      aside={
        <>
          {refreshing && (
            <span className={`${CLASS}__refresh`} role="status">
              Обновление…
            </span>
          )}
          {data.loaded || data.stale ? (
            <FreshnessMark
              source="rows"
              stale={data.stale}
              lastSuccessAt={data.lastSuccessAt}
              showLabel={effectiveSize === 'full' || effectiveSize === 'half'}
            />
          ) : null}
        </>
      }
    />
  );

  let content: ReactElement;
  if (awaitingData) {
    content = <PlannerSkeleton size={effectiveSize} />;
  } else if (data.error !== null && !data.loaded) {
    content = <ErrorState message={data.error} />;
  } else if (items.length === 0) {
    content = (
      <EmptyState
        title="Очередь платежей пуста"
        hint="Нет счетов поставщиков, ожидающих оплаты."
      />
    );
  } else {
    content = (
      <>
        {data.error !== null && (
          <p className={`${CLASS}__notice ${CLASS}__notice--warn`} role="alert">
            Не удалось обновить данные: {data.error}
          </p>
        )}
        <PlannerView {...viewProps(effectiveSize)} />
      </>
    );
  }

  const canOpenDialog =
    !awaitingData &&
    items.length > 0 &&
    (effectiveSize === 'half' || effectiveSize === 'third');

  // The dialog unmounts with the card state below; forget that it was open so it
  // does not pop up again by itself when it can be mounted next time.
  if (!canOpenDialog && dialogOpen) {
    setDialogOpen(false);
  }

  return (
    <article
      className={`${CLASS} ${widgetCardClass()}`}
      data-size={effectiveSize}
      aria-busy={awaitingData || refreshing}
    >
      {header}
      <div className={`${CLASS}__content`}>{content}</div>
      {canOpenDialog && (
        <QueueDialog
          open={dialogOpen}
          title={config.description}
          onClose={() => setDialogOpen(false)}
        >
          <PlannerView {...viewProps('full')} />
        </QueueDialog>
      )}
    </article>
  );
}
