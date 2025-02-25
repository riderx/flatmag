import type { Visual } from '../types';

export interface ImageUploadResult {
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
  return new Promise((resolve) => {
    if (!file.type.match('image.*')) {
      resolve({ error: 'Please select an image file' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      resolve({ base64 });
    };
    reader.onerror = () => {
      resolve({ error: 'Failed to read file' });
    };
    reader.readAsDataURL(file);
  });
};

export const getImageUrl = (url: string): string => {
  // In a real app, this might handle CDN URLs or other transformations
  return url;
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
