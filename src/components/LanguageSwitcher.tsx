import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';
import { playMechanicalClick } from '../utils/audio';

const languages: { code: Language; label: string; name: string }[] = [
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-50">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => { playMechanicalClick('click'); setOpen((value) => !value); }}
        aria-label="Selecionar idioma"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="language-menu"
        className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-secondary/45 bg-surface-container-low/90 px-3 text-xs font-bold tracking-[0.08em] text-parchment transition-colors hover:border-secondary hover:text-amber-glow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
      >
        {language.toUpperCase()}
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id="language-menu" role="menu" aria-label="Idiomas" className="absolute right-0 mt-2 min-w-40 overflow-hidden rounded-xl border border-surface-variant/45 bg-background p-1.5 shadow-[0_16px_38px_rgba(0,0,0,0.48)]">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              role="menuitemradio"
              aria-checked={language === item.code}
              onClick={() => {
                playMechanicalClick('click');
                setLanguage(item.code);
                setOpen(false);
                buttonRef.current?.focus();
              }}
              className="flex min-h-10 w-full items-center justify-between gap-4 rounded-lg px-3 text-left text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-parchment focus-visible:outline-2 focus-visible:outline-secondary"
            >
              <span>{item.name}</span>
              <span className="flex items-center gap-2 text-xs font-bold text-secondary">{item.label}{language === item.code && <Check size={14} aria-hidden="true" />}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
