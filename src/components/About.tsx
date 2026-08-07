import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  const progressScale = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section 
      ref={sectionRef} 
      className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-lowest relative overflow-hidden" 
      id="about"
    >
      {/* Section Scroll Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-surface-variant/20 z-10">
        <motion.div 
          className="h-full bg-gradient-to-r from-secondary via-amber-glow to-secondary origin-left shadow-[0_0_8px_rgba(176,131,50,0.6)]"
          style={{ scaleX: progressScale }}
        />
      </div>

      <div className="max-w-[1280px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-4 mb-12 justify-center"
        >
          <div className="w-12 h-px bg-secondary/50"></div>
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest text-center">{t.about.tagline}</span>
          <div className="w-12 h-px bg-secondary/50"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left Column */}
          <div className="flex flex-col space-y-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative pl-8 border-l border-surface-variant"
            >
              <div className="absolute -left-2 top-0 w-4 h-4 bg-background border border-secondary rounded-full"></div>
              <h3 className="font-headline-md text-[24px] text-parchment mb-4">{t.about.originTitle}</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {t.about.originText}
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative pl-8 border-l border-surface-variant"
            >
              <div className="absolute -left-2 top-0 w-4 h-4 bg-background border border-secondary rounded-full"></div>
              <h3 className="font-headline-md text-[24px] text-parchment mb-4">{t.about.learningTitle}</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {t.about.learningText}
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative pl-8 border-l border-surface-variant"
            >
              <div className="absolute -left-2 top-0 w-4 h-4 bg-background border border-secondary rounded-full"></div>
              <h3 className="font-headline-md text-[24px] text-parchment mb-4">{t.about.diversityTitle}</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {t.about.diversityText}
              </p>
            </motion.div>
            
            <motion.div 
              id="purpose"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative pl-8 border-l border-surface-variant scroll-mt-32"
            >
              <div className="absolute -left-[18px] top-0 bg-surface-container-high rounded-full border border-secondary/30 p-1 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
              </div>
              <h3 className="font-headline-md text-[24px] text-parchment mb-4">{t.about.purposeSectionTitle}</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {t.about.purposeSectionText}
              </p>
            </motion.div>
          </div>
          
          {/* Right Column */}
          <div className="flex flex-col space-y-16 md:mt-24">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative pl-8 border-l border-surface-variant"
            >
              <div className="absolute -left-2 top-0 w-4 h-4 bg-background border border-secondary rounded-full"></div>
              <h3 className="font-headline-md text-[24px] text-parchment mb-4">{t.about.firstCarTitle}</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {t.about.firstCarText}
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7 }}
              className="relative w-full aspect-video rounded-lg overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-surface-variant/20 my-8"
            >
              <div 
                className="bg-cover bg-center w-full h-full" 
                style={{ backgroundImage: 'url("/assets/images/aircooled-box-767.jpg")' }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-background/40 to-transparent"></div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative pl-8 border-l border-surface-variant"
            >
              <div className="absolute -left-2 top-0 w-4 h-4 bg-background border border-secondary rounded-full"></div>
              <h3 className="font-headline-md text-[24px] text-parchment mb-4">{t.about.aircooledArrivalTitle}</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {t.about.aircooledArrivalText}
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative pl-8 border-l border-surface-variant"
            >
              <div className="absolute -left-2 top-0 w-4 h-4 bg-background border border-secondary rounded-full"></div>
              <h3 className="font-headline-md text-[24px] text-parchment mb-4">{t.about.collectionTodayTitle}</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {t.about.collectionTodayText}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
