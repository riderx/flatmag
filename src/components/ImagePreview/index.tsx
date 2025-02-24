import React from 'react';

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ImagePreview({ src, alt, className = '', style = {} }: ImagePreviewProps) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover rounded pointer-events-none"
        draggable={false}
        loading="lazy"
      />
    </div>
  );
}