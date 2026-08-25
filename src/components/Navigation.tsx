import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { playMechanicalClick } from '../utils/audio';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { buildWhatsAppLink } from '../config/contact';

interface NavigationProps {
  onOpenInquire?: () => void;
}

export default function Navigation({ onOpenInquire }: NavigationProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (targetId: string) => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const navHeight = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    playMechanicalClick('click');
    setIsOpen(false);
    
    setTimeout(() => {
      scrollToSection(targetId);
    }, 50);

    window.history.pushState(null, '', `#${targetId}`);
  };

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        scrollToSection(hash);
      }, 200);
    }
  }, []);

  return (
    <>
      {/* Scroll Progress Indicator Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-secondary via-amber-glow to-secondary z-[60] origin-left shadow-[0_0_10px_rgba(176,131,50,0.5)]"
        style={{ scaleX }}
      />

      <nav
        className={`fixed w-full z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md border-b border-surface-variant/30 shadow-xl py-3'
            : 'bg-background/40 backdrop-blur-sm py-5'
        }`}
      >
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto">
          <a href="#" aria-label="Studio SenhorEle - Início" className="flex items-center space-x-3 group">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border border-secondary/40 shadow-md flex items-center justify-center bg-surface-container-low group-hover:border-secondary transition-all">
              <img 
                src="/assets/images/logo-senhorele-hero.png"
                alt="Logotipo Studio SenhorEle"
                width="192"
                height="192"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </a>

          <ul className="hidden lg:flex lg:space-x-6 xl:space-x-8 items-center">
            <li>
              <motion.a 
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={(e) => handleNavClick(e, 'collection')}
                className="font-label-caps text-xs sm:text-xs md:text-sm lg:text-base text-on-surface-variant hover:text-amber-glow transition-colors duration-300 inline-block px-1.5 sm:px-2 py-1 tracking-wider whitespace-nowrap cursor-pointer" 
                href="#collection"
              >
                {t.nav.collection}
              </motion.a>
            </li>
            <li>
              <motion.a 
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={(e) => handleNavClick(e, 'about')}
                className="font-label-caps text-xs sm:text-xs md:text-sm lg:text-base text-on-surface-variant hover:text-amber-glow transition-colors duration-300 inline-block px-1.5 sm:px-2 py-1 tracking-wider whitespace-nowrap cursor-pointer" 
                href="#about"
              >
                {t.nav.about}
              </motion.a>
            </li>
            <li>
              <motion.a 
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={(e) => handleNavClick(e, 'purpose')}
                className="font-label-caps text-xs sm:text-xs md:text-sm lg:text-base text-on-surface-variant hover:text-amber-glow transition-colors duration-300 inline-block px-1.5 sm:px-2 py-1 tracking-wider whitespace-nowrap cursor-pointer" 
                href="#purpose"
              >
                {t.nav.purpose}
              </motion.a>
            </li>
            <li>
              <motion.a
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={(e) => handleNavClick(e, 'partners')}
                className="font-label-caps text-sm lg:text-base text-on-surface-variant hover:text-amber-glow transition-colors duration-300 inline-block px-2 py-1 tracking-wider whitespace-nowrap cursor-pointer"
                href="#partners"
              >
                {t.nav.partners}
              </motion.a>
            </li>
          </ul>

          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6">
            <LanguageSwitcher />

            <motion.a 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              href={buildWhatsAppLink('')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playMechanicalClick('click')}
              className="hidden xl:flex items-center justify-center bg-secondary text-deep-charcoal font-label-caps text-base px-6 py-3 rounded-xl hover:bg-amber-glow transition-colors cursor-pointer shadow-md font-semibold tracking-wider whitespace-nowrap"
            >
              {t.nav.inquire}
            </motion.a>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="lg:hidden min-h-11 min-w-11 inline-flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-lg"
              onClick={() => {
                playMechanicalClick('click');
                setIsOpen(!isOpen);
              }}
              aria-label="Alternar menu"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[28px]">{isOpen ? 'close' : 'menu'}</span>
            </motion.button>
          </div>
        </div>
        
        {/* Menu Mobile / Tablet */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden bg-background/95 backdrop-blur-lg border-t border-surface-variant/30 overflow-hidden"
            >
              <ul className="flex flex-col py-4 px-margin-mobile">
                <li className="py-2">
                  <motion.a 
                    whileHover={{ scale: 1.03, x: 4 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => handleNavClick(e, 'collection')} 
                    className="font-label-caps text-base text-on-surface-variant hover:text-amber-glow transition-colors block py-1.5 tracking-wider cursor-pointer" 
                    href="#collection"
                  >
                    {t.nav.collection}
                  </motion.a>
                </li>
                <li className="py-2">
                  <motion.a 
                    whileHover={{ scale: 1.03, x: 4 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => handleNavClick(e, 'about')} 
                    className="font-label-caps text-base text-on-surface-variant hover:text-amber-glow transition-colors block py-1.5 tracking-wider cursor-pointer" 
                    href="#about"
                  >
                    {t.nav.about}
                  </motion.a>
                </li>
                <li className="py-2">
                  <motion.a 
                    whileHover={{ scale: 1.03, x: 4 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => handleNavClick(e, 'purpose')} 
                    className="font-label-caps text-base text-on-surface-variant hover:text-amber-glow transition-colors block py-1.5 tracking-wider cursor-pointer" 
                    href="#purpose"
                  >
                    {t.nav.purpose}
                  </motion.a>
                </li>
                <li className="py-2">
                  <motion.a
                    whileHover={{ scale: 1.03, x: 4 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => handleNavClick(e, 'partners')}
                    className="font-label-caps text-base text-on-surface-variant hover:text-amber-glow transition-colors block py-1.5 tracking-wider cursor-pointer"
                    href="#partners"
                  >
                    {t.nav.partners}
                  </motion.a>
                </li>
                <li className="py-3 mt-4">
                  <motion.a 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    href={buildWhatsAppLink('Olá, Studio SenhorEle!')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      playMechanicalClick('click');
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center bg-secondary text-deep-charcoal font-label-caps text-base font-semibold px-6 py-3.5 rounded-xl hover:bg-amber-glow transition-colors cursor-pointer"
                  >
                    {t.nav.inquire}
                  </motion.a>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
