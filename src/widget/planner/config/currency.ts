/** Currency codes present in `provider-payment-queue`. */
export enum ECurrencyCode {
  Rub = 'RUB',
  Usd = 'USD',
  Eur = 'EUR',
  Gbp = 'GBP',
}

export const CURRENCY_SYMBOLS: Readonly<Record<ECurrencyCode, string>> = {
  [ECurrencyCode.Rub]: '₽',
  [ECurrencyCode.Usd]: '$',
  [ECurrencyCode.Eur]: '€',
  [ECurrencyCode.Gbp]: '£',
};

/** Kopecks / cents in one unit; sums are accumulated in minor units to avoid float drift. */
export const MINOR_UNITS_PER_UNIT = 100;
