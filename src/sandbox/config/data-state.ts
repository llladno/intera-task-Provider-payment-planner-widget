/** Shapes of the `ICollectionDataResult` envelope the sandbox can simulate. */
export enum EDataStateMode {
  Ready = 'ready',
  Stale = 'stale',
  Refreshing = 'refreshing',
  Loading = 'loading',
  Empty = 'empty',
  Error = 'error',
}

export const DATA_STATE_MODES: readonly EDataStateMode[] =
  Object.values(EDataStateMode);

export const MOCK_LAST_SUCCESS_AT = '2026-10-24T10:15:00Z';
export const MOCK_STALE_LAST_SUCCESS_AT = '2026-10-24T08:40:00Z';
export const MOCK_ERROR_MESSAGE =
  'Enigma API request timed out after 15000 ms for /api/ProviderPaymentQueue/bysky/query';
