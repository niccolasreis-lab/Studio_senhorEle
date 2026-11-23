import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../api/og';
import imageHandler from '../api/og-image';
import sharp from 'sharp';
import { diaryShareIdFromLocation } from '../src/utils/share';

const shareId = 'DIA-MAN-BEDE61F590C54910866FEB1A2B4ECF97';
const origin = 'https://colecaosrlaircooled.com.br';
const imageUrl = 'https://rucqvvollyrlgyekoelq.supabase.co/storage/v1/object/public/vehicle-images/event.jpg';
const row = {
  id: 99, share_id: shareId, title: 'Encontro & coleção', summary: 'Evento do Studio',
  thumbnail_url: imageUrl, editorial_status: 'published',
  event_starts_at: '2026-11-23T14:00:00Z', event_ends_at: '2026-11-23T18:00:00Z', location: 'São Paulo',
};
const response = () => ({ statusCode: 0, setHeader: vi.fn(), end: vi.fn() });
const request = { query: { id: shareId }, headers: { host: 'colecaosrlaircooled.com.br' } };

afterEach(() => vi.unstubAllGlobals());

describe('event share links', () => {
  it('opens the exact published event automatically while serving crawler metadata and a no-JS fallback', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith('/studio_updates')) {
        expect(url.searchParams.get('editorial_status')).toBe('eq.published');
        expect(url.searchParams.get('share_id')).toBe(`eq.${shareId}`);
        return Response.json(row);
      }
      return Response.json(null);
    }));
    const res = response();
    await handler(request, res);
    const html = String(res.end.mock.calls[0][0]);
    expect(res.statusCode).toBe(200);
    expect(html).toContain(`window.location.replace("${origin}/?d=${shareId}#diario")`);
    expect(html).toContain(`property="og:image" content="${origin}/api/og-image?id=${shareId}&amp;v=4"`);
    expect(html).toContain(`src="${imageUrl}"`);
    expect(html).toContain('23 de novembro de 2026');
    expect(html).toContain('São Paulo');
    expect(html).toContain('Encontro &amp; coleção');
    expect(res.setHeader).not.toHaveBeenCalledWith('Location', expect.anything());
  });

  it('does not open or expose unpublished/missing events', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(null)));
    const res = response();
    await handler(request, res);
    const html = String(res.end.mock.calls[0][0]);
    expect(html).toContain('Conteúdo não encontrado');
    expect(html).not.toContain('window.location.replace');
  });

  it('renders a public JPEG preview preserving a portrait poster', async () => {
    const poster = await sharp({ create: { width: 300, height: 600, channels: 3, background: '#ff0000' } }).png().toBuffer();
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL) => {
      if (String(input) === imageUrl) return new Response(new Uint8Array(poster), { headers: { 'content-type': 'image/png' } });
      return Response.json(String(input).includes('/studio_updates') ? row : null);
    }));
    const res = response();
    await imageHandler(request, res);
    expect(res.statusCode).toBe(200);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
    const output = res.end.mock.calls[0][0] as Buffer;
    expect(await sharp(output).metadata()).toMatchObject({ width: 1200, height: 630, format: 'jpeg' });
    const { data } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
    // Letterboxing retains the whole vertical image rather than cropping its top/bottom.
    expect(data[0]).toBeLessThan(50);
    expect(data[(600 * 3)]).toBeGreaterThan(200);
  });

  it('resolves exact event URLs even with an older SPA navigation cache', () => {
    expect(diaryShareIdFromLocation('', `/p/${shareId}`)).toBe(shareId);
    expect(diaryShareIdFromLocation(`?d=${shareId}`, '/')).toBe(shareId);
    expect(diaryShareIdFromLocation('', '/p/SRL-FSC-1968')).toBeNull();
    expect(diaryShareIdFromLocation('', '/p/%broken')).toBeNull();
  });
});
