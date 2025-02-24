import React, { useRef, useEffect, useState } from 'react';
import { PagePolygon } from './PagePolygon';
import { PageContent } from '../PageContent';
import { useFlipbook } from './hooks/useFlipbook';
import { useDebug } from './hooks/useDebug';
import { DebugOverlay } from './DebugOverlay';
import type { Article } from '../../types';

interface PageRendererProps {
  articles: Article[];
  pages: number;
  currentPage: number;
  onFlip: (direction: 'left' | 'right') => void;
  onEditArticle: (article: Article) => void;
  onUpdateArticle: (article: Article) => void;
}

export function PageRenderer({
  articles,
  pages,
  currentPage,
  onFlip,
  onEditArticle,
  onUpdateArticle
}: PageRendererProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewWidth, setViewWidth] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const { debugInfo, updateDebugInfo } = useDebug();
  const {
    polygons,
    flipDirection,
    opacity,
    touchStartX,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useFlipbook(viewWidth, viewHeight, currentPage, pages, onFlip);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        setShowDebug(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (viewportRef.current) {
        setViewWidth(viewportRef.current.clientWidth);
        setViewHeight(viewportRef.current.clientHeight);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getArticlesForPage = (pageIndex: number) => {
    return articles.filter(article => {
      const startPage = article.startPage;
      const endPage = startPage + article.pageCount - 1;
      return pageIndex + 1 >= startPage && pageIndex + 1 <= endPage;
    });
  };

  return (
    <div
      className="relative"
      style={{ width: '90vw', height: '80vh' }}
    >
      <DebugOverlay info={debugInfo} visible={showDebug} />
      <div
      ref={viewportRef}
      className="viewport select-none relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        width: '90vw',
        height: '80vh',
        perspective: '2000px',
        transformStyle: 'preserve-3d'
      }}
    >
      <div 
        className="flipbook-container"
        style={{
          transform: `scale(0.9)`,
          transformOrigin: 'center center',
          width: '100%',
          height: '100%'
        }}
      >
        {!touchStartX && !flipDirection && (
          <>
            <div
              className="absolute left-0 top-0 w-1/3 h-full cursor-pointer"
              onClick={() => currentPage > 0 && onFlip('left')}
            />
            <div
              className="absolute right-0 top-0 w-1/3 h-full cursor-pointer"
              onClick={() => currentPage < pages - 2 && onFlip('right')}
            />
          </>
        )}

        {polygons.map(({ key, pageIndex, lighting, bgPos, transform, z }) => (
          <PagePolygon
            key={key}
            pageIndex={pageIndex}
            totalPages={pages}
            articles={articles}
            transform={transform}
            lighting={lighting}
            bgPos={bgPos}
            width={viewWidth}
            height={viewHeight}
            opacity={opacity}
            zIndex={z}
            onEditArticle={onEditArticle}
            onUpdateArticle={onUpdateArticle}
          />
        ))}

        {!flipDirection && (
          <div className="flex" style={{ width: viewWidth, height: viewHeight }}>
            <div className="w-1/2 h-full bg-white" style={{ transformStyle: 'preserve-3d' }}>
              <PageContent
                article={getArticlesForPage(currentPage)[0]}
                pageIndex={currentPage}
                isFlipbook={true}
                margins={{ top: 5, right: 5, bottom: 5, left: 5 }}
                onEditArticle={onEditArticle}
                onUpdateArticle={onUpdateArticle}
              />
            </div>
            <div className="w-1/2 h-full bg-white" style={{ transformStyle: 'preserve-3d' }}>
              <PageContent
                article={getArticlesForPage(currentPage + 1)[0]}
                pageIndex={currentPage + 1}
                isFlipbook={true}
                margins={{ top: 5, right: 5, bottom: 5, left: 5 }}
                onEditArticle={onEditArticle}
                onUpdateArticle={onUpdateArticle}
              />
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}