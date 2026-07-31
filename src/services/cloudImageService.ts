/**
 * Cloud Image Service with multi-provider fallback (Imgur & ImgBB CDN).
 * Ensures uploads succeed even when a single API is over capacity.
 */

// User's personal ImgBB API key
const IMGBB_API_KEY = '65721699e787cf128cfffe215a25e7ff';
const DEFAULT_IMGUR_CLIENT_ID = '93724c9657b98d3';

export const CloudImageService = {
  /**
   * Upload an image File or Base64 string to ImgBB Cloud CDN.
   */
  async uploadToImgBB(fileOrBase64: File | string): Promise<string> {
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);

    if (typeof fileOrBase64 === 'string') {
      const base64Data = fileOrBase64.replace(/^data:image\/\w+;base64,/, '');
      formData.append('image', base64Data);
    } else {
      formData.append('image', fileOrBase64);
    }

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || 'Falha ao hospedar imagem no ImgBB.');
    }

    return data.data.url; // Direct CDN link: https://i.ibb.co/xxxxx/image.jpg
  },

  /**
   * Upload image to Imgur API.
   */
  async uploadToImgur(fileOrBase64: File | string): Promise<string> {
    const formData = new FormData();

    if (typeof fileOrBase64 === 'string') {
      const base64Data = fileOrBase64.replace(/^data:image\/\w+;base64,/, '');
      formData.append('image', base64Data);
      formData.append('type', 'base64');
    } else {
      formData.append('image', fileOrBase64);
      formData.append('type', 'file');
    }

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${DEFAULT_IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data?.data?.error || 'Imgur indisponível.';
      throw new Error(errorMsg);
    }

    return data.data.link;
  },

  /**
   * Smart Cloud Upload with automatic resilience fallback:
   * Tries ImgBB CDN -> Tries Imgur CDN -> Fallback to Local Base64
   */
  async uploadSmart(fileOrBase64: File | string): Promise<{ url: string; provider: string }> {
    // 1. Try ImgBB (most reliable, no capacity rate limits)
    try {
      const url = await this.uploadToImgBB(fileOrBase64);
      return { url, provider: 'ImgBB Cloud CDN' };
    } catch {
      // 2. Fallback to Imgur
      try {
        const url = await this.uploadToImgur(fileOrBase64);
        return { url, provider: 'Imgur Cloud CDN' };
      } catch {
        // 3. Fallback to local Data URL if offline / both over capacity
        if (typeof fileOrBase64 === 'string') {
          return { url: fileOrBase64, provider: 'Local Data Base64' };
        }
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ url: reader.result as string, provider: 'Local Data Base64' });
          };
          reader.onerror = reject;
          reader.readAsDataURL(fileOrBase64);
        });
      }
    }
  },
};
