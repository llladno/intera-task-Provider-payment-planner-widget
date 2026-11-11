// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@/test/setup-ui';
import { DEFAULT_SANDBOX_PARAMS } from '@sandbox/config/default-params';
import { useSandboxParams } from '@sandbox/model/use-sandbox-params';

describe('useSandboxParams', () => {
  it('starts from the defaults', () => {
    const { result } = renderHook(() => useSandboxParams());
    expect(result.current.params).toEqual(DEFAULT_SANDBOX_PARAMS);
  });

  it('updates a single param and keeps the rest', () => {
    const { result } = renderHook(() => useSandboxParams());
    act(() => result.current.updateParam('selectedCount', 3));
    act(() => result.current.updateParam('showSummary', false));
    expect(result.current.params.selectedCount).toBe(3);
    expect(result.current.params.showSummary).toBe(false);
    expect(result.current.params.description).toBe(DEFAULT_SANDBOX_PARAMS.description);
  });

  it('toggles currencies on and off', () => {
    const { result } = renderHook(() => useSandboxParams());
    act(() => result.current.toggleCurrency(643));
    act(() => result.current.toggleCurrency(840));
    expect(result.current.params.currencyIds).toEqual([643, 840]);
    act(() => result.current.toggleCurrency(643));
    expect(result.current.params.currencyIds).toEqual([840]);
  });

  it('resets everything to the defaults', () => {
    const { result } = renderHook(() => useSandboxParams());
    act(() => result.current.updateParam('rowLimit', 50));
    act(() => result.current.toggleCurrency(643));
    act(() => result.current.resetParams());
    expect(result.current.params).toEqual(DEFAULT_SANDBOX_PARAMS);
  });
});
