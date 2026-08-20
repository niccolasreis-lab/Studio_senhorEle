import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

type Handler = (req: any, res: any) => Promise<void> | void;

const SUPABASE_URL = 'https://rucqvvollyrlgyekoelq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_BAB7c_Baja_BHKFJvws7hg_HzHRIVAr';

const normalizeShareKey = (raw: string): string =>
  raw.toLowerCase().replace(/[^a-z0-9]/g, '');

// ---------------------------------------------------------------------------
// Imagens dos itens estáticos (espelho de api/og.ts — STATIC_SHARE_ITEMS).
// Inline: cada função de api/ é empacotada individualmente pelo Vercel (nft),
// e imports relativos a outros módulos quebram no runtime.
// ---------------------------------------------------------------------------
const STATIC_IMAGE_BY_KEY: Record<string, string> = {
  insta91173: '/assets/images/porsche-911-classic-1973.jpg',
  postpor9111973: '/assets/images/porsche-911-classic-1973.jpg',
  instakmb70: '/assets/images/vw-kombi-corujinha-1970.jpg',
  postvwkombicorujinha: '/assets/images/vw-kombi-corujinha-1970.jpg',
  instafsc68: '/assets/images/vw-fusca-cal-style-1968.jpg',
  postfuscacalstyle: '/assets/images/vw-fusca-cal-style-1968.jpg',
  instaawl67: '/assets/images/aero-willys-1967.jpg',
  postaerowillys: '/assets/images/aero-willys-1967.jpg',
  instabox767: '/assets/images/aircooled-box-767.jpg',
  postboxeraircooled: '/assets/images/aircooled-box-767.jpg',
  instasrl06: '/assets/images/logo-senhorele-192.jpg',
  postcuradoriasenhorele: '/assets/images/logo-senhorele-192.jpg',
  srl9111973: '/assets/images/porsche-911-classic-1973.jpg',
  porsche911: '/assets/images/porsche-911-classic-1973.jpg',
  srlkmb1970: '/assets/images/vw-kombi-corujinha-1970.jpg',
  vwkombi: '/assets/images/vw-kombi-corujinha-1970.jpg',
  srljfsc1968: '/assets/images/vw-fusca-cal-style-1968.jpg',
  vwfusacal: '/assets/images/vw-fusca-cal-style-1968.jpg',
  srlawl1967: '/assets/images/aero-willys-1967.jpg',
  aerowillys: '/assets/images/aero-willys-1967.jpg',
  srlbox1976: '/assets/images/aircooled-box-767.jpg',
  aircooledbox767: '/assets/images/aircooled-box-767.jpg',
  srljfsc1994: '/assets/images/vw-fusca-cal-style-1968.jpg',
  vwfusca1994: '/assets/images/vw-fusca-cal-style-1968.jpg',
  srl9111989: '/assets/images/porsche-911-classic-1973.jpg',
  porsche911carrera1989: '/assets/images/porsche-911-classic-1973.jpg',
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

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10000;

const renderFromSource = async (res: any, sourceUrl: string): Promise<void> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(sourceUrl, {
      headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*' },
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === 'AbortError') throw new Error('Source fetch timed out');
    throw err;
  }
  clearTimeout(timeout);

  if (!upstream.ok) throw new Error(`Source returned ${upstream.status}`);
  if (!upstream.body) throw new Error('Source returned no body');

  const reader = upstream.body.getReader();
  const chunks: Buffer[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_IMAGE_BYTES) {
      await reader.cancel();
      throw new Error(`Source exceeds ${MAX_IMAGE_BYTES} bytes limit`);
    }
    chunks.push(Buffer.from(value));
  }

  const source = Buffer.concat(chunks);
  const body = await sharp(source)
    .rotate()
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, progressive: true, chromaSubsampling: '4:2:0' })
    .toBuffer();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Length', String(body.length));
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
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

    const staticImage = STATIC_IMAGE_BY_KEY[key];
    if (staticImage) {
      await renderFromSource(res, absolutize(staticImage, origin));
      return;
    }

    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client
      .from('custom_vehicles')
      .select('id, share_id, image, status')
      .in('status', ['published', 'reserved'])
      .limit(200);

    if (error) throw error;

    const vehicle = data?.find(
      (item: any) =>
        normalizeShareKey(String(item.share_id || '')) === key ||
        normalizeShareKey(String(item.id || '')) === key,
    );
    if (!vehicle?.image || !/^https:\/\//i.test(vehicle.image)) {
      res.statusCode = 404;
      res.end('Image not found');
      return;
    }

    await renderFromSource(res, vehicle.image);
  } catch (error) {
    console.error('[og-image] failed', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Unable to load preview image');
  }
};

export default handler;