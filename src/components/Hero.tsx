import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[100dvh] w-full flex flex-col items-center justify-between pt-24 pb-10 md:pt-32 md:pb-16 overflow-hidden">
      {/* Background Video with Dark Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/images/aero-willys-1967.jpg"
          className="w-full h-full object-cover scale-105"
        >
          <source src="/assets/videos/hero-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60"></div>
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
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
          className="font-headline-lg text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-parchment tracking-tight mb-8 font-serif drop-shadow-2xl leading-[1.1] sm:leading-[1.08]"
        >
          {t.hero.title}
        </motion.h1>

        {/* Subtitle / Paragraph */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
          className="font-body-lg text-lg sm:text-xl md:text-2xl text-on-surface-variant max-w-3xl mx-auto leading-relaxed drop-shadow-md tracking-wide px-4"
        >
          {t.hero.subtitle}
        </motion.p>
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
          className="group flex flex-col items-center transition-colors cursor-pointer"
          aria-label={t.hero.explore}
        >
          <span className="font-label-caps text-xs md:text-sm text-on-surface-variant/80 group-hover:text-amber-glow mb-2 tracking-[0.25em] uppercase transition-colors">
            {t.hero.explore}
          </span>
          <span className="material-symbols-outlined text-secondary text-[28px] md:text-[32px] group-hover:translate-y-1 transition-transform animate-bounce">
            keyboard_arrow_down
          </span>
        </motion.a>
      </motion.div>
    </section>
  );
}
