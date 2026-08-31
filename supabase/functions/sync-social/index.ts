// @ts-nocheck -- This file targets the Supabase Deno runtime; the website's
// browser tsconfig cannot resolve Deno/npm: specifiers. Validate on deploy.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.111.0';

type Source = {
  id: number;
  source_key: string;
  platform: 'instagram' | 'youtube';
  handle: string;
  display_name: string;
  editorial_role: 'official' | 'partner';
  external_channel_id: string | null;
  uploads_playlist_id: string | null;
  profile_refreshed_at: string | null;
  last_synced_at: string | null;
};

type ImportedUpdate = {
  source_id: number;
  share_id: string;
  external_id: string;
  platform: 'instagram' | 'youtube';
  editorial_role: 'official' | 'partner';
  content_type: 'image' | 'carousel' | 'reel' | 'video';
  display_aspect: 'portrait' | 'landscape' | 'square';
  author_name: string;
  title: string;
  summary: string;
  thumbnail_url: string | null;
  canonical_url: string;
  published_at: string;
  editorial_status: 'published';
};

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info, x-sync-secret',
  'access-control-allow-methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json; charset=utf-8' },
  });

const cleanError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/(access_token|api[_-]?key|key|secret)=([^&\s]+)/gi, '$1=[redacted]')
    .replace(/\b(Bearer|sb_secret_)\s*[A-Za-z0-9._-]+/gi, '$1 [redacted]')
    .slice(0, 500);
};

const shareIdFor = (platform: string, externalId: string) =>
  `DIA-${platform === 'youtube' ? 'YT' : 'IG'}-${externalId}`
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 96);

const captionTitle = (caption: string | null) => {
  const firstLine = (caption || '').split(/\r?\n/).find((line) => line.trim())?.trim();
  return (firstLine || 'Publicação do Studio SenhorEle').slice(0, 180);
};

const normalizeYouTubeTitle = (title: string, publishedAt: string) => {
  const legacyDateTitle = /^\d{1,2}\s+de\s+[\p{L}.]+\s+de\s+\d{1,3}\s+[\p{L}.]+$/iu.test(title.trim());
  if (!legacyDateTitle) return { title: title.slice(0, 180), portrait: false };
  return {
    title: new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'long',
      calendar: 'gregory',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date(publishedAt)),
    portrait: true,
  };
};

// The public YouTube API does not expose the source video's pixel aspect ratio.
// These overrides are therefore evidence-backed editorial metadata, not an
// inference from duration, thumbnails, or the Shorts URL surface.
const youtubeAspectOverrides = new Map<string, ImportedUpdate['display_aspect']>([
  ['zpCgm9P83Iw', 'portrait'],
  ['zM4Xta25FZk', 'portrait'],
  ['WRqgdPP1GwY', 'portrait'],
  ['t70DJ_HYyEM', 'portrait'],
]);

async function secretsMatch(expected: string, supplied: string) {
  const encoder = new TextEncoder();
  const [expectedHash, suppliedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
    crypto.subtle.digest('SHA-256', encoder.encode(supplied)),
  ]);
  const left = new Uint8Array(expectedHash);
  const right = new Uint8Array(suppliedHash);
  let mismatch = left.length ^ right.length;
  for (let index = 0; index < Math.min(left.length, right.length); index += 1) mismatch |= left[index] ^ right[index];
  return mismatch === 0;
}

async function authenticate(req: Request, supabaseUrl: string, publishableKey: string) {
  const configuredSecret = Deno.env.get('SYNC_CRON_SECRET');
  const suppliedSecret = req.headers.get('x-sync-secret');
  if (configuredSecret && suppliedSecret && await secretsMatch(configuredSecret, suppliedSecret)) return true;

  const authorization = req.headers.get('authorization');
  if (!authorization) return false;
  const authClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await authClient.auth.getUser();
  return !error && data.user?.app_metadata?.role === 'admin';
}

async function fetchJson(url: URL) {
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`${url.hostname} respondeu ${response.status}: ${detail}`);
  }
  return response.json();
}

