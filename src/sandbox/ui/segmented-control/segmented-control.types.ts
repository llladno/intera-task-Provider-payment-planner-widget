export interface ISegmentedControlProps<TOption extends string> {
  options: readonly TOption[];
  value: TOption;
  onChange: (option: TOption) => void;
  /** Text of an option button; default: the option itself. */
  getOptionLabel?: (option: TOption) => string;
}
