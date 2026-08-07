export const WHATSAPP_NUMBER = '5511947251630';

export const WHATSAPP_DISPLAY = '(11) 94725-1630';

export function buildWhatsAppLink(text: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  const trimmed = text.trim();
  return trimmed ? `${base}?text=${encodeURIComponent(trimmed)}` : base;
}

export function openWhatsApp(text: string): void {
  window.open(buildWhatsAppLink(text), '_blank', 'noopener,noreferrer');
}