async function syncYouTube(source: Source, apiKey: string): Promise<{ updates: ImportedUpdate[]; sourcePatch: Record<string, unknown> }> {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const profileRefreshDue = !source.external_channel_id
    || !source.uploads_playlist_id
    || !source.profile_refreshed_at
    || Date.now() - Date.parse(source.profile_refreshed_at) >= 7 * 24 * 60 * 60 * 1000;
  let channel: any = null;
  let uploadsPlaylistId = source.uploads_playlist_id;
  const sourcePatch: Record<string, unknown> = {};

  if (profileRefreshDue) {
    const channelUrl = new URL('https://www.googleapis.com/youtube/v3/channels');
    channelUrl.searchParams.set('part', 'snippet,contentDetails');
    channelUrl.searchParams.set('forHandle', source.handle);
    channelUrl.searchParams.set('key', apiKey);
    const channelPayload = await fetchJson(channelUrl);
    channel = channelPayload.items?.[0];
    if (!channel?.id) throw new Error(`Canal ${source.handle} não encontrado.`);
    uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) throw new Error(`Playlist de uploads indisponível para ${source.handle}.`);
    Object.assign(sourcePatch, {
      display_name: channel.snippet?.title || source.display_name,
      description: String(channel.snippet?.description || '').slice(0, 5000),
      avatar_url: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url || null,
      external_channel_id: channel.id,
      uploads_playlist_id: uploadsPlaylistId,
      profile_refreshed_at: new Date().toISOString(),
    });
  }

  if (!uploadsPlaylistId) throw new Error(`Playlist de uploads indisponível para ${source.handle}.`);

  const items: any[] = [];
  let pageToken: string | undefined;
  do {
    const playlistUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    playlistUrl.searchParams.set('part', 'snippet,contentDetails,status');
    playlistUrl.searchParams.set('playlistId', uploadsPlaylistId);
    playlistUrl.searchParams.set('maxResults', '50');
    playlistUrl.searchParams.set('key', apiKey);
    if (pageToken) playlistUrl.searchParams.set('pageToken', pageToken);
    const playlistPayload = await fetchJson(playlistUrl);
    const pageItems = playlistPayload.items || [];
    items.push(...pageItems);
    const reachedCutoff = pageItems.some((item: any) => {
      const publishedAt = item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt;
      return publishedAt && Date.parse(publishedAt) < cutoff;
    });
    pageToken = reachedCutoff ? undefined : playlistPayload.nextPageToken;
  } while (pageToken);

  const videoIds = items
    .filter((item: any) => {
      const publishedAt = item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt;
      return publishedAt && Date.parse(publishedAt) >= cutoff;
    })
    .map((item: any) => item.contentDetails?.videoId)
    .filter(Boolean);
  const videoBatches: string[][] = [];
  for (let index = 0; index < videoIds.length; index += 50) videoBatches.push(videoIds.slice(index, index + 50));
  const videoPayloads = await Promise.all(videoBatches.map((ids) => {
    const videoUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videoUrl.searchParams.set('part', 'snippet,status');
    videoUrl.searchParams.set('id', ids.join(','));
    videoUrl.searchParams.set('key', apiKey);
    return fetchJson(videoUrl);
  }));
  const videos = new Map(videoPayloads.flatMap((payload: any) => payload.items || []).map((video: any) => [video.id, video]));

  const updates: ImportedUpdate[] = [];
  for (const item of items) {
    const externalId = item.contentDetails?.videoId;
    const video: any = videos.get(externalId);
    const publishedAt = item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt;
    if (!externalId || !publishedAt || Date.parse(publishedAt) < cutoff) continue;
    if (item.status?.privacyStatus !== 'public' || video?.status?.privacyStatus !== 'public') continue;
    if (video?.snippet?.liveBroadcastContent && video.snippet.liveBroadcastContent !== 'none') continue;

    const snippet = video?.snippet || item.snippet;
    const thumbnails = snippet?.thumbnails || {};
    const normalizedTitle = normalizeYouTubeTitle(String(snippet?.title || ''), publishedAt);
    updates.push({
      source_id: source.id,
      share_id: shareIdFor('youtube', externalId),
      external_id: externalId,
      platform: 'youtube',
      editorial_role: source.editorial_role,
      content_type: 'video',
      display_aspect: youtubeAspectOverrides.get(externalId) || (normalizedTitle.portrait ? 'portrait' : 'landscape'),
      author_name: snippet?.channelTitle || source.display_name,
      title: normalizedTitle.title,
      summary: String(snippet?.description || '').slice(0, 5000),
      thumbnail_url: thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || null,
      canonical_url: `https://www.youtube.com/watch?v=${externalId}`,
      published_at: publishedAt,
      editorial_status: 'published',
    });
  }

  return {
    updates,
    sourcePatch,
  };
}

