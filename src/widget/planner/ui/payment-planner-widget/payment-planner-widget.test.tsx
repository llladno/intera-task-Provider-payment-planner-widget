// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import mockData from '@/data/mock-payment-queue.json';
import '@/test/setup-ui';
import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import { PaymentPlannerWidget } from '@planner/ui/payment-planner-widget/payment-planner-widget';
import type {
  ICollectionDataResult,
  TWidgetSize,
} from '@platform/widget-types';

type TData = ICollectionDataResult<IProviderPaymentQueueRow>;

const rows = mockData as IProviderPaymentQueueRow[];

const READY: TData = {
  items: rows,
  loading: false,
  loaded: true,
  error: null,
  stale: false,
  lastSuccessAt: '2026-10-24T10:15:00Z',
};
const EMPTY: TData = { ...READY, items: [] };
const REFRESHING: TData = { ...READY, loading: true };

/** Intl output uses non-breaking spaces; compare with plain ones. */
const flat = (text: string | null): string =>
  (text ?? '').replace(/\s+/g, ' ').trim();

const byFlatText = (expected: string) => (content: string) =>
  flat(content) === expected;

function renderWidget(
  params: Record<string, unknown> = {},
  data: TData = READY,
  size?: TWidgetSize,
) {
  return render(
    <PaymentPlannerWidget params={params} data={data} size={size} />,
  );
}

/** The number shown above a stat label, e.g. `stat('выбрано к оплате')` → `'14'`. */
function stat(label: string): string {
  return flat(screen.getByText(label).previousElementSibling?.textContent ?? '');
}

function card(container: HTMLElement): HTMLElement {
  const article = container.querySelector('article');
  if (!article) {
    throw new Error('widget card not rendered');
  }
  return article;
}

