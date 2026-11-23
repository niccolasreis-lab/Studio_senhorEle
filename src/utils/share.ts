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

/** Also resolve /p/ when an older installed service worker serves the SPA. */
export function diaryShareIdFromLocation(search: string, pathname: string): string | null {
  const queryId = new URLSearchParams(search).get('d');
  if (queryId) return queryId;
  const match = /^\/p\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;
  try {
    const id = decodeURIComponent(match[1]);
    return /^DIA-[A-Z0-9-]+$/i.test(id) ? id : null;
  } catch {
    return null;
  }
}
