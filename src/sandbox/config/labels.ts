export const SANDBOX_LABELS = {
  brand: 'INTERA',
  title: 'Task 2 — Provider Payment Planner Widget',
  toolbar: {
    size: 'Размер:',
    dataState: 'Состояние:',
    theme: 'Тема:',
  },
  panel: {
    title: 'Параметры виджета (params)',
    description: 'Заголовок (description)',
    selectedCount: (selectedCount: number): string =>
      `Счетов к оплате (selectedCount: ${selectedCount})`,
    currencies: 'Валюты (currencyIds — пусто = все)',
    provider: 'Поставщик (providerId)',
    allProviders: 'all (все поставщики)',
    billingCycle: 'Биллинговый цикл (billingCycleId)',
    allBillingCycles: 'all (все циклы)',
    amountFormat: 'Формат (amountFormat)',
    rowLimit: 'Лимит строк (rowLimit)',
    visibleBlocks: 'Отображение блоков',
    reset: 'Сбросить параметры по умолчанию',
  },
} as const;
