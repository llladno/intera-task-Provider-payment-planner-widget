export interface IWidgetViewState {
  /** Currency whose provider shares are shown; `null` = the first currency of the plan. */
  shareCurrencyId: number | null;
  setShareCurrencyId: (currencyId: number) => void;
  /** `billKey` of the table row whose details are open (survives refreshes and re-sorting). */
  expandedBillKey: string | null;
  toggleExpandedBill: (billKey: string) => void;
  /** `quarter` card: all currencies instead of the first few. */
  isCurrencyListExpanded: boolean;
  toggleCurrencyList: () => void;
  isDialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}
