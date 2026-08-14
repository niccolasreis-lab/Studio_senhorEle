/**
 * URL canônica de compartilhamento de um item. Usa a rota /p/<shareId> que,
 * no Vercel, é servida pelo endpoint /api/og — garantindo Open Graph correto
 * quando o link é enviado via redes sociais.
 */
export function buildShareUrl(shareId: string): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://studio-senhorele.vercel.app';
  return `${origin}/p/${encodeURIComponent(shareId)}`;
}