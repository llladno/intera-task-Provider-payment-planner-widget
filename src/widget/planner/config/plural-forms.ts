/** Russian plural forms: one / few / many. */
export type TPluralForms = readonly [string, string, string];

export const BILL_FORMS: TPluralForms = ['счёт', 'счёта', 'счетов'];
/** After "из": `из 21 счёта`, `из 32 счетов`. */
export const BILL_FORMS_AFTER_OF: TPluralForms = ['счёта', 'счетов', 'счетов'];
export const CURRENCY_FORMS: TPluralForms = ['валюта', 'валюты', 'валют'];
export const PROVIDER_FORMS: TPluralForms = [
  'поставщик',
  'поставщика',
  'поставщиков',
];
