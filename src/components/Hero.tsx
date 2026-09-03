import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { playMechanicalClick } from '../utils/audio';

export default function Hero() {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion) {
      video.pause();
      setIsVideoPlaying(false);
      return;
    }

    void video.play().then(() => setIsVideoPlaying(true)).catch(() => setIsVideoPlaying(false));
  }, [prefersReducedMotion]);

  const toggleVideoPlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    playMechanicalClick('click');
    if (video.paused) {
      void video.play().then(() => setIsVideoPlaying(true)).catch(() => setIsVideoPlaying(false));
    } else {
      video.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleExploreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    playMechanicalClick('click');
    const targetElement = document.getElementById('about');
    if (targetElement) {
      const navHeight = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    window.history.pushState(null, '', '#about');
  };

  return (
    <section className="relative min-h-[100dvh] w-full flex flex-col items-center justify-between pt-24 pb-10 md:pt-32 md:pb-16 overflow-hidden">
      {/* Background Video with Dark Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          aria-hidden="true"
          loop
          muted
          playsInline
          preload="metadata"
          onPlay={() => setIsVideoPlaying(true)}
          onPause={() => setIsVideoPlaying(false)}
          className="w-full h-full object-cover scale-105"
        >
          <source src="/assets/videos/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60"></div>
        <button
          type="button"
          onClick={toggleVideoPlayback}
          className="absolute bottom-5 left-5 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-secondary/45 bg-background/80 px-4 font-label-caps text-xs uppercase tracking-[0.12em] text-parchment shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors hover:border-secondary hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary motion-reduce:transition-none md:bottom-8 md:left-8"
          aria-label={isVideoPlaying ? t.hero.pauseVideo : t.hero.playVideo}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
            {isVideoPlaying ? 'pause' : 'play_arrow'}
          </span>
          <span>{isVideoPlaying ? t.hero.pauseVideo : t.hero.playVideo}</span>
        </button>
      </div>
      
      {/* Top Spacer for Nav balance */}
      <div className="h-8 md:h-12 z-10" />

      {/* Main Content Box with Smooth Fade */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-margin-mobile max-w-4xl lg:max-w-5xl mx-auto my-auto py-8"
      >
        <h1 className="sr-only">Studio SenhorEle</h1>
        {/* Logotipo em Destaque com Fade Luxuoso */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col items-center justify-center group"
        >
          {/* Sutil brilho de fundo (Glow Amber) */}
          <div className="absolute -inset-4 bg-amber-glow/20 rounded-full blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none" />

          {/* Logo Image em Alta Resolução */}
          <picture className="relative block w-72 max-w-full sm:w-96 md:w-[440px] lg:w-[500px]">
            <source
              type="image/webp"
              srcSet="/assets/images/logo-senhorele-hero-320.webp 320w, /assets/images/logo-senhorele-hero-640.webp 640w, /assets/images/logo-senhorele-hero-1024.webp 1024w"
              sizes="(max-width: 639px) 288px, (max-width: 767px) 384px, (max-width: 1023px) 440px, 500px"
            />
            <img
              src="/assets/images/logo-senhorele-hero.png"
              alt="Studio SenhorEle - Coleção Air Cooled"
              width="1024"
              height="1024"
              fetchPriority="high"
              decoding="async"
              className="h-auto w-full object-contain drop-shadow-[0_12px_35px_rgba(0,0,0,0.85)] filter transition-transform duration-500 hover:scale-[1.02] motion-reduce:transition-none"
            />
          </picture>
        </motion.div>

        <div className="mt-6 max-w-2xl" />
      </motion.div>
      
      {/* Scroll Down Indicator with Fade & Pulse */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.9 }}
        className="relative z-10 mt-6 md:mt-10 flex flex-col items-center"
      >
        <motion.a 
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          href="#about"
          onClick={handleExploreClick}
          className="group flex flex-col items-center transition-colors cursor-pointer"
          aria-label={t.hero.explore}
        >
          <span className="font-label-caps text-xs md:text-sm text-on-surface-variant/80 group-hover:text-amber-glow mb-2 tracking-[0.25em] uppercase transition-colors">
            {t.hero.explore}
          </span>
          <span aria-hidden="true" className="material-symbols-outlined text-secondary text-[28px] md:text-[32px] group-hover:translate-y-1 transition-transform">
            keyboard_arrow_down
          </span>
        </motion.a>
      </motion.div>
    </section>
  );
}
