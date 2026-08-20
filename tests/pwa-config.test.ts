import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const viteConfig = readFileSync(resolve(process.cwd(), 'vite.config.ts'), 'utf8');

describe('PWA configuration', () => {
  it('registers an auto-updating standalone manifest with install icons', () => {
    expect(viteConfig).toContain('VitePWA');
    expect(viteConfig).toContain("registerType: 'autoUpdate'");
    expect(viteConfig).toContain("display: 'standalone'");
    expect(viteConfig).toContain("sizes: '192x192'");
    expect(viteConfig).toContain("sizes: '512x512'");
  });

  it('keeps client-side routes available from the offline app shell', () => {
    expect(viteConfig).toContain("navigateFallback: '/index.html'");
  });
});
