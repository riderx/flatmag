import React from 'react';
import { Navigation } from './Navigation';

interface FrameProps {
  currentPage: number;
  totalPages: number;
  isAnimating: boolean;
  onClose: () => void;
  onFlip: (direction: 'left' | 'right') => void;
  children: React.ReactNode;
}

export function Frame({
  currentPage,
  totalPages,
  isAnimating,
  onClose,
  onFlip,
  children
}: FrameProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50">
      <Navigation
        currentPage={currentPage}
        totalPages={totalPages}
        isAnimating={isAnimating}
        onClose={onClose}
        onFlip={onFlip}
      />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {children}
      </div>
    </div>
  );
}