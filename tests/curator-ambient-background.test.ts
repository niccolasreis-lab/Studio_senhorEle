import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const component = readFileSync(resolve('src/components/CuratorAmbientBackground.tsx'), 'utf8');
const styles = readFileSync(resolve('src/components/CuratorAmbientBackground.css'), 'utf8');
const admin = readFileSync(resolve('src/components/AdminModal.tsx'), 'utf8');

describe('Curator ambient background', () => {
  it('stays decorative and behind the authenticated admin interface', () => {
    expect(component).toContain('aria-hidden="true"');
    expect(styles).toContain('pointer-events: none');
    expect(admin).toContain('{isAuthenticated && <CuratorAmbientBackground />}');
    expect(admin).toContain('className="relative z-10 min-h-screen"');
  });

  it('uses restrained motion with a static reduced-motion composition', () => {
    expect(component).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(component).toContain("matchMedia('(hover: hover) and (pointer: fine)')");
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('stroke-dashoffset: 0');
    expect(styles).toMatch(/\.curator-ambient__particle,[\s\S]*?display: none;/);
  });

  it('reduces the mechanical composition on mobile and reacts to both cards', () => {
    expect(styles).toContain('@media (max-width: 640px)');
    expect(styles).toContain('.curator-ambient__instrument');
    expect(admin).toContain('data-curator-card="studio"');
    expect(admin).toContain('data-curator-card="guest"');
    expect(styles).toContain(':is(:hover, :focus-visible)');
  });

  it('keeps the palette free of pure black and avoids heavy visual dependencies', () => {
    expect(styles).not.toContain('#000000');
    expect(component).not.toMatch(/three|gsap|webgl|particle\.js/i);
  });
});
