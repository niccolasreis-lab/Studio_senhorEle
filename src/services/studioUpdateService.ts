import { getSupabaseClient } from './supabaseService';

export type UpdatePlatform = 'instagram' | 'youtube' | 'manual';
export type UpdateStatus = 'pending' | 'published' | 'rejected';
export type UpdateContentType = 'image' | 'carousel' | 'reel' | 'video' | 'event' | 'note';
export type DisplayAspect = 'portrait' | 'landscape' | 'square';

export interface SocialSource {
  id: number;
  sourceKey: string;
  platform: 'instagram' | 'youtube';
  handle: string;
  displayName: string;
  description: string;
  editorialRole: 'official' | 'partner';
  publicUrl: string;
  avatarUrl?: string;
  isActive: boolean;
  lastSyncedAt?: string;
  lastSyncStatus?: 'ok' | 'error';
  lastSyncError?: string;
}

export interface StudioUpdate {
  id: number;
  sourceId?: number;
  shareId: string;
  externalId?: string;
  platform: UpdatePlatform;
  editorialRole: 'official' | 'partner' | 'manual';
  contentType: UpdateContentType;
  displayAspect: DisplayAspect;
  authorName: string;
  title: string;
  summary: string;
  thumbnailUrl?: string;
  canonicalUrl?: string;
  publishedAt: string;
  importedAt: string;
  editorialStatus: UpdateStatus;
  approvedAt?: string;
  featuredUntil?: string;
  eventStartsAt?: string;
  eventEndsAt?: string;
  location?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface StudioUpdatePage {
  items: StudioUpdate[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StudioUpdateCounts {
  featured: number;
  archived: number;
  hidden: number;
}

const pageRange = (page: number, pageSize: number) => {
  const safePage = Math.max(1, Math.trunc(page));
  const safePageSize = Math.min(50, Math.max(1, Math.trunc(pageSize)));
  const from = (safePage - 1) * safePageSize;
  return { page: safePage, pageSize: safePageSize, from, to: from + safePageSize - 1 };
};

const looksLikeLegacyEraDateTitle = (title: string) =>
  /^\d{1,2}\s+de\s+[\p{L}.]+\s+de\s+\d{1,3}\s+[\p{L}.]+$/iu.test(title.trim());

export const normalizeImportedTitle = (title: string, publishedAt: string) => {
  if (!looksLikeLegacyEraDateTitle(title)) return title;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    calendar: 'gregory',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(publishedAt));
};

const configuredClient = () => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase não configurado.');
  return client;
};

const mapUpdate = (row: any): StudioUpdate => ({
  id: Number(row.id),
  sourceId: row.source_id == null ? undefined : Number(row.source_id),
  shareId: row.share_id,
  externalId: row.external_id || undefined,
  platform: row.platform,
  editorialRole: row.editorial_role,
  contentType: row.content_type,
  displayAspect: row.display_aspect === 'portrait' || row.display_aspect === 'square'
    ? row.display_aspect
    : row.platform === 'youtube' && looksLikeLegacyEraDateTitle(String(row.title || ''))
      ? 'portrait'
      : 'landscape',
  authorName: row.author_name,
  title: normalizeImportedTitle(String(row.title || ''), row.published_at),
  summary: row.summary || '',
  thumbnailUrl: row.thumbnail_url || undefined,
  canonicalUrl: row.canonical_url || undefined,
  publishedAt: row.published_at,
  importedAt: row.imported_at,
  editorialStatus: row.editorial_status,
  approvedAt: row.approved_at || undefined,
  featuredUntil: row.featured_until || undefined,
  eventStartsAt: row.event_starts_at || undefined,
  eventEndsAt: row.event_ends_at || undefined,
  location: row.location || undefined,
  ctaLabel: row.cta_label || undefined,
  ctaUrl: row.cta_url || undefined,
});

const mapSource = (row: any): SocialSource => ({
  id: Number(row.id),
  sourceKey: row.source_key,
  platform: row.platform,
  handle: row.handle,
  displayName: row.display_name,
  description: row.description || '',
  editorialRole: row.editorial_role,
  publicUrl: row.public_url,
  avatarUrl: row.avatar_url || undefined,
  isActive: Boolean(row.is_active),
  lastSyncedAt: row.last_synced_at || undefined,
  lastSyncStatus: row.last_sync_status || undefined,
  lastSyncError: row.last_sync_error || undefined,
});

const toRow = (update: Partial<StudioUpdate>) => ({
  ...(update.sourceId !== undefined && { source_id: update.sourceId }),
  ...(update.shareId !== undefined && { share_id: update.shareId }),
  ...(update.externalId !== undefined && { external_id: update.externalId }),
  ...(update.platform !== undefined && { platform: update.platform }),
  ...(update.editorialRole !== undefined && { editorial_role: update.editorialRole }),
  ...(update.contentType !== undefined && { content_type: update.contentType }),
  ...(update.displayAspect !== undefined && { display_aspect: update.displayAspect }),
  ...(update.authorName !== undefined && { author_name: update.authorName }),
  ...(update.title !== undefined && { title: update.title }),
  ...(update.summary !== undefined && { summary: update.summary }),
  ...(update.thumbnailUrl !== undefined && { thumbnail_url: update.thumbnailUrl || null }),
  ...(update.canonicalUrl !== undefined && { canonical_url: update.canonicalUrl || null }),
  ...(update.publishedAt !== undefined && { published_at: update.publishedAt }),
  ...(update.editorialStatus !== undefined && { editorial_status: update.editorialStatus }),
  ...(update.approvedAt !== undefined && { approved_at: update.approvedAt || null }),
  ...(update.featuredUntil !== undefined && { featured_until: update.featuredUntil || null }),
  ...(update.eventStartsAt !== undefined && { event_starts_at: update.eventStartsAt || null }),
  ...(update.eventEndsAt !== undefined && { event_ends_at: update.eventEndsAt || null }),
  ...(update.location !== undefined && { location: update.location || null }),
  ...(update.ctaLabel !== undefined && { cta_label: update.ctaLabel || null }),
  ...(update.ctaUrl !== undefined && { cta_url: update.ctaUrl || null }),
  updated_at: new Date().toISOString(),
});

export const StudioUpdateService = {
  async fetchFeaturedPage(page = 1, pageSize = 6): Promise<StudioUpdatePage> {
    const client = configuredClient();
    const range = pageRange(page, pageSize);
    const now = new Date().toISOString();
    const { data, error, count } = await client
      .from('studio_updates')
      .select('*', { count: 'exact' })
      .eq('editorial_status', 'published')
      .gte('featured_until', now)
      .order('published_at', { ascending: false })
      .range(range.from, range.to);
    if (error) throw new Error(error.message);
    return { items: (data || []).map(mapUpdate), total: count || 0, page: range.page, pageSize: range.pageSize };
  },

  async fetchArchivePage(page = 1, pageSize = 6): Promise<StudioUpdatePage> {
    const client = configuredClient();
    const range = pageRange(page, pageSize);
    const now = new Date().toISOString();
    const { data, error, count } = await client
      .from('studio_updates')
      .select('*', { count: 'exact' })
      .eq('editorial_status', 'published')
      .or(`featured_until.is.null,featured_until.lt.${now}`)
      .order('published_at', { ascending: false })
      .range(range.from, range.to);
    if (error) throw new Error(error.message);
    return { items: (data || []).map(mapUpdate), total: count || 0, page: range.page, pageSize: range.pageSize };
  },

  async fetchPublishedByShareId(shareId: string): Promise<StudioUpdate | null> {
    const client = configuredClient();
    const { data, error } = await client
      .from('studio_updates')
      .select('*')
      .eq('share_id', shareId.trim().toUpperCase())
      .eq('editorial_status', 'published')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapUpdate(data) : null;
  },

  async fetchAdminPage(page = 1, pageSize = 12): Promise<StudioUpdatePage> {
    const client = configuredClient();
    const range = pageRange(page, pageSize);
    const { data, error, count } = await client
      .from('studio_updates')
      .select('*', { count: 'exact' })
      .order('imported_at', { ascending: false })
      .range(range.from, range.to);
    if (error) throw new Error(error.message);
    return { items: (data || []).map(mapUpdate), total: count || 0, page: range.page, pageSize: range.pageSize };
  },

  async fetchAdminCounts(): Promise<StudioUpdateCounts> {
    const client = configuredClient();
    const now = new Date().toISOString();
    const [featured, archived, hidden] = await Promise.all([
      client.from('studio_updates').select('id', { count: 'exact', head: true }).eq('editorial_status', 'published').gte('featured_until', now),
      client.from('studio_updates').select('id', { count: 'exact', head: true }).eq('editorial_status', 'published').or(`featured_until.is.null,featured_until.lt.${now}`),
      client.from('studio_updates').select('id', { count: 'exact', head: true }).in('editorial_status', ['pending', 'rejected']),
    ]);
    const failure = [featured.error, archived.error, hidden.error].find(Boolean);
    if (failure) throw new Error(failure.message);
    return { featured: featured.count || 0, archived: archived.count || 0, hidden: hidden.count || 0 };
  },

  async fetchSources(): Promise<SocialSource[]> {
    const client = configuredClient();
    const { data: sessionData } = await client.auth.getSession();
    const isAdmin = sessionData.session?.user.app_metadata?.role === 'admin';
    const publicColumns = 'id,source_key,platform,handle,display_name,description,editorial_role,public_url,avatar_url,is_active';
    const { data, error } = await client
      .from('social_sources')
      .select(isAdmin ? '*' : publicColumns)
      .order('id');
    if (error) throw new Error(error.message);
    return (data || []).map(mapSource);
  },

  async createManual(input: Pick<StudioUpdate, 'title' | 'summary' | 'publishedAt' | 'contentType' | 'authorName'> & Partial<StudioUpdate>): Promise<void> {
    const client = configuredClient();
    const randomId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const seed = randomId.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 48);
    const row = toRow({
      ...input,
      shareId: input.shareId || `DIA-MAN-${seed}`,
      platform: 'manual',
      editorialRole: 'manual',
      editorialStatus: 'published',
      displayAspect: input.displayAspect || 'landscape',
    });
    const { error } = await client.from('studio_updates').insert(row);
    if (error) throw new Error(error.message);
  },

  async update(id: number, patch: Partial<StudioUpdate>): Promise<void> {
    const client = configuredClient();
    const { error } = await client.from('studio_updates').update(toRow(patch)).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async setStatus(update: StudioUpdate, status: UpdateStatus): Promise<void> {
    // The database trigger is authoritative for approved_at/featured_until.
    // Keeping this transition server-side prevents client clock drift and
    // guarantees that rejected/pending rows clear prior approval metadata.
    await this.update(update.id, { editorialStatus: status });
  },

  async remove(id: number): Promise<void> {
    const client = configuredClient();
    const { error } = await client.from('studio_updates').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async syncNow(): Promise<{ status: string; imported: number }> {
    const client = configuredClient();
    const { data, error } = await client.functions.invoke('sync-social', { body: { trigger: 'admin' } });
    if (error) throw new Error(error.message);
    return data;
  },
};
