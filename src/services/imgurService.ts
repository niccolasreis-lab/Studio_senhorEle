/**
 * Imgur API Service for free cloud image hosting.
 * Documentation: https://apidocs.imgur.com/
 */

const DEFAULT_CLIENT_ID = '93724c9657b98d3'; // Fallback / configurable Imgur Client ID

export const ImgurService = {
  getClientId(): string {
    return localStorage.getItem('studio_imgur_client_id') || DEFAULT_CLIENT_ID;
  },

  setClientId(clientId: string): void {
    localStorage.setItem('studio_imgur_client_id', clientId.trim());
  },

  /**
   * Upload an image File or Base64 string directly to Imgur CDN.
   * Returns the direct HTTPS image URL from Imgur.
   */
  async uploadImage(fileOrBase64: File | string, customClientId?: string): Promise<string> {
    const clientId = customClientId || this.getClientId();
    const formData = new FormData();

    if (typeof fileOrBase64 === 'string') {
      // Clean base64 prefix if present (e.g. data:image/jpeg;base64,...)
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
        Authorization: `Client-ID ${clientId}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data?.data?.error || 'Falha ao enviar imagem para o Imgur.';
      throw new Error(errorMsg);
    }

    return data.data.link; // Direct link: https://i.imgur.com/xxxxxx.jpg
  },
};
