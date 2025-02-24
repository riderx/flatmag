import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { handleImageUpload } from '../../utils/imageHandler';

interface ImageUploaderProps {
  onUpload: (base64: string) => void;
  onError: (error: string) => void;
  className?: string;
}

export function ImageUploader({ onUpload, onError, className = '' }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await handleImageUpload(file);
      if (result.error || !result.base64) {
        onError(result.error || 'Failed to upload image');
      } else {
        onUpload(result.base64);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        onClick={handleUploadClick}
        disabled={isUploading}
        className={`inline-flex items-center justify-center text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Upload Image"
      >
        <Upload className={`w-5 h-5 ${isUploading ? 'animate-pulse' : ''}`} />
      </button>
    </>
  );
}