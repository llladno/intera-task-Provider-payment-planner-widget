/**
 * Allowed `amountFormat` values. A literal tuple, as in the starter project, so
 * `AMOUNT_FORMATS.includes('plain')` and `typeof AMOUNT_FORMATS[number]` keep compiling.
 */
export const AMOUNT_FORMATS = ['grouped', 'plain'] as const;

/** What a dashboard layout (`params`) contains. */
export type TAmountFormat = (typeof AMOUNT_FORMATS)[number];

/** How amounts are printed: `1 248 500,00 ₽` or `1248500.00 ₽`. */
export enum EAmountFormat {
  Grouped = 'grouped',
  Plain = 'plain',
}

/**
 * Compile-time guard: the enum and the tuple must describe the same values.
 * Adding a format to one without the other fails type checking here.
 */
export const AMOUNT_FORMAT_BY_VALUE: Readonly<Record<TAmountFormat, EAmountFormat>> = {
  grouped: EAmountFormat.Grouped,
  plain: EAmountFormat.Plain,
};
