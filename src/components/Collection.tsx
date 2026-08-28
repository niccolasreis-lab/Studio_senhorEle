import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playMechanicalClick } from '../utils/audio';
import { useLanguage } from '../i18n/LanguageContext';
import { Translations } from '../i18n/translations';
import { use3DTilt } from '../hooks/use3DTilt';
import { CustomVehicleService, VehicleStatus } from '../services/customVehicleService';
import { buildWhatsAppLink } from '../config/contact';
import { buildShareUrl } from '../utils/share';
import { webpImageUrl } from '../utils/imageUtils';
import GuestsCollection from './GuestsCollection';

export interface CollectionVehicleItem {
  id: string;
  shareId: string;
  title: string;
  subtitle: string;
  image: string;
  year?: string;
  engine?: string;
  transmission?: string;
  description?: string;
  status: VehicleStatus;
  collectionKind: 'studio' | 'guest';
}

interface CollectionProps {
  onSelectCarForInquiry?: (carName: string) => void;
  onOpenDetail?: (vehicleId: string) => void;
}

interface IntersectionObserverGridCardProps {
  item: CollectionVehicleItem;
  index: number;
  onOpenDetail?: (vehicleId: string) => void;
  onSelectCarForInquiry?: (carName: string) => void;
  key?: React.Key;
}

// Custom component using native IntersectionObserver for smooth scroll animations
const IntersectionObserverGridCard = memo(function IntersectionObserverGridCard({
  item,
  index,
  onOpenDetail,
  onSelectCarForInquiry,
}: IntersectionObserverGridCardProps) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const { ref: tiltRef, tiltProps, glareProps } = use3DTilt(8);

  const handleWhatsAppShare = () => {
    playMechanicalClick('click');
    const shareUrl = buildShareUrl(item.shareId);
    const message = [
      `Olá, StudioSRL! Gostaria de mais informações sobre o veículo: ${item.title} (#${item.shareId}).`,
      '',
      `Link do veículo: ${shareUrl}`,
    ].join('\n');
    window.open(buildWhatsAppLink(message), '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const element = tiltRef.current;
    if (!element) return;

    // Set up native Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once element is observed and animated, unobserve to optimize performance
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null, // viewport
        threshold: 0.15, // 15% visible before triggering
        rootMargin: '0px 0px -40px 0px', // trigger slightly before hitting the exact fold
      }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  // Stagger calculation based on column index
  const staggerDelay = (index % 3) * 0.12;

  return (
    <div
      ref={tiltRef}
      {...tiltProps}
      className="relative rounded-2xl h-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={
          isVisible
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 50 }
        }
        transition={{
          duration: 0.7,
          delay: staggerDelay,
          ease: [0.215, 0.61, 0.355, 1], // Custom smooth ease-out curve
        }}
        className="group bg-surface-container-high border border-surface-variant/40 hover:border-secondary/60 rounded-2xl overflow-hidden flex flex-col justify-between transition-colors duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.4)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.65)] relative h-full"
      >
        {/* Amber Glare Overlay */}
        <div className="absolute inset-0 z-30 rounded-2xl pointer-events-none" {...glareProps} />
      {/* Top Image Banner with Watermark */}
      <div 
        className="relative h-64 w-full overflow-hidden bg-background cursor-pointer shrink-0"
        onClick={() => {
          playMechanicalClick('click');
          if (onOpenDetail) onOpenDetail(item.id);
          else if (onSelectCarForInquiry) onSelectCarForInquiry(item.title);
        }}
      >
        <img
          src={webpImageUrl(item.image)}
          alt={item.title}
          loading="lazy"
          decoding="async"
          width="512"
          height="288"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-surface-container-high/20 to-transparent pointer-events-none" />

        {/* Share ID Badge */}
        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md border border-secondary/40 px-2.5 py-1 rounded-full text-secondary font-label-caps text-[11px] tracking-wider shadow-md z-20">
          #{item.shareId}
        </div>

        {/* Year Pill */}
        {item.year && (
          <div className="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur-md border border-surface-variant/40 px-2.5 py-1 rounded-full text-parchment font-label-caps text-[11px] tracking-wider shadow-md z-20">
            {item.year}
          </div>
        )}

        {item.status === 'reserved' && (
          <div className="absolute bottom-3 left-3 bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-label-caps font-bold z-20">
            Reservado
          </div>
        )}

        {/* Quick View Overlay Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/40 backdrop-blur-[2px] z-20">
          <span className="bg-secondary text-deep-charcoal font-label-caps text-xs px-4 py-2 rounded-full font-bold flex items-center space-x-1.5 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Ver Ficha Técnica</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between bg-surface-container-high">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <span className="font-label-caps text-xs text-secondary tracking-widest block mb-1">
              {item.subtitle}
            </span>
            <h3 
              onClick={() => {
                playMechanicalClick('click');
                if (onOpenDetail) onOpenDetail(item.id);
              }}
              className="font-headline-md text-2xl text-parchment group-hover:text-amber-glow transition-colors cursor-pointer mb-3 leading-snug line-clamp-1"
              title={item.title}
            >
              {item.title}
            </h3>
          </div>

          {/* Quick Technical Tags */}
          <div className="flex flex-wrap gap-2 my-3 min-h-[64px] items-start content-start">
            {item.engine && (
              <span className="bg-surface-container-low border border-surface-variant/30 text-on-surface-variant font-label-caps text-[11px] px-2.5 py-1 rounded-md flex items-center space-x-1 max-w-full truncate" title={item.engine}>
                <span className="material-symbols-outlined text-[13px] text-secondary shrink-0">tune</span>
                <span className="truncate">{item.engine}</span>
              </span>
            )}
            {item.transmission && (
              <span className="bg-surface-container-low border border-surface-variant/30 text-on-surface-variant font-label-caps text-[11px] px-2.5 py-1 rounded-md flex items-center space-x-1 max-w-full truncate" title={item.transmission}>
                <span className="material-symbols-outlined text-[13px] text-secondary shrink-0">settings</span>
                <span className="truncate">{item.transmission}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-surface-variant/30 flex items-center justify-between gap-3 mt-auto">
          <button
            onClick={() => {
              playMechanicalClick('click');
              if (onOpenDetail) onOpenDetail(item.id);
            }}
            className="text-xs font-label-caps text-on-surface-variant hover:text-parchment transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>{t.collection.viewDetails}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/40 hover:border-[#25D366] font-label-caps text-xs px-3.5 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center space-x-1.5 font-bold shadow-sm"
          >
            <span>Compartilhar no WhatsApp</span>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.228-1.157zm11.233-6.082c-.083-.139-.304-.222-.637-.388-.333-.167-1.968-.972-2.274-1.083-.306-.112-.529-.167-.751.167-.222.333-.861 1.083-1.056 1.306-.194.222-.389.25-.722.083-.333-.167-1.408-.519-2.682-1.655-1.002-.892-1.678-1.995-1.874-2.328-.195-.333-.021-.513.145-.678.15-.149.333-.389.5-.583.167-.194.222-.333.333-.556.111-.222.056-.417-.028-.583-.083-.167-.751-1.806-1.028-2.472-.27-.648-.545-.561-.75-.572-.198-.011-.426-.011-.654-.011-.228 0-.598.086-.911.428-.313.342-1.196 1.169-1.196 2.85 0 1.681 1.225 3.303 1.396 3.533.171.23 2.413 3.685 5.845 5.166.816.352 1.453.562 1.949.72.82.261 1.567.224 2.157.136.657-.098 2.018-.825 2.302-1.625.284-.801.284-1.487.199-1.626z"/>
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
    </div>
  );
});

