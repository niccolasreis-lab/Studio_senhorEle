import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playMechanicalClick } from '../utils/audio';
import { useAccessibleModal } from '../hooks/useAccessibleModal';
import { useLanguage } from '../i18n/LanguageContext';

export interface VehicleDetail {
  id: string;
  shareId: string;
  title: string;
  subtitle: string;
  image: string;
  year: string;
  engine: string;
  transmission: string;
  color: string;
  power: string;
  restorationWorkshop: string;
  restorationYear: string;
  condition: string;
  description: string;
  restorationHistory: string[];
  specs: { label: string; value: string }[];
}

export const VEHICLE_DETAILS: Record<string, VehicleDetail> = {
  'porsche-911': {
    id: 'porsche-911',
    shareId: 'SRL-911-1973',
    title: 'Porsche 911 Classic',
    subtitle: 'Matching Numbers • 1973',
    image: '/assets/images/porsche-911-classic-1973.jpg',
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
  onInquire: (carTitle: string) => void;
}

export default function VehicleDetailModal({
  vehicleId,
  onClose,
  onInquire,
}: VehicleDetailModalProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const modalRef = useAccessibleModal<HTMLDivElement>(Boolean(vehicleId), onClose);

  let vehicle: VehicleDetail | null = vehicleId ? VEHICLE_DETAILS[vehicleId] : null;

  if (!vehicle && vehicleId) {
    const customMatch = CustomVehicleService.getCustomVehicles().find((cv) => cv.id === vehicleId);
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
        color: customMatch.color || 'Acabamento de Época',
        power: customMatch.power || 'Especificação de Fábrica',
        restorationWorkshop: 'Studio Senhorele / Curadoria Especial',
        restorationYear: customMatch.year,
        condition: customMatch.condition || 'Excelente Estado de Conservação',
        description: customMatch.description || 'Exemplar exclusivo da coleção Studio SenhorEle.',
        restorationHistory: [
          'Avaliação detalhada de histórico e proveniência.',
          'Revisão completa dos sistemas mecânicos e elétricos.',
          'Higienização detalhada e polimento técnico artesanal.'
        ],
        specs: [
          { label: 'Chassi / ID', value: customMatch.shareId },
          { label: 'Motor', value: customMatch.engine },
          { label: 'Transmissão', value: customMatch.transmission }
        ]
      };
    }
  }

  if (!vehicle) return null;

  const handleShare = async () => {
    playMechanicalClick('click');
    const shareUrl = `${window.location.origin}${window.location.pathname}?v=${vehicle.shareId}`;
    const shareText = `Confira este clássico no Studio Senhorele: ${vehicle.title} (${vehicle.year}) - ID: #${vehicle.shareId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: vehicle.title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard if share was dismissed or unsupported
      }
    }

    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    playMechanicalClick('click');
    const shareUrl = `${window.location.origin}${window.location.pathname}?v=${vehicle.shareId}`;
    const shareText = `Confira este clássico no Studio Senhorele: ${vehicle.title} (${vehicle.year}) - ID: #${vehicle.shareId}\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
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
                src={vehicle.image}
                alt={vehicle.title}
                decoding="async"
                width="1600"
                height="900"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-surface-container-high/20 to-transparent pointer-events-none" />

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-parchment transition-colors p-2.5 rounded-full bg-background/60 backdrop-blur-md border border-surface-variant/40 hover:bg-surface-variant/60 cursor-pointer shadow-lg z-20"
                aria-label="Fechar modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </motion.button>

              {/* Share ID Badge & Quick Actions */}
              <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
                <span className="bg-background/80 backdrop-blur-md border border-secondary/50 text-secondary font-label-caps text-xs px-3 py-1.5 rounded-full shadow-md flex items-center space-x-1">
                  <span className="material-symbols-outlined text-[14px]">tag</span>
                  <span>#{vehicle.shareId}</span>
                </span>
              </div>

              {/* Title & Subtitle overlay */}
              <div className="absolute bottom-4 left-6 right-6">
                <span className="font-label-caps text-xs text-secondary tracking-widest uppercase block mb-1">
                  Studio Senhorele • Curadoria
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
              {/* Overview Description */}
              <div className="space-y-3">
                <p className="font-body-lg text-lg text-parchment/90 leading-relaxed font-serif italic border-l-2 border-secondary pl-4 py-1">
                  "{vehicle.description}"
                </p>
              </div>

              {/* Technical Specifications Grid */}
              <div className="space-y-4">
                <h3 className="font-headline-md text-xl text-parchment flex items-center space-x-2 border-b border-surface-variant/30 pb-2">
                  <span className="material-symbols-outlined text-secondary">tune</span>
                  <span>{t.vehicleDetail.specsTitle}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-4 flex flex-col">
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                      {t.vehicleDetail.engine}
                    </span>
                    <span className="font-body-md text-parchment font-medium">{vehicle.engine}</span>
                  </div>

                  <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-4 flex flex-col">
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                      {t.vehicleDetail.transmission}
                    </span>
                    <span className="font-body-md text-parchment font-medium">{vehicle.transmission}</span>
                  </div>

                  <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-4 flex flex-col">
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                      {t.vehicleDetail.color}
                    </span>
                    <span className="font-body-md text-parchment font-medium">{vehicle.color}</span>
                  </div>

                  <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-4 flex flex-col">
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                      Potência Estimada
                    </span>
                    <span className="font-body-md text-parchment font-medium">{vehicle.power}</span>
                  </div>

                  <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-4 flex flex-col">
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                      {t.vehicleDetail.status}
                    </span>
                    <span className="font-body-md text-secondary font-medium">{vehicle.condition}</span>
                  </div>

                  <div className="bg-surface-container-low border border-surface-variant/30 rounded-xl p-4 flex flex-col">
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                      {t.vehicleDetail.year}
                    </span>
                    <span className="font-body-md text-parchment font-medium">{vehicle.year} ({vehicle.restorationYear})</span>
                  </div>
                </div>

                {/* Additional Spec Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {vehicle.specs.map((spec, i) => (
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
              </div>

              {/* Restoration History Timeline / Process */}
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
            </div>

            {/* Toast Notification for Share / Copy */}
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
            <div className="p-4 sm:p-6 bg-surface-container-low border-t border-surface-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="text-xs text-on-surface-variant flex items-center space-x-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                <span>{t.vehicleDetail.shareIdLabel}: <strong className="text-parchment">#{vehicle.shareId}</strong></span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleWhatsAppShare}
                  className="px-3.5 py-2.5 rounded-lg border border-emerald-600/50 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors font-label-caps text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  title="Compartilhar no WhatsApp"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>WhatsApp</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleShare}
                  className="px-3.5 py-2.5 rounded-lg border border-surface-variant text-on-surface-variant hover:text-parchment hover:border-secondary transition-colors font-label-caps text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  title="Copiar link e compartilhar"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? 'check' : 'share'}
                  </span>
                  <span>{copied ? t.vehicleDetail.copied : t.vehicleDetail.copyLink}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => {
                    onClose();
                    onInquire(vehicle.title);
                  }}
                  className="bg-secondary text-deep-charcoal font-label-caps text-xs px-5 py-2.5 rounded-lg hover:bg-amber-glow transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                >
                  <span>{t.vehicleDetail.inquireVehicle}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
