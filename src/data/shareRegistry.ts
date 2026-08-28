/**
 * Registro local dos veículos-base. Conteúdo do Diário e veículos cadastrados
 * são resolvidos diretamente no Supabase pelo endpoint Open Graph.
 */
import { INITIAL_DEFAULT_VEHICLES } from '../services/customVehicleService';

export interface ShareItem {
  kind: 'vehicle';
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

  return vehicles;
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
  const siteUrl = `${origin}/?v=${shareId}`;

  return {
    ...item,
    siteUrl,
    redirectUrl: `${origin}/p/${shareId}`,
  };
}
