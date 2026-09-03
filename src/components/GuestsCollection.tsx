import React, { memo, useState } from 'react';
import { motion } from 'motion/react';
import { buildWhatsAppLink } from '../config/contact';
import { playMechanicalClick } from '../utils/audio';
import { buildShareUrl } from '../utils/share';
import { webpImageUrl } from '../utils/imageUtils';
import { useLanguage } from '../i18n/LanguageContext';
import type { CollectionVehicleItem } from './Collection';

interface GuestsCollectionProps {
  items: CollectionVehicleItem[];
  onOpenDetail?: (vehicleId: string) => void;
}

const GuestsCollection = memo(function GuestsCollection({ items, onOpenDetail }: GuestsCollectionProps) {
  const { t } = useLanguage();
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const shareGuest = async (item: CollectionVehicleItem) => {
    playMechanicalClick('click');
    const url = buildShareUrl(item.shareId);
    const text = `${t.guests.shareText}: ${item.title} (#${item.shareId})`;

    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopiedShareId(item.shareId);
      window.setTimeout(() => setCopiedShareId(null), 2500);
    } catch {
      window.prompt(t.guests.copyPrompt, url);
    }
  };

  const shareGuestOnWhatsApp = (item: CollectionVehicleItem) => {
    playMechanicalClick('click');
    const url = buildShareUrl(item.shareId);
    const text = `${t.guests.shareText}: ${item.title} (#${item.shareId})\n${url}`;
    window.open(buildWhatsAppLink(text), '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.section
      id="guests"
      aria-labelledby="guests-heading"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative overflow-hidden border-y border-secondary/15 bg-racing-green-dark/35 py-section-gap"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_15%,rgba(193,146,69,0.18),transparent_34%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mb-10 max-w-3xl">
          <h2 id="guests-heading" className="font-headline-lg text-headline-lg-mobile text-parchment md:text-headline-lg">
            {t.guests.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-on-surface-variant md:text-base">
            {t.guests.description}
          </p>
        </header>

        {items.length === 0 ? (
          <p className="border-t border-surface-variant/35 py-12 text-on-surface-variant">{t.guests.empty}</p>
        ) : <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
          {items.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: Math.min(index, 3) * 0.08 }}
              className="group overflow-hidden rounded-2xl border border-secondary/20 bg-surface-container-high shadow-[0_18px_45px_rgba(0,0,0,0.34)]"
            >
              <button
                type="button"
                onClick={() => {
                  playMechanicalClick('click');
                  onOpenDetail?.(item.id);
                }}
                className="relative block h-64 w-full cursor-pointer overflow-hidden bg-background text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary sm:h-72"
                aria-label={`${t.guests.openDetails}: ${item.title}`}
              >
                <img
                  src={webpImageUrl(item.image)}
                  alt={item.title}
                  width="720"
                  height="405"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-background/10" />
                <span className="absolute left-4 top-4 rounded-full border border-secondary/45 bg-background/85 px-3 py-1.5 font-label-caps text-[10px] font-bold tracking-[0.16em] text-secondary backdrop-blur-md">
                  {t.guests.badge}
                </span>
                <span className="absolute bottom-4 right-4 rounded-full border border-parchment/20 bg-background/80 px-3 py-1 font-label-caps text-[10px] text-parchment backdrop-blur-md">
                  #{item.shareId}
                </span>
              </button>

              <div className="p-5 sm:p-6">
                <span className="font-label-caps text-[11px] tracking-widest text-secondary">{item.subtitle}</span>
                <h3 className="mt-1 font-headline-md text-2xl leading-tight text-parchment">{item.title}</h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.year && <span className="rounded-md bg-surface-container-low px-2.5 py-1 text-xs text-on-surface-variant">{item.year}</span>}
                  {item.engine && <span className="rounded-md bg-surface-container-low px-2.5 py-1 text-xs text-on-surface-variant">{item.engine}</span>}
                </div>

                <p className="mt-5 border border-secondary/25 bg-surface-container-low/45 p-3 text-xs leading-relaxed text-on-surface-variant">
                  {t.guests.disclaimer}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-surface-variant/30 pt-4">
                  <button
                    type="button"
                    onClick={() => onOpenDetail?.(item.id)}
                    className="min-h-11 rounded-lg px-3 text-xs font-label-caps text-parchment transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-secondary"
                  >
                    {t.guests.openDetails}
                  </button>
                  <button
                    type="button"
                    onClick={() => void shareGuest(item)}
                    className="ml-auto flex min-h-11 items-center gap-1.5 rounded-lg border border-secondary/40 px-3 text-xs font-label-caps text-secondary transition-colors hover:bg-secondary hover:text-deep-charcoal focus-visible:outline-2 focus-visible:outline-secondary"
                  >
                    <span className="material-symbols-outlined text-[17px]" aria-hidden="true">
                      {copiedShareId === item.shareId ? 'check' : 'share'}
                    </span>
                    {copiedShareId === item.shareId ? t.guests.copied : t.guests.share}
                  </button>
                  <button
                    type="button"
                    onClick={() => shareGuestOnWhatsApp(item)}
                    aria-label={`${t.guests.whatsappLabel}: ${item.title}`}
                    title={t.guests.whatsappLabel}
                    className="flex size-11 items-center justify-center rounded-lg border border-[#25D366]/45 text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-deep-charcoal focus-visible:outline-2 focus-visible:outline-[#25D366]"
                  >
                    <span className="material-symbols-outlined text-[19px]" aria-hidden="true">send</span>
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>}
      </div>
    </motion.section>
  );
});

export default GuestsCollection;