const Collection = memo(function Collection({ onSelectCarForInquiry, onOpenDetail }: CollectionProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagKey, setSelectedTagKey] = useState<keyof Translations['collection']['filters']>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const handleShareCarousel = async (item: CollectionVehicleItem) => {
    playMechanicalClick('click');
    const shareUrl = buildShareUrl(item.shareId);
    const shareText = `Confira este clássico no Studio Senhorele: ${item.title} (#${item.shareId})`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard if share was dismissed or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopiedShareId(item.shareId);
      setTimeout(() => setCopiedShareId(null), 2500);
    } catch {
      window.prompt('URL:', shareUrl);
    }
  };

  const filterTagKeys: (keyof Translations['collection']['filters'])[] = [
    'all',
    'porsche',
    'corujinha',
    'fusca',
  ];

  const [customVehicles, setCustomVehicles] = useState<CollectionVehicleItem[]>(() =>
    CustomVehicleService.getCustomVehicles()
      .filter((v) => v.status === 'published' || v.status === 'reserved')
      .map((v) => ({
      id: v.id,
      shareId: v.shareId,
      title: v.title,
      subtitle: v.subtitle,
      year: v.year,
      engine: v.engine,
      transmission: v.transmission,
      image: v.image,
      description: v.description,
      status: v.status,
      collectionKind: v.collectionKind === 'guest' ? 'guest' : 'studio',
    }))
  );

  const refreshCustomVehicles = () => {
    const fresh = CustomVehicleService.getCustomVehicles()
      .filter((v) => v.status === 'published' || v.status === 'reserved')
      .map((v) => ({
      id: v.id,
      shareId: v.shareId,
      title: v.title,
      subtitle: v.subtitle,
      year: v.year,
      engine: v.engine,
      transmission: v.transmission,
      image: v.image,
      description: v.description,
      status: v.status,
      collectionKind: v.collectionKind === 'guest' ? 'guest' : 'studio',
    }));
    setCustomVehicles(fresh);
  };

  useEffect(() => {
    refreshCustomVehicles();
    // Async sync with Supabase cloud database
    CustomVehicleService.syncWithSupabase().then(() => {
      refreshCustomVehicles();
    });

    const handleUpdate = () => refreshCustomVehicles();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('studio_custom_vehicle_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('studio_custom_vehicle_updated', handleUpdate);
    };
  }, []);

  // A lista do serviço já inclui os veículos base. Usar uma segunda coleção
  // aqui duplicaria os clássicos e impediria que o status os ocultasse.
  const allItems = customVehicles.filter((vehicle) => vehicle.collectionKind !== 'guest');
  const guestItems = customVehicles.filter(
    (vehicle) => vehicle.collectionKind === 'guest' && vehicle.status === 'published'
  );

  const filteredItems = allItems.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    const currentFilterLabel = t.collection.filters[selectedTagKey].toLowerCase();
    
    const matchesTag = 
      selectedTagKey === 'all' || 
      item.title.toLowerCase().includes(currentFilterLabel) || 
      item.subtitle.toLowerCase().includes(currentFilterLabel) ||
      (selectedTagKey === 'corujinha' && item.title.toLowerCase().includes('kombi')) ||
      (selectedTagKey === 'fusca' && item.title.toLowerCase().includes('fusca'));

    const matchesQuery =
      query === '' ||
      item.title.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query) ||
      item.shareId.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query);

    return matchesTag && matchesQuery;
  });

  // Reset carousel index when search/filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [searchQuery, selectedTagKey]);

  const prevSlide = () => {
    if (filteredItems.length === 0) return;
    playMechanicalClick('click');
    setCurrentIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    if (filteredItems.length === 0) return;
    playMechanicalClick('click');
    setCurrentIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (viewMode !== 'carousel') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredItems.length, viewMode]);

  const getCardPosition = (index: number) => {
    const total = filteredItems.length;
    if (total === 0) return 0;
    let diff = index - currentIndex;

    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    return diff;
  };

  return (
    <>
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="py-section-gap bg-background overflow-hidden relative"
      id="collection"
    >
      <div className="text-center mb-10 relative z-10 px-4 max-w-4xl mx-auto">
        <span className="font-label-caps text-label-caps text-secondary tracking-widest block mb-3">
          {t.collection.tagline}
        </span>
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-parchment mb-6">
          {t.collection.title}
        </h2>

        {/* Search Bar & Layout Toggle */}
        <div className="max-w-xl mx-auto space-y-4">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[22px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.collection.searchPlaceholder}
              className="w-full pl-12 pr-10 py-3 bg-surface-container-low/90 border border-surface-variant/40 rounded-xl text-parchment font-body-md text-sm focus:outline-none focus:border-secondary transition-all shadow-inner placeholder:text-on-surface-variant/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 text-on-surface-variant hover:text-parchment transition-colors rounded-full cursor-pointer"
                aria-label="Limpar pesquisa"
                title="Limpar pesquisa"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Quick Filter Chips & View Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {filterTagKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    playMechanicalClick('click');
                    setSelectedTagKey(key);
                  }}
                  className={`font-label-caps text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer border ${
                    selectedTagKey === key
                      ? 'bg-secondary text-deep-charcoal border-secondary font-bold shadow-md'
                      : 'bg-surface-container-low text-on-surface-variant border-surface-variant/40 hover:border-secondary/60 hover:text-parchment'
                  }`}
                >
                  {t.collection.filters[key]}
                </button>
              ))}
            </div>

            {/* Grid vs Carousel View Toggle */}
            <div className="flex items-center bg-surface-container-low border border-surface-variant/40 rounded-lg p-1 space-x-1 shrink-0 ml-auto sm:ml-0">
              <button
                onClick={() => {
                  playMechanicalClick('click');
                  setViewMode('grid');
                }}
                className={`p-1.5 rounded-md transition-colors flex items-center space-x-1 font-label-caps text-xs cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-secondary text-deep-charcoal font-bold shadow'
                    : 'text-on-surface-variant hover:text-parchment'
                }`}
                title="Exibir em Grade com Animação Intersection Observer"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                <span className="hidden sm:inline">Grade</span>
              </button>

              <button
                onClick={() => {
                  playMechanicalClick('click');
                  setViewMode('carousel');
                }}
                className={`p-1.5 rounded-md transition-colors flex items-center space-x-1 font-label-caps text-xs cursor-pointer ${
                  viewMode === 'carousel'
                    ? 'bg-secondary text-deep-charcoal font-bold shadow'
                    : 'text-on-surface-variant hover:text-parchment'
                }`}
                title="Exibir em Carrossel 3D"
              >
                <span className="material-symbols-outlined text-[18px]">view_carousel</span>
                <span className="hidden sm:inline">Carrossel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-16 px-4 max-w-md mx-auto"
        >
          <div className="w-16 h-16 rounded-full bg-surface-container-low border border-surface-variant/40 flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px]">search_off</span>
          </div>
          <h3 className="font-headline-md text-xl text-parchment mb-2">{t.collection.noResultsTitle}</h3>
          <p className="font-body-md text-sm text-on-surface-variant mb-6">
            {t.collection.noResultsText}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTagKey('all');
            }}
            className="bg-secondary text-deep-charcoal font-label-caps text-xs px-5 py-2.5 rounded-lg hover:bg-amber-glow transition-colors cursor-pointer"
          >
            Limpar Filtros e Ver Todos
          </button>
        </motion.div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW WITH NATIVE INTERSECTION OBSERVER ANIMATIONS */
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <IntersectionObserverGridCard
                key={item.id}
                item={item}
                index={index}
                onOpenDetail={onOpenDetail}
                onSelectCarForInquiry={onSelectCarForInquiry}
              />
            ))}
          </div>
        </div>
      ) : (
        /* 3D CAROUSEL VIEW */
        <div 
          className="carousel-container relative w-full h-[520px] md:h-[600px] flex items-center justify-center max-w-[1440px] mx-auto px-4"
          style={{ perspective: 1200 }}
        >
          <AnimatePresence mode="sync">
            {filteredItems.map((item, index) => {
              const pos = getCardPosition(index);
              const isCenter = pos === 0;
              const isLeft = pos === -1 || (currentIndex === 0 && index === filteredItems.length - 1 && filteredItems.length > 2);
              const isRight = pos === 1 || (currentIndex === filteredItems.length - 1 && index === 0 && filteredItems.length > 2);

              const shouldRender = filteredItems.length === 1 ? isCenter : (isCenter || isLeft || isRight);
              if (!shouldRender) return null;

              let targetVariant = 'hiddenRight';
              let zIndex = 10;

              if (isCenter) {
                targetVariant = 'center';
                zIndex = 30;
              } else if (isLeft) {
                targetVariant = 'left';
                zIndex = 20;
              } else if (isRight) {
                targetVariant = 'right';
                zIndex = 20;
              } else if (pos < 0) {
                targetVariant = 'hiddenLeft';
              }

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={targetVariant}
                  animate={targetVariant}
                  variants={{
                    center: {
                      x: 0,
                      scale: 1,
                      rotateY: 0,
                      opacity: 1,
                    },
                    left: {
                      x: '-68%',
                      scale: 0.86,
                      rotateY: 22,
                      opacity: 0.65,
                    },
                    right: {
                      x: '68%',
                      scale: 0.86,
                      rotateY: -22,
                      opacity: 0.65,
                    },
                    hiddenLeft: {
                      x: '-130%',
                      scale: 0.7,
                      rotateY: 40,
                      opacity: 0,
                    },
                    hiddenRight: {
                      x: '130%',
                      scale: 0.7,
                      rotateY: -40,
                      opacity: 0,
                    },
                  }}
                  transition={{
                    duration: 0.65,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  drag={isCenter ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) {
                      nextSlide();
                    } else if (info.offset.x > 60) {
                      prevSlide();
                    }
                  }}
                  onClick={() => {
                    if (isLeft) prevSlide();
                    else if (isRight) nextSlide();
                    else if (isCenter) {
                      if (onOpenDetail) onOpenDetail(item.id);
                      else if (onSelectCarForInquiry) onSelectCarForInquiry(item.title);
                    }
                  }}
                  style={{ zIndex, transformStyle: 'preserve-3d', willChange: 'transform' }}
                  className="carousel-item absolute w-[280px] sm:w-[320px] md:w-[400px] h-[450px] md:h-[500px] rounded-2xl overflow-hidden border border-surface-variant/40 bg-surface-container-high flex flex-col group cursor-pointer shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
                >
                  <div className="h-2/3 w-full relative overflow-hidden">
                    <img
                      src={webpImageUrl(item.image)}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      width="512"
                      height="288"
                      className="w-full h-full object-cover transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent pointer-events-none" />
                    
                    <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md border border-secondary/40 px-2.5 py-1 rounded-full text-secondary font-label-caps text-[10px] tracking-wider shadow-md z-20">
                      #{item.shareId}
                    </div>
                    {item.status === 'reserved' && (
                      <div className="absolute top-3 right-3 bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-label-caps font-bold z-20">
                        Reservado
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-between bg-surface-container-high">
                    <div>
                      <h3 className="font-headline-md text-[24px] md:text-headline-md text-parchment mb-1 group-hover:text-amber-glow transition-colors">
                        {item.title}
                      </h3>
                      <p className="font-label-caps text-label-caps text-secondary tracking-wider">
                        {item.subtitle}
                      </p>
                    </div>

                    {isCenter && (
                      <div className="flex justify-between items-center pt-2 relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareCarousel(item);
                          }}
                          className="text-xs text-on-surface-variant font-label-caps group-hover:text-parchment transition-colors cursor-pointer flex items-center space-x-1"
                          title={t.collection.share}
                        >
                          <span className="material-symbols-outlined text-[14px] text-secondary">
                            {copiedShareId === item.shareId ? 'check' : 'link'}
                          </span>
                          <span>
                            {copiedShareId === item.shareId ? t.collection.copied : t.collection.share}
                          </span>
                        </button>
                        <div className="relative group/btn">
                          <span className="material-symbols-outlined text-secondary text-[20px] group-hover:translate-x-1 transition-transform">
                            info
                          </span>
                          <span className="absolute bottom-full mb-2 right-0 px-2.5 py-1 bg-surface-container-lowest border border-surface-variant text-[10px] font-label-caps text-parchment rounded shadow-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            Abrir Detalhes
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Navigation Buttons with Tooltips */}
          {filteredItems.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-margin-desktop z-40 pointer-events-none">
              <div className="relative group/prev pointer-events-auto">
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  onClick={prevSlide}
                  aria-label="Veículo anterior"
                  className="w-12 h-12 rounded-full bg-surface-container-high/95 border-2 border-secondary/50 hover:border-secondary ring-1 ring-secondary/20 hover:ring-secondary/50 flex items-center justify-center text-parchment hover:text-secondary transition-all shadow-2xl hover:shadow-[0_0_20px_rgba(176,131,50,0.35)] cursor-pointer"
                >
                  <span className="material-symbols-outlined font-bold text-[24px]">chevron_left</span>
                </motion.button>
                <span className="absolute bottom-full mb-2 left-0 px-2.5 py-1 bg-surface-container-lowest border border-surface-variant/80 text-[11px] font-label-caps text-parchment rounded shadow-lg opacity-0 group-hover/prev:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Anterior (Seta Esquerda)
                </span>
              </div>

              <div className="relative group/next pointer-events-auto">
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  onClick={nextSlide}
                  aria-label="Próximo veículo"
                  className="w-12 h-12 rounded-full bg-surface-container-high/95 border-2 border-secondary/50 hover:border-secondary ring-1 ring-secondary/20 hover:ring-secondary/50 flex items-center justify-center text-parchment hover:text-secondary transition-all shadow-2xl hover:shadow-[0_0_20px_rgba(176,131,50,0.35)] cursor-pointer"
                >
                  <span className="material-symbols-outlined font-bold text-[24px]">chevron_right</span>
                </motion.button>
                <span className="absolute bottom-full mb-2 right-0 px-2.5 py-1 bg-surface-container-lowest border border-surface-variant/80 text-[11px] font-label-caps text-parchment rounded shadow-lg opacity-0 group-hover/next:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Próximo (Seta Direita)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Indicators for Carousel mode */}
      {viewMode === 'carousel' && filteredItems.length > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {filteredItems.map((item, idx) => (
            <div key={item.id} className="relative group/dot">
              <motion.button
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ir para ${item.title}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-8 bg-secondary'
                    : 'w-2 bg-surface-variant hover:bg-on-surface-variant'
                }`}
              />
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-surface-container-lowest border border-surface-variant text-[10px] font-label-caps text-parchment rounded shadow-md opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.section>
    <GuestsCollection items={guestItems} onOpenDetail={onOpenDetail} />
    </>
  );
});

export default Collection;
