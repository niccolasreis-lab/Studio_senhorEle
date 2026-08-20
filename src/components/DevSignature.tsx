import { Globe, Instagram, MessageCircle } from 'lucide-react';

const NEXA_LOGO = '/assets/images/logotipo_nexareis.png';
const NEXA_WEBSITE_URL = 'https://nexareis.com.br/';
const NEXA_INSTAGRAM_URL = 'https://instagram.com/nexareisautomacao';
const NEXA_WHATSAPP_URL = 'https://wa.me/5511937105501';

export default function DevSignature() {
  return (
    <div className="border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-5">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-xs text-[#6b7280]">
          <div className="flex items-center gap-2">
            <img
              src={NEXA_LOGO}
              alt="Nexa Reis Automation"
              width="36"
              height="36"
              loading="lazy"
              decoding="async"
              className="h-9 w-9 rounded-full object-cover bg-surface-container-low ring-1 ring-white/10"
            />
            <span>
              Desenvolvido por{' '}
              <span className="font-semibold text-gray-300">Nexa Reis Automation</span>
            </span>
          </div>

          <span className="hidden md:inline text-gray-700" aria-hidden="true">•</span>

          <a
            href={NEXA_WEBSITE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-cyan-500"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>nexareis.com.br</span>
          </a>

          <span className="hidden md:inline text-gray-700" aria-hidden="true">•</span>

          <a
            href={NEXA_INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-cyan-500"
          >
            <Instagram className="h-3.5 w-3.5" />
            <span>@nexareisautomacao</span>
          </a>

          <span className="hidden md:inline text-gray-700" aria-hidden="true">•</span>

          <a
            href={NEXA_WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-green-500"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>+55 11 93710-5501</span>
          </a>
        </div>
      </div>
    </div>
  );
}
