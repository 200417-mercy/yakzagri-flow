import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('PWA manifest', () => {
  const manifestPath = resolve(__dirname, '../../public/manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as {
    icons?: Array<{ src: string; sizes: string; type: string; purpose?: string }>;
  };

  it('declares an icons array', () => {
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons?.length).toBeGreaterThan(0);
  });

  it('includes 192x192 and 512x512 icons', () => {
    const sizes = manifest.icons?.map((icon) => icon.sizes) ?? [];
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });

  it('marks the 192x192 and 512x512 icons as maskable', () => {
    const maskable = (manifest.icons ?? []).filter((icon) =>
      (icon.purpose ?? '').split(/\s+/).includes('maskable'),
    );
    const maskableSizes = maskable.map((icon) => icon.sizes);
    expect(maskableSizes).toContain('192x192');
    expect(maskableSizes).toContain('512x512');
  });

  it('gives every icon a valid purpose value', () => {
    const validPurposes = new Set(['any', 'maskable', 'monochrome']);
    for (const icon of manifest.icons ?? []) {
      if (icon.purpose === undefined) continue;
      const tokens = icon.purpose.split(/\s+/).filter(Boolean);
      expect(tokens.length).toBeGreaterThan(0);
      for (const token of tokens) {
        expect(validPurposes.has(token)).toBe(true);
      }
    }
  });
});
