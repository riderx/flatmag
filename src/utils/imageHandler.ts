import type { Visual } from '../types';

export interface ImageUploadResult {
  url: string;
  base64?: string;
  error?: string;
}

async function downloadAndConvertToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const handleImageUpload = async (file: File): Promise<ImageUploadResult> => {
  try {
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Image must be less than 5MB');
    }

    const base64 = await convertFileToBase64(file);
    return {
      url: base64,
      base64
    };
  } catch (error) {
    return {
      url: '',
      error: error instanceof Error ? error.message : 'Failed to upload image'
    };
  }
};

export const getImageUrl = async (url: string): Promise<string> => {
  if (url.startsWith('data:')) {
    return url;
  }

  return downloadAndConvertToBase64(url);
};

export const cleanupImageUrl = (url: string) => {}; // No cleanup needed for base64

export const validateVisualPosition = (
  visual: Visual,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } => {
  const x = Math.max(0, Math.min(100, visual.x));
  const y = Math.max(0, Math.min(100, visual.y));
  return { x, y };
};