describe('PaymentPlannerWidget — data states', () => {
  it('shows a skeleton on initial loading and no empty state', () => {
    renderWidget({}, { ...EMPTY, loading: true, loaded: false });
    expect(
      screen.getByRole('status', { name: 'Загрузка очереди платежей' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Очередь платежей пуста')).not.toBeInTheDocument();
  });

  it('treats "not loaded and not failed" as loading, never as empty', () => {
    renderWidget({}, { ...EMPTY, loaded: false });
    expect(
      screen.getByRole('status', { name: 'Загрузка очереди платежей' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Очередь платежей пуста')).not.toBeInTheDocument();
  });

  it('shows the error block when the load failed', () => {
    renderWidget({}, { ...EMPTY, loaded: false, error: 'Enigma timed out' });
    expect(screen.getByRole('alert')).toHaveTextContent('Enigma timed out');
  });

  it('shows the empty state for a loaded empty queue', () => {
    renderWidget({}, EMPTY);
    expect(screen.getByText('Очередь платежей пуста')).toBeInTheDocument();
  });

  it('marks stale data with the freshness mark', () => {
    renderWidget({}, { ...READY, stale: true });
    expect(screen.getByText('Stale')).toBeInTheDocument();
    expect(stat('счетов в очереди')).toBe('32');
  });

  it('shows the stale mark whenever stale is true, even if not loaded', () => {
    renderWidget({}, { ...EMPTY, loaded: false, stale: true });
    expect(screen.getByText('Stale')).toBeInTheDocument();
  });

  it('does not crash on a non-array items value or rows with missing names', () => {
    const broken = { ...READY, items: undefined } as unknown as TData;
    expect(() => renderWidget({}, broken)).not.toThrow();
    expect(screen.getByText('Очередь платежей пуста')).toBeInTheDocument();

    const nameless = rows.map((row, index) =>
      index === 0
        ? ({
            ...row,
            provider_name: undefined,
            provider_currency_name: undefined,
            billing_cycle_name: undefined,
          } as unknown as IProviderPaymentQueueRow)
        : row,
    );
    const { container } = renderWidget({ selectedCount: 3 }, { ...READY, items: nameless });
    expect(flat(container.textContent)).not.toContain('undefined');
  });

  it('keeps data visible and warns when a refresh failed', () => {
    renderWidget({}, { ...READY, error: 'refresh failed' });
    expect(screen.getByRole('alert')).toHaveTextContent('refresh failed');
    expect(stat('счетов в очереди')).toBe('32');
  });

  it('survives garbage params', () => {
    expect(() =>
      renderWidget({ selectedCount: 'x', currencyIds: 'y', rowLimit: -1 }),
    ).not.toThrow();
    expect(stat('выбрано к оплате')).toBe('10');
  });

  it('uses params.size and lets the size prop win', () => {
    const { container, rerender } = renderWidget({ size: 'third' });
    expect(card(container)).toHaveAttribute('data-size', 'third');
    rerender(
      <PaymentPlannerWidget
        params={{ size: 'third' }}
        data={READY}
        size="quarter"
      />,
    );
    expect(card(container)).toHaveAttribute('data-size', 'quarter');
  });
});

describe('PaymentPlannerWidget — full size', () => {
  it('shows stats and per-currency totals without mixing currencies', () => {
    const { container } = renderWidget({ selectedCount: 14 });
    expect(stat('счетов в очереди')).toBe('32');
    expect(stat('выбрано к оплате')).toBe('14');
    expect(stat('поставщиков в плане')).toBe('6');
    const text = flat(container.textContent);
    for (const amount of [
      '1 248 500,00 ₽',
      '103 500,00 $',
      '12 600,00 €',
      '11 000,00 £',
    ]) {
      expect(text).toContain(amount);
    }
  });

  it('shows provider shares as whole percents that add up to 100', () => {
    renderWidget({ selectedCount: 14 });
    const sharesSection = screen
      .getByText('По поставщикам')
      .closest('section') as HTMLElement;
    const percents = within(sharesSection)
      .getAllByText(/·\s*\d+%/)
      .map((shareValue) =>
        Number(/·\s*(\d+)%/.exec(flat(shareValue.textContent))?.[1]),
      );
    expect(percents).toEqual([55, 28, 17]);
    expect(percents.reduce((sum, percent) => sum + percent, 0)).toBe(100);
  });

  it('formats plain amounts when amountFormat is plain', () => {
    renderWidget({ selectedCount: 14, amountFormat: 'plain' });
    expect(
      screen.getAllByText(byFlatText('1248500.00 ₽')).length,
    ).toBeGreaterThan(0);
  });

  it('updates the plan from the slider, the buttons and the number input', async () => {
    const user = userEvent.setup();
    renderWidget({ selectedCount: 14 });

    fireEvent.change(screen.getByRole('slider'), { target: { value: '20' } });
    expect(stat('выбрано к оплате')).toBe('20');

    await user.click(
      screen.getByRole('button', { name: 'Увеличить количество счетов' }),
    );
    expect(stat('выбрано к оплате')).toBe('21');
    await user.click(
      screen.getByRole('button', { name: 'Уменьшить количество счетов' }),
    );
    expect(stat('выбрано к оплате')).toBe('20');

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '999');
    expect(stat('выбрано к оплате')).toBe('32');
    expect(input).toHaveValue(32);
  });

  it('warns about invalid selected amounts and keeps them out of totals', () => {
    renderWidget({ selectedCount: 20 });
    expect(screen.getByText(/Исключено некорректных: 2/)).toBeInTheDocument();
  });

  it('reveals invalid rows beyond the row limit with "Show more"', async () => {
    const user = userEvent.setup();
    renderWidget({ selectedCount: 20, rowLimit: 10 });
    expect(screen.queryAllByText(/Некорректная сумма \(исключена\)/)).toHaveLength(0);
    expect(screen.getByText('Показано 10 из 32')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Показать ещё 10' }));
    await user.click(screen.getByRole('button', { name: 'Показать ещё 10' }));
    expect(screen.getAllByText(/Некорректная сумма \(исключена\)/)).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Свернуть' }));
    expect(screen.getByText('Показано 10 из 32')).toBeInTheDocument();
  });

  it('opens and closes bill details with the linked customer bill', async () => {
    const user = userEvent.setup();
    renderWidget({ selectedCount: 14 });
    const toggle = screen.getAllByRole('button', { name: /SatCom Global/ })[0];
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Клиентский счёт', { selector: 'h5' })).toBeInTheDocument();
    expect(screen.getByText('Оплачен клиентом полностью')).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Оплачен клиентом полностью')).not.toBeInTheDocument();
  });

  it('says so when a bill has no linked customer bill', async () => {
    const user = userEvent.setup();
    renderWidget({ selectedCount: 14, rowLimit: 100 });
    await user.click(screen.getByText(/\(#77626\)/));
    expect(
      screen.getByText('Связанный клиентский счёт отсутствует.'),
    ).toBeInTheDocument();
  });

  it('hides customer bills when showCustomerBills is false', async () => {
    const user = userEvent.setup();
    renderWidget({ selectedCount: 14, showCustomerBills: false });
    expect(
      screen.queryByRole('columnheader', { name: 'Клиентский счёт' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /SatCom Global/ })[0]);
    expect(
      screen.queryByText('Клиентский счёт', { selector: 'h5' }),
    ).not.toBeInTheDocument();
  });

  it('honours showSummary and showProviderBreakdown', () => {
    const { unmount } = renderWidget({ showSummary: false });
    expect(screen.queryByText('счетов в очереди')).not.toBeInTheDocument();
    expect(screen.queryByText('Сумма по валютам')).not.toBeInTheDocument();
    expect(screen.getByText('По поставщикам')).toBeInTheDocument();
    unmount();

    renderWidget({ showProviderBreakdown: false });
    expect(screen.queryByText('По поставщикам')).not.toBeInTheDocument();
    expect(screen.getByText('Сумма по валютам')).toBeInTheDocument();
  });

  it('switches the provider shares between currencies', async () => {
    const user = userEvent.setup();
    renderWidget({ selectedCount: 14 });
    const shares = screen.getByText('По поставщикам').closest('section');
    expect(shares).not.toBeNull();
    expect(within(shares as HTMLElement).getByText(/SatCom Global/)).toBeInTheDocument();
    expect(within(shares as HTMLElement).queryByText(/Marlink SAS/)).not.toBeInTheDocument();

    await user.click(
      within(
        within(shares as HTMLElement).getByRole('group', {
          name: 'Валюта распределения',
        }),
      ).getByRole('button', { name: 'EUR' }),
    );
    expect(within(shares as HTMLElement).getByText(/Marlink SAS/)).toBeInTheDocument();
    expect(within(shares as HTMLElement).queryByText(/SatCom Global/)).not.toBeInTheDocument();
  });

  it('filters the queue before the cut with the in-widget filters', async () => {
    const user = userEvent.setup();
    renderWidget({ selectedCount: 14 });

    await user.selectOptions(screen.getByLabelText('Поставщик'), '1770');
    expect(stat('счетов в очереди')).toBe('4');
    expect(stat('выбрано к оплате')).toBe('4');

    await user.selectOptions(screen.getByLabelText('Поставщик'), 'all');
    const usdCount = rows.filter((queueRow) => queueRow.provider_currency_id === 840).length;
    await user.click(
      within(screen.getByRole('group', { name: 'Валюты' })).getByRole('button', {
        name: 'USD',
      }),
    );
    expect(stat('счетов в очереди')).toBe(String(usdCount));
  });

  it('shows a dedicated state, with a reset, when filters match nothing', async () => {
    const user = userEvent.setup();
    renderWidget({ selectedCount: 14 });
    await user.selectOptions(screen.getByLabelText('Поставщик'), '1770');
    await user.click(
      within(screen.getByRole('group', { name: 'Валюты' })).getByRole('button', {
        name: 'RUB',
      }),
    );
    expect(
      screen.getByText('По выбранным фильтрам очередь пуста'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
    expect(stat('счетов в очереди')).toBe('32');
  });

  it('keeps slider, details and the node itself during a background refresh', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWidget({ selectedCount: 14 });
    fireEvent.change(screen.getByRole('slider'), { target: { value: '5' } });
    const toggle = screen.getAllByRole('button', { name: /SatCom Global/ })[0];
    await user.click(toggle);
    const slider = screen.getByRole('slider');

    rerender(<PaymentPlannerWidget params={{ selectedCount: 14 }} data={REFRESHING} />);

    expect(screen.getByText('Обновление…')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBe(slider);
    expect(slider).toHaveValue('5');
    expect(
      screen.getAllByRole('button', { name: /SatCom Global/ })[0],
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('lets the host change selectedCount after the user moved the slider', () => {
    const { rerender } = renderWidget({ selectedCount: 14 });
    fireEvent.change(screen.getByRole('slider'), { target: { value: '5' } });
    expect(stat('выбрано к оплате')).toBe('5');
    rerender(<PaymentPlannerWidget params={{ selectedCount: 9 }} data={READY} />);
    expect(stat('выбрано к оплате')).toBe('9');
  });
});

describe('PaymentPlannerWidget — compact sizes', () => {
  it('half shows N of M, all currencies and the open-queue action', () => {
    const { container } = renderWidget({ selectedCount: 14 }, READY, 'half');
    const text = flat(container.textContent);
    expect(text).toContain('из 32 счетов');
    expect(text).toContain('6 поставщиков');
    for (const amount of ['1 248 500,00 ₽', '103 500,00 $', '12 600,00 €', '11 000,00 £']) {
      expect(text).toContain(amount);
    }
    expect(text).toContain('44%');
    expect(text).toContain('Старейший счёт: 02.10.2026');
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Открыть очередь платежей →' }),
    ).toBeInTheDocument();
  });

  it('third shows the counter, whole-amount totals and the details action', () => {
    const { container } = renderWidget({ selectedCount: 14 }, READY, 'third');
    const text = flat(container.textContent);
    expect(text).toContain('/ 32 к оплате');
    expect(text).toContain('1 248 500 ₽');
    expect(screen.getByRole('button', { name: 'Открыть детали →' })).toBeInTheDocument();
  });

  it('quarter shows two currencies and an explicit remainder, never hiding silently', async () => {
    const user = userEvent.setup();
    const { container } = renderWidget({ selectedCount: 14 }, READY, 'quarter');
    let text = flat(container.textContent);
    expect(text).toContain('1 248 500 ₽');
    expect(text).toContain('103 500 $');
    expect(text).not.toContain('12 600');
    expect(text).toContain('+ ещё 2 валюты (EUR, GBP)');

    await user.click(screen.getByRole('button', { name: 'Все валюты →' }));
    text = flat(container.textContent);
    expect(text).toContain('12 600 €');
    expect(text).toContain('11 000 £');
    expect(text).not.toContain('+ ещё');

    await user.click(screen.getByRole('button', { name: 'Свернуть ↑' }));
    expect(flat(container.textContent)).toContain('+ ещё 2 валюты (EUR, GBP)');
  });

  it('quarter shows no remainder when every currency fits', () => {
    const { container } = renderWidget(
      { selectedCount: 14, currencyIds: [643, 840] },
      READY,
      'quarter',
    );
    expect(flat(container.textContent)).not.toContain('ещё');
    expect(screen.queryByRole('button', { name: /валюты/ })).not.toBeInTheDocument();
  });

  it('half opens the full queue in a dialog and closes it', async () => {
    const user = userEvent.setup();
    const { container } = renderWidget({ selectedCount: 14 }, READY, 'half');
    const dialog = container.querySelector('dialog');
    expect(dialog).not.toHaveAttribute('open');

    await user.click(screen.getByRole('button', { name: 'Открыть очередь платежей →' }));
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog as HTMLElement).getByRole('table')).toBeInTheDocument();

    await user.click(within(dialog as HTMLElement).getByRole('button', { name: 'Закрыть' }));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('third opens the same dialog from "Open details"', async () => {
    const user = userEvent.setup();
    const { container } = renderWidget({ selectedCount: 14 }, READY, 'third');
    await user.click(screen.getByRole('button', { name: 'Открыть детали →' }));
    expect(container.querySelector('dialog')).toHaveAttribute('open');
  });

  it('does not render a dialog for full and quarter', () => {
    expect(renderWidget({}, READY, 'full').container.querySelector('dialog')).toBeNull();
    expect(renderWidget({}, READY, 'quarter').container.querySelector('dialog')).toBeNull();
  });

  it('does not reopen a closed-by-unmount dialog when data returns', async () => {
    const user = userEvent.setup();
    const { container, rerender } = renderWidget({ selectedCount: 14 }, READY, 'half');
    await user.click(screen.getByRole('button', { name: 'Открыть очередь платежей →' }));
    expect(container.querySelector('dialog')).toHaveAttribute('open');

    rerender(<PaymentPlannerWidget params={{ selectedCount: 14 }} data={EMPTY} size="half" />);
    expect(container.querySelector('dialog')).toBeNull();

    rerender(<PaymentPlannerWidget params={{ selectedCount: 14 }} data={READY} size="half" />);
    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
  });
});

describe('PaymentPlannerWidget — review fixes', () => {
  it('keeps the same bill open when a refresh puts another bill ahead of it', async () => {
    const user = userEvent.setup();
    /** The row button of a bill (its number also appears in the open details). */
    const billToggle = (billId: number): HTMLButtonElement => {
      const toggle = screen
        .getAllByText(new RegExp(`\\(#${billId}\\)`))
        .map((element) => element.closest('button'))
        .find((button) => button !== null);
      if (!toggle) {
        throw new Error(`no row for bill ${billId}`);
      }
      return toggle;
    };

    const { rerender } = renderWidget({ selectedCount: 14, rowLimit: 100 });
    await user.click(billToggle(77614));
    expect(billToggle(77614)).toHaveAttribute('aria-expanded', 'true');

    const newBillAhead: IProviderPaymentQueueRow = {
      ...rows[0],
      payment_rank: 0,
      provider_bill_id: 70001,
      provider_bill_no: 'NEW-70001',
      customer_bill_id: 99001,
    };
    rerender(
      <PaymentPlannerWidget
        params={{ selectedCount: 14, rowLimit: 100 }}
        data={{ ...READY, items: [newBillAhead, ...rows] }}
      />,
    );

    expect(billToggle(77614)).toHaveAttribute('aria-expanded', 'true');
    expect(billToggle(70001)).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows a failed refresh above the empty state too', () => {
    renderWidget({}, { ...EMPTY, error: 'refresh failed' });
    expect(screen.getByRole('alert')).toHaveTextContent('refresh failed');
    expect(screen.getByText('Очередь платежей пуста')).toBeInTheDocument();
  });

  it('marks invalid bills outside the plan without saying they were excluded', () => {
    renderWidget({ selectedCount: 5, rowLimit: 100 });
    expect(screen.getAllByText('⚠ Некорректная сумма')).toHaveLength(2);
    expect(screen.queryByText(/\(исключена\)/)).not.toBeInTheDocument();
  });

  it('says "excluded" only for invalid bills that are in the plan', () => {
    renderWidget({ selectedCount: 18, rowLimit: 100 });
    // 77630 (position 16) is in the plan, 77638 (position 19) is not.
    expect(screen.getAllByText('⚠ Некорректная сумма (исключена)')).toHaveLength(1);
    expect(screen.getAllByText('⚠ Некорректная сумма')).toHaveLength(1);
  });

  it('shows <1% instead of 0% for a tiny but real share', () => {
    const bigBill: IProviderPaymentQueueRow = {
      ...rows[0],
      provider_id: 1,
      provider_name: 'Big Provider',
      provider_bill_id: 1,
      provider_total_due: 1000000,
      payment_rank: 1,
    };
    const tinyBill: IProviderPaymentQueueRow = {
      ...rows[0],
      provider_id: 2,
      provider_name: 'Tiny Provider',
      provider_bill_id: 2,
      provider_total_due: 3000,
      payment_rank: 2,
    };
    renderWidget({ selectedCount: 2 }, { ...READY, items: [bigBill, tinyBill] });
    const sharesSection = screen
      .getByText('По поставщикам')
      .closest('section') as HTMLElement;
    expect(within(sharesSection).getByText(/·\s*<1%/)).toBeInTheDocument();
    expect(within(sharesSection).getByText(/·\s*100%/)).toBeInTheDocument();
  });
});
