import type { Visual } from '../../types';

export interface ImageUploadResult {
  url: string;
  base64?: string;
  error?: string;
}

export interface ImageLoadingState {
  isLoading: boolean;
  error: string | null;
  retryCount: number;
}

export interface ImageValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}