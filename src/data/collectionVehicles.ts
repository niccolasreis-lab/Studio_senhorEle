/**
 * Acervo exclusivo — Studio SenhorEle
 *
 * Base de conhecimento dos veículos específicos da coleção, associada a
 * MODELO + ANO. Usada pelo Cadastro Rápido (Express Smart) para preencher a
 * descrição e a história exatas do veículo correspondente quando o curador
 * seleciona marca/modelo/ano. Textos transcritos fielmente da curadoria.
 */

export interface CollectionCuratedEntry {
  id: string;
  brand: string;
  exactNames: string[];
  modelKeys: string[];
  years: number[];
  title: string;
  history: string[];
  description: string;
  engine?: string;
  transmission?: string;
  image?: string;
}

export const CURATED_COLLECTION: CollectionCuratedEntry[] = [
  {
    id: 'fusca-brezel-1950',
    brand: 'Volkswagen',
    exactNames: ['Fusca Brezel', 'Brezel'],
    modelKeys: ['fusca', 'brezel'],
    years: [1950],
    title: 'Volkswagen Fusca Brezel',
    history: [
      'O Fusca Brezel pertence à fase mais antiga e desejada do Volkswagen clássico. Seu grande símbolo é o vidro traseiro dividido ao centro, formato que deu origem ao apelido alemão “Brezel”, associado ao desenho de um pretzel. Essa configuração antecedeu a adoção do vidro traseiro oval em 1953.',
    ],
    description:
      'Um verdadeiro representante dos primeiros anos do Fusca, com linhas simples, construção robusta e detalhes característicos do pós-guerra. O exemplar de 1950 ocupa uma posição especial na coleção por representar as origens de um dos automóveis mais reconhecidos do mundo.',
  },
  {
    id: 'fusca-zwitter-1953',
    brand: 'Volkswagen',
    exactNames: ['Fusca Zwitter', 'Zwitter'],
    modelKeys: ['fusca', 'zwitter'],
    years: [1953],
    title: 'Volkswagen Fusca Zwitter',
    history: [
      'O Zwitter é uma das versões de transição mais interessantes da história do Fusca. Produzido no período de passagem entre o Split Window e o Oval, combinava elementos do modelo antigo, como o vidro traseiro dividido, com características que seriam utilizadas na geração seguinte.',
    ],
    description:
      'Um Fusca raro e historicamente significativo, marcado pela combinação de detalhes de duas fases distintas do modelo. O exemplar representa um curto capítulo da evolução do Volkswagen no início dos anos 1950.',
  },
  {
    id: 'fusca-oval-1954',
    brand: 'Volkswagen',
    exactNames: ['Fusca Oval', 'Oval'],
    modelKeys: ['fusca', 'oval'],
    years: [1954],
    title: 'Volkswagen Fusca Oval',
    history: [
      'Em 1953, a Volkswagen substituiu o tradicional vidro traseiro bipartido pelo vidro oval de peça única, criando uma das fases mais admiradas do Fusca. O modelo de 1954 já pertence plenamente a essa geração.',
    ],
    description:
      'Reconhecido imediatamente por seu elegante vidro traseiro oval, este Fusca combina o charme dos primeiros Volkswagen com uma importante evolução de projeto. É um exemplar que traduz perfeitamente a estética automobilística da década de 1950.',
  },
  {
    id: 'fusca-cabriolet-1959',
    brand: 'Volkswagen',
    exactNames: ['Fusca Cabriolet', 'Cabriolet'],
    modelKeys: ['fusca', 'cabriolet'],
    years: [1959],
    title: 'Volkswagen Fusca Cabriolet',
    history: [
      'O Fusca Cabriolet transformou a simplicidade mecânica do Volkswagen em um automóvel de proposta mais sofisticada e voltada ao lazer. A versão conversível acompanhou a evolução do Fusca e recebeu ao longo dos anos melhorias de visibilidade, acabamento e desempenho.',
    ],
    description:
      'Com capota conversível e o desenho inconfundível do Fusca, o exemplar de 1959 une elegância, simplicidade e espírito europeu. Uma interpretação mais exclusiva e descontraída de um dos maiores clássicos da Volkswagen.',
  },
  {
    id: 'fusca-1300-1961',
    brand: 'Volkswagen',
    exactNames: ['Fusca 1300'],
    modelKeys: ['fusca', '1300'],
    years: [1961],
    title: 'Volkswagen Fusca 1300',
    history: [
      'O início dos anos 1960 marcou uma fase de consolidação do Fusca no Brasil. Historicamente, porém, a Volkswagen registra que a substituição brasileira do motor 1200 pelo 1300 ocorreu em 1967, portanto a denominação “1300” deste exemplar de 1961 deve ser tratada como característica específica do veículo e não como configuração original confirmada de fábrica.',
    ],
    description:
      'Um exemplar que retrata a fase clássica do Fusca no começo dos anos 1960, mantendo as proporções arredondadas, a simplicidade construtiva e a personalidade que tornaram o modelo tão popular.',
  },
  {
    id: 'karmann-ghia-1966',
    brand: 'Volkswagen',
    exactNames: ['Karmann Ghia', 'Karmann'],
    modelKeys: ['karmann', 'ghia'],
    years: [1966],
    title: 'Volkswagen Karmann Ghia',
    engine: 'Motor Boxer Refrigerado a Ar',
    transmission: 'Manual de 4 marchas',
    history: [
      'Criado a partir da combinação entre a confiável base mecânica Volkswagen e uma carroceria de desenho esportivo e elegante, o Karmann Ghia tornou-se um dos modelos mais sofisticados ligados à história da marca. No Brasil, seu lançamento ocorreu em 1962.',
    ],
    description:
      'O exemplar de 1966 representa uma época em que estilo e simplicidade mecânica se encontravam em um automóvel de personalidade única. Suas linhas baixas e arredondadas fazem do Karmann Ghia um dos clássicos mais elegantes da coleção.',
  },
  {
    id: 'kombi-furgao-1966',
    brand: 'Volkswagen',
    exactNames: ['Kombi Furgão', 'Furgão'],
    modelKeys: ['kombi', 'furgao'],
    years: [1966],
    title: 'Volkswagen Kombi Furgão',
    history: [
      'A Kombi começou sua trajetória brasileira na década de 1950 e rapidamente se tornou uma ferramenta essencial para comércio, transporte e serviços. A configuração Furgão reforçou justamente essa vocação utilitária do modelo.',
    ],
    description:
      'Simples, robusta e extremamente funcional, esta Kombi Furgão de 1966 representa a primeira grande fase do utilitário no Brasil e a estreita relação da Kombi com o desenvolvimento comercial do país.',
  },
  {
    id: 'kombi-alema-cd-1970',
    brand: 'Volkswagen',
    exactNames: ['Kombi Alemã CD', 'Alemã CD'],
    modelKeys: ['kombi', 'alema'],
    years: [1970],
    title: 'Volkswagen Kombi Alemã CD',
    history: [
      'No início dos anos 1970, a Kombi já havia se consolidado internacionalmente como um dos veículos utilitários mais versáteis da Volkswagen. Este exemplar alemão identificado na coleção como “CD” preserva uma configuração ligada à vocação de transporte e trabalho do modelo.',
    ],
    description:
      'Uma Kombi alemã de 1970 que reúne funcionalidade, desenho clássico e forte identidade histórica. Um exemplar especialmente interessante para demonstrar a evolução internacional da família Volkswagen Transporter.',
  },
  {
    id: 'kombi-alema-st-1970',
    brand: 'Volkswagen',
    exactNames: ['Kombi Alemã ST', 'Alemã ST'],
    modelKeys: ['kombi', 'alema', 'st'],
    years: [1970],
    title: 'Volkswagen Kombi Alemã ST',
    history: [
      'A Kombi europeia atravessou os anos 1960 e 1970 evoluindo sem abandonar os princípios que a tornaram famosa: simplicidade, amplo aproveitamento interno e versatilidade.',
    ],
    description:
      'Identificada na coleção como “ST”, esta Kombi alemã de 1970 preserva o espírito original do utilitário Volkswagen e representa uma importante referência da produção europeia do período.',
  },
  {
    id: 'fusca-trocar-1972',
    brand: 'Volkswagen',
    exactNames: ['Fusca Trocar', 'Trocar'],
    modelKeys: ['fusca', 'trocar'],
    years: [1972],
    title: 'Volkswagen Fusca Trocar',
    history: [
      'Em 1972, o Fusca já era um fenômeno mundial e havia se tornado parte definitiva da cultura automobilística brasileira. Sua construção simples, mecânica conhecida e facilidade de manutenção ajudaram a consolidar sua enorme popularidade.',
    ],
    description:
      'Identificado na coleção como “Trocar”, este exemplar de 1972 representa a fase madura do Fusca, quando seu desenho e sua personalidade já haviam se transformado em símbolos reconhecidos por diversas gerações.',
  },
  {
    id: 'fusca-1303-1973',
    brand: 'Volkswagen',
    exactNames: ['Fusca 1303', 'Beetle 1303', '1303'],
    modelKeys: ['fusca', '1303'],
    years: [1973],
    title: 'Volkswagen Beetle 1303',
    history: [
      'O 1303 pertence a uma das evoluções mais avançadas do Fusca europeu clássico. Produzido durante os anos 1970, incorporou importantes mudanças de projeto, incluindo suspensão dianteira do tipo MacPherson e uma carroceria visualmente atualizada.',
    ],
    description:
      'Um Beetle que mantém a identidade histórica do Fusca, mas apresenta uma interpretação mais moderna para sua época. O exemplar de 1973 mostra como a Volkswagen procurou atualizar o clássico sem abandonar sua personalidade original.',
  },
  {
    id: 'envemo-super-90-1980',
    brand: 'Porsche',
    exactNames: ['Envemo Super 90', 'Super 90', 'Envemo'],
    modelKeys: ['envemo', 'super'],
    years: [1980, 1981],
    title: 'Porsche Envemo Super 90',
    engine: 'Motor Volkswagen Refrigerado a Ar',
    transmission: 'Manual de 4 marchas',
    history: [
      'O Envemo Super 90 nasceu no Brasil no início dos anos 1980 como uma sofisticada recriação inspirada no Porsche 356. Produzido pela brasileira Envemo, tornou-se conhecido pelo cuidado com as proporções e detalhes do clássico alemão.',
    ],
    description:
      'Um esportivo brasileiro de forte inspiração Porsche, combinando aparência clássica, produção artesanal e mecânica de origem Volkswagen. Hoje, o Super 90 representa um capítulo bastante particular da indústria nacional de veículos especiais.',
  },
  {
    id: 'fusca-cristalino-1985',
    brand: 'Volkswagen',
    exactNames: ['Fusca Cristalino', 'Cristalino'],
    modelKeys: ['fusca', 'cristalino'],
    years: [1985],
    title: 'Volkswagen Fusca Cristalino',
    history: [
      'Em meados dos anos 1980, o Fusca brasileiro já carregava décadas de história e continuava fiel ao conceito que o tornou famoso. O exemplar denominado “Cristalino” na coleção pertence aos últimos anos da primeira fase de produção brasileira do modelo.',
    ],
    description:
      'Um Fusca de 1985 que preserva a essência do clássico em uma fase já madura de sua trajetória. Simples, carismático e imediatamente reconhecível, representa os últimos capítulos de uma geração profundamente ligada à história brasileira.',
  },
  {
    id: 'fusca-itamar-prata-1994',
    brand: 'Volkswagen',
    exactNames: ['Fusca Itamar Prata', 'Itamar Prata'],
    modelKeys: ['fusca', 'itamar'],
    years: [1994],
    title: 'Volkswagen Fusca Itamar Prata',
    history: [
      'A retomada da fabricação do Fusca nos anos 1990 criou uma das fases mais curiosas da história do modelo no Brasil. O chamado Fusca Itamar trouxe novamente às ruas um projeto clássico em plena era dos automóveis modernos.',
    ],
    description:
      'Este exemplar prata de 1994 simboliza o encontro entre duas épocas: o desenho histórico criado décadas antes e o mercado brasileiro dos anos 1990. Uma peça representativa da última grande fase do Fusca nacional.',
  },
  {
    id: 'fusca-itamar-preto-1993',
    brand: 'Volkswagen',
    exactNames: ['Fusca Itamar', 'Itamar', 'Fusca Itamar Preto', 'Itamar Preto'],
    modelKeys: ['fusca', 'itamar'],
    years: [1993, 1994],
    title: 'Volkswagen Fusca Itamar Preto',
    history: [
      'Após ter sua produção encerrada no Brasil, o Fusca retornou às linhas de montagem em 1993 por iniciativa do então presidente Itamar Franco, dando origem à geração popularmente conhecida como “Fusca Itamar”. A própria Volkswagen preserva em seu acervo o primeiro exemplar dessa retomada.',
    ],
    description:
      'Na cor preta, este Fusca Itamar 1993/1994 representa o renascimento de um ícone brasileiro. Mantinha a identidade visual tradicional do Fusca enquanto incorporava atualizações necessárias para sua volta ao mercado nos anos 1990.',
  },
  {
    id: 'kombi-carat-verm-1997',
    brand: 'Volkswagen',
    exactNames: ['Kombi Carat', 'Carat'],
    modelKeys: ['kombi', 'carat'],
    years: [1997, 1998],
    title: 'Volkswagen Kombi Carat Vermelha',
    history: [
      'A Kombi recebeu uma importante atualização na década de 1990. Em 1997 surgiu a versão Carat, associada a acabamento mais elaborado e às mudanças que incluíram teto mais alto e porta lateral corrediça.',
    ],
    description:
      'Na cor vermelha, esta Kombi Carat 1997/1998 mostra o lado mais refinado de um veículo tradicionalmente utilitário. É um exemplar que representa uma das principais modernizações realizadas na longa carreira da Kombi brasileira.',
  },
  {
    id: 'kombi-standard-azul-1997',
    brand: 'Volkswagen',
    exactNames: ['Kombi Standard', 'Standard'],
    modelKeys: ['kombi', 'standard'],
    years: [1997, 1998],
    title: 'Volkswagen Kombi Standard Azul',
    history: [
      'No final dos anos 1990, a Kombi brasileira passou por uma renovação importante de carroceria, incluindo o teto mais elevado que passaria a caracterizar seus últimos anos de produção.',
    ],
    description:
      'Esta Kombi Standard azul preserva a simplicidade que sempre definiu o modelo, já incorporando elementos da sua fase moderna. Um exemplar que combina tradição, espaço interno e a reconhecida versatilidade da Kombi.',
  },
  {
    id: 'kombi-pickup-1999',
    brand: 'Volkswagen',
    exactNames: ['Kombi Pickup', 'Pickup'],
    modelKeys: ['kombi', 'pickup'],
    years: [1999, 2000],
    title: 'Volkswagen Kombi Pickup',
    history: [
      'A plataforma da Kombi deu origem a diversas configurações voltadas ao trabalho, entre elas as versões de carga aberta. Essa versatilidade ajudou a transformar o modelo em uma presença constante no comércio e nos serviços brasileiros.',
    ],
    description:
      'A Kombi Pickup 1999/2000 evidencia o caráter multifuncional do projeto Volkswagen. Com cabine avançada e área destinada à carga, representa uma das interpretações mais práticas da tradicional família Kombi.',
  },
  {
    id: 'kombi-ambulancia-2000',
    brand: 'Volkswagen',
    exactNames: ['Kombi Ambulância', 'Ambulância'],
    modelKeys: ['kombi', 'ambulancia'],
    years: [2000],
    title: 'Volkswagen Kombi Ambulância',
    history: [
      'Ao longo de sua extensa trajetória brasileira, a Kombi recebeu inúmeras adaptações profissionais. Sua ampla área interna e construção simples possibilitaram aplicações comerciais, institucionais e de atendimento especializado.',
    ],
    description:
      'Configurada como ambulância, esta Kombi do ano 2000 revela uma das muitas funções assumidas pelo modelo no cotidiano brasileiro. Um exemplar que preserva não apenas a história do automóvel, mas também sua vocação de serviço.',
  },
  {
    id: 'kombi-prata-2005',
    brand: 'Volkswagen',
    exactNames: ['Kombi Prata', 'Prata'],
    modelKeys: ['kombi'],
    years: [2005, 2006],
    title: 'Volkswagen Kombi Prata',
    history: [
      'Este exemplar pertence a um momento particularmente importante da história da Kombi brasileira. Na metade dos anos 2000, o modelo se aproximava da transição entre o tradicional conjunto refrigerado a ar e a nova fase equipada com motor 1.4 Total Flex refrigerado a água.',
    ],
    description:
      'Uma Kombi 2005/2006 que representa a passagem entre duas eras técnicas de um mesmo projeto. Seu desenho permanecia imediatamente reconhecível, mesmo após décadas de evolução e adaptações ao mercado brasileiro.',
  },
  {
    id: 'kombi-05-50-2007',
    brand: 'Volkswagen',
    exactNames: ['Kombi 05/50', '05/50'],
    modelKeys: ['kombi'],
    years: [2007, 2008],
    title: 'Volkswagen Kombi 05/50',
    history: [
      'Em 2007, a Kombi completou 50 anos de produção no Brasil. Para celebrar a data, surgiu uma edição comemorativa extremamente limitada; a identificação “05/50” deste exemplar indica sua posição dentro dessa série especial de 50 unidades.',
    ],
    description:
      'Mais do que uma Kombi, este exemplar representa uma peça comemorativa de uma das histórias mais longas da indústria automobilística brasileira. Sua numeração 05/50 reforça sua relevância e exclusividade dentro da coleção.',
  },
  {
    id: 'boxster-987-2008',
    brand: 'Porsche',
    exactNames: ['987 Boxster', 'Boxster', '987'],
    modelKeys: ['boxster', '987'],
    years: [2008],
    title: 'Porsche 987 Boxster',
    engine: 'Boxer de 6 cilindros (2.7L/2.9L)',
    transmission: 'Manual 5 ou 6 marchas',
    history: [
      'O código 987 identifica a segunda geração do Porsche Boxster. A geração trouxe desenho refinado, interior renovado e uma evolução importante do conceito de roadster de motor central apresentado originalmente pela Porsche nos anos 1990.',
    ],
    description:
      'O Boxster 987 de 2008 combina equilíbrio dinâmico, motor central e a tradição esportiva da Porsche em um roadster compacto. Representa a passagem da coleção dos clássicos refrigerados a ar para uma interpretação moderna do automóvel esportivo.',
  },
  {
    id: 'kombi-last-edition-2013',
    brand: 'Volkswagen',
    exactNames: ['Kombi Série LE', 'Série LE', 'Kombi Last Edition', 'Last Edition'],
    modelKeys: ['kombi'],
    years: [2013, 2014],
    title: 'Volkswagen Kombi Série LE',
    engine: '1.4L Total Flex',
    transmission: 'Manual de 5 marchas',
    history: [
      'A produção brasileira da Kombi chegou ao fim em 2013, encerrando uma trajetória iniciada em 1957. Para marcar a despedida, a Volkswagen apresentou a Kombi Last Edition, série limitada a 1.200 unidades.',
    ],
    description:
      'A Kombi Série LE representa o encerramento de uma das mais longas histórias da indústria automobilística brasileira. Com detalhes exclusivos e forte apelo histórico, simboliza a despedida definitiva de um veículo que atravessou gerações e se tornou parte da cultura nacional.',
  },
];

