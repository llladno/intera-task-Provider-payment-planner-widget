import type { TPluralForms } from '@planner/config/plural-forms';

const HUNDRED = 100;
const TEN = 10;
const TEENS_START = 10;
const TEENS_END = 20;
const FEW_MIN = 2;
const FEW_MAX = 4;

/** Picks the Russian plural form for `count`: `pluralize(2, BILL_FORMS)` → `счёта`. */
export function pluralize(count: number, forms: TPluralForms): string {
  const lastTwoDigits = Math.abs(count) % HUNDRED;
  const lastDigit = lastTwoDigits % TEN;
  if (lastTwoDigits > TEENS_START && lastTwoDigits < TEENS_END) {
    return forms[2];
  }
  if (lastDigit === 1) {
    return forms[0];
  }
  if (lastDigit >= FEW_MIN && lastDigit <= FEW_MAX) {
    return forms[1];
  }
  return forms[2];
}
