import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const progressScale = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const chapters = [
    { title: t.about.originTitle, text: t.about.originText },
    { title: t.about.firstCarTitle, text: t.about.firstCarText },
    { title: t.about.learningTitle, text: t.about.learningText },
    { title: t.about.aircooledArrivalTitle, text: t.about.aircooledArrivalText, image: true },
    { title: t.about.diversityTitle, text: t.about.diversityText },
    { title: t.about.collectionTodayTitle, text: t.about.collectionTodayText },
    { title: t.about.purposeSectionTitle, text: t.about.purposeSectionText, purpose: true },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-lowest relative overflow-hidden"
      id="about"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-surface-variant/20 z-10">
        <motion.div className="h-full bg-secondary origin-left" style={{ scaleX: progressScale }} />
      </div>

      <div className="max-w-[1080px] mx-auto">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-14 md:mb-20"
        >
          <h2 className="font-headline-lg text-3xl md:text-5xl text-parchment text-balance">
            {t.about.tagline}
          </h2>
        </motion.header>

        <ol className="relative border-l border-surface-variant/70 ml-2 md:ml-4">
          {chapters.map((chapter, index) => (
            <motion.li
              key={chapter.title}
              id={chapter.purpose ? 'purpose' : undefined}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55 }}
              className={`relative pl-8 md:pl-14 pb-14 md:pb-20 last:pb-0 scroll-mt-32 ${chapter.purpose ? 'pt-8 md:pt-10' : ''}`}
            >
              <span
                aria-hidden="true"
                className={`absolute -left-[5px] top-2 w-[9px] h-[9px] rounded-full border ${chapter.purpose ? 'bg-secondary border-secondary' : 'bg-background border-secondary/80'}`}
              />

              {chapter.image && (
                <figure className="mb-8 overflow-hidden rounded-xl aspect-[16/9] border border-surface-variant/20 bg-surface-container-low">
                  <img
                    src="/assets/images/aircooled-box-767.jpg"
                    alt="Encontro de clássicos Volkswagen Air Cooled da turma Box 767"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </figure>
              )}

              <div className={chapter.purpose ? 'rounded-xl bg-surface-container-low px-6 py-7 md:px-9 md:py-9 border border-secondary/25' : ''}>
                <p className="font-label-caps text-xs text-secondary tracking-[0.18em] mb-3" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="font-headline-md text-2xl md:text-3xl text-parchment mb-4">
                  {chapter.title}
                </h3>
                <p className="font-body-lg text-base md:text-lg text-on-surface-variant leading-relaxed max-w-[72ch]">
                  {chapter.text}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
