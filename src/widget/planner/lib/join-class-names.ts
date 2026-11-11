type TClassNamePart = string | false | null | undefined;

/** Joins BEM class names, skipping falsy parts: `join('a', isOn && 'a--on')`. */
export function joinClassNames(...classNameParts: TClassNamePart[]): string {
  return classNameParts.filter(Boolean).join(' ');
}
