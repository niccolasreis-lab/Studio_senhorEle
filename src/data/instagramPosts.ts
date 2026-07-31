export interface InstagramPost {
  id: string;
  shareId: string;
  title: string;
  caption: string;
  mediaUrl: string;
  permalink: string;
  timestamp: string;
  likeCount?: number;
  tags: string[];
}

export const FALLBACK_INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'post-por-911-1973',
    shareId: 'INSTA-911-73',
    title: 'Porsche 911 Targa (1973) — Encontro de Clássicos',
    caption: 'Detalhes únicos de restauração e preservação do Porsche 911 Targa. Uma verdadeira joia em tom Verde Irish Green de 1973. Acompanhe os detalhes da curadoria @studiosenhorele.',
    mediaUrl: '/assets/images/porsche-911-classic-1973.jpg',
    permalink: 'https://www.instagram.com/p/C1234567890/',
    timestamp: '2026-07-20T14:30:00Z',
    likeCount: 482,
    tags: ['porsche', 'aircooled', 'classic'],
  },
  {
    id: 'post-vw-kombi-corujinha',
    shareId: 'INSTA-KMB-70',
    title: 'VW Kombi Corujinha 1970 — Saia e Blusa Lotus',
    caption: 'Ícone da cultura Air-Cooled nacional. Kombi Corujinha de 6 portas restaurada nos mínimos detalhes. Disponível para consulta de curadoria no acervo Studio SenhorEle.',
    mediaUrl: '/assets/images/vw-kombi-corujinha-1970.jpg',
    permalink: 'https://www.instagram.com/p/C0987654321/',
    timestamp: '2026-07-15T18:00:00Z',
    likeCount: 619,
    tags: ['corujinha', 'aircooled', 'vw'],
  },
  {
    id: 'post-fusca-cal-style',
    shareId: 'INSTA-FSC-68',
    title: 'VW Fusca Cal Style 1968 — California Heritage',
    caption: 'A essência do Cal-Look com suspensão encurtada, motor 1600cc de dupla carburação e acabamento impecável. Foto oficial no Box 767. Entre em contato para saber mais.',
    mediaUrl: '/assets/images/vw-fusca-cal-style-1968.jpg',
    permalink: 'https://www.instagram.com/p/C9988776655/',
    timestamp: '2026-07-10T11:15:00Z',
    likeCount: 395,
    tags: ['fusca', 'calstyle', 'aircooled'],
  },
  {
    id: 'post-aero-willys-1967',
    shareId: 'INSTA-AWL-67',
    title: 'Aero Willys 1967 — Origem do Acervo',
    caption: 'O modelo que deu início à trajetória do Studio SenhorEle. Aero Willys 1967 em estado de conservação primoroso e interior 100% original. Confira os detalhes no feed!',
    mediaUrl: '/assets/images/aero-willys-1967.jpg',
    permalink: 'https://www.instagram.com/p/C5544332211/',
    timestamp: '2026-07-01T09:45:00Z',
    likeCount: 520,
    tags: ['willys', 'classic', 'heritage'],
  },
  {
    id: 'post-boxer-aircooled',
    shareId: 'INSTA-BOX-767',
    title: 'Preparação Box 767 — Motor Boxer Air Cooled',
    caption: 'Bastidores da preparação de motores Boxer refrigerados a ar. Arte artesanal, acerto fino e paixão pela mecânica clássica Volkswagen e Porsche.',
    mediaUrl: '/assets/images/aircooled-box-767.jpg',
    permalink: 'https://www.instagram.com/p/C1122334455/',
    timestamp: '2026-06-25T16:20:00Z',
    likeCount: 712,
    tags: ['aircooled', 'engine', 'box767'],
  },
  {
    id: 'post-curadoria-senhorele',
    shareId: 'INSTA-SRL-06',
    title: 'Curadoria SenhorEle — Preservação de Raros',
    caption: 'Processo de avaliação de originalidade e proveniência histórica. Preservando a cultura antigomobilista e conectando apaixonados a exemplares únicos.',
    mediaUrl: '/assets/images/logo-senhorele-192.jpg',
    permalink: 'https://www.instagram.com/studiosenhorele/',
    timestamp: '2026-06-20T10:00:00Z',
    likeCount: 540,
    tags: ['curadoria', 'senhorele', 'classic'],
  },
];
