/**
 * Endpoint serverless (Vercel) que renderiza o Open Graph de cada item
 * compartilhável do site — posts do feed e veículos (base + custom do Supabase).
 *
 * Rota: /api/og?id=<shareId>  (alcançável também via /p/<shareId> graças ao
 * rewrite em vercel.json).
 *
 * Crawlers (WhatsApp, Facebook, X, Telegram...) não executam JS do SPA, então
 * este endpoint devolve HTML estático com as meta tags og:* corretas de cada item.
 */
import { createClient } from '@supabase/supabase-js';

type Handler = (req: any, res: any) => Promise<void> | void;

interface ShareItemResult {
  kind: 'instagram' | 'vehicle';
  id: string;
  shareId: string;
  title: string;
  description: string;
  image: string;
  permalink?: string;
  subtitle?: string;
  year?: string;
  siteUrl: string;
  redirectUrl: string;
}

const SITE_NAME = 'Studio Senhor Ele';
const SUPABASE_URL = 'https://rucqvvollyrlgyekoelq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_BAB7c_Baja_BHKFJvws7hg_HzHRIVAr';

const normalizeShareKey = (raw: string): string =>
  raw.toLowerCase().replace(/[^a-z0-9]/g, '');

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

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

async function findCustomVehicle(id: string, origin: string): Promise<ShareItemResult | null> {
  const key = normalizeShareKey(id);
  if (!key) return null;

  try {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await client
      .from('custom_vehicles')
      .select('share_id, id, title, subtitle, image, year, engine, transmission, description, status')
      .in('status', ['published', 'reserved'])
      .limit(200);

    if (error || !data || data.length === 0) return null;

    const row: any = data.find(
      (vehicle: any) =>
        normalizeShareKey(String(vehicle.share_id || '')) === key ||
        normalizeShareKey(String(vehicle.id || '')) === key,
    );
    if (!row) return null;

    const shareId = row.share_id || id;
    const encodedShareId = encodeURIComponent(shareId);
    return {
      kind: 'vehicle' as const,
      id: row.id || shareId,
      shareId,
      title: row.title || 'Veículo — Studio Senhor Ele',
      description: row.description || row.subtitle || 'Conheça este veículo no acervo.',
      image: row.image || '',
      subtitle: row.subtitle,
      year: String(row.year || ''),
      siteUrl: `${origin}/?v=${encodedShareId}`,
      redirectUrl: `${origin}/p/${encodedShareId}`,
    };
  } catch {
    return null;
  }
}

const renderPage = (
  result: ShareItemResult,
  origin: string
): string => {
  const title = escapeHtml(result.title);
  const description = escapeHtml(result.description || 'Studio Senhor Ele — clique para ver o conteúdo.');
  const image = absolutize(result.image || '/assets/images/af-logo-192.png', origin);
  const shareUrl = absolutize(`/p/${result.shareId}`, origin);
  const tag = result.kind === 'vehicle' ? 'Veículo' : 'Post';
  const isInstagram = result.kind === 'instagram';

  const contentHtml =
    result.kind === 'vehicle'
      ? [
          `<div class="chip">${escapeHtml(result.year ? `• ${result.year}` : '')}</div>`.trim(),
        ].join('')
      : '';

  const linksHtml = isInstagram && result.permalink
    ? `<a class="btn btn-outline" href="${escapeHtml(result.permalink)}" rel="noopener">Ver no Instagram</a>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | ${SITE_NAME}</title>
  <link rel="canonical" href="${shareUrl}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${shareUrl}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:alt" content="${title}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #0d0d0d;
      color: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #161616;
      border: 1px solid #2a2a2a;
      border-radius: 20px;
      max-width: 640px;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,.55);
    }
    .cover { width: 100%; aspect-ratio: 16/10; object-fit: cover; display: block; background: #222; }
    .body { padding: 24px; }
    .tag {
      display: inline-block;
      font-size: 11px;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #d4a45a;
      border: 1px solid #d4a45a55;
      border-radius: 999px;
      padding: 4px 12px;
      margin-bottom: 14px;
    }
    .chip {
      display: inline-block;
      font-size: 12px;
      color: #aaa;
      margin-left: 8px;
    }
    h1 { font-size: 24px; line-height: 1.3; margin-bottom: 10px; font-weight: 700; }
    p { color: #c9c9c9; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn {
      display: inline-block;
      padding: 12px 20px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: opacity .15s;
    }
    .btn:hover { opacity: .85; }
    .btn-primary { background: #d4a45a; color: #141414; }
    .btn-outline { border: 1px solid #444; color: #eee; }
  </style>
</head>
<body>
  <main class="card">
    <img class="cover" src="${image}" alt="${title}" />
    <div class="body">
      <span class="tag">${tag}${contentHtml}</span>
      <h1>${title}</h1>
      <p>${description}</p>
      <div class="actions">
        <a class="btn btn-primary" href="${result.siteUrl}">Ver no site</a>
        ${linksHtml}
      </div>
    </div>
  </main>
</body>
</html>`;

  return html;
};

const renderNotFound = (origin: string): string => {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${SITE_NAME}</title>
  <meta property="og:title" content="${SITE_NAME}" />
  <meta property="og:description" content="Veículos clássicos, raridades e histórias de colecionador." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${origin}/" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0d0d0d; color: #f5f5f5;
      min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; text-align: center;
    }
    h1 { font-size: 22px; margin-bottom: 12px; }
    p { color: #aaa; margin-bottom: 24px; }
    a { color: #d4a45a; font-weight: 600; }
  </style>
</head>
<body>
  <div>
    <h1>Conteúdo não encontrado</h1>
    <p>O item que você procura pode ter sido removido ou ainda não foi publicado.</p>
    <a href="${origin}/">Voltar ao ${SITE_NAME}</a>
  </div>
</body>
</html>`;
  return html;
};

const handler: Handler = async (req, res) => {
  try {
    await handle(req, res);
  } catch (err: any) {
    console.error('[og] unhandled error', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`OG_ERROR: ${err?.message || err}\n${err?.stack || ''}`);
  }
};

async function handle(req: any, res: any) {
  const origin = buildOrigin(req);
  const rawId = String(req.query?.id || '').trim();
  const key = normalizeShareKey(rawId);

  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=3600');

  if (!key) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderNotFound(origin));
    return;
  }

  const customItem = await findCustomVehicle(rawId, origin);
  if (customItem) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderPage(customItem, origin));
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(renderNotFound(origin));
}

export default handler;
