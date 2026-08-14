/**
 * Endpoint serverless (Vercel) que renderiza o Open Graph de cada item
 * compartilhável do site — posts do feed e veículos (base + custom do Supabase).
 *
 * Rota: /api/og?id=<shareId>  (alcançável também via /p/<shareId> graças ao
 * rewrite em vercel.json).
 *
 * Crawlers (WhatsApp, Facebook, X, Telegram...) não executam JS do SPA, então
 * este endpoint devolve HTML estático com as meta tags og:* corretas de cada item.
 *
 * IMPORTANTE: este arquivo NÃO importa nada de ../src — o Vercel empacota a pasta
 * api/ com nft e imports relativos para src/ quebram no runtime. Os dados
 * estáticos abaixo espelham src/data (posts do feed + veículos base) e a leitura
 * do Supabase usa apenas o client npm (node_modules).
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
const DEFAULT_IMAGE = '/assets/images/af-logo-192.png';

const normalizeShareKey = (raw: string): string =>
  raw.toLowerCase().replace(/[^a-z0-9]/g, '');

// ---------------------------------------------------------------------------
// Dados estáticos espelhados de src/data/instagramPosts.ts e
// src/services/customVehicleService.ts (INITIAL_DEFAULT_VEHICLES).
// Mantidos aqui para que a função funcione sem depender de imports de src/.
// ---------------------------------------------------------------------------
const STATIC_SHARE_ITEMS: Omit<ShareItemResult, 'siteUrl' | 'redirectUrl'>[] = [
  // --- Posts do feed (Instagram) ---
  {
    kind: 'instagram',
    id: 'post-por-911-1973',
    shareId: 'INSTA-911-73',
    title: 'Porsche 911 Targa (1973) — Encontro de Clássicos',
    description:
      'Detalhes únicos de restauração e preservação do Porsche 911 Targa. Uma verdadeira joia em tom Verde Irish Green de 1973. Acompanhe os detalhes da curadoria @studiosenhorele.',
    image: '/assets/images/porsche-911-classic-1973.jpg',
    permalink: 'https://www.instagram.com/p/C1234567890/',
  },
  {
    kind: 'instagram',
    id: 'post-vw-kombi-corujinha',
    shareId: 'INSTA-KMB-70',
    title: 'VW Kombi Corujinha 1970 — Saia e Blusa Lotus',
    description:
      'Ícone da cultura Air-Cooled nacional. Kombi Corujinha de 6 portas restaurada nos mínimos detalhes. Disponível para consulta de curadoria no acervo Studio SenhorEle.',
    image: '/assets/images/vw-kombi-corujinha-1970.jpg',
    permalink: 'https://www.instagram.com/p/C0987654321/',
  },
  {
    kind: 'instagram',
    id: 'post-fusca-cal-style',
    shareId: 'INSTA-FSC-68',
    title: 'VW Fusca Cal Style 1968 — California Heritage',
    description:
      'A essência do Cal-Look com suspensão encurtada, motor 1600cc de dupla carburação e acabamento impecável. Foto oficial no Box 767. Entre em contato para saber mais.',
    image: '/assets/images/vw-fusca-cal-style-1968.jpg',
    permalink: 'https://www.instagram.com/p/C9988776655/',
  },
  {
    kind: 'instagram',
    id: 'post-aero-willys-1967',
    shareId: 'INSTA-AWL-67',
    title: 'Aero Willys 1967 — Origem do Acervo',
    description:
      'O modelo que deu início à trajetória do Studio SenhorEle. Aero Willys 1967 em estado de conservação primoroso e interior 100% original. Confira os detalhes no feed!',
    image: '/assets/images/aero-willys-1967.jpg',
    permalink: 'https://www.instagram.com/p/C5544332211/',
  },
  {
    kind: 'instagram',
    id: 'post-boxer-aircooled',
    shareId: 'INSTA-BOX-767',
    title: 'Preparação Box 767 — Motor Boxer Air Cooled',
    description:
      'Bastidores da preparação de motores Boxer refrigerados a ar. Arte artesanal, acerto fino e paixão pela mecânica clássica Volkswagen e Porsche.',
    image: '/assets/images/aircooled-box-767.jpg',
    permalink: 'https://www.instagram.com/p/C1122334455/',
  },
  {
    kind: 'instagram',
    id: 'post-curadoria-senhorele',
    shareId: 'INSTA-SRL-06',
    title: 'Curadoria SenhorEle — Preservação de Raros',
    description:
      'Processo de avaliação de originalidade e proveniência histórica. Preservando a cultura antigomobilista e conectando apaixonados a exemplares únicos.',
    image: '/assets/images/logo-senhorele-192.jpg',
    permalink: 'https://www.instagram.com/studiosenhorele/',
  },

  // --- Veículos base do acervo ---
  {
    kind: 'vehicle',
    id: 'porsche-911',
    shareId: 'SRL-911-1973',
    title: 'Porsche 911 Classic',
    subtitle: 'Matching Numbers • 1973',
    year: '1973',
    description:
      'Exemplar ícone da engenharia alemã com números de chassi e motor 100% correspondentes. Interior em couro preto e rodas Fuchs de época.',
    image: '/assets/images/porsche-911-classic-1973.jpg',
  },
  {
    kind: 'vehicle',
    id: 'vw-kombi',
    shareId: 'SRL-KMB-1970',
    title: 'VW Kombi Corujinha',
    subtitle: 'Restored Heritage • 1970',
    year: '1970',
    description:
      'Restauração minuciosa no padrão de fábrica. Tapeçaria em tom palha, janelas saia e blusa impecáveis e motor 1500cc revisado.',
    image: '/assets/images/vw-kombi-corujinha-1970.jpg',
  },
  {
    kind: 'vehicle',
    id: 'vw-fusca-cal',
    shareId: 'SRL-FSC-1968',
    title: 'VW Fusca Cal Style',
    subtitle: 'Air Cooled Custom • 1968',
    year: '1968',
    description:
      'Estilo clássico da califórnia anos 60. Suspensão catracada, rodas BRM originais e mecânica boxer retrabalhada.',
    image: '/assets/images/vw-fusca-cal-style-1968.jpg',
  },
  {
    kind: 'vehicle',
    id: 'aero-willys',
    shareId: 'SRL-AWL-1967',
    title: 'Aero Willys',
    subtitle: 'Original Impecável • 1967',
    year: '1967',
    description:
      'Sedã executivo de luxo nacional com motor 6 cilindros em linha Willys Overland. Painel e mostradores em jacarandá preservados.',
    image: '/assets/images/aero-willys-1967.jpg',
  },
  {
    kind: 'vehicle',
    id: 'aircooled-box-767',
    shareId: 'SRL-BOX-1976',
    title: 'Air Cooled Box 767',
    subtitle: 'German Vintage Engineering • 1976',
    year: '1976',
    description:
      'Projeto exclusivo com preparação esportiva para motores boxer refrigerados a ar. Coletor em inox e instrumentos de precisão.',
    image: '/assets/images/aircooled-box-767.jpg',
  },
  {
    kind: 'vehicle',
    id: 'vw-fusca-1994',
    shareId: 'SRL-FSC-1994',
    title: 'VW Fusca Itamar',
    subtitle: 'Edição Especial de Coleção • 1994',
    year: '1994',
    description:
      'Raro exemplar da série de religamento presidencial de 1994. Tapeçaria xadrez original, volante de dois raios e manual carimbado.',
    image: '/assets/images/vw-fusca-cal-style-1968.jpg',
  },
  {
    kind: 'vehicle',
    id: 'porsche-911-carrera-1989',
    shareId: 'SRL-911-1989',
    title: 'Porsche 911 Carrera 3.2',
    subtitle: 'G50 Gearbox Classic • 1989',
    year: '1989',
    description:
      'O ápice da era clássica dos Porsche 911 arrefecidos a ar com o cobiçado câmbio Getrag G50. Teto solar elétrico e rodas Fuchs 16".',
    image: '/assets/images/porsche-911-classic-1973.jpg',
  },
];

const buildShareItemResult = (
  item: Omit<ShareItemResult, 'siteUrl' | 'redirectUrl'>,
  origin: string
): ShareItemResult => {
  const shareId = encodeURIComponent(item.shareId);
  const siteUrl =
    item.kind === 'vehicle' ? `${origin}/?v=${shareId}` : `${origin}/#instagram-feed`;
  return { ...item, siteUrl, redirectUrl: `${origin}/p/${shareId}` };
};

const findStaticShareItem = (
  rawId: string
): Omit<ShareItemResult, 'siteUrl' | 'redirectUrl'> | null => {
  const key = normalizeShareKey(rawId);
  if (!key) return null;
  return (
    STATIC_SHARE_ITEMS.find(
      (i) => normalizeShareKey(i.shareId) === key || normalizeShareKey(i.id) === key
    ) || null
  );
};

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

const renderPage = (result: ShareItemResult, origin: string): string => {
  const title = escapeHtml(result.title);
  const description = escapeHtml(result.description || 'Studio Senhor Ele — clique para ver o conteúdo.');
  const sourceImage = absolutize(result.image || DEFAULT_IMAGE, origin);
  const image = result.kind === 'vehicle'
    ? `${origin}/api/og-image?id=${encodeURIComponent(result.shareId)}&v=3`
    : sourceImage;
  const imageAttribute = escapeHtml(image);
  const shareUrl = absolutize(`/p/${result.shareId}`, origin);
  const tag = result.kind === 'vehicle' ? 'Veículo' : 'Post';
  const isInstagram = result.kind === 'instagram';

  const contentHtml =
    result.kind === 'vehicle'
      ? [
          `<div class="chip">${escapeHtml(result.year ? `• ${result.year}` : '')}</div>`.trim(),
        ].join('')
      : '';

  const linksHtml =
    isInstagram && result.permalink
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
  <meta property="og:image" content="${imageAttribute}" />
  <meta property="og:image:secure_url" content="${imageAttribute}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${title}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageAttribute}" />

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
    <img class="cover" src="${imageAttribute}" alt="${title}" />
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

  const staticItem = findStaticShareItem(key);
  if (staticItem) {
    const result = buildShareItemResult(staticItem, origin);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderPage(result, origin));
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
