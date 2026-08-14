import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { findStaticShareItem, normalizeShareKey } from './og-share-data';

type Handler = (req: any, res: any) => Promise<void> | void;

const SUPABASE_URL = 'https://rucqvvollyrlgyekoelq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_BAB7c_Baja_BHKFJvws7hg_HzHRIVAr';

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

const renderFromSource = async (
  res: any,
  source: Buffer | string,
): Promise<void> => {
  const upstream =
    typeof source === 'string'
      ? await fetch(source, {
          headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*' },
        })
      : null;

  let input: Buffer;
  if (upstream) {
    if (!upstream.ok) throw new Error(`Source returned ${upstream.status}`);
    input = Buffer.from(await upstream.arrayBuffer());
  } else {
    input = Buffer.isBuffer(source) ? source : Buffer.from(source);
  }

  const body = await sharp(input)
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

    const staticItem = findStaticShareItem(key);
    if (staticItem?.image) {
      await renderFromSource(res, absolutize(staticItem.image, origin));
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