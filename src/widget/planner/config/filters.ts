/** Filter value meaning "no restriction" (any provider / any billing cycle). */
export const ALL_FILTER_VALUE = 'all';
export type TAllFilterValue = typeof ALL_FILTER_VALUE;

/** A concrete id, or {@link ALL_FILTER_VALUE}. */
export type TIdFilter = number | TAllFilterValue;
