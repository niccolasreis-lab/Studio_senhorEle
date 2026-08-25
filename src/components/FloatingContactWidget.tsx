import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playMechanicalClick } from '../utils/audio';
import { buildWhatsAppLink } from '../config/contact';

interface FloatingContactWidgetProps {
  onOpenInquire?: () => void;
}

export default function FloatingContactWidget({ onOpenInquire }: FloatingContactWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = () => {
    playMechanicalClick(isOpen ? 'click' : 'modal');
    setIsOpen(!isOpen);
  };

  const handleOpenOption = (action?: () => void) => {
    playMechanicalClick('click');
    setIsOpen(false);
    if (action) action();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden flex-col items-end sm:flex">
      {/* Expanded Contact Stack */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 flex flex-col space-y-3 items-end"
          >
            {/* WhatsApp Option */}
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              href={buildWhatsAppLink('Olá, Studio SenhorEle!')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleOpenOption()}
              className="flex items-center justify-center bg-[#25D366] hover:bg-[#20bd5a] text-white w-14 h-14 rounded-full shadow-[0_10px_25px_rgba(37,211,102,0.4)] transition-all cursor-pointer group"
            >
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.228-1.157zm11.233-6.082c-.083-.139-.304-.222-.637-.388-.333-.167-1.968-.972-2.274-1.083-.306-.112-.529-.167-.751.167-.222.333-.861 1.083-1.056 1.306-.194.222-.389.25-.722.083-.333-.167-1.408-.519-2.682-1.655-1.002-.892-1.678-1.995-1.874-2.328-.195-.333-.021-.513.145-.678.15-.149.333-.389.5-.583.167-.194.222-.333.333-.556.111-.222.056-.417-.028-.583-.083-.167-.751-1.806-1.028-2.472-.27-.648-.545-.561-.75-.572-.198-.011-.426-.011-.654-.011-.228 0-.598.086-.911.428-.313.342-1.196 1.169-1.196 2.85 0 1.681 1.225 3.303 1.396 3.533.171.23 2.413 3.685 5.845 5.166.816.352 1.453.562 1.949.72.82.261 1.567.224 2.157.136.657-.098 2.018-.825 2.302-1.625.284-.801.284-1.487.199-1.626z"/>
              </svg>
            </motion.a>

            {/* Instagram Option */}
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              href="https://www.instagram.com/studiosenhorele/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleOpenOption()}
              className="flex items-center justify-center bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white w-14 h-14 rounded-full shadow-[0_10px_25px_rgba(220,39,67,0.35)] transition-all cursor-pointer group"
            >
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </motion.a>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button with Official Logo */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.2 }}
        onClick={toggleWidget}
        className="relative group cursor-pointer flex items-center justify-center"
        aria-label={isOpen ? 'Fechar opções de contato' : 'Abrir opções de contato'}
        aria-expanded={isOpen}
      >
        {/* Glowing Pulsing Outer Ring */}
        <span className="absolute inset-0 rounded-full bg-secondary/30 animate-ping opacity-75 pointer-events-none" />

        {/* Outer Circular Container */}
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full p-1 transition-all duration-300 shadow-[0_14px_35px_rgba(0,0,0,0.75)] ${
          isOpen
            ? 'bg-amber-glow ring-4 ring-amber-glow/80 scale-105'
            : 'bg-gradient-to-tr from-secondary via-amber-glow to-secondary hover:ring-4 hover:ring-amber-glow/60'
        }`}>
          <div className="w-full h-full rounded-full overflow-hidden bg-surface-container-low relative flex items-center justify-center">
            {/* Official Logo */}
            <img
              src="/assets/images/logo-senhorele-192.jpg"
              alt=""
              width="192"
              height="192"
              decoding="async"
              className={`w-full h-full object-cover transition-transform duration-300 ${isOpen ? 'scale-90 opacity-40' : 'group-hover:scale-110'}`}
            />

            {/* Close Icon Overlay when Open */}
            {isOpen && (
              <motion.div
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-deep-charcoal/80 text-amber-glow"
              >
                <span className="material-symbols-outlined text-[32px] md:text-[36px]">close</span>
              </motion.div>
            )}

            {/* Online Status Dot when Closed */}
            {!isOpen && (
              <span className="absolute top-1 right-1 w-4 h-4 md:w-4.5 md:h-4.5 bg-emerald-500 border-2 border-surface-container-low rounded-full shadow-md" />
            )}
          </div>
        </div>

        {/* Hover Label Tooltip */}
        {!isOpen && (
          <span className="absolute right-20 md:right-24 px-3.5 py-2 bg-surface-container-high/95 border border-surface-variant/60 text-parchment font-label-caps text-xs md:text-sm rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap backdrop-blur-md">
            Contato Rápido
          </span>
        )}
      </motion.button>
    </div>
  );
}
