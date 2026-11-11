import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guards the documented layout: segments only import from segments to their left
 * (config → lib → model → ui), and there are no barrels or relative imports.
 */
const SLICE_DIR = path.resolve(__dirname);
const SRC_DIR = path.resolve(__dirname, '../..');
const SEGMENTS = ['config', 'lib', 'model', 'ui'] as const;
type TSegment = (typeof SEGMENTS)[number];

function listFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const entryPath = path.join(directory, entry);
    return statSync(entryPath).isDirectory() ? listFiles(entryPath) : [entryPath];
  });
}

function importSpecifiers(filePath: string): string[] {
  const source = readFileSync(filePath, 'utf8');
  return Array.from(
    source.matchAll(/(?:from|import)\s+'([^']+)'/g),
    (match) => match[1],
  );
}

const sliceFiles = listFiles(SLICE_DIR).filter(
  (filePath) => /\.(ts|tsx)$/.test(filePath) && !/\.test\.tsx?$/.test(filePath),
);

function segmentOf(filePath: string): TSegment | null {
  const firstFolder = path.relative(SLICE_DIR, filePath).split(path.sep)[0];
  return (SEGMENTS as readonly string[]).includes(firstFolder)
    ? (firstFolder as TSegment)
    : null;
}

describe('planner slice architecture', () => {
  it('imports only from segments to its left', () => {
    const violations: string[] = [];
    for (const filePath of sliceFiles) {
      const ownSegment = segmentOf(filePath);
      if (ownSegment === null) {
        continue;
      }
      const ownRank = SEGMENTS.indexOf(ownSegment);
      for (const specifier of importSpecifiers(filePath)) {
        const targetSegment = /^@planner\/(config|lib|model|ui)\//.exec(specifier)?.[1];
        if (targetSegment && SEGMENTS.indexOf(targetSegment as TSegment) > ownRank) {
          violations.push(
            `${path.relative(SLICE_DIR, filePath)} (${ownSegment}) imports ${specifier}`,
          );
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('has no barrel (index.ts) files', () => {
    const barrels = listFiles(SRC_DIR).filter((filePath) =>
      /\/index\.tsx?$/.test(filePath),
    );
    expect(barrels).toEqual([]);
  });

  it('uses no relative imports in the widget, the sandbox or the tests', () => {
    const offenders = listFiles(SRC_DIR)
      .filter((filePath) => /\.(ts|tsx)$/.test(filePath))
      .flatMap((filePath) =>
        importSpecifiers(filePath)
          .filter((specifier) => specifier.startsWith('.'))
          .map((specifier) => `${path.relative(SRC_DIR, filePath)}: ${specifier}`),
      );
    expect(offenders).toEqual([]);
  });

  it('keeps the sandbox on the public entry files of the widget', () => {
    const sandboxFiles = listFiles(path.join(SRC_DIR, 'sandbox')).filter((filePath) =>
      /\.(ts|tsx)$/.test(filePath),
    );
    const internalImports = sandboxFiles.flatMap((filePath) =>
      importSpecifiers(filePath)
        .filter((specifier) => specifier.startsWith('@planner/'))
        .map((specifier) => `${path.relative(SRC_DIR, filePath)}: ${specifier}`),
    );
    expect(internalImports).toEqual([]);
  });
});
