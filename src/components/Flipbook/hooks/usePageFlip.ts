import { useState, useCallback } from 'react';

const FLIP_DURATION = 1000;

interface PageFlipState {
  currentPage: number;
  flipProgress: number;
  flipDirection: 'left' | 'right' | null;
  isAnimating: boolean;
  opacity: number;
}

export function usePageFlip(totalPages: number) {
  const [state, setState] = useState<PageFlipState>({
    currentPage: 0,
    flipProgress: 0,
    flipDirection: null,
    isAnimating: false,
    opacity: 1
  });

  const handleFlip = useCallback((direction: 'left' | 'right') => {
    if (state.isAnimating) return;
    if (direction === 'left' && state.currentPage <= 0) return;
    if (direction === 'right' && state.currentPage >= totalPages - 2) return;

    setState(prev => ({
      ...prev,
      isAnimating: true,
      flipDirection: direction,
      flipProgress: 0,
      opacity: 1
    }));

    const animate = (start: number) => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / FLIP_DURATION);

      setState(prev => ({
        ...prev,
        flipProgress: progress,
        opacity: progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1
      }));

      if (progress < 1) {
        requestAnimationFrame(() => animate(start));
      } else {
        setState(prev => ({
          ...prev,
          currentPage: direction === 'left' ? prev.currentPage - 2 : prev.currentPage + 2,
          flipDirection: null,
          flipProgress: 0,
          opacity: 1,
          isAnimating: false
        }));
      }
    };

    requestAnimationFrame(() => animate(Date.now()));
  }, [state.isAnimating, state.currentPage, totalPages]);

  return {
    ...state,
    handleFlip
  };
}