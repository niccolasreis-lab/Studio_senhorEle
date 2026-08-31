import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import PartnersShowcase, { Partner } from './ui/partners-showcase';
import { StudioUpdateService } from '../services/studioUpdateService';

export default function Partners() {
  const { t } = useLanguage();
  const [fuscaNaFotoProfile, setFuscaNaFotoProfile] = useState<{ avatar?: string; description?: string }>({});

  useEffect(() => {
    let active = true;
    StudioUpdateService.fetchSources().then((sources) => {
      const source = sources.find((item) => item.sourceKey === 'youtube-fuscanafoto');
      if (active) setFuscaNaFotoProfile({ avatar: source?.avatarUrl, description: source?.description || undefined });
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const partners: Partner[] = [
    {
      id: 1,
      name: 'Pelúcia Estética Automotiva',
      category: t.partners.categories.detailing,
      website: 'https://www.instagram.com/pelucia_estetica_automotiva/',
      linkLabel: t.partners.instagramDestination,
      logo: '/images/parceiros/pelucia-estetica-automotiva.png',
      logoStatus: 'available',
      imageAlt: t.partners.peluciaImageAlt,
      logoClassName: 'px-3 py-1 sm:px-4 sm:py-2',
    },
    {
      id: 2,
      name: 'Freeza Serviços Automotivos',
      category: t.partners.categories.automotiveServices,
      website: 'https://oficinafreza.com.br/',
      linkLabel: t.partners.websiteDestination,
      logo: '/images/parceiros/freeza-servicos-automotivos.png',
      logoStatus: 'available',
      logoClassName: 'px-2 sm:px-3',
    },
    {
      id: 3,
      name: 'CJC Automecânica',
      category: t.partners.categories.mechanicsAndElectrical,
      website: 'https://www.instagram.com/automecanica.cjc/',
      linkLabel: t.partners.instagramDestination,
      logo: '/images/parceiros/cjc-automecanica.png',
      logoStatus: 'available',
      logoClassName: 'px-3 py-1 sm:px-4 sm:py-2',
    },
    {
      id: 4,
      name: 'Bayo Turbo Injepro',
      category: t.partners.categories.performanceAndTechnology,
      website: 'https://injepro.com/',
      linkLabel: t.partners.websiteDestination,
      logo: '/images/parceiros/bayo-turbo-injepro.png',
      logoStatus: 'available',
      logoClassName: 'px-0 py-5 sm:py-6',
    },
    {
      id: 5,
      name: 'Lobato Gui',
      category: t.partners.categories.automotiveServices,
      website: 'https://www.instagram.com/lobatogui/',
      linkLabel: t.partners.instagramDestination,
      logo: '/images/parceiros/lobato-gui.jpg',
      imageAlt: t.partners.lobatoImageAlt,
      logoClassName: 'px-3 py-1 sm:px-4 sm:py-2',
    },
    {
      id: 6,
      name: 'Fusca na Foto',
      category: t.partners.categories.youtubePartner,
      website: 'https://www.youtube.com/@FuscanaFoto',
      linkLabel: t.partners.youtubeDestination,
      logo: fuscaNaFotoProfile.avatar || '',
      logoStatus: fuscaNaFotoProfile.avatar ? 'available' : 'pending',
      description: fuscaNaFotoProfile.description,
      imageAlt: t.partners.fuscaNaFotoImageAlt,
      logoClassName: 'rounded-full px-5 py-2 sm:px-7',
    },
    {
      id: 7,
      name: 'Air Volks Garage',
      category: t.partners.categories.automotiveServices,
      website: 'https://www.instagram.com/airvolksgarage/',
      linkLabel: t.partners.instagramDestination,
      logo: 'https://i.imgur.com/JXjRRz6.jpeg',
      logoStatus: 'available',
      logoClassName: 'px-3 py-1 sm:px-4 sm:py-2',
    },
  ];

  return (
    <PartnersShowcase
      partners={partners}
      title={t.partners.title}
      description={t.partners.description}
      actionLabel={t.partners.actionLabel}
      fallbackLabel={t.partners.fallbackLabel}
      newTabLabel={t.partners.newTabLabel}
    />
  );
}
