/**
 * Dados estáticos compartilhados entre os endpoints de Open Graph
 * (api/og.ts e api/og-image.ts). Mantidos self-contained: NÃO importam de
 * ../src — o Vercel empacota apenas a pasta api/ com nft, e imports relativos
 * para src/ quebram no runtime (ERR_MODULE_NOT_FOUND).
 *
 * Espelham src/data/instagramPosts.ts e
 * src/services/customVehicleService.ts (INITIAL_DEFAULT_VEHICLES).
 */
export interface StaticShareItem {
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

export const DEFAULT_IMAGE = '/assets/images/af-logo-192.png';

export const normalizeShareKey = (raw: string): string =>
  raw.toLowerCase().replace(/[^a-z0-9]/g, '');

export const STATIC_SHARE_ITEMS: StaticShareItem[] = [
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

export const findStaticShareItem = (
  rawId: string
): StaticShareItem | null => {
  const key = normalizeShareKey(rawId);
  if (!key) return null;
  return (
    STATIC_SHARE_ITEMS.find(
      (i) => normalizeShareKey(i.shareId) === key || normalizeShareKey(i.id) === key
    ) || null
  );
};