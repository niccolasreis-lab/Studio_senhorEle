/**
 * Gerador editorial de fichas técnicas — Studio SenhorEle
 *
 * Recebe apenas MARCA + MODELO + ANO e devolve o conteúdo completo do card e
 * da ficha técnica detalhada. Regras editoriais aplicadas:
 *
 *  1. NUNCA inventa cor real, condição, restauração, preparação, proveniência,
 *     número de proprietários ou quilometragem.
 *  2. Qualquer campo sem informação confiável é ocultado (nunca "Não informado").
 *  3. A configuração é adaptada à fase correta do ano (ex.: Fusca 1950–1994).
 *  4. Havendo múltiplas versões no mesmo ano, usa apenas dados comuns e
 *     sinaliza a existência de variações.
 *  5. Share ID único no formato SRL-[MODELO]-[ANO].
 */

export interface VehiclePhase {
  from: number;
  to: number;
  phaseLabel: string;
  engine?: string;
  engineShort?: string;
  transmission?: string;
  transmissionShort?: string;
  displacement?: string;
  power?: string;
  torque?: string;
  fuel?: string;
  cooling?: string;
  intake?: string;
  drive?: string;
  weight?: string;
  characteristics: string[];
  variationsNote?: string;
}

export interface ModelEntry {
  matchKeys: string[];
  brand: string;
  displayName: string;
  rangeNote: string;
  intro: string;
  history: string[];
  curiosities: string[];
  phases: VehiclePhase[];
}

export interface GeneratedVehicleSpec {
  id: string;
  shareId: string;
  title: string;
  subtitle: string;
  year: string;
  image: string;
  // Card
  engine: string;
  transmission: string;
  // Ficha
  power?: string;
  torque?: string;
  displacement?: string;
  fuel?: string;
  cooling?: string;
  intake?: string;
  drive?: string;
  weight?: string;
  variationsNote?: string;
  presentation?: string;
  specs: { label: string; value: string }[];
  characteristics: VehiclePhase['characteristics'];
  history: string[];
  curiosities: string[];
  hasIndividualData: boolean;
}

const BASE_IMAGE = '/assets/images/vw-fusca-cal-style-1968.jpg';

const BRAND_IMAGES: Record<string, string> = {
  volkswagen: '/assets/images/vw-fusca-cal-style-1968.jpg',
  vw: '/assets/images/vw-fusca-cal-style-1968.jpg',
  porsche: '/assets/images/porsche-911-classic-1973.jpg',
  willys: '/assets/images/aero-willys-1967.jpg',
  aero: '/assets/images/aero-willys-1967.jpg',
  chevrolet: '/assets/images/aero-willys-1967.jpg',
  ford: '/assets/images/aero-willys-1967.jpg',
};

