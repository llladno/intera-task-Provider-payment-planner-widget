import { MINOR_UNITS_PER_UNIT } from '@planner/config/currency';

/** Amounts are accumulated in minor units so repeated additions do not drift. */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * MINOR_UNITS_PER_UNIT);
}

export function fromMinorUnits(minorUnits: number): number {
  return minorUnits / MINOR_UNITS_PER_UNIT;
}
