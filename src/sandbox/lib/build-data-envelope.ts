import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import type { ICollectionDataResult } from '@platform/widget-types';
import {
  EDataStateMode,
  MOCK_ERROR_MESSAGE,
  MOCK_LAST_SUCCESS_AT,
  MOCK_STALE_LAST_SUCCESS_AT,
} from '@sandbox/config/data-state';

type TQueueEnvelope = ICollectionDataResult<IProviderPaymentQueueRow>;

/** The data envelope INTERA's `useCollectionData` would hand over in the given state. */
export function buildDataEnvelope(
  dataMode: EDataStateMode,
  queueRows: readonly IProviderPaymentQueueRow[],
): TQueueEnvelope {
  switch (dataMode) {
    case EDataStateMode.Loading:
      return {
        items: [],
        loading: true,
        loaded: false,
        error: null,
        stale: false,
        lastSuccessAt: null,
      };
    case EDataStateMode.Refreshing:
      return {
        items: queueRows,
        loading: true,
        loaded: true,
        error: null,
        stale: false,
        lastSuccessAt: MOCK_LAST_SUCCESS_AT,
      };
    case EDataStateMode.Stale:
      return {
        items: queueRows,
        loading: false,
        loaded: true,
        error: null,
        stale: true,
        lastSuccessAt: MOCK_STALE_LAST_SUCCESS_AT,
      };
    case EDataStateMode.Empty:
      return {
        items: [],
        loading: false,
        loaded: true,
        error: null,
        stale: false,
        lastSuccessAt: MOCK_LAST_SUCCESS_AT,
      };
    case EDataStateMode.Error:
      return {
        items: [],
        loading: false,
        loaded: false,
        error: MOCK_ERROR_MESSAGE,
        stale: false,
        lastSuccessAt: null,
      };
    case EDataStateMode.Ready:
      return {
        items: queueRows,
        loading: false,
        loaded: true,
        error: null,
        stale: false,
        lastSuccessAt: MOCK_LAST_SUCCESS_AT,
      };
  }
}
