import {
  BILL_FORMS,
  BILL_FORMS_AFTER_OF,
  CURRENCY_FORMS,
  PROVIDER_FORMS,
} from '@planner/config/plural-forms';
import { pluralize } from '@planner/lib/format/pluralize';

/** Visible strings that depend on a value (counts, names). Static ones live in `LABELS`. */
export const MESSAGES = {
  billsOfTotal: (total: number): string =>
    `из ${total} ${pluralize(total, BILL_FORMS_AFTER_OF)}`,
  providersCount: (count: number): string =>
    `${count} ${pluralize(count, PROVIDER_FORMS)}`,
  billsCount: (count: number): string =>
    `${count} ${pluralize(count, BILL_FORMS)}`,
  toPayOfTotal: (total: number): string => `из ${total} к оплате`,
  slashTotalToPay: (total: number): string => `/ ${total} к оплате`,
  slashTotal: (total: number): string => `/ ${total}`,
  oldestBillOn: (date: string): string => `Старейший счёт: ${date}`,
  currenciesInPlan: (count: number): string => `Валют в плане: ${count}`,
  moreCurrencies: (count: number, names: string): string =>
    `+ ещё ${count} ${pluralize(count, CURRENCY_FORMS)} (${names})`,
  moreProviders: (count: number): string =>
    `+ ещё ${count} ${pluralize(count, PROVIDER_FORMS)}`,
  moreCount: (count: number): string => `+ ещё ${count}`,
  invalidExcluded: (count: number): string =>
    `⚠ Исключено некорректных: ${count}`,
  refreshFailed: (message: string): string =>
    `Не удалось обновить данные: ${message}`,
  shown: (shown: number, total: number): string =>
    `Показано ${shown} из ${total}`,
  showMore: (count: number): string => `Показать ещё ${count}`,
  selectedValueText: (selected: number, total: number): string =>
    `${selected} из ${total}`,
  shareAria: (provider: string, percent: string, currency: string): string =>
    `${provider}: ${percent} от суммы в ${currency}`,
  invalidAmountDetail: (raw: string, isExcluded: boolean): string =>
    isExcluded
      ? `некорректная (${raw}), исключена из итогов`
      : `некорректная (${raw})`,
  billNumber: (billNo: string, billId: number): string =>
    `${billNo} (#${billId})`,
  rank: (rank: number): string => `#${rank}`,
} as const;
