import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAccessibleModal } from '../hooks/useAccessibleModal';
import { useLanguage } from '../i18n/LanguageContext';
import { buildWhatsAppLink } from '../config/contact';

interface InquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCar?: string;
}

const VEHICLE_OPTIONS = [
  'Porsche 911 Classic',
  'VW Kombi Corujinha',
  'VW Fusca Cal Style',
  'Aero Willys',
  'Preparação Air Cooled',
  'Informações Gerais do Studio',
];

export default function InquireModal({
  isOpen,
  onClose,
  selectedCar,
}: InquireModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [carInterest, setCarInterest] = useState(
    selectedCar || 'Informações Gerais do Studio',
  );
  const [message, setMessage] = useState('');
  const modalRef = useAccessibleModal<HTMLDivElement>(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    setCarInterest(selectedCar || 'Informações Gerais do Studio');
  }, [isOpen, selectedCar]);

  const openWhatsApp = () => {
    const text = [
      `Olá, Studio Senhorele! Meu nome é *${name}*.`,
      '',
      `*Interesse:* ${carInterest}`,
      `*Telefone:* ${phone}`,
      `*E-mail:* ${email}`,
      message ? `*Mensagem:* ${message}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    window.open(
      buildWhatsAppLink(text),
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    openWhatsApp();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/85 backdrop-blur-md"
          />

          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquire-modal-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-surface-container-high border border-surface-variant/40 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden z-10 p-6 md:p-8"
          >
            <motion.button
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-parchment transition-colors p-2 rounded-full hover:bg-surface-variant/40 cursor-pointer"
              aria-label="Fechar formulário de consulta"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </motion.button>

            <div className="text-center mb-6 pr-8">
              <span className="font-label-caps text-label-caps text-secondary tracking-widest block mb-1">
                Studio Senhorele
              </span>
              <h2
                id="inquire-modal-title"
                className="font-headline-md text-headline-md text-parchment"
              >
                {t.inquire.title}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 text-sm">
                {t.inquire.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="inquire-name"
                  className="block font-label-caps text-label-caps text-on-surface-variant mb-1"
                >
                  {t.inquire.nameLabel} *
                </label>
                <input
                  id="inquire-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t.inquire.namePlaceholder}
                  className="w-full bg-surface-container-low border border-surface-variant/50 rounded-lg px-4 py-2.5 text-on-surface text-body-md focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="inquire-email"
                    className="block font-label-caps text-label-caps text-on-surface-variant mb-1"
                  >
                    {t.inquire.emailLabel} *
                  </label>
                  <input
                    id="inquire-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t.inquire.emailPlaceholder}
                    className="w-full bg-surface-container-low border border-surface-variant/50 rounded-lg px-4 py-2.5 text-on-surface text-body-md focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="inquire-phone"
                    className="block font-label-caps text-label-caps text-on-surface-variant mb-1"
                  >
                    {t.inquire.phoneLabel} *
                  </label>
                  <input
                    id="inquire-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    minLength={8}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={t.inquire.phonePlaceholder}
                    className="w-full bg-surface-container-low border border-surface-variant/50 rounded-lg px-4 py-2.5 text-on-surface text-body-md focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="inquire-vehicle"
                  className="block font-label-caps text-label-caps text-on-surface-variant mb-1"
                >
                  {t.inquire.carSelected}
                </label>
                <select
                  id="inquire-vehicle"
                  name="vehicle"
                  value={carInterest}
                  onChange={(event) => setCarInterest(event.target.value)}
                  className="w-full bg-surface-container-low border border-surface-variant/50 rounded-lg px-4 py-2.5 text-on-surface text-body-md focus:outline-none focus:border-secondary transition-colors"
                >
                  {VEHICLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="inquire-message"
                  className="block font-label-caps text-label-caps text-on-surface-variant mb-1"
                >
                  {t.inquire.messageLabel}
                </label>
                <textarea
                  id="inquire-message"
                  name="message"
                  rows={3}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={t.inquire.messagePlaceholder}
                  className="w-full bg-surface-container-low border border-surface-variant/50 rounded-lg px-4 py-2.5 text-on-surface text-body-md focus:outline-none focus:border-secondary transition-colors resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                type="submit"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-label-caps text-label-caps px-5 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>{t.inquire.whatsappDirect}</span>
              </motion.button>

              <div className="text-center pt-1">
                <a
                  href="https://www.instagram.com/studiosenhorele/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-on-surface-variant hover:text-parchment transition-colors font-label-caps"
                >
                  <span>Prefiro conversar pelo Instagram</span>
                  <span className="material-symbols-outlined text-[14px]">
                    arrow_outward
                  </span>
                </a>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
