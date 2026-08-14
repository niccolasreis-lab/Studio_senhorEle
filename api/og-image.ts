import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

type Handler = (req: any, res: any) => Promise<void> | void;

const SUPABASE_URL = 'https://rucqvvollyrlgyekoelq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_BAB7c_Baja_BHKFJvws7hg_HzHRIVAr';

const normalizeShareKey = (raw: string): string =>
  raw.toLowerCase().replace(/[^a-z0-9]/g, '');

const handler: Handler = async (req, res) => {
  try {
    const rawId = String(req.query?.id || '').trim();
    const key = normalizeShareKey(rawId);
    if (!key) {
      res.statusCode = 400;
      res.end('Invalid image id');
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

    const upstream = await fetch(vehicle.image, {
      headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*' },
    });
    if (!upstream.ok) throw new Error(`Storage returned ${upstream.status}`);

    const source = Buffer.from(await upstream.arrayBuffer());
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
  } catch (error) {
    console.error('[og-image] failed', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Unable to load preview image');
  }
};

export default handler;
