export type Language = 'pt' | 'en' | 'de';

export interface Translations {
  nav: {
    collection: string;
    guests: string;
    diary: string;
    studio: string;
    about: string;
    purpose: string;
    partners: string;
    inquire: string;
  };
  hero: {
    explore: string;
  };
  about: {
    tagline: string;
    title: string;
    p1: string;
    p2: string;
    p3: string;
    purposeTitle: string;
    purposeText: string;
    curationTitle: string;
    curationText: string;
    restorationTitle: string;
    restorationText: string;
    communityTitle: string;
    communityText: string;
    // Detailed Story Timeline Keys
    originTitle: string;
    originText: string;
    learningTitle: string;
    learningText: string;
    diversityTitle: string;
    diversityText: string;
    purposeSectionTitle: string;
    purposeSectionText: string;
    firstCarTitle: string;
    firstCarText: string;
    aircooledArrivalTitle: string;
    aircooledArrivalText: string;
    collectionTodayTitle: string;
    collectionTodayText: string;
  };
  collection: {
    tagline: string;
    title: string;
    searchPlaceholder: string;
    filters: {
      all: string;
      aircooled: string;
      porsche: string;
      corujinha: string;
      fusca: string;
      willys: string;
      instagram: string;
    };
    carouselHint: string;
    viewDetails: string;
    shareId: string;
    share: string;
    copied: string;
    noResultsTitle: string;
    noResultsText: string;
  };
  guests: {
    title: string;
    description: string;
    badge: string;
    disclaimer: string;
    openDetails: string;
    share: string;
    copied: string;
    shareText: string;
    copyPrompt: string;
    whatsappLabel: string;
    empty: string;
  };
  partners: {
    title: string;
    description: string;
    actionLabel: string;
    instagramDestination: string;
    websiteDestination: string;
    youtubeDestination: string;
    fallbackLabel: string;
    newTabLabel: string;
    peluciaImageAlt: string;
    lobatoImageAlt: string;
    fuscaNaFotoImageAlt: string;
    categories: {
      detailing: string;
      automotiveServices: string;
      mechanicsAndElectrical: string;
      performanceAndTechnology: string;
      youtubePartner: string;
    };
  };
  diary: {
    title: string;
    description: string;
    recommendation: string;
    manual: string;
    loading: string;
    error: string;
    retry: string;
    empty: string;
    playVideo: string;
    openOriginal: string;
    share: string;
    copied: string;
    viewArchive: string;
    hideArchive: string;
    archivePagination: string;
    featuredPagination: string;
    previous: string;
    next: string;
    channelPartner: string;
    subscribeChannel: string;
    watchOnYoutube: string;
    hashtagsTitle: string;
    captionTitle: string;
  };
  instagramCard: {
    viewPost: string;
    inquirePost: string;
    badge: string;
    sharePost: string;
    linkCopied: string;
  };
  inquire: {
    title: string;
    subtitle: string;
    carSelected: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitButton: string;
    whatsappDirect: string;
    successMessage: string;
    close: string;
  };
  vehicleDetail: {
    specsTitle: string;
    historyTitle: string;
    shareIdLabel: string;
    copyLink: string;
    copied: string;
    inquireVehicle: string;
    year: string;
    engine: string;
    transmission: string;
    color: string;
    mileage: string;
    status: string;
    placaPreta: string;
    matchingNumbers: string;
    yes: string;
    no: string;
    doubtTitle: string;
    doubtPlaceholder: string;
    doubtSendButton: string;
    doubtEmptyHint: string;
  };
  galleryModal: {
    viewGallery: string;
    photoCounter: string;
    keyboardHint: string;
    close: string;
    zoomHD: string;
    angleLabel: string;
  };
  footer: {
    description: string;
    navigationTitle: string;
    contactTitle: string;
    hoursTitle: string;
    hoursText: string;
    rights: string;
  };
}