function normalizeKey(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/**
 * Retorna o ano de fábrica sugerido para um modelo, quando ele identifica de
 * forma única um veículo do acervo. Para modelos genéricos (ex.: "Fusca",
 * "Kombi"), que correspondem a vários anos, retorna null e o ano permanece
 * como escolhido pelo curador.
 */
export function curatedYearForModel(modelName: string): number | null {
  const key = normalizeKey(modelName);
  if (!key) return null;

  const exact = CURATED_COLLECTION.filter((c) =>
    c.exactNames.some((n) => normalizeKey(n) === key)
  );
  const pool =
    exact.length > 0
      ? exact
      : CURATED_COLLECTION.filter((c) =>
          c.modelKeys.some((k) => key.includes(normalizeKey(k)))
        );

  if (pool.length !== 1) return null;
  return pool[0].years[0] ?? null;
}

export interface CuratedModelMetadata {
  brand: string;
  title: string;
  years: number[];
}

/**
 * Metadados editoriais de um modelo identificado de forma única no acervo.
 * Modelos genéricos ou ambíguos retornam null para preservar a escolha manual.
 */
export function curatedMetadataForModel(modelName: string): CuratedModelMetadata | null {
  const key = normalizeKey(modelName);
  if (!key) return null;

  const exact = CURATED_COLLECTION.filter((entry) =>
    entry.exactNames.some((name) => normalizeKey(name) === key)
  );
  const pool = exact.length > 0
    ? exact
    : CURATED_COLLECTION.filter((entry) =>
        entry.modelKeys.some((modelKey) => key.includes(normalizeKey(modelKey)))
      );

  if (pool.length !== 1) return null;

  return {
    brand: pool[0].brand,
    title: pool[0].title,
    years: [...pool[0].years],
  };
}
