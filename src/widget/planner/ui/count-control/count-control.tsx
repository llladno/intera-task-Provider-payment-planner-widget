import {
  useId,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactElement,
} from 'react';
import { PERCENT_TOTAL } from '@planner/config/format-locale';
import { LABELS } from '@planner/config/labels';
import { MESSAGES } from '@planner/lib/messages';
import { Button } from '@planner/ui/button/button';
import { EButtonVariant } from '@planner/ui/button/button.constants';
import {
  ECountControlVariant,
  EMPTY_DRAFT,
} from '@planner/ui/count-control/count-control.constants';
import type { ICountControlProps } from '@planner/ui/count-control/count-control.types';
import '@planner/ui/count-control/count-control.css';

const BLOCK = 'dash-payment-planner-count-control';

function clampCount(requestedCount: number, maxCount: number): number {
  return Math.min(Math.max(0, Math.round(requestedCount)), maxCount);
}

export function CountControl({
  value,
  max,
  onChange,
  variant,
}: ICountControlProps): ReactElement {
  const controlId = useId();
  const [draftText, setDraftText] = useState<string | null>(null);
  // Show the typed text only while it still matches the selection; a clamped
  // or externally changed value must not leave a stale number in the field.
  const isDraftCurrent =
    draftText !== null &&
    (draftText.trim() === EMPTY_DRAFT || Number(draftText) === value);
  const displayedText = isDraftCurrent ? draftText : String(value);

  const handleNumberChange = (typedText: string): void => {
    setDraftText(typedText);
    if (typedText.trim() === EMPTY_DRAFT) {
      return;
    }
    const typedCount = Number(typedText);
    if (Number.isFinite(typedCount)) {
      onChange(clampCount(typedCount, max));
    }
  };

  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setDraftText(null);
    onChange(clampCount(Number(event.target.value), max));
  };

  const handleStep = (stepSize: number): void => {
    setDraftText(null);
    onChange(clampCount(value + stepSize, max));
  };

  const filledShare = max > 0 ? (value / max) * PERCENT_TOTAL : 0;
  const rangeStyle = { '--fill': `${filledShare}%` } as CSSProperties;

  const rangeInput = (
    <input
      className={`${BLOCK}__range`}
      type="range"
      min={0}
      max={Math.max(max, 0)}
      step={1}
      value={value}
      disabled={max === 0}
      aria-label={LABELS.controls.selectedCountAria}
      aria-valuetext={MESSAGES.selectedValueText(value, max)}
      style={rangeStyle}
      onChange={handleRangeChange}
    />
  );

  if (variant === ECountControlVariant.Compact) {
    return <div className={BLOCK}>{rangeInput}</div>;
  }

  return (
    <div className={BLOCK}>
      <label className={`${BLOCK}__label`} htmlFor={`${controlId}-number`}>
        {LABELS.controls.selectedCount}
      </label>
      <div className={`${BLOCK}__stepper`}>
        <Button
          variant={EButtonVariant.Icon}
          aria-label={LABELS.controls.decrease}
          disabled={value <= 0}
          onClick={() => handleStep(-1)}
        >
          −
        </Button>
        <input
          id={`${controlId}-number`}
          className={`${BLOCK}__number`}
          type="number"
          inputMode="numeric"
          min={0}
          max={max}
          value={displayedText}
          disabled={max === 0}
          onChange={(event) => handleNumberChange(event.target.value)}
          onBlur={() => setDraftText(null)}
        />
        <Button
          variant={EButtonVariant.Icon}
          aria-label={LABELS.controls.increase}
          disabled={value >= max}
          onClick={() => handleStep(1)}
        >
          +
        </Button>
        <span className={`${BLOCK}__total`}>{MESSAGES.slashTotal(max)}</span>
      </div>
      {rangeInput}
    </div>
  );
}