const MODELS: ModelEntry[] = [
  {
    matchKeys: ['fusca', 'beetle'],
    brand: 'Volkswagen',
    displayName: 'Volkswagen Fusca',
    rangeNote: 'Como produzido no Brasil entre 1950 e 1994.',
    intro:
      'Ícone absoluto da motorização nacional, o Fusca nasceu na Alemanha nos anos 30 e tornou-se, no Brasil, o carro-símbolo de gerações inteiras. Simples, econômico e com o inconfundível motor boxer refrigerado a ar, consolidou-se como o veículo mais fabricado de toda a história.',
    history: [
      'Projeto de Ferdinand Porsche e do engenheiro Erwin Komenda, apresentado na Alemanha em 1938 como o carro do povo (Volkswagen).',
      'As primeiras unidades chegaram ao Brasil ainda nas décadas de 30/40; a produção local em São Bernardo do Campo teve início nos anos 50.',
      'Por décadas foi o automóvel mais vendido do país, tanto na versão 1200 quanto nas evoluções 1300, 1500 e 1600.',
      'A produção brasileira foi suspensa em 1986 e retomada em 1993 na linha Série Ouro / "Fusca Itamar", marcando uma despedida memorável.',
    ],
    curiosities: [
      'Foi o primeiro carro a ultrapassar a marca de 20 milhões de unidades no mundo.',
      'O ronco característico vem do motor boxer de quatro cilindros com refrigeração a ar.',
      'O design curvo e a lanterna traseira tornaram-se linguagem visual reconhecida em qualquer época.',
    ],
    phases: [
      {
        from: 1950, to: 1961,
        phaseLabel: 'Fusca 1200 — primeira era',
        engine: '1.2L de 4 cilindros opostos, refrigerado a ar',
        engineShort: '1.2L Boxer A/C',
        transmission: 'Manual de 4 marchas',
        transmissionShort: 'Manual 4M',
        displacement: '1200 cm³',
        power: 'cerca de 30 cv (SAE)',
        fuel: 'Gasolina',
        cooling: 'Refrigerado a ar',
        intake: 'Carburador simples',
        drive: 'Tração traseira',
        weight: 'em torno de 730 kg',
        characteristics: [
          'Carburador simples e sistema elétrico de 6V.',
          'Visual herdado dos primeiros exemplares europeus, com para-choques cromados.',
          'Produção nacional em escala já consolidada no fim da década de 50.',
        ],
      },
      {
        from: 1962, to: 1967,
        phaseLabel: 'Fusca 1200 — fase consolidada',
        engine: '1.2L de 4 cilindros opostos, refrigerado a ar',
        engineShort: '1.2L Boxer A/C',
        transmission: 'Manual de 4 marchas',
        transmissionShort: 'Manual 4M',
        displacement: '1200 cm³',
        power: 'cerca de 32 cv (SAE)',
        fuel: 'Gasolina',
        cooling: 'Refrigerado a ar',
        intake: 'Carburador simples',
        drive: 'Tração traseira',
        characteristics: [
          'Design simples e funcional.',
          'Elétrico de 6V e lanternas de formato clássico.',
        ],
        variationsNote: 'Nesse período a versão 1200 era a dominante, co-literalmente sem grandes variações mecânicas entre anos.',
      },
      {
        from: 1968, to: 1973,
        phaseLabel: 'Fusca 1300',
        engine: '1.3L de 4 cilindros opostos, refrigerado a ar',
        engineShort: '1.3L Boxer A/C',
        transmission: 'Manual de 4 marchas',
        transmissionShort: 'Manual 4M',
        displacement: '1300 cm³',
        power: 'cerca de 40 cv (SAE)',
        fuel: 'Gasolina',
        cooling: 'Refrigerado a ar',
        intake: 'Carburador simples',
        drive: 'Tração traseira',
        characteristics: [
          'Introdução do motor 1300 de fabricação nacional em 1967/68.',
          'Rodas aro 15 e pinturas em dois tons característicos.',
        ],
      },
      {
        from: 1974, to: 1979,
        phaseLabel: 'Fusca 1300/1500 — anos de transição',
        engine: 'Boxer refrigerado a ar (1.3L ou 1.5L, conforme versão)',
        engineShort: '1.3L/1.5L',
        displacement: '1300 ou 1500 cm³ (conforme versão)',
        power: 'cerca de 40 a 50 cv (SAE)',
        fuel: 'Gasolina',
        cooling: 'Refrigerado a ar',
        drive: 'Tração traseira',
        characteristics: [
          'Coexistência das versões 1300 e 1500 no mesmo período.',
          'Mudanças de emblemas e de acabamento interno.',
        ],
        variationsNote: 'A configuração de 1500 variava conforme a versão. Sem a versão exata, não é possível fixar uma única especificação.',
      },
      {
        from: 1980, to: 1986,
        phaseLabel: 'Fusca 1300/1500 — fim da 1ª produção',
        engine: 'Boxer refrigerado a ar (1.3L ou 1.5L)',
        engineShort: '1.3L/1.5L',
        fuel: 'Gasolina; projetos tardios também a álcool',
        cooling: 'Refrigerado a ar',
        characteristics: [
          'Fase final da primeira época, ainda com carburação.',
          'A produção de 1986 cedeu lugar a novas gerações.',
        ],
        variationsNote: 'Existiram versões a gasolina e, no fim, movidas a álcool. Sem a versão exata, não se fixa configuração única.',
      },
      {
        from: 1993, to: 1994,
        phaseLabel: 'Fusca "Itamar" — série de despedida',
        engine: '1.6L de 4 cilindros opostos, refrigerado a ar',
        engineShort: '1.6L Boxer',
        displacement: '1600 cm³',
        power: 'cerca de 60 cv (SAE)',
        fuel: 'Gasolina e/ou álcool (conforme regulagem)',
        cooling: 'Refrigerado a ar',
        intake: 'Carburador',
        drive: 'Tração traseira',
        characteristics: [
          'Série especial e retorno produção como edição de despedida.',
          'Considerado o canto do cisne do clássico.',
        ],
      },
    ],
  },
  {
    matchKeys: ['kombi', 'bus', 't1', 'korujinha'],
    brand: 'Volkswagen',
    displayName: 'Volkswagen Kombi',
    rangeNote: 'Como produzido no Brasil entre 1966 e 2013.',
    intro:
      'A Kombi é a utilitária que virou símbolo cultural: a "Corujinha" das décadas de 60 e 70 conquistou o Brasil com carroceria compacta e motor boxer. Evoluiu por quase cinco décadas até a despedida em 2013, tornando-se o veículo de maior tempo em produção no país.',
    history: [
      'Baseada no Microbus alemão, projeto do fim dos anos 40, chegou ao Brasil em 1966.',
      'A primeira geração ("Corujinha", de janelas baixas) foi produzida até o fim da década de 70.',
      'A segunda geração, de para-brisa rebaixado, dominou o mercado dos anos 70 ao fim dos 2000.',
      'A produção terminou em 2013, encerrando o ciclo de produção mais longo entre automóveis no Brasil.',
    ],
    curiosities: [
      'Foi o veículo de maior tempo em produção ininterrupta na história da indústria brasileira.',
      'Conquistou folclore como "camper" e símbolo de liberdade em praias e estradas.',
      'Por muitos anos manteve projeto quase inalterado, um caso raro de longevidade.',
    ],
    phases: [
      {
        from: 1966, to: 1970,
        phaseLabel: 'Kombi Corujinha (T1 brasileira)',
        engine: '1.2L Boxer (à primeira) e 1.5L Boxer',
        engineShort: '1.2L / 1.5L',
        transmission: 'Manual de 4 marchas',
        transmissionShort: 'Manual 4M',
        displacement: '1200 cm³ (até 1968) e 1500 cm³ (depois)',
        power: 'cerca de 42 a 50 cv (SAE)',
        fuel: 'Gasolina',
        cooling: 'Refrigerado a ar',
        intake: 'Carburador simples',
        drive: 'Tração traseira',
        characteristics: [
          'Primeira geração, janelas características.',
          'Motor posicionado na traseira, sob a plataforma de carga.',
        ],
      },
      {
        from: 1971, to: 1975,
        phaseLabel: 'Kombi Corujinha (final)',
        engine: '1.5L Boxer (4 cilindros) A/C',
        transmission: 'Manual de 4 marchas',
        engineShort: '1.5L',
        displacement: '1500 cm³',
        power: 'cerca de 52 cv (SAE)',
        fuel: 'Gasolina',
        cooling: 'Refrigerado a ar',
        drive: 'Tração traseira',
        characteristics: [
          'Compacta e versátil, ideal para cargas e o cotidiano.',
        ],
      },
      {
        from: 1976, to: 1985,
        phaseLabel: 'Kombi segunda geração (Coru-brasil)',
        engine: '1.5L Boxer (início), depois 1.6L / 1.4L água',
        engineShort: '1.5L / 1.6L',
        displacement: '1500 a 1600 cm³',
        power: 'cerca de 50 a 60 cv (SAE)',
        fuel: 'Gasolina e álcool (conforme o ano)',
        cooling: 'Refrigerado a ar (fase inicial); refrigerado a água nas versões 1.6',
        characteristics: [
          'Redesenho com carroceria mais arredondada e nova dianteira.',
          'As versões refrigeradas a ar cederam espaço aos motores 1.6 a água.',
        ],
        variationsNote: 'Nesse período coexistiam motores a ar e a água. Sem a versão exata, foram mantidos apenas os dados comuns.',
      },
      {
        from: 1981, to: 2004,
        phaseLabel: 'Kombi refrigerada a água',
        engine: '1.6L de 4 cilindros, refrigerado a água',
        engineShort: '1.6L água',
        transmission: 'Manual de 4 marchas',
        displacement: '1600 cm³',
        fuel: 'Gasolina e álcool',
        cooling: 'Versões a ar (fim) e a água (predominante)',
        drive: 'Tração traseira',
        characteristics: [
          'Era da Kombi com motor dianteiro a água (1.6).',
          'Uso intenso como utilitário e no turismo.',
        ],
      },
    ],
  },
];

