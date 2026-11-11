import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import ts from 'typescript';
import { defineConfig, type Alias } from 'vite';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const TSCONFIG_PATH = path.join(ROOT_DIR, 'tsconfig.json');
const WILDCARD_SUFFIX = /\/\*$/;

/**
 * Import aliases come from `compilerOptions.paths` in tsconfig.json, which is the single
 * source of truth: `tsc`, Vite and Vitest cannot disagree about where `@planner/...` points.
 */
function readTsconfigAliases(): Alias[] {
  const { config, error } = ts.readConfigFile(TSCONFIG_PATH, ts.sys.readFile);
  if (error) {
    throw new Error(`Cannot read ${TSCONFIG_PATH}`);
  }
  const pathPatterns: Record<string, string[]> =
    config?.compilerOptions?.paths ?? {};
  return Object.entries(pathPatterns).map(([pattern, [targetPattern]]) => ({
    find: pattern.replace(WILDCARD_SUFFIX, ''),
    replacement: path.resolve(ROOT_DIR, targetPattern.replace(WILDCARD_SUFFIX, '')),
  }));
}

export default defineConfig({
  plugins: [react()],
  resolve: { alias: readTsconfigAliases() },
});
