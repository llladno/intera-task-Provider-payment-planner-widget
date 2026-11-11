import { describe, expect, it } from 'vitest';
import mockData from '@/data/mock-payment-queue.json';
import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import {
  EDataStateMode,
  MOCK_ERROR_MESSAGE,
} from '@sandbox/config/data-state';
import { buildDataEnvelope } from '@sandbox/lib/build-data-envelope';

const queueRows = mockData as IProviderPaymentQueueRow[];

describe('buildDataEnvelope', () => {
  it('ready: loaded rows, nothing pending', () => {
    const envelope = buildDataEnvelope(EDataStateMode.Ready, queueRows);
    expect(envelope).toMatchObject({ loading: false, loaded: true, error: null, stale: false });
    expect(envelope.items).toBe(queueRows);
  });

  it('loading: no rows yet, not loaded', () => {
    expect(buildDataEnvelope(EDataStateMode.Loading, queueRows)).toMatchObject({
      items: [],
      loading: true,
      loaded: false,
    });
  });

  it('refreshing: keeps the rows while loading', () => {
    const envelope = buildDataEnvelope(EDataStateMode.Refreshing, queueRows);
    expect(envelope).toMatchObject({ loading: true, loaded: true });
    expect(envelope.items).toBe(queueRows);
  });

  it('stale: loaded rows flagged as stale', () => {
    expect(buildDataEnvelope(EDataStateMode.Stale, queueRows)).toMatchObject({
      loaded: true,
      stale: true,
    });
  });

  it('empty: loaded without rows', () => {
    expect(buildDataEnvelope(EDataStateMode.Empty, queueRows)).toMatchObject({
      items: [],
      loaded: true,
      error: null,
    });
  });

  it('error: not loaded, with the mock message', () => {
    expect(buildDataEnvelope(EDataStateMode.Error, queueRows)).toMatchObject({
      items: [],
      loaded: false,
      error: MOCK_ERROR_MESSAGE,
    });
  });
});