function normalizeKey(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function brandImage(brandKey: string): string {
  return BRAND_IMAGES[brandKey] || BASE_IMAGE;
}

function pickPhase(model: ModelEntry, year: number): VehiclePhase | undefined {
  return model.phases.find((p) => year >= p.from && year <= p.to);
}

/** Gera o Share ID base no formato SRL-[MODELO]-[ANO]. */
export function baseShareId(model: string, year: string): string {
  const code = (model || '').replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 3) || 'CAR';
  return `SRL-${code}-${year || 'XXXX'}`;
}

/** Garante unicidade do Share ID (SRL-X-1976-02, -03...). */
export function makeUniqueShareId(base: string, existing: string[]): string {
  const set = new Set(existing.map((s) => s.trim().toUpperCase()));
  if (!set.has(base)) return base;
  let i = 2;
  while (set.has(`${base}-${i.toString().padStart(2, '0')}`)) i++;
  return `${base}-${i.toString().padStart(2, '0')}`;
}

export const SpecGenerator = {
  generate(brand: string, model: string, yearStr: string): GeneratedVehicleSpec {
    const brandKey = normalizeKey(brand);
    const modelKey = normalizeKey(model);
    const yearNum = parseInt(yearStr, 10);
    const hasYear = Number.isFinite(yearNum);

    const entry =
      MODELS.find((m) =>
        m.matchKeys.some((k) => modelKey.includes(k)) ||
        modelKey.includes(normalizeKey(m.displayName) || '')
      ) || null;

    const title = entry ? entry.displayName : `${brand} ${model}`.trim();
    const shareId = baseShareId(model, yearStr);
    const image = brandImage(brandKey);

    if (!entry) {
      return {
        id: `custom-${normalizeKey(shareId)}`,
        shareId,
        title,
        subtitle: `${brand} — em avaliação de curadoria${hasYear ? ` • ${yearNum}` : ''}`,
        year: yearStr,
        image,
        engine: '',
        transmission: '',
        specs: [],
        characteristics: [],
        history: [
          'Exemplar em processo de avaliação e catalogação pela curadoria do Studio SenhorEle.',
          'As especificações e o histórico serão apresentados após a confirmação dos dados do veículo.',
        ],
        curiosities: [],
        hasIndividualData: false,
      };
    }

    const phase = hasYear ? pickPhase(entry, yearNum) : entry.phases[entry.phases.length - 1];

    const engine = phase?.engine || '';
    const transmissionShort = phase?.transmissionShort || phase?.transmission || 'Manual';
    const engineShort = phase?.engineShort || engine;

    const specs: { label: string; value: string }[] = [];
    const push = (label: string, value?: string) => {
      if (value) specs.push({ label, value });
    };
    push('Motor', phase?.engine);
    push('Cilindrada', phase?.displacement);
    push('Potência', phase?.power);
    push('Torque', phase?.torque);
    push('Combustível', phase?.fuel);
    push('Refrigeração', phase?.cooling);
    push('Alimentação', phase?.intake);
    push('Tração', phase?.drive);
    push('Peso', phase?.weight);
    push('Transmissão', phase?.transmission);

    return {
      id: `${normalizeKey(shareId)}`,
      shareId,
      title,
      subtitle: `${entry.brand} • Clássico de coleção${hasYear ? ` • ${yearNum}` : ''}`,
      year: yearStr || '',
      image,
      engine: engineShort,
      transmission: transmissionShort,
      power: phase?.power,
      torque: phase?.torque,
      displacement: phase?.displacement,
      fuel: phase?.fuel,
      cooling: phase?.cooling,
      intake: phase?.intake,
      drive: phase?.drive,
      weight: phase?.weight,
      variationsNote: phase?.variationsNote,
      presentation: entry.intro,
      specs,
      characteristics: phase?.characteristics || [],
      history: entry.history,
      curiosities: entry.curiosities,
      hasIndividualData: false,
    };
  },
};