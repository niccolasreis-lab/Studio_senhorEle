import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

type Handler = (req: any, res: any) => Promise<void> | void;

const SUPABASE_URL = 'https://rucqvvollyrlgyekoelq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_BAB7c_Baja_BHKFJvws7hg_HzHRIVAr';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10000;

const normalizeShareKey = (raw: string): string => raw.toLowerCase().replace(/[^a-z0-9]/g, '');

const STATIC_ITEM_BY_KEY: Record<string, { image: string; title: string; tag: string }> = {
  srl9111973: { image: '/assets/images/porsche-911-classic-1973.jpg', title: 'Porsche 911 Classic', tag: 'Coleção' },
  porsche911: { image: '/assets/images/porsche-911-classic-1973.jpg', title: 'Porsche 911 Classic', tag: 'Coleção' },
  srlkmb1970: { image: '/assets/images/vw-kombi-corujinha-1970.jpg', title: 'VW Kombi Corujinha', tag: 'Coleção' },
  vwkombi: { image: '/assets/images/vw-kombi-corujinha-1970.jpg', title: 'VW Kombi Corujinha', tag: 'Coleção' },
  srlfsc1968: { image: '/assets/images/vw-fusca-cal-style-1968.jpg', title: 'VW Fusca Cal Style', tag: 'Coleção' },
  vwfusacal: { image: '/assets/images/vw-fusca-cal-style-1968.jpg', title: 'VW Fusca Cal Style', tag: 'Coleção' },
  srlawl1967: { image: '/assets/images/aero-willys-1967.jpg', title: 'Aero Willys', tag: 'Coleção' },
  aerowillys: { image: '/assets/images/aero-willys-1967.jpg', title: 'Aero Willys', tag: 'Coleção' },
  srlbox1976: { image: '/assets/images/aircooled-box-767.jpg', title: 'Air Cooled Box 767', tag: 'Coleção' },
  aircooledbox767: { image: '/assets/images/aircooled-box-767.jpg', title: 'Air Cooled Box 767', tag: 'Coleção' },
  srlfsc1994: { image: '/assets/images/vw-fusca-cal-style-1968.jpg', title: 'VW Fusca Itamar', tag: 'Coleção' },
  vwfusca1994: { image: '/assets/images/vw-fusca-cal-style-1968.jpg', title: 'VW Fusca Itamar', tag: 'Coleção' },
  srl9111989: { image: '/assets/images/porsche-911-classic-1973.jpg', title: 'Porsche 911 Carrera 3.2', tag: 'Coleção' },
  porsche911carrera1989: { image: '/assets/images/porsche-911-classic-1973.jpg', title: 'Porsche 911 Carrera 3.2', tag: 'Coleção' },
};

const buildOrigin = (req: any): string => {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
};

const absolutize = (url: string, origin: string): string => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `${origin.startsWith('https') ? 'https:' : 'http:'}${url}`;
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

const trustedImageUrl = (rawUrl: string, origin: string): URL | null => {
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    const host = parsed.hostname.toLowerCase();
    const sameOrigin = parsed.origin === new URL(origin).origin;
    const trustedExternal = host === 'rucqvvollyrlgyekoelq.supabase.co'
      || host === 'i.ytimg.com'
      || host === 'yt3.ggpht.com'
      || host.endsWith('.cdninstagram.com')
      || host.endsWith('.fbcdn.net');
    return sameOrigin || trustedExternal ? parsed : null;
  } catch {
    return null;
  }
};

