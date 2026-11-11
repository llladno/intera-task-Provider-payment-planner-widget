import { describe, expect, it } from 'vitest';
import { joinClassNames } from '@planner/lib/join-class-names';

describe('joinClassNames', () => {
  it('joins the truthy parts with a space', () => {
    expect(joinClassNames('block', 'block--on')).toBe('block block--on');
  });

  it('skips false, null, undefined and empty parts', () => {
    expect(joinClassNames('block', false, null, undefined, '', 'extra')).toBe(
      'block extra',
    );
  });

  it('supports a condition as a part', () => {
    const isActive = false;
    expect(joinClassNames('block', isActive && 'block--active')).toBe('block');
  });
});
