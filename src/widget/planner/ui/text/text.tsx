import type { ReactElement } from 'react';
import { joinClassNames } from '@planner/lib/join-class-names';
import { ETextTone } from '@planner/ui/text/text.constants';
import type { ITextProps } from '@planner/ui/text/text.types';
import '@planner/ui/text/text.css';

const BLOCK = 'dash-payment-planner-text';

export function Text({
  children,
  tone = ETextTone.Default,
  as: Element = 'span',
}: ITextProps): ReactElement {
  return (
    <Element
      className={joinClassNames(
        BLOCK,
        tone === ETextTone.Muted && `${BLOCK}--muted`,
        tone === ETextTone.Warning && `${BLOCK}--warning`,
      )}
    >
      {children}
    </Element>
  );
}
