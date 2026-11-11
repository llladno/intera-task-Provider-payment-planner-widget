/** Keys of the widget `params` object (dashboard YAML / parameter editor). */
export enum EPlannerParamKey {
  Description = 'description',
  /** Legacy alias of `description`. */
  Title = 'title',
  Subtitle = 'subtitle',
  Size = 'size',
  SelectedCount = 'selectedCount',
  CurrencyIds = 'currencyIds',
  ProviderId = 'providerId',
  BillingCycleId = 'billingCycleId',
  AmountFormat = 'amountFormat',
  RowLimit = 'rowLimit',
  /** Legacy alias of `rowLimit`. */
  MaxRows = 'maxRows',
  ShowCustomerBills = 'showCustomerBills',
  ShowProviderBreakdown = 'showProviderBreakdown',
  ShowSummary = 'showSummary',
}
