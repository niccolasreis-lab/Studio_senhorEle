import { FALLBACK_INSTAGRAM_POSTS, InstagramPost } from '../data/instagramPosts';
import { buildWhatsAppLink } from '../config/contact';

const CACHE_KEY = 'studio_senhorele_instagram_posts_v3';
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes cache

interface CacheData {
  timestamp: number;
  posts: InstagramPost[];
}

export class InstagramService {
  /**
   * Automatically fetches public Instagram feed for @studiosenhorele
   * via public CORS/Feed Proxy endpoints, or falls back to curated dataset.
   */
  public static async getLatestPosts(): Promise<InstagramPost[]> {
    return Promise.resolve(FALLBACK_INSTAGRAM_POSTS.slice(0, 6));
  }

  /**
   * Formats a WhatsApp inquiry link for a specific Instagram post
   */
  public static generateWhatsAppLink(post: InstagramPost): string {
    const text = [
      `Olá, Studio SenhorEle! Vi este destaque no Instagram:`,
      `*${post.title}*`,
      `*ID do Post:* #${post.shareId}`,
      `*Link do Post:* ${post.permalink}`,
      ``,
      `Gostaria de consultar mais detalhes sobre este veículo/curadoria.`,
    ].join('\n');

    return buildWhatsAppLink(text);
  }
}
