import React from 'react';
import { motion } from 'motion/react';
import { playMechanicalClick } from '../utils/audio';
import { useLanguage } from '../i18n/LanguageContext';
import { buildWhatsAppLink } from '../config/contact';

interface FooterProps {
  onOpenInquire?: () => void;
  isFilmGrainEnabled?: boolean;
  onToggleFilmGrain?: () => void;
}

const WHATSAPP_UPDATES_URL = buildWhatsAppLink(
  'Olá, Studio Senhorele! Gostaria de receber novidades sobre o acervo.',
);

export default function Footer({ onOpenInquire, isFilmGrainEnabled = true, onToggleFilmGrain }: FooterProps) {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-container-low border-t border-white/10 relative z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-section-gap space-y-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter pt-4">
          <div className="md:col-span-2 flex flex-col space-y-6">
            <a
              href="#"
              className="flex items-center space-x-3 group w-fit"
              aria-label="Studio Senhorele — voltar ao início"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-secondary/40 shadow-md flex items-center justify-center bg-surface-container-low">
                <img
                  src="/assets/images/logo-senhorele-hero.png"
                  alt="Studio Senhorele Logo"
                  width="192"
                  height="192"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-headline-md text-headline-md text-parchment tracking-tighter group-hover:text-amber-glow transition-colors">
                Studio Senhorele
              </div>
            </a>

            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              © {currentYear} Studio Senhorele. {t.footer.rights}
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => playMechanicalClick('click')}
                className="inline-flex items-center space-x-2 border border-secondary text-secondary font-label-caps text-label-caps px-5 py-2.5 rounded-lg hover:bg-secondary hover:text-deep-charcoal transition-colors"
                href="https://www.instagram.com/studiosenhorele/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Instagram</span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_outward
                </span>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => playMechanicalClick('click')}
                className="inline-flex items-center space-x-2 bg-[#25D366] text-white font-label-caps text-label-caps px-5 py-2.5 rounded-lg hover:bg-[#20bd5a] transition-colors"
                href={buildWhatsAppLink('')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>WhatsApp</span>
                <span className="material-symbols-outlined text-[16px]">chat</span>
              </motion.a>

              {onToggleFilmGrain && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => {
                    playMechanicalClick('click');
                    onToggleFilmGrain();
                  }}
                  className={`inline-flex items-center space-x-2 border font-label-caps text-label-caps px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
                    isFilmGrainEnabled
                      ? 'border-secondary/60 text-secondary bg-secondary/10 hover:bg-secondary/20'
                      : 'border-surface-variant text-on-surface-variant hover:text-parchment bg-surface-container-low'
                  }`}
                  title="Alternar textura de granulação de filme vintage"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isFilmGrainEnabled ? 'movie' : 'movie_off'}
                  </span>
                  <span>Vintage Grain: {isFilmGrainEnabled ? 'ON' : 'OFF'}</span>
                </motion.button>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-4 mt-8 md:mt-0">
            <h4 className="font-label-caps text-label-caps text-on-surface tracking-widest mb-2">
              {t.footer.contactTitle}
            </h4>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-parchment underline underline-offset-4 transition-all"
              href="https://www.instagram.com/studiosenhorele/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram @studiosenhorele
            </a>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-parchment underline underline-offset-4 transition-all"
              href={buildWhatsAppLink('')}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp (11) 94725-1630
            </a>
          </div>

          <div className="flex flex-col space-y-4 mt-8 md:mt-0">
            <h4 className="font-label-caps text-label-caps text-on-surface tracking-widest mb-2">
              {t.footer.navigationTitle}
            </h4>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-parchment underline underline-offset-4 transition-all"
              href="#about"
            >
              {t.nav.about}
            </a>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-parchment underline underline-offset-4 transition-all"
              href="#about"
            >
              {t.nav.purpose}
            </a>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
