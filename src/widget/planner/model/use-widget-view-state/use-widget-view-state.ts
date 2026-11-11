import { useCallback, useState } from 'react';
import type { IWidgetViewState } from '@planner/model/use-widget-view-state/types';

/**
 * Transient view state of the card (which currency, which row, expanded list, dialog).
 * Kept in the always-mounted widget so a background refresh does not reset it.
 */
export function useWidgetViewState(): IWidgetViewState {
  const [shareCurrencyId, setShareCurrencyId] = useState<number | null>(null);
  const [expandedBillKey, setExpandedBillKey] = useState<string | null>(null);
  const [isCurrencyListExpanded, setIsCurrencyListExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleExpandedBill = useCallback((billKey: string) => {
    setExpandedBillKey((currentBillKey) =>
      currentBillKey === billKey ? null : billKey,
    );
  }, []);
  const toggleCurrencyList = useCallback(
    () => setIsCurrencyListExpanded((isExpanded) => !isExpanded),
    [],
  );
  const openDialog = useCallback(() => setIsDialogOpen(true), []);
  const closeDialog = useCallback(() => setIsDialogOpen(false), []);

  return {
    shareCurrencyId,
    setShareCurrencyId,
    expandedBillKey,
    toggleExpandedBill,
    isCurrencyListExpanded,
    toggleCurrencyList,
    isDialogOpen,
    openDialog,
    closeDialog,
  };
}
