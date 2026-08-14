/**
 * Registro compartilhado de itens compartilháveis (posts do feed + veículos
 * do acervo) usado pelo endpoint /api/og para montar o Open Graph de cada
 * item. Fonte única de dados para os meta tags servidos aos crawlers.
 */
import { FALLBACK_INSTAGRAM_POSTS } from './instagramPosts';
import { INITIAL_DEFAULT_VEHICLES } from '../services/customVehicleService';

export interface ShareItem {
  kind: 'instagram' | 'vehicle';
  id: string;
  shareId: string;
  title: string;
  description: string;
  image: string;
  permalink?: string;
  subtitle?: string;
  year?: string;
}

export function normalizeShareKey(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function buildStaticShareItems(): ShareItem[] {
  const posts: ShareItem[] = FALLBACK_INSTAGRAM_POSTS.map((p) => ({
    kind: 'instagram',
    id: p.id,
    shareId: p.shareId,
    title: p.title,
    description: p.caption,
    image: p.mediaUrl,
    permalink: p.permalink,
  }));

  const vehicles: ShareItem[] = INITIAL_DEFAULT_VEHICLES.map((v) => ({
    kind: 'vehicle',
    id: v.id,
    shareId: v.shareId,
    title: v.title,
    description: v.description || v.subtitle,
    image: v.image,
    subtitle: v.subtitle,
    year: v.year,
  }));

  return [...posts, ...vehicles];
}

export function findStaticShareItem(rawId: string): ShareItem | null {
  const key = normalizeShareKey(rawId);
  if (!key) return null;
  return (
    buildStaticShareItems().find(
      (item) =>
        normalizeShareKey(item.shareId) === key || normalizeShareKey(item.id) === key
    ) || null
  );
}

export interface ShareItemResult extends ShareItem {
  siteUrl: string;
  redirectUrl: string;
}

export function buildShareItemResult(
  item: ShareItem,
  origin: string
): ShareItemResult {
  const shareId = encodeURIComponent(item.shareId);
  const siteUrl = item.kind === 'vehicle'
    ? `${origin}/?v=${shareId}`
    : `${origin}/#instagram-feed`;

  return {
    ...item,
    siteUrl,
    redirectUrl: `${origin}/p/${shareId}`,
  };
}
