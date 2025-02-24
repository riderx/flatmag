import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { handleImageUpload, getImageUrl } from '../utils/imageHandler';
import type { Visual } from '../types';

interface VisualUploaderProps {
  visual: Partial<Visual>;
  onUpload: (url: string) => void;
  onError: (error: string) => void;
}

export function VisualUploader({ visual, onUpload, onError }: VisualUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await handleImageUpload(file);
    if (result.error || !result.base64) {
      onError(result.error);
    } else {
      onUpload(result.base64);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleUpload}
        className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800"
        title="Upload Image"
      >
        <Upload className="w-5 h-5" />
      </button>
    </>
  );
}