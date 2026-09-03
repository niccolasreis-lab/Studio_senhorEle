import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanBuildOutput } from '../scripts/clean-dist.mjs';

const temporaryRoots: string[] = [];

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe('cleanBuildOutput', () => {
  it('removes the complete previous output directory', () => {
    const root = mkdtempSync(join(tmpdir(), 'studio-senhorele-clean-test-'));
    temporaryRoots.push(root);
    const nestedDirectory = join(root, 'dist', 'assets');
    mkdirSync(nestedDirectory, { recursive: true });
    writeFileSync(join(nestedDirectory, 'historical-bundle.js'), 'stale');

    cleanBuildOutput(root);

    expect(existsSync(join(root, 'dist'))).toBe(false);
  });
});