export const translations: Record<Language, Translations> = {
  pt: {
    nav: {
      collection: 'Coleção',
      guests: 'Convidados',
      diary: 'Diário do Studio',
      studio: 'O Studio',
      about: 'Nossa História',
      purpose: 'Propósito',
      partners: 'Parceiros',
      inquire: 'Contato',
    },
    hero: {
      explore: 'EXPLORAR',
    },
    about: {
      tagline: 'CURADORIA & PAIXÃO AUTOMOTIVA',
      title: 'A Arte da Preservação Automotiva',
      p1: 'O Studio SenhorEle nasceu do amor genuíno por veículos que marcaram época. Especializados em ícones VW Air-Cooled e Porsche clássicos, nossa missão é preservar a autenticidade e a história de cada exemplar.',
      p2: 'Cada carro de nosso acervo passa por uma avaliação minuciosa de proveniência, originalidade de peças e estado de conservação, garantindo veículos de padrão excepcional para colecionadores exigentes.',
      p3: 'Da lendária Kombi Corujinha aos prestigiados modelos Porsche 911, celebramos a engenharia atemporal e a emoção pura de pilotar uma máquina clássica.',
      purposeTitle: 'Nosso Propósito',
      purposeText: 'Conectar entusiastas e colecionadores a exemplares raros e meticulosamente preservados.',
      curationTitle: 'Curadoria Rigorosa',
      curationText: 'Seleção restrita focada em originalidade, Matching Numbers e histórico comprovado.',
      restorationTitle: 'Restauração de Excelência',
      restorationText: 'Parcerias com os melhores especialistas em mecânica boxer e funilaria artesanal.',
      communityTitle: 'Cultura & Encontros',
      communityText: 'Fomentar a paixão pela cultura vintage racing e encontros de antigomobilismo.',
      originTitle: 'A origem',
      originText: 'Como todo jovem, eu gostava de carros. Mas foi meu irmão do meio, José, quem me apresentou de verdade a esse mundo — um apaixonado por carros antigos, que dedicava o pouco tempo livre que tinha para cuidar dos seus veículos.',
      learningTitle: 'A jornada de aprendizado',
      learningText: 'Foram muitos carros comprados e vendidos — Ford, Chevrolet, Chrysler, Mercedes, até alguns Porsches. Nem sempre a reforma saía como eu queria, e no fim das contas o saldo raramente compensava.',
      diversityTitle: 'A diversidade do universo Air Cooled',
      diversityText: 'O mundo Air Cooled é imenso, com muitas tendências e estilos. Ao longo do caminho, reuni um pouco de tudo: alemães antigos, cal style, nacionais absolutamente originais, german look, e outros com motores e acabamentos mais sofisticados.',
      purposeSectionTitle: 'O propósito',
      purposeSectionText: 'Este espaço existe para divulgar nossa coleção própria e também os veículos de amigos — não para compra e venda, mas para valorizar o trabalho contemporâneo nacional de restauração e preparação nas marcas Porsche e Volkswagen.',
      firstCarTitle: 'O primeiro carro',
      firstCarText: 'No início dos anos 2000, por indicação do amigo Toninho, acabei comprando meu primeiro carro antigo: um Aero Willys 1967, impecável e originalíssimo. Gostei tanto que me animei a ter outros.',
      aircooledArrivalTitle: 'Chegando ao VW Air Cooled',
      aircooledArrivalText: 'Foi aí que conheci o universo VW Air Cooled. Convidado pelo amigo Gerson, comecei a frequentar a turma do Box 767, onde fiz amigos e aprendi — e ainda aprendo — sobre restauração e preparação de veículos clássicos Volkswagen.',
      collectionTodayTitle: 'A coleção hoje',
      collectionTodayText: 'Hoje o Studio reúne veículos das décadas de 50, 60, 70, 80, 90 e 2000 — a maioria Air Cooled, mas também Fuscas, Kombis e Porsches de lançamentos especiais.',
    },
    collection: {
      tagline: 'NOSSA COLEÇÃO',
      title: 'Coleção de Clássicos Exclusivos',
      searchPlaceholder: 'Buscar por modelo, ano ou código Share ID...',
      filters: {
        all: 'Todos',
        aircooled: 'VW Air-Cooled',
        porsche: 'Porsche',
        corujinha: 'Kombi Corujinha',
        fusca: 'Fusca',
        willys: 'Aero Willys',
        instagram: 'Feed Instagram',
      },
      carouselHint: 'Use as setas do teclado ou deslize para navegar pelo acervo 3D',
      viewDetails: 'Ver Ficha Técnica',
      shareId: 'CÓDIGO',
      share: 'Compartilhar',
      copied: 'Link copiado!',
      noResultsTitle: 'Nenhum clássico encontrado',
      noResultsText: 'Tente ajustar os termos de busca ou selecionar outro filtro acima.',
    },
    guests: {
      title: 'Convidados do Studio',
      description: 'Histórias e automóveis de amigos que compartilham conosco o cuidado pela cultura automotiva. Cada presença é editorial e independente do acervo do Studio.',
      badge: 'Convidado',
      disclaimer: 'Veículo convidado, apresentado por amizade e interesse cultural. Não integra o acervo e não possui vínculo comercial com o Studio SenhorEle.',
      openDetails: 'Ver ficha',
      share: 'Compartilhar',
      copied: 'Link copiado',
      shareText: 'Conheça este convidado do Studio SenhorEle',
      copyPrompt: 'Copie o link deste convidado:',
      whatsappLabel: 'Compartilhar no WhatsApp',
      empty: 'Nenhum veículo convidado foi publicado até o momento.',
    },
    partners: {
      title: 'Parceiros',
      description: 'Profissionais e empresas que compartilham nossa paixão pelo universo automotivo.',
      actionLabel: 'Conhecer parceiro',
      instagramDestination: 'Ver Instagram',
      websiteDestination: 'Visitar website',
      youtubeDestination: 'Ver canal no YouTube',
      fallbackLabel: 'Identidade visual em atualização',
      newTabLabel: 'abre em nova guia',
      peluciaImageAlt: 'Imagem histórica automotiva fornecida para a Pelúcia Estética Automotiva',
      lobatoImageAlt: 'Imagem representativa dos serviços automotivos de Lobato Gui',
      fuscaNaFotoImageAlt: 'Imagem do canal parceiro Fusca na Foto',
      categories: {
        detailing: 'Estética automotiva',
        automotiveServices: 'Serviços automotivos',
        mechanicsAndElectrical: 'Mecânica e elétrica automotiva',
        performanceAndTechnology: 'Preparação e tecnologia automotiva',
        youtubePartner: 'Canal parceiro · indicações automotivas',
      },
    },
    diary: {
      title: 'Diário do Studio',
      description: 'Novidades, encontros e histórias do Studio SenhorEle, além de indicações escolhidas de parceiros do universo automotivo.',
      recommendation: 'Indicação',
      manual: 'Studio SenhorEle',
      loading: 'Carregando novidades…',
      error: 'Não foi possível carregar o Diário agora. Tente novamente mais tarde.',
      retry: 'Tentar novamente',
      empty: 'Ainda não há novidades publicadas. Volte em breve.',
      playVideo: 'Reproduzir vídeo',
      openOriginal: 'Ver publicação original',
      share: 'Compartilhar',
      copied: 'Link copiado',
      viewArchive: 'Ver arquivo',
      hideArchive: 'Ocultar arquivo',
      archivePagination: 'Paginação do arquivo do Diário',
      featuredPagination: 'Paginação das novidades em destaque',
      previous: 'Anterior',
      next: 'Próxima',
      channelPartner: 'Canal Parceiro',
      subscribeChannel: 'Inscrever-se no Canal',
      watchOnYoutube: 'Assistir no YouTube',
      hashtagsTitle: 'Tags & Tópicos',
      captionTitle: 'Legenda',
    },
    instagramCard: {
      viewPost: 'Ver no Instagram',
      inquirePost: 'Consultar via WhatsApp',
      badge: 'Destaque Instagram',
      sharePost: 'Compartilhar',
      linkCopied: 'Link copiado!',
    },
    inquire: {
      title: 'Entrar em Contato',
      subtitle: 'Entre em contato diretamente com nossa curadoria para tirar dúvidas ou obter mais informações sobre o acervo.',
      carSelected: 'Veículo de Interesse',
      nameLabel: 'Seu Nome',
      namePlaceholder: 'Ex: Roberto Silva',
      phoneLabel: 'Telefone / WhatsApp',
      phonePlaceholder: 'Ex: (11) 99999-8888',
      emailLabel: 'E-mail',
      emailPlaceholder: 'Ex: roberto@exemplo.com',
      messageLabel: 'Mensagem',
      messagePlaceholder: 'Descreva seu interesse ou dúvidas sobre o acervo...',
      submitButton: 'Enviar Mensagem',
      whatsappDirect: 'Falar diretamente no WhatsApp',
      successMessage: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      close: 'Fechar',
    },
    vehicleDetail: {
      specsTitle: 'Ficha Técnica & Detalhes',
      historyTitle: 'História & Proveniência',
      shareIdLabel: 'CÓDIGO DE COMPARTILHAMENTO',
      copyLink: 'Copiar Link / ID',
      copied: 'Copiado!',
      inquireVehicle: 'Consultar sobre este Veículo',
      year: 'Ano',
      engine: 'Motorização',
      transmission: 'Transmissão',
      color: 'Cor Externa',
      mileage: 'Quilometragem',
      status: 'Condição',
      placaPreta: 'Placa Preta',
      matchingNumbers: 'Matching Numbers',
      yes: 'Sim',
      no: 'Não',
      doubtTitle: 'Tem alguma dúvida sobre este carro?',
      doubtPlaceholder: 'Digite sua dúvida sobre este veículo...',
      doubtSendButton: 'Enviar pelo WhatsApp',
      doubtEmptyHint: 'Digite sua dúvida antes de continuar.',
    },
    galleryModal: {
      viewGallery: 'Ver em Galeria Fullscreen',
      photoCounter: 'Foto {current} de {total}',
      keyboardHint: 'Use as setas (← →) para navegar ou ESC para fechar',
      close: 'Fechar Galeria',
      zoomHD: 'Alta Resolução HD',
      angleLabel: 'Ângulo de Exposição',
    },
    footer: {
      description: 'Curadoria especializada em clássicos automotivos VW Air-Cooled e Porsche. Preservando histórias e movendo paixões.',
      navigationTitle: 'Navegação',
      contactTitle: 'Entre em Contato',
      hoursTitle: 'Atendimento',
      hoursText: 'Segunda a Sexta: 09h às 18h',
      rights: 'Todos os direitos reservados.',
    },
  },
  en: {
    nav: {
      collection: 'Collection',
      guests: 'Studio Guests',
      diary: 'Studio Diary',
      studio: 'The Studio',
      about: 'Our Story',
      purpose: 'Purpose',
      partners: 'Partners',
      inquire: 'Contact',
    },
    hero: {
      explore: 'EXPLORE',
    },
    about: {
      tagline: 'AUTOMOTIVE CURATION & PASSION',
      title: 'The Art of Automotive Preservation',
      p1: 'Studio SenhorEle was born from a genuine love for iconic vintage automobiles. Specializing in classic VW Air-Cooled icons and Porsche heritage, our mission is to preserve the authenticity and provenance of every vehicle.',
      p2: 'Every car in our collection undergoes a rigorous evaluation of history, mechanical integrity, and originality, guaranteeing exceptional standards for discerning collectors.',
      p3: 'From the legendary VW Split-Window Bus to prestigious Porsche 911 models, we celebrate timeless engineering and the raw emotion of driving classic machinery.',
      purposeTitle: 'Our Purpose',
      purposeText: 'Connecting global enthusiasts and collectors with rare, meticulously preserved classic automobiles.',
      curationTitle: 'Rigorous Curation',
      curationText: 'Selective inventory focused on originality, Matching Numbers, and documented history.',
      restorationTitle: 'Excellence in Restoration',
      restorationText: 'Partnerships with premier boxer engine mechanics and master coachbuilders.',
      communityTitle: 'Culture & Gatherings',
      communityText: 'Fostering passion for vintage racing culture and international classic car meets.',
      originTitle: 'The Origin',
      originText: 'Like any young person, I loved cars. But it was my middle brother, José, who truly introduced me to this world — a classic car enthusiast who dedicated every spare moment to caring for his vehicles.',
      learningTitle: 'The Learning Journey',
      learningText: 'Many cars were bought and sold — Ford, Chevrolet, Chrysler, Mercedes, even a few Porsches. Restoration didn’t always go as planned, and financial returns were rarely the main reward.',
      diversityTitle: 'The Air-Cooled Universe',
      diversityText: 'The Air-Cooled world is vast, rich in styles and trends. Over the years, I gathered a piece of everything: vintage Germans, Cal-Style, 100% original local classics, German-Look, and custom builds with upgraded engines and finishes.',
      purposeSectionTitle: 'The Purpose',
      purposeSectionText: 'This platform exists to showcase our private collection and friends’ vehicles — not for trade, but to highlight contemporary Brazilian restoration and performance craft across Porsche and Volkswagen.',
      firstCarTitle: 'The First Classic',
      firstCarText: 'In the early 2000s, recommended by my friend Toninho, I acquired my first vintage car: an immaculate, fully original 1967 Aero Willys. I loved it so much it inspired me to build a collection.',
      aircooledArrivalTitle: 'Discovering VW Air-Cooled',
      aircooledArrivalText: 'That is when I entered the VW Air-Cooled world. Invited by my friend Gerson, I joined the Box 767 crew, making lifelong friends and learning the art of classic Volkswagen restoration and tuning.',
      collectionTodayTitle: 'The Collection Today',
      collectionTodayText: 'Today the Studio brings together vehicles from the 1950s through the 2000s — predominantly Air-Cooled, alongside special-edition Beetles, Kombis, and iconic Porsche models.',
    },
    collection: {
      tagline: 'OUR INVENTORY',
      title: 'Exclusive Classic Collection',
      searchPlaceholder: 'Search by model, year or Share ID...',
      filters: {
        all: 'All',
        aircooled: 'VW Air-Cooled',
        porsche: 'Porsche',
        corujinha: 'Split-Window Bus',
        fusca: 'Beetle / Fusca',
        willys: 'Aero Willys',
        instagram: 'Instagram Feed',
      },
      carouselHint: 'Use keyboard arrow keys or swipe to navigate the 3D collection',
      viewDetails: 'View Specifications',
      shareId: 'SHARE ID',
      share: 'Share',
      copied: 'Link copied!',
      noResultsTitle: 'No classic vehicles found',
      noResultsText: 'Try adjusting your search query or selecting a different filter above.',
    },
    guests: {
      title: 'Studio Guests',
      description: 'Stories and automobiles from friends who share our care for automotive culture. Each appearance is editorial and independent from the Studio collection.',
      badge: 'Guest',
      disclaimer: 'Guest vehicle presented through friendship and cultural interest. It is not part of the collection and has no commercial relationship with Studio SenhorEle.',
      openDetails: 'View details',
      share: 'Share',
      copied: 'Link copied',
      shareText: 'Meet this Studio SenhorEle guest',
      copyPrompt: 'Copy this guest link:',
      whatsappLabel: 'Share on WhatsApp',
      empty: 'No guest vehicles have been published yet.',
    },
    partners: {
      title: 'Partners',
      description: 'Professionals and companies who share our passion for the automotive world.',
      actionLabel: 'Meet partner',
      instagramDestination: 'View Instagram',
      websiteDestination: 'Visit website',
      youtubeDestination: 'View YouTube channel',
      fallbackLabel: 'Visual identity being updated',
      newTabLabel: 'opens in a new tab',
      peluciaImageAlt: 'Historic automotive image provided for Pelúcia Estética Automotiva',
      lobatoImageAlt: 'Representative image of Lobato Gui automotive services',
      fuscaNaFotoImageAlt: 'Image from partner channel Fusca na Foto',
      categories: {
        detailing: 'Automotive detailing',
        automotiveServices: 'Automotive services',
        mechanicsAndElectrical: 'Automotive mechanics and electrical',
        performanceAndTechnology: 'Automotive performance and technology',
        youtubePartner: 'Partner channel · automotive recommendations',
      },
    },
    diary: {
      title: 'Studio Diary',
      description: 'News, gatherings and stories from Studio SenhorEle, together with selected recommendations from automotive partners.',
      recommendation: 'Recommendation',
      manual: 'Studio SenhorEle',
      loading: 'Loading updates…',
      error: 'The Diary could not be loaded right now. Please try again later.',
      retry: 'Try again',
      empty: 'There are no published updates yet. Check back soon.',
      playVideo: 'Play video',
      openOriginal: 'View original post',
      share: 'Share',
      copied: 'Link copied',
      viewArchive: 'View archive',
      hideArchive: 'Hide archive',
      archivePagination: 'Studio Diary archive pagination',
      featuredPagination: 'Featured Studio Diary pagination',
      previous: 'Previous',
      next: 'Next',
      channelPartner: 'Partner Channel',
      subscribeChannel: 'Subscribe to Channel',
      watchOnYoutube: 'Watch on YouTube',
      hashtagsTitle: 'Tags & Topics',
      captionTitle: 'Caption',
    },
    instagramCard: {
      viewPost: 'View on Instagram',
      inquirePost: 'Ask via WhatsApp',
      badge: 'Instagram Highlight',
      sharePost: 'Share',
      linkCopied: 'Link copied!',
    },
    inquire: {
      title: 'Contact Us',
      subtitle: 'Get in touch directly with our curation team to ask questions or get more information about the collection.',
      carSelected: 'Vehicle of Interest',
      nameLabel: 'Your Name',
      namePlaceholder: 'e.g. Robert Smith',
      phoneLabel: 'Phone / WhatsApp',
      phonePlaceholder: 'e.g. +1 (555) 019-2834',
      emailLabel: 'Email Address',
      emailPlaceholder: 'e.g. robert@example.com',
      messageLabel: 'Message',
      messagePlaceholder: 'Tell us about your interest or questions...',
      submitButton: 'Send Message',
      whatsappDirect: 'Contact on WhatsApp Directly',
      successMessage: 'Message sent successfully! Our curation team will contact you shortly.',
      close: 'Close',
    },
    vehicleDetail: {
      specsTitle: 'Technical Specs & Details',
      historyTitle: 'History & Provenance',
      shareIdLabel: 'SHARE CODE / UNIQUE ID',
      copyLink: 'Copy Link / ID',
      copied: 'Copied!',
      inquireVehicle: 'Inquire About This Vehicle',
      year: 'Year',
      engine: 'Engine Specs',
      transmission: 'Transmission',
      color: 'Exterior Color',
      mileage: 'Mileage',
      status: 'Condition',
      placaPreta: 'Collector Plate',
      matchingNumbers: 'Matching Numbers',
      yes: 'Yes',
      no: 'No',
      doubtTitle: 'Have a question about this car?',
      doubtPlaceholder: 'Type your question about this vehicle...',
      doubtSendButton: 'Send via WhatsApp',
      doubtEmptyHint: 'Please type your question before continuing.',
    },
    galleryModal: {
      viewGallery: 'View Fullscreen Art Gallery',
      photoCounter: 'Photo {current} of {total}',
      keyboardHint: 'Use arrow keys (← →) to navigate or ESC to close',
      close: 'Close Gallery',
      zoomHD: 'High Definition HD',
      angleLabel: 'Exhibition Angle',
    },
    footer: {
      description: 'Specialized curation of classic VW Air-Cooled and Porsche vehicles. Preserving history and moving passion.',
      navigationTitle: 'Navigation',
      contactTitle: 'Collection conversations',
      hoursTitle: 'Opening Hours',
      hoursText: 'Monday to Friday: 09:00 - 18:00',
      rights: 'All rights reserved.',
    },
  },
  de: {
    nav: {
      collection: 'Kollektion',
      guests: 'Studio-Gäste',
      diary: 'Studio-Tagebuch',
      studio: 'Das Studio',
      about: 'Über uns',
      purpose: 'Philosophie',
      partners: 'Partner',
      inquire: 'Kontakt',
    },
    hero: {
      explore: 'ENTDECKEN',
    },
    about: {
      tagline: 'AUTOMOBILE KURATIERUNG & LEIDENSCHAFT',
      title: 'Die Kunst der weltweiten Fahrzeugkonservierung',
      p1: 'Das Studio SenhorEle entstand aus einer tiefen Leidenschaft für zeitlose Automobilklassiker. Spezialisiert auf seltene VW Luftgekühlt-Modelle und klassische Porsche-Fahrzeuge.',
      p2: 'Jedes Fahrzeug unserer Sammlung wird einer strengen Überprüfung hinsichtlich Herkunft, Originalität und mechanischem Zustand unterzogen.',
      p3: 'Vom legendären VW T1 Bulli bis hin zum begehrten Porsche 911 feiern wir zeitlose Ingenieurskunst und die pure Emotion des klassischen Fahrens.',
      purposeTitle: 'Unsere Philosophie',
      purposeText: 'Verbindung von weltweiten Sammlern mit seltenen, perfekt erhaltenen Automobillegenden.',
      curationTitle: 'Strikte Kuratierung',
      curationText: 'Ausgewählter Bestand mit Fokus auf Originalität, Matching Numbers und lückenlose Historie.',
      restorationTitle: 'Restaurierung auf Höchstem Niveau',
      restorationText: 'Partnerschaften mit den besten Boxermotor-Spezialisten und Meisterbetrieben.',
      communityTitle: 'Kultur & Begeisterung',
      communityText: 'Förderung der historischen Rennkultur und internationaler Klassiker-Treffen.',
      originTitle: 'Der Ursprung',
      originText: 'Wie jeder Jugendliche liebte ich Autos. Aber erst mein mittlerer Bruder José führte mich richtig in diese Welt ein — ein leidenschaftlicher Sammler, der jede freie Minute seinen Fahrzeugen widmete.',
      learningTitle: 'Die Lernreise',
      learningText: 'Es wurden viele Autos gekauft und verkauft — Ford, Chevrolet, Chrysler, Mercedes, sogar einige Porsches. Nicht jede Restaurierung verlief wie geplant, doch die Begeisterung wuchs stetig.',
      diversityTitle: 'Das Luftgekühlte Universum',
      diversityText: 'Die Welt der luftgekühlten Fahrzeuge ist riesig. Im Laufe der Zeit sammelte ich von allem etwas: deutsche Klassiker, Cal-Style, absolut originale Modelle, German-Look und leistungsgesteigerte Unikate.',
      purposeSectionTitle: 'Das Ziel',
      purposeSectionText: 'Diese Plattform präsentiert unsere eigene Sammlung sowie Fahrzeuge von Freunden — nicht zum Verkauf, sondern zur Wertschätzung hochkarätiger Restaurierungskunst bei Porsche und Volkswagen.',
      firstCarTitle: 'Das Erste Klassische Auto',
      firstCarText: 'Anfang der 2000er Jahre kaufte ich auf Empfehlung meines Freundes Toninho mein erstes klassisches Auto: einen makellosen Aero Willys von 1967. Die Faszination ließ mich nie wieder los.',
      aircooledArrivalTitle: 'Der Einstieg bei VW Luftgekühlt',
      aircooledArrivalText: 'So entdeckte ich das VW Air-Cooled Universum. Eingeladen von meinem Freund Gerson stieß ich zur Box 767 Gruppe, fand Freunde und lernte die Kunst der VW-Klassiker-Restaurierung.',
      collectionTodayTitle: 'Die Sammlung Heute',
      collectionTodayText: 'Heute vereint das Studio Fahrzeuge aus den 50er bis 2000er Jahren — überwiegend luftgekühlt, ergänzt durch besondere Käfer, T1 Bullis und exklusive Porsche-Modelle.',
    },
    collection: {
      tagline: 'UNSER BESTAND',
      title: 'Exklusive Klassiker-Sammlung',
      searchPlaceholder: 'Suche nach Modell, Jahr oder Share-ID...',
      filters: {
        all: 'Alle',
        aircooled: 'VW Luftgekühlt',
        porsche: 'Porsche',
        corujinha: 'VW T1 Bulli',
        fusca: 'VW Käfer',
        willys: 'Aero Willys',
        instagram: 'Instagram Feed',
      },
      carouselHint: 'Nutzen Sie die Pfeiltasten oder Wischen zur Navigation in der 3D-Galerie',
      viewDetails: 'Technische Daten',
      shareId: 'SHARE-ID',
      share: 'Teilen',
      copied: 'Link kopiert!',
      noResultsTitle: 'Keine Klassiker gefunden',
      noResultsText: 'Bitte passen Sie Ihre Suchanfrage oder den gewählten Filter an.',
    },
    guests: {
      title: 'Gäste des Studios',
      description: 'Geschichten und Fahrzeuge von Freunden, die unsere Wertschätzung für automobile Kultur teilen. Jeder Auftritt ist redaktionell und unabhängig von der Studio-Sammlung.',
      badge: 'Gastfahrzeug',
      disclaimer: 'Dieses Gastfahrzeug wird aus Freundschaft und kulturellem Interesse vorgestellt. Es gehört nicht zur Sammlung und steht in keiner geschäftlichen Beziehung zum Studio SenhorEle.',
      openDetails: 'Details ansehen',
      share: 'Teilen',
      copied: 'Link kopiert',
      shareText: 'Entdecken Sie dieses Gastfahrzeug des Studio SenhorEle',
      copyPrompt: 'Link zu diesem Gastfahrzeug kopieren:',
      whatsappLabel: 'Über WhatsApp teilen',
      empty: 'Derzeit sind noch keine Gastfahrzeuge veröffentlicht.',
    },
    partners: {
      title: 'Partner',
      description: 'Fachleute und Unternehmen, die unsere Leidenschaft für die automobile Welt teilen.',
      actionLabel: 'Partner kennenlernen',
      instagramDestination: 'Instagram ansehen',
      websiteDestination: 'Website besuchen',
      youtubeDestination: 'YouTube-Kanal ansehen',
      fallbackLabel: 'Visuelle Identität wird aktualisiert',
      newTabLabel: 'wird in einem neuen Tab geöffnet',
      peluciaImageAlt: 'Historisches Automobilbild, bereitgestellt für Pelúcia Estética Automotiva',
      lobatoImageAlt: 'Repräsentatives Bild der Automobildienstleistungen von Lobato Gui',
      fuscaNaFotoImageAlt: 'Bild des Partnerkanals Fusca na Foto',
      categories: {
        detailing: 'Fahrzeugaufbereitung',
        automotiveServices: 'Automobildienstleistungen',
        mechanicsAndElectrical: 'Kfz-Mechanik und -Elektrik',
        performanceAndTechnology: 'Fahrzeugoptimierung und -technologie',
        youtubePartner: 'Partnerkanal · automobile Empfehlungen',
      },
    },
    diary: {
      title: 'Studio-Tagebuch',
      description: 'Neuigkeiten, Treffen und Geschichten des Studio SenhorEle sowie ausgewählte Empfehlungen von Partnern aus der Automobilwelt.',
      recommendation: 'Empfehlung',
      manual: 'Studio SenhorEle',
      loading: 'Neuigkeiten werden geladen…',
      error: 'Das Tagebuch kann momentan nicht geladen werden. Bitte versuchen Sie es später erneut.',
      retry: 'Erneut versuchen',
      empty: 'Noch wurden keine Neuigkeiten veröffentlicht. Schauen Sie bald wieder vorbei.',
      playVideo: 'Video abspielen',
      openOriginal: 'Originalbeitrag ansehen',
      share: 'Teilen',
      copied: 'Link kopiert',
      viewArchive: 'Archiv ansehen',
      hideArchive: 'Archiv ausblenden',
      archivePagination: 'Seitennavigation im Studio-Tagebuch-Archiv',
      featuredPagination: 'Seitennavigation der hervorgehobenen Neuigkeiten',
      previous: 'Zurück',
      next: 'Weiter',
      channelPartner: 'Partner-Kanal',
      subscribeChannel: 'Kanal abonnieren',
      watchOnYoutube: 'Auf YouTube ansehen',
      hashtagsTitle: 'Tags & Themen',
      captionTitle: 'Beschreibung',
    },
    instagramCard: {
      viewPost: 'Auf Instagram ansehen',
      inquirePost: 'Über WhatsApp anfragen',
      badge: 'Instagram-Highlight',
      sharePost: 'Teilen',
      linkCopied: 'Link kopiert!',
    },
    inquire: {
      title: 'Kontakt aufnehmen',
      subtitle: 'Kontaktieren Sie unser Experten-Team für Fragen zu unserem Bestand.',
      carSelected: 'Gewähltes Fahrzeug',
      nameLabel: 'Ihr Name',
      namePlaceholder: 'z.B. Hans Müller',
      phoneLabel: 'Telefon / WhatsApp',
      phonePlaceholder: 'z.B. +49 170 1234567',
      emailLabel: 'E-Mail-Adresse',
      emailPlaceholder: 'z.B. hans@beispiel.de',
      messageLabel: 'Nachricht',
      messagePlaceholder: 'Teilen Sie uns Ihr Anliegen oder Ihre Fragen mit...',
      submitButton: 'Nachricht Absenden',
      whatsappDirect: 'Direkt per WhatsApp kontaktieren',
      successMessage: 'Vielen Dank! Unser Team wird sich in Kürze bei Ihnen melden.',
      close: 'Schließen',
    },
    vehicleDetail: {
      specsTitle: 'Technische Daten & Details',
      historyTitle: 'Historie & Provenienz',
      shareIdLabel: 'SHARE-CODE / EINDEUTIGE ID',
      copyLink: 'Link / ID kopieren',
      copied: 'Kopiert!',
      inquireVehicle: 'Fahrzeug Anfragen',
      year: 'Baujahr',
      engine: 'Motorisierung',
      transmission: 'Getriebe',
      color: 'Außenfarbe',
      mileage: 'Laufleistung',
      status: 'Zustand',
      placaPreta: 'Sammler-Zulassung',
      matchingNumbers: 'Matching Numbers',
      yes: 'Ja',
      no: 'Nein',
      doubtTitle: 'Fragen zu diesem Fahrzeug?',
      doubtPlaceholder: 'Geben Sie eine Frage zu diesem Fahrzeug ein...',
      doubtSendButton: 'Über WhatsApp senden',
      doubtEmptyHint: 'Bitte geben Sie zuerst eine Frage ein.',
    },
    galleryModal: {
      viewGallery: 'In Vollbild-Galerie ansehen',
      photoCounter: 'Foto {current} von {total}',
      keyboardHint: 'Nutzen Sie die Pfeiltasten (← →) oder ESC zum Schließen',
      close: 'Galerie Schließen',
      zoomHD: 'Hohe Auflösung HD',
      angleLabel: 'Ausstellungswinkel',
    },
    footer: {
      description: 'Spezialisierte Kuratierung von VW Luftgekühlt- und Porsche-Klassikern. Geschichte bewahren und Leidenschaft bewegen.',
      navigationTitle: 'Navigation',
      contactTitle: 'Gespräche über die Sammlung',
      hoursTitle: 'Öffnungszeiten',
      hoursText: 'Montag bis Freitag: 09:00 - 18:00 Uhr',
      rights: 'Alle Rechte vorbehalten.',
    },
  },
};
