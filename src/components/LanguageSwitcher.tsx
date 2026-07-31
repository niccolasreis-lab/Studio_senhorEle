import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';
import { playMechanicalClick } from '../utils/audio';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'pt', label: 'PT', flag: '🇧🇷' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-surface-container-low/90 backdrop-blur-md border border-secondary/40 rounded-full p-1 shadow-inner relative z-10">
      {languages.map((lang) => {
        const isActive = language === lang.code;
        return (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              playMechanicalClick('click');
              setLanguage(lang.code);
            }}
            className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-label-caps transition-colors cursor-pointer select-none ${
              isActive
                ? 'text-deep-charcoal font-bold'
                : 'text-on-surface-variant/80 hover:text-amber-glow'
            }`}
            aria-label={`Mudar idioma para ${lang.label}`}
          >
            {isActive && (
              <motion.div
                layoutId="activeLangBg"
                className="absolute inset-0 bg-secondary rounded-full shadow-md"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 text-sm leading-none">{lang.flag}</span>
            <span className="relative z-10 font-bold tracking-wider leading-none">{lang.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
