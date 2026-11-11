import type { ReactElement } from 'react';
import { joinClassNames } from '@planner/lib/join-class-names';
import type { ISectionProps } from '@planner/ui/section/section.types';
import '@planner/ui/section/section.css';

const BLOCK = 'dash-payment-planner-section';

export function Section({
  title,
  children,
  aside,
  isBoxed = false,
}: ISectionProps): ReactElement {
  return (
    <section
      className={joinClassNames(BLOCK, isBoxed && `${BLOCK}--boxed`)}
    >
      <div className={`${BLOCK}__header`}>
        <h5 className={`${BLOCK}__title`}>{title}</h5>
        {aside}
      </div>
      {children}
    </section>
  );
}
