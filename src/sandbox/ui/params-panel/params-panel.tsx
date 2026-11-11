import type { ReactElement } from 'react';
import {
  ALL_FILTER_VALUE,
  AMOUNT_FORMATS,
  type TAmountFormat,
} from '@/widget/payment-planner-params';
import {
  WIDGET_ROW_LIMITS,
  type TWidgetRowLimit,
} from '@platform/widget-types';
import { SANDBOX_LABELS } from '@sandbox/config/labels';
import type { TBooleanParamKey } from '@sandbox/model/types';
import type { IParamsPanelProps } from '@sandbox/ui/params-panel/params-panel.types';
import '@sandbox/ui/params-panel/params-panel.css';

const BLOCK = 'sandbox-params-panel';

const VISIBILITY_PARAM_KEYS: readonly TBooleanParamKey[] = [
  'showSummary',
  'showProviderBreakdown',
  'showCustomerBills',
];

function toIdFilter(selectValue: string): number | typeof ALL_FILTER_VALUE {
  return selectValue === ALL_FILTER_VALUE ? ALL_FILTER_VALUE : Number(selectValue);
}

export function ParamsPanel({
  paramsState,
  queueSize,
  providers,
  currencies,
  billingCycles,
}: IParamsPanelProps): ReactElement {
  const { params, updateParam, toggleCurrency, resetParams } = paramsState;

  return (
    <aside className={BLOCK}>
      <h3 className={`${BLOCK}__title`}>{SANDBOX_LABELS.panel.title}</h3>

      <label className={`${BLOCK}__field`}>
        <span className={`${BLOCK}__label`}>{SANDBOX_LABELS.panel.description}</span>
        <input
          className={`${BLOCK}__input`}
          value={params.description}
          onChange={(event) => updateParam('description', event.target.value)}
        />
      </label>

      <label className={`${BLOCK}__field`}>
        <span className={`${BLOCK}__label`}>
          {SANDBOX_LABELS.panel.selectedCount(params.selectedCount)}
        </span>
        <input
          type="range"
          min={0}
          max={queueSize}
          value={params.selectedCount}
          onChange={(event) =>
            updateParam('selectedCount', Number(event.target.value))
          }
        />
      </label>

      <div className={`${BLOCK}__field`}>
        <span className={`${BLOCK}__label`}>{SANDBOX_LABELS.panel.currencies}</span>
        <div className={`${BLOCK}__checks`}>
          {currencies.map((currency) => (
            <label key={currency.id} className={`${BLOCK}__check`}>
              <input
                type="checkbox"
                checked={params.currencyIds.includes(currency.id)}
                onChange={() => toggleCurrency(currency.id)}
              />
              <span>{currency.name}</span>
            </label>
          ))}
        </div>
      </div>

      <label className={`${BLOCK}__field`}>
        <span className={`${BLOCK}__label`}>{SANDBOX_LABELS.panel.provider}</span>
        <select
          className={`${BLOCK}__select`}
          value={String(params.providerId)}
          onChange={(event) =>
            updateParam('providerId', toIdFilter(event.target.value))
          }
        >
          <option value={ALL_FILTER_VALUE}>{SANDBOX_LABELS.panel.allProviders}</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name} (#{provider.id})
            </option>
          ))}
        </select>
      </label>

      <label className={`${BLOCK}__field`}>
        <span className={`${BLOCK}__label`}>{SANDBOX_LABELS.panel.billingCycle}</span>
        <select
          className={`${BLOCK}__select`}
          value={String(params.billingCycleId)}
          onChange={(event) =>
            updateParam('billingCycleId', toIdFilter(event.target.value))
          }
        >
          <option value={ALL_FILTER_VALUE}>
            {SANDBOX_LABELS.panel.allBillingCycles}
          </option>
          {billingCycles.map((billingCycle) => (
            <option key={billingCycle.id} value={billingCycle.id}>
              {billingCycle.name} (#{billingCycle.id})
            </option>
          ))}
        </select>
      </label>

      <div className={`${BLOCK}__field-row`}>
        <label className={`${BLOCK}__field`}>
          <span className={`${BLOCK}__label`}>{SANDBOX_LABELS.panel.amountFormat}</span>
          <select
            className={`${BLOCK}__select`}
            value={params.amountFormat}
            onChange={(event) =>
              updateParam('amountFormat', event.target.value as TAmountFormat)
            }
          >
            {AMOUNT_FORMATS.map((amountFormat) => (
              <option key={amountFormat} value={amountFormat}>
                {amountFormat}
              </option>
            ))}
          </select>
        </label>

        <label className={`${BLOCK}__field`}>
          <span className={`${BLOCK}__label`}>{SANDBOX_LABELS.panel.rowLimit}</span>
          <select
            className={`${BLOCK}__select`}
            value={params.rowLimit}
            onChange={(event) =>
              updateParam('rowLimit', Number(event.target.value) as TWidgetRowLimit)
            }
          >
            {WIDGET_ROW_LIMITS.map((rowLimit) => (
              <option key={rowLimit} value={rowLimit}>
                {rowLimit}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={`${BLOCK}__field`}>
        <span className={`${BLOCK}__label`}>{SANDBOX_LABELS.panel.visibleBlocks}</span>
        <div className={`${BLOCK}__checks`}>
          {VISIBILITY_PARAM_KEYS.map((paramKey) => (
            <label key={paramKey} className={`${BLOCK}__check`}>
              <input
                type="checkbox"
                checked={params[paramKey]}
                onChange={(event) => updateParam(paramKey, event.target.checked)}
              />
              <span>{paramKey}</span>
            </label>
          ))}
        </div>
      </div>

      <button type="button" className={`${BLOCK}__reset`} onClick={resetParams}>
        {SANDBOX_LABELS.panel.reset}
      </button>
    </aside>
  );
}