const fetchImage = async (sourceUrl: string, origin: string): Promise<Buffer | null> => {
  const trusted = trustedImageUrl(sourceUrl, origin);
  if (!trusted) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const upstream = await fetch(trusted, {
      headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*' },
      signal: controller.signal,
      redirect: 'error',
    });
    if (!upstream.ok || !upstream.body) return null;
    const contentType = upstream.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) return null;
    const reader = upstream.body.getReader();
    const chunks: Buffer[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_IMAGE_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const titleLines = (title: string): string[] => {
  const words = title.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lines: string[] = [];
  for (const word of words) {
    const current = lines[lines.length - 1];
    if (!current || (current.length + word.length + 1 > 32 && lines.length < 2)) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
  }
  if (lines.length > 2) lines.splice(2);
  if (lines[1]?.length > 38) lines[1] = `${lines[1].slice(0, 37).trimEnd()}…`;
  return lines.length ? lines : ['Studio SenhorEle'];
};

const overlaySvg = (title: string, tag: string) => {
  const lines = titleLines(title);
  return Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="34%" stop-color="#07100b" stop-opacity="0"/>
          <stop offset="100%" stop-color="#07100b" stop-opacity="0.96"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#shade)"/>
      <rect x="64" y="438" width="${Math.max(150, tag.length * 15 + 44)}" height="42" rx="12" fill="#b08332"/>
      <text x="86" y="466" fill="#101611" font-size="20" font-weight="700" font-family="Arial, sans-serif" letter-spacing="2">${escapeXml(tag.toUpperCase())}</text>
      ${lines.map((line, index) => `<text x="64" y="${535 + index * 58}" fill="#f2ead8" font-size="${lines.length === 1 ? 54 : 48}" font-weight="700" font-family="Georgia, serif">${escapeXml(line)}</text>`).join('')}
      <text x="1136" y="582" text-anchor="end" fill="#d7c59b" font-size="20" font-family="Arial, sans-serif">Studio SenhorEle</text>
    </svg>
  `);
};

const renderCard = async (res: any, sourceUrl: string | null, title: string, tag: string, origin: string): Promise<void> => {
  const source = sourceUrl ? await fetchImage(sourceUrl, origin) : null;
  const base = source
    ? sharp(source).rotate().resize(1200, 630, { fit: 'cover', position: 'centre' })
    : sharp({ create: { width: 1200, height: 630, channels: 3, background: '#142019' } });
  const body = await base
    .composite([{ input: overlaySvg(title, tag), top: 0, left: 0 }])
    .jpeg({ quality: 84, progressive: true, chromaSubsampling: '4:2:0' })
    .toBuffer();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Length', String(body.length));
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  res.setHeader('X-Robots-Tag', 'all');
  res.end(body);
};

const handler: Handler = async (req, res) => {
  try {
    const rawId = String(req.query?.id || '').trim();
    const key = normalizeShareKey(rawId);
    if (!key) {
      res.statusCode = 400;
      res.end('Invalid image id');
      return;
    }

    const origin = buildOrigin(req);
    const shareIdCandidate = rawId.toUpperCase();
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: vehicle, error } = await client
      .from('custom_vehicles')
      .select('id, share_id, image, title, collection_kind, status')
      .in('status', ['published', 'reserved'])
      .eq('share_id', shareIdCandidate)
      .maybeSingle();
    if (!error && vehicle) {
      await renderCard(res, vehicle.image ? absolutize(vehicle.image, origin) : null, vehicle.title || 'Veículo', vehicle.collection_kind === 'guest' ? 'Convidado do Studio' : 'Coleção', origin);
      return;
    }

    const staticItem = STATIC_ITEM_BY_KEY[key];
    if (staticItem) {
      await renderCard(res, absolutize(staticItem.image, origin), staticItem.title, staticItem.tag, origin);
      return;
    }

    const { data: update, error: updateError } = await client
      .from('studio_updates')
      .select('id, share_id, thumbnail_url, title, editorial_status')
      .eq('editorial_status', 'published')
      .eq('share_id', shareIdCandidate)
      .maybeSingle();
    if (updateError) throw updateError;
    if (!update) {
      res.statusCode = 404;
      res.end('Image not found');
      return;
    }
    await renderCard(res, update.thumbnail_url ? absolutize(update.thumbnail_url, origin) : null, update.title || 'Diário do Studio', 'Diário do Studio', origin);
  } catch (error) {
    console.error('[og-image] failed', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Unable to load preview image');
  }
};

export default handler;