async function syncInstagram(source: Source, accessToken: string, userId: string): Promise<{ updates: ImportedUpdate[]; sourcePatch: Record<string, unknown> }> {
  const graphVersion = Deno.env.get('INSTAGRAM_GRAPH_API_VERSION') || 'v23.0';
  if (!/^v\d+\.\d+$/.test(graphVersion)) throw new Error('INSTAGRAM_GRAPH_API_VERSION inválida.');
  const mediaUrl = new URL(`https://graph.instagram.com/${graphVersion}/${encodeURIComponent(userId)}/media`);
  mediaUrl.searchParams.set('fields', 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,username');
  mediaUrl.searchParams.set('limit', '50');
  mediaUrl.searchParams.set('access_token', accessToken);
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const media: any[] = [];
  let nextUrl: URL | null = mediaUrl;

  while (nextUrl) {
    const payload = await fetchJson(nextUrl);
    const pageItems = payload.data || [];
    media.push(...pageItems);
    const reachedCutoff = pageItems.some((item: any) => item.timestamp && Date.parse(item.timestamp) < cutoff);
    if (reachedCutoff || !payload.paging?.next) break;
    const candidate = new URL(payload.paging.next);
    if (candidate.hostname !== 'graph.instagram.com') throw new Error('Paginação do Instagram retornou um host inesperado.');
    nextUrl = candidate;
  }

  const updates: ImportedUpdate[] = media
    .filter((item: any) => item.id && item.timestamp && Date.parse(item.timestamp) >= cutoff)
    .filter((item: any) => typeof item.permalink === 'string' && item.permalink.startsWith('https://'))
    .filter((item: any) => ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'].includes(item.media_type))
    .map((item: any) => ({
      source_id: source.id,
      share_id: shareIdFor('instagram', item.id),
      external_id: item.id,
      platform: 'instagram' as const,
      editorial_role: source.editorial_role,
      content_type: item.media_product_type === 'REELS' ? 'reel' : item.media_type === 'CAROUSEL_ALBUM' ? 'carousel' : item.media_type === 'VIDEO' ? 'reel' : 'image',
      display_aspect: item.media_product_type === 'REELS' ? 'portrait' : 'square',
      author_name: item.username ? `@${item.username}` : source.display_name,
      title: captionTitle(item.caption),
      summary: String(item.caption || '').slice(0, 5000),
      thumbnail_url: item.thumbnail_url || item.media_url || null,
      canonical_url: item.permalink,
      published_at: item.timestamp,
      editorial_status: 'published' as const,
    }));

  return { updates, sourcePatch: {} };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  if (!supabaseUrl || !serviceRoleKey || !publishableKey) return json({ error: 'Ambiente Supabase incompleto.' }, 500);
  if (!(await authenticate(req, supabaseUrl, publishableKey))) return json({ error: 'Não autorizado.' }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: run, error: runError } = await admin.from('social_sync_runs').insert({}).select('id').single();
  if (runError) return json({ error: 'Não foi possível iniciar o registro da sincronização.' }, 500);

  const { data: sources, error: sourcesError } = await admin.from('social_sources').select('*').eq('is_active', true).order('id');
  if (sourcesError) {
    const message = cleanError(sourcesError);
    await admin.from('social_sync_runs').update({
      finished_at: new Date().toISOString(),
      status: 'error',
      error_message: message,
    }).eq('id', run.id);
    return json({ error: message }, 500);
  }

  const results = await Promise.all(((sources || []) as Source[]).map(async (source): Promise<Record<string, unknown>> => {
    try {
      let synced: { updates: ImportedUpdate[]; sourcePatch: Record<string, unknown> };
      if (source.platform === 'youtube') {
        const apiKey = Deno.env.get('YOUTUBE_API_KEY');
        if (!apiKey) throw new Error('YOUTUBE_API_KEY não configurada.');
        synced = await syncYouTube(source, apiKey);
      } else {
        const accessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
        const userId = Deno.env.get('INSTAGRAM_USER_ID');
        if (!accessToken || !userId) throw new Error('Credenciais do Instagram não configuradas.');
        synced = await syncInstagram(source, accessToken, userId);
      }

      let insertedCount = 0;
      if (synced.updates.length) {
        const { data: inserted, error } = await admin
          .from('studio_updates')
          .upsert(synced.updates, {
            onConflict: 'source_id,external_id',
            ignoreDuplicates: true,
          })
          .select('id');
        if (error) throw error;
        insertedCount = inserted?.length || 0;
      }

      const { error: sourceUpdateError } = await admin.from('social_sources').update({
        ...synced.sourcePatch,
        last_synced_at: new Date().toISOString(),
        last_sync_status: 'ok',
        last_sync_error: null,
        updated_at: new Date().toISOString(),
      }).eq('id', source.id);
      if (sourceUpdateError) throw sourceUpdateError;
      return { source: source.source_key, status: 'ok', imported: insertedCount };
    } catch (error) {
      const message = cleanError(error);
      await admin.from('social_sources').update({
        last_sync_status: 'error',
        last_sync_error: message,
        updated_at: new Date().toISOString(),
      }).eq('id', source.id);
      return { source: source.source_key, status: 'error', error: message };
    }
  }));

  const importedCount = results.reduce((sum, result) => sum + Number(result.imported || 0), 0);
  const failures = results.filter((result) => result.status === 'error').length;
  const status = failures === 0 ? 'ok' : failures === results.length ? 'error' : 'partial';
  await admin.from('social_sync_runs').update({
    finished_at: new Date().toISOString(),
    status,
    imported_count: importedCount,
    source_results: results,
    error_message: failures ? `${failures} fonte(s) com erro.` : null,
  }).eq('id', run.id);

  return json({ status, imported: importedCount, sources: results }, status === 'error' ? 502 : 200);
});
