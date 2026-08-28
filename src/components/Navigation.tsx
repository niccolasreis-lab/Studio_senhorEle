import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { playMechanicalClick } from '../utils/audio';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { buildWhatsAppLink } from '../config/contact';

interface NavigationProps {
  onOpenInquire?: () => void;
}

export default function Navigation({ onOpenInquire: _onOpenInquire }: NavigationProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const studioMenuRef = useRef<HTMLLIElement>(null);
  const studioButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!studioOpen && !isOpen) return;
    const closeOutside = (event: MouseEvent) => {
      if (studioOpen && !studioMenuRef.current?.contains(event.target as Node)) setStudioOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (studioOpen) studioButtonRef.current?.focus();
      else if (isOpen) mobileButtonRef.current?.focus();
      setStudioOpen(false);
      setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen, studioOpen]);

  const scrollToSection = (targetId: string) => {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;
    const navHeight = 80;
    const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  };

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();
    playMechanicalClick('click');
    setIsOpen(false);
    setStudioOpen(false);
    window.setTimeout(() => scrollToSection(targetId), 50);
    window.history.pushState(null, '', `#${targetId}`);
  };

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    let observer: MutationObserver | null = null;
    let timeoutId: number | undefined;
    const tryScroll = () => {
      if (!document.getElementById(hash)) return false;
      scrollToSection(hash);
      observer?.disconnect();
      if (timeoutId) window.clearTimeout(timeoutId);
      return true;
    };
    const initialId = window.setTimeout(() => {
      if (tryScroll()) return;
      observer = new MutationObserver(tryScroll);
      observer.observe(document.body, { childList: true, subtree: true });
      timeoutId = window.setTimeout(() => observer?.disconnect(), 4000);
    }, 100);
    return () => {
      window.clearTimeout(initialId);
      if (timeoutId) window.clearTimeout(timeoutId);
      observer?.disconnect();
    };
  }, []);

  const desktopLinkClass = 'inline-flex min-h-10 items-center px-2 font-label-caps text-sm tracking-wide text-on-surface-variant transition-colors hover:text-amber-glow focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-secondary';
  const mobileLinkClass = 'block min-h-11 rounded-lg px-2 py-3 font-label-caps text-base tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container hover:text-amber-glow focus-visible:outline-2 focus-visible:outline-secondary';

  return (
    <>
      <motion.div className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-secondary via-amber-glow to-secondary shadow-[0_2px_10px_rgba(176,131,50,0.42)]" style={{ scaleX }} />
      <nav aria-label="Navegação principal" className={`fixed z-40 w-full transition-all duration-300 ${isScrolled ? 'border-b border-surface-variant/30 bg-background/95 py-2 shadow-xl backdrop-blur-md' : 'bg-background/55 py-3 backdrop-blur-sm'}`}>
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-margin-mobile md:px-margin-desktop">
          <a href="/" aria-label="Studio SenhorEle — início" className="group flex shrink-0 items-center">
            <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-secondary/40 bg-surface-container-low shadow-md transition-colors group-hover:border-secondary md:h-16 md:w-16">
              <img src="/assets/images/logo-senhorele-hero.png" alt="Logotipo Studio SenhorEle" width="192" height="192" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex xl:gap-2">
            <li><a href="#collection" onClick={(event) => handleNavClick(event, 'collection')} className={desktopLinkClass}>{t.nav.collection}</a></li>
            <li><a href="#guests" onClick={(event) => handleNavClick(event, 'guests')} className={desktopLinkClass}>{t.nav.guests}</a></li>
            <li><a href="#diario" onClick={(event) => handleNavClick(event, 'diario')} className={desktopLinkClass}>{t.nav.diary}</a></li>
            <li ref={studioMenuRef} className="relative">
              <button
                ref={studioButtonRef}
                type="button"
                aria-expanded={studioOpen}
                aria-haspopup="true"
                aria-controls="studio-navigation-menu"
                onClick={() => { playMechanicalClick('click'); setStudioOpen((value) => !value); }}
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowDown') return;
                  event.preventDefault();
                  setStudioOpen(true);
                  window.requestAnimationFrame(() => studioMenuRef.current?.querySelector<HTMLAnchorElement>('a')?.focus());
                }}
                className={`${desktopLinkClass} gap-1`}
              >
                {t.nav.studio}<ChevronDown size={15} aria-hidden="true" className={`transition-transform ${studioOpen ? 'rotate-180' : ''}`} />
              </button>
              {studioOpen && (
                <div id="studio-navigation-menu" className="absolute left-1/2 mt-2 w-52 -translate-x-1/2 rounded-xl border border-surface-variant/45 bg-background p-2 shadow-[0_16px_38px_rgba(0,0,0,0.48)]">
                  <a href="#about" onClick={(event) => handleNavClick(event, 'about')} className="block min-h-10 rounded-lg px-3 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-parchment focus-visible:outline-2 focus-visible:outline-secondary">{t.nav.about}</a>
                  <a href="#purpose" onClick={(event) => handleNavClick(event, 'purpose')} className="block min-h-10 rounded-lg px-3 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-parchment focus-visible:outline-2 focus-visible:outline-secondary">{t.nav.purpose}</a>
                  <a href="#partners" onClick={(event) => handleNavClick(event, 'partners')} className="block min-h-10 rounded-lg px-3 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-parchment focus-visible:outline-2 focus-visible:outline-secondary">{t.nav.partners}</a>
                </div>
              )}
            </li>
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <a href={buildWhatsAppLink('')} target="_blank" rel="noopener noreferrer" onClick={() => playMechanicalClick('click')} className="hidden min-h-10 items-center justify-center rounded-xl bg-secondary px-4 text-sm font-semibold tracking-wide text-deep-charcoal shadow-md transition-colors hover:bg-amber-glow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary lg:inline-flex">
              {t.nav.inquire}
            </a>
            <button ref={mobileButtonRef} type="button" aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={isOpen} aria-controls="mobile-navigation-menu" onClick={() => { playMechanicalClick('click'); setIsOpen((value) => !value); }} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-secondary lg:hidden">
              {isOpen ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div id="mobile-navigation-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="overflow-hidden border-t border-surface-variant/30 bg-background/98 backdrop-blur-lg lg:hidden">
              <div className="px-margin-mobile py-4">
                <a href="#collection" onClick={(event) => handleNavClick(event, 'collection')} className={mobileLinkClass}>{t.nav.collection}</a>
                <a href="#guests" onClick={(event) => handleNavClick(event, 'guests')} className={mobileLinkClass}>{t.nav.guests}</a>
                <a href="#diario" onClick={(event) => handleNavClick(event, 'diario')} className={mobileLinkClass}>{t.nav.diary}</a>
                <div className="my-2 border-t border-surface-variant/30 pt-3">
                  <p className="px-2 pb-1 text-[10px] font-label-caps uppercase tracking-[0.12em] text-secondary">{t.nav.studio}</p>
                  <a href="#about" onClick={(event) => handleNavClick(event, 'about')} className={mobileLinkClass}>{t.nav.about}</a>
                  <a href="#purpose" onClick={(event) => handleNavClick(event, 'purpose')} className={mobileLinkClass}>{t.nav.purpose}</a>
                  <a href="#partners" onClick={(event) => handleNavClick(event, 'partners')} className={mobileLinkClass}>{t.nav.partners}</a>
                </div>
                <a href={buildWhatsAppLink('Olá, Studio SenhorEle!')} target="_blank" rel="noopener noreferrer" onClick={() => { playMechanicalClick('click'); setIsOpen(false); }} className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl bg-secondary px-5 text-sm font-semibold text-deep-charcoal transition-colors hover:bg-amber-glow focus-visible:outline-2 focus-visible:outline-secondary">
                  {t.nav.inquire}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
