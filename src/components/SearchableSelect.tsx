import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  icon?: string;
  accentColor?: string;
}

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Buscar ou digitar...',
  required = false,
  icon,
  accentColor = 'amber',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtered options based on search
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes((search || value).toLowerCase())
  );

  // Show all when dropdown is open and no search filter
  const displayOptions = search ? filteredOptions : options;

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onChange(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelect = (opt: string) => {
    onChange(opt);
    setSearch('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  };

  // Accent color classes
  const accentBorder = accentColor === 'amber' ? 'border-amber-400' : 'border-secondary';
  const accentRing = accentColor === 'amber' ? 'ring-amber-400/20' : 'ring-secondary/20';
  const accentBg = accentColor === 'amber' ? 'bg-amber-400/10' : 'bg-secondary/10';
  const accentText = accentColor === 'amber' ? 'text-amber-300' : 'text-secondary';
  const accentHover = accentColor === 'amber' ? 'hover:bg-amber-500/15' : 'hover:bg-secondary/15';

  return (
    <div ref={containerRef} className="relative">
      <label className="block font-label-caps text-[11px] text-on-surface-variant mb-1">
        {label} {required && '*'}
      </label>

      <div
        className={`flex items-center w-full bg-surface-container border rounded-xl transition-all duration-200 ${
          isOpen
            ? `${accentBorder} ring-2 ${accentRing}`
            : 'border-surface-variant/40 hover:border-surface-variant/70'
        }`}
      >
        {/* Icon prefix */}
        {icon && (
          <span className={`material-symbols-outlined text-[16px] pl-3 ${isOpen ? accentText : 'text-on-surface-variant'}`}>
            {icon}
          </span>
        )}

        {/* Text Input (search + type freely) */}
        <input
          ref={inputRef}
          type="text"
          value={search || value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          className="flex-1 px-3 py-2 bg-transparent text-parchment text-xs focus:outline-none min-w-0"
          autoComplete="off"
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setSearch('');
              inputRef.current?.focus();
            }}
            className="px-1 text-on-surface-variant/50 hover:text-rose-400 transition-colors cursor-pointer"
            tabIndex={-1}
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        )}

        {/* Dropdown toggle chevron */}
        <button
          type="button"
          onClick={handleToggle}
          className={`px-2.5 py-2 transition-colors cursor-pointer ${isOpen ? accentText : 'text-on-surface-variant/60 hover:text-parchment'}`}
          tabIndex={-1}
        >
          <span
            className="material-symbols-outlined text-[16px] transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            expand_more
          </span>
        </button>
      </div>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && displayOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 w-full mt-1 bg-surface-container-high border border-surface-variant/50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
            style={{ transformOrigin: 'top center' }}
          >
            {/* Header count badge */}
            <div className="px-3 py-1.5 border-b border-surface-variant/30 flex items-center justify-between">
              <span className="text-[10px] text-on-surface-variant font-label-caps tracking-wider">
                {search ? `${displayOptions.length} resultado(s)` : `${displayOptions.length} opções`}
              </span>
              <span className="text-[9px] text-on-surface-variant/50 font-label-caps">
                ↑↓ Rolar • Enter Selecionar
              </span>
            </div>

            {/* Scrollable options list */}
            <div className="max-h-[180px] overflow-y-auto custom-scrollbar">
              {displayOptions.map((opt, idx) => {
                const isSelected = opt.toLowerCase() === value.toLowerCase();
                return (
                  <button
                    key={`${opt}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3 py-2 text-xs transition-all duration-100 cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? `${accentBg} ${accentText} font-bold`
                        : `text-parchment/80 ${accentHover} hover:text-parchment`
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && (
                      <span className={`material-symbols-outlined text-[14px] ${accentText}`}>check</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Free-type hint */}
            {search && filteredOptions.length === 0 && (
              <div className="px-3 py-2.5 border-t border-surface-variant/30 text-center">
                <span className="text-[10px] text-on-surface-variant">
                  Nenhum resultado — <span className={`${accentText} font-bold`}>"{search}"</span> será usado como valor personalizado
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
