import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playMechanicalClick } from '../utils/audio';
import { useAccessibleModal } from '../hooks/useAccessibleModal';
import { useLanguage } from '../i18n/LanguageContext';
import { buildWhatsAppLink } from '../config/contact';
import { buildShareUrl } from '../utils/share';
import { webpImageUrl } from '../utils/imageUtils';
import ImageLightboxModal, { GalleryItem } from './ImageLightboxModal';

export interface VehicleDetail {
  id: string;
  shareId: string;
  title: string;
  subtitle: string;
  image: string;
  gallery?: GalleryItem[];
  year: string;
  engine?: string;
  transmission?: string;
  color?: string;
  power?: string;
  restorationWorkshop?: string;
  restorationYear?: string;
  condition?: string;
  description?: string;
  restorationHistory?: string[];
  history?: string[];
  curiosities?: string[];
  presentationText?: string;
  variationsNote?: string;
  specs: { label: string; value: string }[];
}

export const VEHICLE_DETAILS: Record<string, VehicleDetail> = {
  'porsche-911': {
    id: 'porsche-911',
    shareId: 'SRL-911-1973',
    title: 'Porsche 911 Classic',
    subtitle: 'Matching Numbers • 1973',
    image: '/assets/images/porsche-911-classic-1973.jpg',
    gallery: [
      {
        src: '/assets/images/porsche-911-classic-1973.jpg',
        angleLabel: 'Ângulo Principal • Exterior F-Series',
        caption: 'Irish Green histórico com rodas Fuchs 15" originais de fábrica.',
      },
      {
        src: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=80',
        angleLabel: 'Engenharia • Motor Boxer Flat-6',
        caption: 'Bloco 2.4L refrigerado a ar com dupla carburação Zenith e matching numbers.',
      },
      {
        src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80',
        angleLabel: 'Cockpit Vintage • Tapeçaria e Relógios VDO',
        caption: 'Acabamento interno em couro bovino bege canela com volante de época.',
      },
      {
        src: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=80',
        angleLabel: 'Perfil Traseiro • Emblemas & Grade de Época',
        caption: 'Detalhes originais de grade cromada e certificação de coleção.',
      },
    ],
    year: '1973',
    engine: '2.4L Flat-6 Boxer Air Cooled',
    transmission: 'Manual 5 Marchas Type 915',
    color: 'Verde Irish Green / Couro Bege Canela',
    power: '165 cv @ 6.200 RPM',
    restorationWorkshop: 'Ateliê Especializado Porsche & Studio SR. L',
    restorationYear: '2020 - 2022',
    condition: 'Concours Grade - 100% Matching Numbers',
    description: 'Um ícone incomparável do design e engenharia esportiva alemã dos anos 70. Mantém o motor original refrigerado a ar com números correspondentes de fábrica e certificação de coleção.',
    restorationHistory: [
      'Desmonte integral de carroceria (Nuts & Bolts restoration) com gabarito de fábrica.',
      'Revisão completa do motor Boxer 2.4L com carburadores duplos Zenith e componentes originais alemães.',
      'Restauração de tapeçaria em couro bovino no padrão original de 1973.',
      'Instrumentos de painel VDO restaurados com calibração histórica de época.',
      'Sistema elétrico 100% refeito seguindo o diagrama elétrico original Porsche de fábrica.'
    ],
    specs: [
      { label: 'Chassi / ID', value: 'SRL-911-1973' },
      { label: 'Carroceria', value: 'Coupé F-Series' },
      { label: 'Alimentação', value: 'Dupla Carburação Zenith' },
      { label: 'Rodas / Pneus', value: 'Fuchs 15" Originais / Pirelli CN36' }
    ]
  },
  'vw-kombi': {
    id: 'vw-kombi',
    shareId: 'SRL-KMB-1970',
    title: 'VW Kombi Corujinha',
    subtitle: 'Restored Heritage • 1970',
    image: '/assets/images/vw-kombi-corujinha-1970.jpg',
    gallery: [
      {
        src: '/assets/images/vw-kombi-corujinha-1970.jpg',
        angleLabel: 'Vista Frontal • T1 Corujinha 6 Portas',
        caption: 'Pintura bi-tom Azul Lótus & Branco Lótus com frisos originais em alumínio.',
      },
      {
        src: 'https://images.unsplash.com/photo-1527247043589-98e6ac08f56c?auto=format&fit=crop&w=1600&q=80',
        angleLabel: 'Interior Vintage • Salão de Passageiros',
        caption: 'Tapeçaria artesanal estilo curvim de época acolchoado para 9 ocupantes.',
      },
      {
        src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80',
        angleLabel: 'Detalhes de Época • Vidros & Logotipia VW',
        caption: 'Emblemas de alumínio polido e borrachas novas de vedação de fábrica.',
      },
    ],
    year: '1970',
    engine: '1500cc Air-Cooled 4 cilindros Boxer',
    transmission: 'Manual de 4 marchas com redução original',
    color: 'Saia e Blusa - Azul Lotus e Branco Lótus',
    power: '52 cv SAE',
    restorationWorkshop: 'Box 767 / Studio Senhorele',
    restorationYear: '2019 - 2021',
    condition: 'Restauro Artensanal Completo',
    description: 'A clássica Kombi T1 "Corujinha" de 6 portas. Símbolo de liberdade e nostalgia, cuidadosamente preservada com detalhes de acabamento de época e mecânica impecável.',
    restorationHistory: [
      'Remoção total de tinta e funilaria artesanal sem sobreposição de chapas.',
      'Pintura em dois tons "Saia e Blusa" nas cores históricas originais VW de 1970.',
      'Reconstrução do motor 1500cc Boxer Air Cooled com carburação simples e componentes novos.',
      'Interior customizado em curvim de época estilo vintage com estofamento acolchoado.',
      'Substituição de todas as borrachas, vidros originais e frisos em alumínio polido.'
    ],
    specs: [
      { label: 'Chassi / ID', value: 'SRL-KMB-1970' },
      { label: 'Configuração', value: '6 Portas / T1 Primeira Geração' },
      { label: 'Sistema Elétrico', value: '12V Conversão com fiação vintage' },
      { label: 'Capacidade', value: '9 Passageiros / Layout de época' }
    ]
  },
  'vw-fusca-cal': {
    id: 'vw-fusca-cal',
    shareId: 'SRL-FSC-1968',
    title: 'VW Fusca Cal Style',
    subtitle: 'Air Cooled Custom • 1968',
    image: '/assets/images/vw-fusca-cal-style-1968.jpg',
    gallery: [
      {
        src: '/assets/images/vw-fusca-cal-style-1968.jpg',
        angleLabel: 'Vista Frontal • Cal Look California Style',
        caption: 'Pintura Vermelho Granada com suspensão encurtada e catraca dupla.',
      },
      {
        src: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1600&q=80',
        angleLabel: 'Postura & Rodas • BRM Diamantadas',
        caption: 'Rodas BRM aro 15 com acabamento diamantado e perfil baixo dianteiro.',
      },
      {
        src: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=80',
        angleLabel: 'Motor 1600cc Dual Solex 32',
        caption: 'Dupla carburação regulada com escapamento inox 4-em-1 e abafador cerâmico.',
      },
    ],
    year: '1968',
    engine: '1600cc Air-Cooled com comando W110 e carburação dupla Solex 32',
    transmission: 'Manual 4 marchas rápida com alavanca EMPI',
    color: 'Vermelho Granada / Detalhes Cromo e Dourado',
    power: '75 cv em dinamômetro',
    restorationWorkshop: 'Oficina Box 767',
    restorationYear: '2022 - 2023',
    condition: 'Custom Cal-Look de Exposição',
    description: 'Inspirado na cultura californiana dos anos 70 (California Look). Fusca 1300 rebaixado na medida ideal, com rodas aro 15 de época, interior limpo e preparação de motor apimentada.',
    restorationHistory: [
      'Faceta de suspensão dianteira encurtada com catraca regulável.',
      'Motor 1600cc montado do zero com virabrequim equilibrado e dupla carburação regulada.',
      'Rodas BRM com acabamento diamantado e pneus perfil baixo traseiro/dianteiro.',
      'Interior estilo "Clean Cal-Look" com bancos gomados e medidores adicionais no painel.',
      'Escapamento esportivo em aço inox tipo 4-em-1 com abafador cerâmico.'
    ],
    specs: [
      { label: 'Chassi / ID', value: 'SRL-FSC-1968' },
      { label: 'Estilo', value: 'Cal Look Vintage' },
      { label: 'Suspensão', value: 'Catraca dupla & mangas invertidas' },
      { label: 'Acessórios', value: 'Alavanca EMPI & Medidores Cronomac' }
    ]
  },
  'aero-willys': {
    id: 'aero-willys',
    shareId: 'SRL-AWL-1967',
    title: 'Aero Willys',
    subtitle: 'Original Impecável • 1967',
    image: '/assets/images/aero-willys-1967.jpg',
    gallery: [
      {
        src: '/assets/images/aero-willys-1967.jpg',
        angleLabel: 'Vista Frontal • Sedan Executivo Willys',
        caption: 'O primeiro clássico do acervo. Conservação impecável e Placa Preta.',
      },
      {
        src: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80',
        angleLabel: 'Frisos e Cromagem • Grade de Época',
        caption: 'Calotas originais estampadas e para-choques cromados com brilho espelhado.',
      },
      {
        src: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80',
        angleLabel: 'Interior Executivo • Veludo & Painel de Madeira',
        caption: 'Troca de marcha na coluna de direção e tapeçaria original em veludo de fábrica.',
      },
    ],
    year: '1967',
    engine: 'Motor 2600 6 Cilindros em Linha "Itamaraty"',
    transmission: 'Manual de 4 marchas na coluna de direção',
    color: 'Verde Clássico de Época / Interior Tecido Veludo Original',
    power: '110 cv SAE',
    restorationWorkshop: 'Preservação de Acervo / Studio SR. L',
    restorationYear: 'Conservado com Certificado de Placa Preta',
    condition: 'Extremamente Raro e Impecável',
    description: 'O marco inicial da coleção do Studio Senhorele. Comprado nos anos 2000 por indicação de amigos, este Aero Willys 1967 preserva a sofisticação e o luxo dos grandes sedãs nacionais dos anos 60.',
    restorationHistory: [
      'Veículo de conservação histórica excepcional com pintura e tapeçaria altamente preservadas.',
      'Revisão completa de mecânica original 6 cilindros, carburador Carter e freios hidráulicos.',
      'Cromagem renovada nas calotas, para-choques e frisos de grade dianteira.',
      'Pneus faixa branca aro 15 com rodas estampadas originais de fábrica.',
      'Manutenção preventiva periódica para preservar a dirigibilidade suave de época.'
    ],
    specs: [
      { label: 'Chassi / ID', value: 'SRL-AWL-1967' },
      { label: 'Série', value: 'Sedan Executivo Willys-Overland' },
      { label: 'Cilindrada', value: '2.6L (161 cu in) 6 em linha' },
      { label: 'Destaque', value: 'Primeiro veículo do acervo do Studio' }
    ]
  },
  'aircooled-engine': {
    id: 'aircooled-engine',
    shareId: 'SRL-BOX-767',
    title: 'Preparação Air Cooled',
    subtitle: 'Box 767 Restauração • Custom',
    image: '/assets/images/aircooled-box-767.jpg',
    gallery: [
      {
        src: '/assets/images/aircooled-box-767.jpg',
        angleLabel: 'Engenharia • Usinagem & Acabamento Box 767',
        caption: 'Montagem artesanal de bloco de magnésio/alumínio com dupla carburação Weber.',
      },
      {
        src: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1600&q=80',
        angleLabel: 'Bancada de Testes • Dinamômetro & Pressão de Óleo',
        caption: 'Aferição estática de temperatura, pressão e estanqueidade dos componentes.',
      },
    ],
    year: 'Custom & High Performance',
    engine: 'Motores Boxer 1600cc a 2100cc Air Cooled sob medida',
    transmission: 'Câmbio trabalhado com relações longas / Blocante',
    color: 'Acabamento Usinado / Alumínio Polido & Pintura Epóxi',
    power: 'Ajuste sob medida (80cv a 150cv+)',
    restorationWorkshop: 'Oficina Especializada Box 767',
    restorationYear: 'Projetos Contínuos',
    condition: 'Alta Performance & Engenharia Clássica',
    description: 'A essência do desenvolvimento técnico no Studio Senhorele. Em parceria com a turma do Box 767, desenvolvemos restaurações e montagens de motores Boxer refrigerados a ar com rigor absoluto e acabamento artesanal.',
    restorationHistory: [
      'Retífica e usinagem de precisão de blocos de alumínio e magnésio VW/Porsche.',
      'Equilíbrio dinâmico de virabrequim, volante e conjunto de pistões forjados.',
      'Instalação de radiadores de óleo externos com ventoinhas elétricas termostáticas.',
      'Acerto individual de carburação dupla Weber 40 / 44 DCOE ou injeção programável.',
      'Testes de bancada para aferição de pressão de óleo, temperatura e estanqueidade.'
    ],
    specs: [
      { label: 'Chassi / ID', value: 'SRL-BOX-767' },
      { label: 'Especialidade', value: 'Motores VW Boxer & Porsche Flat 4/6' },
      { label: 'Oficina', value: 'Box 767 - Mogi das Cruzes / SP' },
      { label: 'Serviços', value: 'Restauração, Preparação' }
    ]
  }
};

