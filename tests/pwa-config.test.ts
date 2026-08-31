import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const viteConfig = readFileSync(resolve(process.cwd(), 'vite.config.ts'), 'utf8');
const entrypoint = readFileSync(resolve(process.cwd(), 'src/main.tsx'), 'utf8');
const pwaRegistration = readFileSync(resolve(process.cwd(), 'src/pwa.ts'), 'utf8');
const packageJson = readFileSync(resolve(process.cwd(), 'package.json'), 'utf8');

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

  it('actively reloads new deployments instead of leaving old clients on stale bundles', () => {
    expect(viteConfig).toContain('injectRegister: null');
    expect(entrypoint).toContain("import('./pwa')");
    expect(pwaRegistration).toContain("registerSW({");
    expect(pwaRegistration).toContain('immediate: true');
    expect(pwaRegistration).toContain('registration.update()');
    expect(pwaRegistration).toContain("cache: 'no-store'");
  });

  it('cleans historical build artifacts before generating the precache manifest', () => {
    expect(packageJson).toContain('node scripts/clean-dist.mjs && vite build');
    expect(viteConfig).toContain('cleanupOutdatedCaches: true');
    expect(viteConfig).toContain('emptyOutDir: true');
  });
});
