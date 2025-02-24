import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface NavigationProps {
  currentPage: number;
  totalPages: number;
  isAnimating: boolean;
  onClose: () => void;
  onFlip: (direction: 'left' | 'right') => void;
}

export function Navigation({
  currentPage,
  totalPages,
  isAnimating,
  onClose,
  onFlip
}: NavigationProps) {
  return (
    <>
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-white hover:text-gray-300 z-50"
      >
        <X className="w-8 h-8" />
      </button>

      <button
        onClick={() => onFlip('left')}
        disabled={currentPage <= 0 || isAnimating}
        className="absolute left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-50"
      >
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>

      <button
        onClick={() => onFlip('right')}
        disabled={currentPage >= totalPages - 2 || isAnimating}
        className="absolute right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-50"
      >
        <ChevronRight className="w-8 h-8 text-white" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/20 text-white text-lg z-50">
        {currentPage + 1}-{currentPage + 2} of {totalPages}
      </div>
    </>
  );
}