import { CustomVehicleService } from '../services/customVehicleService';

interface VehicleDetailModalProps {
  vehicleId: string | null;
  onClose: () => void;
  onInquire?: (carTitle: string) => void;
}

export default function VehicleDetailModal({
  vehicleId,
  onClose,
}: VehicleDetailModalProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [questionError, setQuestionError] = useState(false);
  const modalRef = useAccessibleModal<HTMLDivElement>(Boolean(vehicleId), onClose);

  let vehicle: VehicleDetail | null = vehicleId ? VEHICLE_DETAILS[vehicleId] : null;
  const customVehicle = vehicleId
    ? CustomVehicleService.getCustomVehicles().find((candidate) => candidate.id === vehicleId)
    : undefined;
  const isGuest = customVehicle?.collectionKind === 'guest';

  if (!vehicle && vehicleId) {
    const customMatch = customVehicle;
    if (customMatch) {
      vehicle = {
        id: customMatch.id,
        shareId: customMatch.shareId,
        title: customMatch.title,
        subtitle: customMatch.subtitle,
        image: customMatch.image,
        year: customMatch.year,
        engine: customMatch.engine,
        transmission: customMatch.transmission,
        color: customMatch.color,
        power: customMatch.power,
        condition: customMatch.condition,
        description: customMatch.description || customMatch.presentationText,
        presentationText: customMatch.presentationText,
        variationsNote: customMatch.variationsNote,
        history: customMatch.history,
        curiosities: customMatch.curiosities,
        restorationHistory: customMatch.history,
        gallery: [
          { src: webpImageUrl(customMatch.image), angleLabel: 'Imagem 1', caption: customMatch.subtitle },
          ...(customMatch.image2 ? [{ src: webpImageUrl(customMatch.image2), angleLabel: 'Imagem 2', caption: customMatch.subtitle }] : []),
          ...(customMatch.image3 ? [{ src: webpImageUrl(customMatch.image3), angleLabel: 'Imagem 3', caption: customMatch.subtitle }] : []),
          ...(customMatch.gallery || []).map((src, i) => ({ src: webpImageUrl(src), angleLabel: `Imagem ${i + 4}`, caption: customMatch.subtitle })),
        ],
        specs:
          customMatch.specs && customMatch.specs.length > 0
            ? customMatch.specs
            : [
                { label: 'Chassi / ID', value: customMatch.shareId },
                { label: 'Motor', value: customMatch.engine },
                { label: 'Transmissão', value: customMatch.transmission },
              ],
      };
    }
  }

  if (!vehicle) return null;

  const vehicleShareUrl = buildShareUrl(vehicle.shareId);

  useEffect(() => {
    if (!vehicleId || !vehicle) return;
    const previousUrl = window.location.href;
    const shareUrl = buildShareUrl(vehicle.shareId);
    window.history.replaceState({}, '', shareUrl);
    return () => {
      window.history.replaceState({}, '', previousUrl);
    };
  }, [vehicleId, vehicle?.shareId]);

  const handleShare = async () => {
    playMechanicalClick('click');
    const shareUrl = vehicleShareUrl;
    const shareText = isGuest
      ? `Conheça este convidado do Studio SenhorEle: ${vehicle.title} (${vehicle.year}) - ID: #${vehicle.shareId}`
      : `Confira este clássico no Studio Senhorele: ${vehicle.title} (${vehicle.year}) - ID: #${vehicle.shareId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: vehicle.title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copie o link:', shareUrl);
    }
  };

  const handleWhatsAppShare = () => {
    playMechanicalClick('click');
    const shareUrl = vehicleShareUrl;
    const shareText = isGuest
      ? `Conheça este convidado do Studio SenhorEle: ${vehicle.title} (${vehicle.year}) - ID: #${vehicle.shareId}\n${shareUrl}`
      : `Confira este clássico no Studio Senhorele: ${vehicle.title} (${vehicle.year}) - ID: #${vehicle.shareId}\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
  };

  const handleSendQuestion = () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setQuestionError(true);
      return;
    }
    setQuestionError(false);
    playMechanicalClick('click');

    const lines = [
      'Olá! Estou visitando o site da Coleção SrL e tenho uma dúvida sobre este veículo:',
      '',
      `🚗 ${vehicle.title}`,
    ];
    if (vehicle.year) lines.push(`📅 ${vehicle.year}`);
    lines.push(
      '',
      'Minha dúvida:',
      trimmedQuestion,
      '',
      '🔗 Página do veículo:',
      window.location.href,
    );

    window.open(buildWhatsAppLink(lines.join('\n')), '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {vehicleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/85 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehicle-detail-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl bg-surface-container-high border border-surface-variant/40 rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]"
          >
            {/* Header Image with close button & badge */}
            <div className="relative h-64 sm:h-80 w-full shrink-0 overflow-hidden bg-background">
              <img
                src={webpImageUrl(vehicle.image)}
                alt={vehicle.title}
                decoding="async"
                width="1600"
                height="900"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-surface-container-high/20 to-transparent pointer-events-none" />

              {/* Share ID Badge & Quick Actions */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="bg-background/80 backdrop-blur-md border border-secondary/50 text-secondary font-label-caps text-xs px-3 py-1.5 rounded-full shadow-md flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[14px]">tag</span>
                    <span className="truncate">#{vehicle.shareId}</span>
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      playMechanicalClick('slide');
                      setIsLightboxOpen(true);
                    }}
                    className="bg-background/80 backdrop-blur-md border border-amber-glow/60 hover:border-amber-glow text-amber-glow font-label-caps text-xs px-3 py-1.5 rounded-full shadow-md flex items-center space-x-1.5 cursor-pointer hover:bg-amber-glow/20 transition-all shrink-0"
                    title="Abrir Galeria de Arte Fullscreen"
                    aria-label={t.galleryModal.viewGallery}
                  >
                    <span className="material-symbols-outlined text-[15px]">fullscreen</span>
                    <span className="hidden sm:inline">{t.galleryModal.viewGallery}</span>
                  </motion.button>
                </div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  onClick={onClose}
                  className="text-on-surface-variant hover:text-parchment transition-colors p-2.5 rounded-full bg-background/60 backdrop-blur-md border border-surface-variant/40 hover:bg-surface-variant/60 cursor-pointer shadow-lg shrink-0"
                  aria-label="Fechar modal"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </motion.button>
              </div>

              {/* Title & Subtitle overlay */}
              <div className="absolute bottom-4 left-6 right-6">
                <span className="font-label-caps text-xs text-secondary tracking-widest uppercase block mb-1">
                  {isGuest ? 'Convidado do Studio • Presença editorial' : 'Studio Senhorele • Curadoria'}
                </span>
                <h2
                  id="vehicle-detail-title"
                  className="font-headline-lg text-2xl sm:text-4xl text-parchment font-bold drop-shadow-md"
                >
                  {vehicle.title}
                </h2>
                <p className="font-label-caps text-xs sm:text-sm text-secondary/90 tracking-wide mt-1">
                  {vehicle.subtitle}
                </p>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar">
              {isGuest && (
                <aside className="rounded-xl border border-secondary/35 bg-racing-green-dark/45 p-4" aria-label="Informação sobre o veículo convidado">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-[20px] text-secondary" aria-hidden="true">handshake</span>
                    <div>
                      <p className="font-label-caps text-xs text-secondary">Convidado do Studio</p>
                      <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                        Veículo convidado, apresentado por amizade e interesse cultural. Não integra o acervo e não possui vínculo comercial com o Studio SenhorEle.
                      </p>
                    </div>
                  </div>
                </aside>
              )}
              {/* Overview Description */}
              {vehicle.description && (
                <div className="space-y-3">
                  <p className="font-body-lg text-lg text-parchment/90 leading-relaxed font-serif italic border-l-2 border-secondary pl-4 py-1">
                    "{vehicle.description}"
                  </p>
                  {vehicle.variationsNote && (
                    <p className="font-label-caps text-xs text-on-surface-variant leading-relaxed">
                      {vehicle.variationsNote}
                    </p>
                  )}
                </div>
              )}

              {/* Technical Specifications Grid */}
              <div className="space-y-4">
                <h3 className="font-headline-md text-xl text-parchment flex items-center space-x-2 border-b border-surface-variant/30 pb-2">
                  <span className="material-symbols-outlined text-secondary">tune</span>
                  <span>{t.vehicleDetail.specsTitle}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {vehicle.engine && (
                    <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-4 flex flex-col">
                      <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                        {t.vehicleDetail.engine}
                      </span>
                      <span className="font-body-md text-parchment font-medium">{vehicle.engine}</span>
                    </div>
                  )}

                  {vehicle.transmission && (
                    <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-4 flex flex-col">
                      <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                        {t.vehicleDetail.transmission}
                      </span>
                      <span className="font-body-md text-parchment font-medium">{vehicle.transmission}</span>
                    </div>
                  )}

                  {vehicle.color && (
                    <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-4 flex flex-col">
                      <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                        {t.vehicleDetail.color}
                      </span>
                      <span className="font-body-md text-parchment font-medium">{vehicle.color}</span>
                    </div>
                  )}

                  {vehicle.power && (
                    <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-4 flex flex-col">
                      <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                        Potência Estimada
                      </span>
                      <span className="font-body-md text-parchment font-medium">{vehicle.power}</span>
                    </div>
                  )}

                  {vehicle.condition && (
                    <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-4 flex flex-col">
                      <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                        {t.vehicleDetail.status}
                      </span>
                      <span className="font-body-md text-secondary font-medium">{vehicle.condition}</span>
                    </div>
                  )}

                  {vehicle.year && (
                    <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-4 flex flex-col">
                      <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                        {t.vehicleDetail.year}
                      </span>
                      <span className="font-body-md text-parchment font-medium">
                        {vehicle.year}
                        {vehicle.restorationYear && vehicle.restorationYear !== vehicle.year ? ` (${vehicle.restorationYear})` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Additional Spec Badges (campos vazios são omitidos) */}
                {vehicle.specs.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {vehicle.specs
                      .filter((spec) => spec.value && spec.value.trim() !== '')
                      .map((spec, i) => (
                        <div key={i} className="bg-surface-container-lowest/60 rounded-lg p-3 border border-surface-variant/20">
                          <div className="text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">
                            {spec.label}
                          </div>
                          <div className="text-xs font-semibold text-secondary mt-0.5 truncate">
                            {spec.value}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Histórico do Modelo / Proveniência (oculto se sem dados fidedignos) */}
              {vehicle.restorationHistory && vehicle.restorationHistory.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-headline-md text-xl text-parchment flex items-center space-x-2 border-b border-surface-variant/30 pb-2">
                    <span className="material-symbols-outlined text-secondary">history_edu</span>
                    <span>{t.vehicleDetail.historyTitle}</span>
                  </h3>

                  <div className="space-y-3">
                    {vehicle.restorationHistory.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-secondary/20 border border-secondary/60 text-secondary text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          {idx + 1}
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curiosidades (oculto quando vazio) */}
              {vehicle.curiosities && vehicle.curiosities.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-headline-md text-xl text-parchment flex items-center space-x-2 border-b border-surface-variant/30 pb-2">
                    <span className="material-symbols-outlined text-secondary">psychology_alt</span>
                    <span>&nbsp;</span>
                    <span className="font-headline-md text-base text-parchment">Curiosidades Históricas</span>
                  </h3>
                  <ul className="space-y-2">
                    {vehicle.curiosities.map((curiosity, idx) => (
                      <li key={idx} className="font-body-md text-sm text-on-surface-variant leading-relaxed list-disc list-inside">
                        {curiosity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ask a Question via WhatsApp */}
              {!isGuest && <div className="space-y-4 max-w-xl">
                <h3 className="font-headline-md text-xl text-parchment flex items-center space-x-2 border-b border-surface-variant/30 pb-2">
                  <span className="material-symbols-outlined text-secondary">help</span>
                  <span>{t.vehicleDetail.doubtTitle}</span>
                </h3>

                <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-4 sm:p-5">
                  <textarea
                    value={question}
                    onChange={(e) => {
                      setQuestion(e.target.value);
                      if (e.target.value.trim()) setQuestionError(false);
                    }}
                    rows={3}
                    placeholder={t.vehicleDetail.doubtPlaceholder}
                    className="w-full bg-surface-container-lowest/70 border border-surface-variant/40 rounded-lg px-4 py-3 text-parchment font-body-md text-sm focus:outline-none focus:border-secondary transition-colors resize-none placeholder:text-on-surface-variant/60"
                    aria-label={t.vehicleDetail.doubtTitle}
                  />

                  {questionError && (
                    <p className="text-xs text-amber-glow font-label-caps mt-2">
                      {t.vehicleDetail.doubtEmptyHint}
                    </p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    onClick={handleSendQuestion}
                    className="w-full mt-3 bg-secondary text-deep-charcoal hover:bg-amber-glow font-label-caps text-sm px-5 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-md font-bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>{t.vehicleDetail.doubtSendButton}</span>
                  </motion.button>
                </div>
              </div>}
            </div>
            <AnimatePresence>
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-secondary text-deep-charcoal font-label-caps text-xs px-4 py-2 rounded-lg font-bold flex items-center justify-center space-x-2 mx-6 mt-2 shadow-lg"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>{t.vehicleDetail.copied} #{vehicle.shareId}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Actions */}
            <div className="p-4 sm:p-6 bg-surface-container-low border-t border-surface-variant/30 flex flex-wrap items-center justify-center gap-3 sm:justify-end shrink-0">
              {isGuest ? (
                <>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => void handleShare()}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-6 text-sm font-bold font-label-caps text-deep-charcoal transition-colors hover:bg-amber-glow sm:w-auto"
                  >
                    <span className="material-symbols-outlined text-[19px]" aria-hidden="true">share</span>
                    <span>Compartilhar convidado</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    onClick={handleWhatsAppShare}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#25D366]/55 px-6 text-sm font-bold font-label-caps text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-deep-charcoal sm:w-auto"
                  >
                    <span className="material-symbols-outlined text-[19px]" aria-hidden="true">send</span>
                    <span>Compartilhar no WhatsApp</span>
                  </motion.button>
                </>
              ) : <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
                href={buildWhatsAppLink([
                  `Olá, StudioSRL! Gostaria de mais informações sobre o veículo: ${vehicle.title} (#${vehicle.shareId}).`,
                  '',
                  `Link do veículo: ${vehicleShareUrl}`,
                ].join('\n'))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playMechanicalClick('click')}
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-deep-charcoal font-label-caps text-sm px-6 py-3 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md font-bold"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.228-1.157zm11.233-6.082c-.083-.139-.304-.222-.637-.388-.333-.167-1.968-.972-2.274-1.083-.306-.112-.529-.167-.751.167-.222.333-.861 1.083-1.056 1.306-.194.222-.389.25-.722.083-.333-.167-1.408-.519-2.682-1.655-1.002-.892-1.678-1.995-1.874-2.328-.195-.333-.021-.513.145-.678.15-.149.333-.389.5-.583.167-.194.222-.333.333-.556.111-.222.056-.417-.028-.583-.083-.167-.751-1.806-1.028-2.472-.27-.648-.545-.561-.75-.572-.198-.011-.426-.011-.654-.011-.228 0-.598.086-.911.428-.313.342-1.196 1.169-1.196 2.85 0 1.681 1.225 3.303 1.396 3.533.171.23 2.413 3.685 5.845 5.166.816.352 1.453.562 1.949.72.82.261 1.567.224 2.157.136.657-.098 2.018-.825 2.302-1.625.284-.801.284-1.487.199-1.626z"/>
                </svg>
                <span>Falar no WhatsApp sobre este Veículo</span>
              </motion.a>
              }
            </div>
          </motion.div>
        </div>
      )}
      
      {vehicle && (
        <ImageLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          title={vehicle.title}
          subtitle={vehicle.subtitle}
          images={
            vehicle.gallery && vehicle.gallery.length > 0
              ? vehicle.gallery
              : [{ src: vehicle.image, angleLabel: 'Vista Principal', caption: vehicle.subtitle }]
          }
        />
      )}
    </AnimatePresence>
  );
}
