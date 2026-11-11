import { describe, expect, it } from 'vitest';
import { formatAmount } from '@planner/lib/format/format-amount';
import { formatDate } from '@planner/lib/format/format-date';
import {
  distributePercents,
  formatPercent,
  formatShare,
} from '@planner/lib/format/format-percent';
import { pluralize } from '@planner/lib/format/pluralize';

/** Intl uses non-breaking spaces; compare with plain ones. */
const plain = (text: string): string => text.replace(/\s/g, ' ');

describe('formatAmount', () => {
  it('groups thousands with a comma fraction by default', () => {
    expect(plain(formatAmount(1248500, 'RUB', 'grouped'))).toBe(
      '1 248 500,00 ₽',
    );
  });

  it('prints plain amounts with a dot fraction', () => {
    expect(plain(formatAmount(1248500, 'RUB', 'plain'))).toBe('1248500.00 ₽');
  });

  it('drops zero kopecks only in compact mode', () => {
    expect(plain(formatAmount(103500, 'USD', 'grouped', { compact: true }))).toBe(
      '103 500 $',
    );
    expect(
      plain(formatAmount(103500.5, 'USD', 'grouped', { compact: true })),
    ).toBe('103 500,50 $');
  });

  it('falls back to the currency code for unknown currencies', () => {
    expect(plain(formatAmount(5, 'CHF', 'plain'))).toBe('5.00 CHF');
  });
});

describe('formatDate / formatPercent / pluralize', () => {
  it('formats ISO dates and leaves anything else untouched', () => {
    expect(formatDate('2026-10-02')).toBe('02.10.2026');
    expect(formatDate('yesterday')).toBe('yesterday');
  });

  it('formats percentages with at most one fraction digit', () => {
    expect(plain(formatPercent(55.1234))).toBe('55,1%');
    expect(formatPercent(28)).toBe('28%');
  });

  it('picks the Russian plural form', () => {
    const forms = ['счёт', 'счёта', 'счетов'] as const;
    expect([1, 2, 5, 11, 12, 21, 22, 25].map((count) => pluralize(count, forms))).toEqual([
      'счёт',
      'счёта',
      'счетов',
      'счетов',
      'счетов',
      'счёт',
      'счёта',
      'счетов',
    ]);
  });
});

describe('distributePercents', () => {
  it('rounds shares to whole percents that add up to exactly 100', () => {
    // 688500 / 350000 / 210000 of 1248500 — plain rounding gives 55 + 28 + 17 = 100,
    // but e.g. thirds give 33 + 33 + 33 = 99.
    expect(distributePercents([55.1462, 28.0336, 16.8202])).toEqual([55, 28, 17]);
    expect(distributePercents([100 / 3, 100 / 3, 100 / 3])).toEqual([34, 33, 33]);
    for (const shares of [
      [50.5, 49.5],
      [0.4, 0.4, 99.2],
      [12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5],
    ]) {
      const sum = distributePercents(shares).reduce((sum, percent) => sum + percent, 0);
      expect(sum).toBe(100);
    }
  });

  it('handles empty and single-share input', () => {
    expect(distributePercents([])).toEqual([]);
    expect(distributePercents([100])).toEqual([100]);
  });
});

describe('formatShare', () => {
  it('prints the whole percent as is', () => {
    expect(formatShare(55, 55.1)).toBe('55%');
    expect(formatShare(0, 0)).toBe('0%');
  });

  it('never shows 0% for a real share', () => {
    expect(formatShare(0, 0.3)).toBe('<1%');
  });
});
