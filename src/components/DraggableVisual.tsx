import React, { useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { getImageUrl } from '../utils/imageHandler';
import type { Visual, SizeRatio, Article } from '../types';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import type { ImageLoadingState } from '../utils/imageHandler/types';

interface DraggableVisualProps {
  visual: Visual;
  isLocked: boolean;
  currentPage: number;
  article: Article;
  onUpdateArticle: (article: Article) => void;
}

const ratioToPercent = (ratio: SizeRatio): number => {
  if (ratio === 'full') return 100;
  const [num, den] = ratio.split('/').map(Number);
  return (num / den) * 100;
};

export function DraggableVisual({ 
  visual, 
  isLocked, 
  currentPage,
  article,
  onUpdateArticle
}: DraggableVisualProps) {
  const [loadingState, setLoadingState] = useState<ImageLoadingState>({
    isLoading: false,
    error: null,
    retryCount: 0
  });
  const showList = useSelector((state: RootState) => state.magazine.showList);
  
  const isFullSize = visual.width === 'full' && visual.height === 'full';
  const isDragDisabled = isLocked || (!showList && isFullSize);

  const loadImage = async () => {
    if (!visual.url || visual.url.startsWith('data:')) return;
    
    setLoadingState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    
    try {
      const url = await getImageUrl(visual.url);
      onUpdateArticle({
        ...article,
        visuals: article.visuals.map(v =>
          v.id === visual.id ? { ...v, url } : v
        )
      });
    } catch (error) {
      console.error('Error loading image:', error);
      setLoadingState(prev => ({
        ...prev,
        error: 'Failed to load image',
        retryCount: prev.retryCount + 1
      }));
    } finally {
      setLoadingState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: visual.id,
    disabled: isDragDisabled,
    data: {
      currentPage,
      type: 'visual'
    }
  });

  useEffect(() => {
    if (!visual.url?.startsWith('data:')) {
      setLoadingState({
        isLoading: false,
        error: null,
        retryCount: 0
      });
      loadImage();
    }
  }, [visual.url]);


  // Only show the visual if it's on the current page
  if (visual.page !== currentPage) {
    return null;
  }

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const width = ratioToPercent(visual.width);
  const height = ratioToPercent(visual.height);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`absolute select-none ${isDragDisabled ? '' : 'cursor-move'}`}
      style={{
        left: `${visual.x}%`,
        top: `${visual.y}%`,
        width: width === 100 ? '100%' : `${width}%`,
        height: height === 100 ? '100%' : 'auto',
        zIndex: 10,
        ...style,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
    >
      <div
        className={`${
          visual.type === 'illustration'
            ? 'bg-gray-100 border-2 border-dashed border-gray-300'
            : visual.url ? '' : 'bg-gray-200'
        } rounded flex flex-col items-center justify-center overflow-hidden h-full`}
        style={{
          height: height === 100 ? '100%' : `${Math.max(height * 2, 80)}px`,
          pointerEvents: 'none'
        }}
      >
        {loadingState.isLoading ? (
          <div className="text-gray-500 text-sm text-center p-2">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 mb-2 rounded-full bg-gray-200"></div>
              <span className="block">Loading image...</span>
            </div>
          </div>
        ) : loadingState.error ? (
          <div className="text-red-500 text-sm text-center p-2 space-y-1">
            <span className="block">Error loading image</span>
            <span className="block text-xs">{loadingState.error}</span>
            {loadingState.retryCount < 3 && (
              <span className="block text-xs text-gray-500">
                Retrying... ({loadingState.retryCount + 1}/3)
              </span>
            )}
          </div>
        ) : visual.url ? (
          <img 
            src={visual.url} 
            alt={visual.title || 'Visual content'}
            className="w-full h-full object-cover rounded pointer-events-none"
            loading="lazy"
            draggable={false}
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            onError={(e) => {
              console.error('Image load error:', e);
              const target = e.target as HTMLImageElement;
              setLoadingState(prev => ({
                ...prev,
                error: `Failed to display image: ${target.src}`
              }));
            }}
          />
        ) : (
          <>
            <span className="text-gray-500 text-sm pointer-events-none">
              {visual.type.charAt(0).toUpperCase() + visual.type.slice(1)}
            </span>
            {visual.title && (
              <span className="text-xs text-gray-400 mt-1 pointer-events-none">
                {visual.title}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}