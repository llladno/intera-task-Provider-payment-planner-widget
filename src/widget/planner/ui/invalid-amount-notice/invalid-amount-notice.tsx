import type { ReactElement } from 'react';
import { LABELS } from '@planner/config/labels';
import { MESSAGES } from '@planner/lib/messages';
import { Notice } from '@planner/ui/notice/notice';

/** Says how many selected bills were left out of the sums; renders nothing for zero. */
export function InvalidAmountNotice({
  invalidCount,
}: {
  invalidCount: number;
}): ReactElement | null {
  if (invalidCount <= 0) {
    return null;
  }
  return (
    <Notice
      message={MESSAGES.invalidExcluded(invalidCount)}
      hint={LABELS.notices.invalidHint}
    />
  );
}
