import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playMechanicalClick } from '../utils/audio';
import { useAccessibleModal } from '../hooks/useAccessibleModal';
import { useLanguage } from '../i18n/LanguageContext';

export interface GalleryItem {
  src: string;
  caption?: string;
  angleLabel?: string;
}

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  images: GalleryItem[];
  initialIndex?: number;
}

export default function ImageLightboxModal({
  isOpen,
  onClose,
  title,
  subtitle,
  images,
  initialIndex = 0,
}: ImageLightboxModalProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isFullscreenHD, setIsFullscreenHD] = useState(false);

  // Sync initialIndex when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Handle accessible modal behavior
  const modalRef = useAccessibleModal({
    isOpen,
    onClose,
    autoFocusRef: undefined,
  });

  // Track mouse for ambient spotlight effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotlightPos({ x, y });
  };

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    playMechanicalClick('slide');
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    playMechanicalClick('slide');
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleSelectThumbnail = (index: number) => {
    if (index === currentIndex) return;
    playMechanicalClick('slide');
    setCurrentIndex(index);
  };

  const toggleNativeFullscreen = () => {
    playMechanicalClick('click');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreenHD(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreenHD(false);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleNativeFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const photoCounterText = t.galleryModal.photoCounter
    .replace('{current}', String(currentIndex + 1))
    .replace('{total}', String(images.length));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} - ${t.galleryModal.viewGallery}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-surface-container-lowest/95 backdrop-blur-xl text-on-background select-none overflow-hidden"
          onMouseMove={handleMouseMove}
        >
          {/* Dynamic Spotlight Glow Background */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-500 opacity-40"
            style={{
              background: `radial-gradient(600px circle at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(193, 146, 69, 0.15), transparent 70%)`,
            }}
          />

          {/* Header Bar */}
          <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/60 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-glow animate-pulse" />
                <h2 className="font-headline-md text-xl md:text-2xl text-parchment font-light tracking-wide">
                  {title}
                </h2>
              </div>
              {subtitle && (
                <p className="text-xs text-on-surface-variant font-label-caps mt-0.5 tracking-wider">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Actions & Controls */}
            <div className="flex items-center gap-3">
              {/* Photo Counter */}
              <span className="hidden sm:inline-block text-xs font-label-caps tracking-widest text-secondary px-3 py-1 rounded-full border border-secondary/30 bg-secondary/10">
                {photoCounterText}
              </span>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleNativeFullscreen}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-label-caps text-on-surface-variant hover:text-amber-glow border border-outline-variant/40 hover:border-amber-glow/60 rounded-md transition-all duration-200 cursor-pointer"
                title="Alternar Tela Cheia (F)"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                <span>{isFullscreenHD ? 'Sair Fullscreen' : t.galleryModal.zoomHD}</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  playMechanicalClick('modal');
                  onClose();
                }}
                className="p-2 rounded-full bg-surface-container-high/60 border border-outline-variant/50 hover:border-amber-glow text-on-surface hover:text-amber-glow transition-all duration-200 cursor-pointer"
                aria-label={t.galleryModal.close}
                title="Fechar (ESC)"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </header>

          {/* Main Image Stage */}
          <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden">
            {/* Previous Arrow Button */}
            {images.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-4 md:left-8 z-20 p-3 rounded-full bg-surface-container-high/80 border border-outline-variant/40 hover:border-amber-glow text-parchment hover:text-amber-glow shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Foto anterior"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Displayed Image */}
            <div className="relative max-w-6xl max-h-[72vh] flex flex-col items-center justify-center group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage.src}
                  src={currentImage.src}
                  alt={currentImage.caption || title}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="max-h-[68vh] max-w-full object-contain rounded-lg shadow-2xl border border-secondary/20 vintage-overlay"
                />
              </AnimatePresence>

              {/* Angle Badge & Caption Overlay */}
              {(currentImage.angleLabel || currentImage.caption) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mt-3 px-4 py-2 rounded-md bg-surface-container/80 backdrop-blur-md border border-outline-variant/30 text-center max-w-xl"
                >
                  {currentImage.angleLabel && (
                    <span className="block text-[11px] font-label-caps text-secondary tracking-widest uppercase mb-0.5">
                      {currentImage.angleLabel}
                    </span>
                  )}
                  {currentImage.caption && (
                    <p className="text-xs text-on-surface-variant font-body-md">
                      {currentImage.caption}
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Next Arrow Button */}
            {images.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 md:right-8 z-20 p-3 rounded-full bg-surface-container-high/80 border border-outline-variant/40 hover:border-amber-glow text-parchment hover:text-amber-glow shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Próxima foto"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </main>

          {/* Footer Bar with Thumbnail Strip & Keyboard Hint */}
          <footer className="relative z-10 flex flex-col items-center gap-3 px-6 py-4 border-t border-outline-variant/30 bg-surface/70 backdrop-blur-md">
            {/* Thumbnails Carousel Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 max-w-full overflow-x-auto py-1 px-2 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={`${img.src}-${idx}`}
                    onClick={() => handleSelectThumbnail(idx)}
                    className={`relative flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-md overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                      idx === currentIndex
                        ? 'border-amber-glow scale-105 shadow-[0_0_12px_rgba(193,146,69,0.4)] opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-secondary/50'
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={img.caption || `Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === currentIndex && (
                      <div className="absolute inset-0 bg-amber-glow/10 pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Keyboard Hint */}
            <p className="text-[11px] font-label-caps text-outline tracking-wider text-center">
              {t.galleryModal.keyboardHint}
            </p>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
