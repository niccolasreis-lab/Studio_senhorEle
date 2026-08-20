import heic2any from 'heic2any';

export type NormalizedImageFile = {
  file: File;
  preview: string;
};

const HEIC_EXTENSIONS = ['heic', 'heif', 'heics', 'heifs', 'hif'];

export const isHeicFile = (file: File): boolean => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const mime = (file.type || '').toLowerCase();
  return HEIC_EXTENSIONS.includes(ext) || mime.includes('heic') || mime.includes('heif');
};

const fileFromBlob = (blob: Blob, originalName: string): File => {
  const baseName = originalName.replace(/\.(heic|heif|heics|heifs|hif)$/i, '');
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
};

export const normalizeImageFile = async (file: File): Promise<NormalizedImageFile> => {
  if (isHeicFile(file)) {
    const converted = (await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })) as Blob | Blob[];
    const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
    const jpegFile = fileFromBlob(jpegBlob, file.name);
    return { file: jpegFile, preview: URL.createObjectURL(jpegFile) };
  }

  const reader = new FileReader();
  const preview = await new Promise<string>((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return { file, preview };
};