import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CarFront } from 'lucide-react';
import { Marquee } from './marquee';
import { cn } from '../../lib/utils';

export interface Partner {
  id: number;
  name: string;
  category?: string;
  website: string;
  linkLabel?: string;
  logo: string;
  logoStatus?: 'available' | 'pending';
  imageAlt?: string;
  logoClassName?: string;
}

export interface PartnersShowcaseProps {
  partners: Partner[];
  title?: string;
  description?: string;
  actionLabel?: string;
  fallbackLabel?: string;
  newTabLabel?: string;
}

export function PartnersShowcase({
  partners,
  title = 'Parceiros',
  description = 'Profissionais e empresas que compartilham nossa paixão pelo universo automotivo.',
  actionLabel = 'Conhecer parceiro',
  fallbackLabel = 'Identidade visual em atualização',
  newTabLabel = 'abre em nova guia',
}: PartnersShowcaseProps) {
  const shouldReduceMotion = useReducedMotion();
  const [failedImages, setFailedImages] = useState<Set<number>>(() => new Set());

  const handleImageError = (partner: Partner) => {
    setFailedImages((current) => {
      if (current.has(partner.id)) return current;
      const next = new Set(current);
      next.add(partner.id);
      return next;
    });

    if (import.meta.env.DEV) {
      console.warn(`[Parceiros] Não foi possível carregar a imagem de ${partner.name}: ${partner.logo}`);
    }
  };

  return (
    <section
      id="partners"
      aria-labelledby="partners-title"
      className="relative scroll-mt-24 overflow-hidden border-y border-surface-variant/25 bg-surface-container-low px-margin-mobile py-section-gap md:px-margin-desktop"
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-secondary/20" />

      <div className="relative mx-auto max-w-[1280px]">
        <motion.header
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 max-w-[72ch] md:mb-16"
        >
          <h2
            id="partners-title"
            className="text-balance font-headline-lg text-headline-lg-mobile text-parchment md:text-headline-lg"
          >
            {title}
          </h2>
          <p className="mt-5 max-w-[65ch] font-body-lg text-base leading-relaxed text-on-surface-variant md:text-lg">
            {description}
          </p>
        </motion.header>

        <Marquee
          pauseOnHover
          speed={42}
          aria-label={title}
          className="mt-2 py-6 md:py-8"
        >
          {partners.map((partner, index) => {
            const hasImageError = failedImages.has(partner.id);
            const shouldShowImage = partner.logoStatus !== 'pending' && !hasImageError;
            const destination = partner.linkLabel ?? actionLabel;

            return (
              <a
                key={partner.id}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${destination}: ${partner.name} (${newTabLabel})`}
                title={partner.name}
                className="group relative flex h-28 w-[164px] shrink-0 items-center justify-center rounded-xl px-4 py-4 transition-[background-color,transform] duration-300 ease-out hover:bg-surface-container-high/55 focus-visible:bg-surface-container-high/55 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary sm:h-32 sm:w-[230px] sm:px-7 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-2 z-10 max-w-[calc(100%-1rem)] -translate-x-1/2 translate-y-1 truncate rounded-md bg-surface-container-highest px-2.5 py-1 font-label-caps text-[9px] uppercase tracking-[0.08em] text-secondary opacity-0 shadow-[0_6px_18px_rgba(14,14,14,0.35)] transition-[opacity,transform] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  {partner.name}
                </span>
                {shouldShowImage ? (
                  <img
                    src={partner.logo}
                    alt={partner.imageAlt ?? `Logotipo de ${partner.name}`}
                    loading={index < 5 ? 'eager' : 'lazy'}
                    decoding="async"
                    width="320"
                    height="160"
                    onError={() => handleImageError(partner)}
                    className={cn(
                      'max-h-20 w-full object-contain opacity-90 transition-[opacity,transform] duration-300 ease-out group-hover:scale-[1.03] group-hover:opacity-100 group-focus-visible:opacity-100 sm:max-h-24 motion-reduce:transition-none',
                      partner.logoClassName,
                    )}
                  />
                ) : (
                  <span className="flex flex-col items-center justify-center gap-2 text-center text-on-surface-variant">
                    <CarFront aria-hidden="true" className="h-7 w-7 text-secondary/75" strokeWidth={1.5} />
                    <span className="font-body-md text-sm leading-snug text-parchment">{partner.name}</span>
                    <span className="font-label-caps text-[9px] uppercase tracking-[0.12em]">
                      {fallbackLabel}
                    </span>
                  </span>
                )}
              </a>
            );
          })}
        </Marquee>
      </div>
    </section>
  );
}

export default PartnersShowcase;
