import { afterEach, describe, expect, it, vi } from 'vitest';
import { StudioUpdateService } from '../src/services/studioUpdateService';

const request = vi.hoisted(() => vi.fn<typeof fetch>());
vi.mock('../src/services/supabaseService', async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const client = createClient('https://studio.example.test', 'public-test-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: request },
  });
  return { getSupabaseClient: () => client };
});

afterEach(() => {
  request.mockReset();
  vi.useRealTimers();
});

describe('manual event calendar', () => {
  it('reads published manual events by start or end, independently of the 30-day diary window', async () => {
    const now = '2026-11-18T12:00:00.000Z';
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);
    const start = '2026-12-20T12:00:00Z';
    request.mockResolvedValue(Response.json([{
      id: 7, title: 'Encontro', event_starts_at: start, location: 'São Paulo',
      published_at: '2026-08-01T10:00:00Z',
    }], { headers: { 'content-range': '6-6/7' } }));

    const result = await StudioUpdateService.fetchUpcomingEventsPage(2);
    const url = new URL(String(request.mock.calls[0][0]));
    expect(url.pathname).toBe('/rest/v1/studio_updates');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      editorial_status: 'eq.published', platform: 'eq.manual', content_type: 'eq.event',
      event_starts_at: 'not.is.null', or: `(event_starts_at.gte.${now},event_ends_at.gte.${now})`,
      order: 'event_starts_at.asc,id.asc', offset: '6', limit: '6',
    });
    expect(url.searchParams.has('featured_until')).toBe(false);
    expect(result).toMatchObject({ page: 2, total: 7, items: [{ id: 7, eventStartsAt: start, location: 'São Paulo' }] });
  });

  it('publishes the announcement with its own publication date and a separate event date', async () => {
    request.mockResolvedValue(new Response(null, { status: 201 }));
    await StudioUpdateService.createManual({
      title: 'Encontro', summary: '', authorName: 'Studio', contentType: 'event',
      publishedAt: '2026-11-18T12:00:00Z', eventStartsAt: '2027-01-20T12:00:00Z', location: 'São Paulo',
    });
    const init = request.mock.calls[0][1]!;
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toMatchObject({
      platform: 'manual', content_type: 'event', editorial_status: 'published',
      published_at: '2026-11-18T12:00:00Z', event_starts_at: '2027-01-20T12:00:00Z', location: 'São Paulo',
    });
  });

  it('clears a removed end date in storage and preserves the start on a partial edit', async () => {
    request.mockResolvedValue(new Response(null, { status: 204 }));
    await StudioUpdateService.update(7, { eventEndsAt: '' });
    const [url, init] = request.mock.calls[0];
    expect(new URL(String(url)).searchParams.get('id')).toBe('eq.7');
    const body = JSON.parse(String(init?.body));
    expect(body.event_ends_at).toBeNull();
    expect(body).not.toHaveProperty('event_starts_at');
  });

  it('recovers an expired last page and still surfaces other database errors', async () => {
    request.mockResolvedValueOnce(Response.json({ code: 'PGRST103', message: 'Range not satisfiable' }, { status: 416 }));
    expect(await StudioUpdateService.fetchUpcomingEventsPage(2)).toMatchObject({ items: [], total: 0 });
    request.mockResolvedValueOnce(Response.json({ message: 'Calendar unavailable' }, { status: 403 }));
    await expect(StudioUpdateService.fetchUpcomingEventsPage()).rejects.toThrow('Calendar unavailable');
  });
});
