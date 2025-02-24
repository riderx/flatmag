import React, { useRef, useEffect, useState } from 'react';
import { PagePolygon } from './PagePolygon';
import { PageContent } from '../PageContent';
import { usePageFlip } from './usePageFlip';
import type { Article } from '../../types';

interface Page3DProps {
  articles: Article[];
  pages: number;
  onEditArticle: (article: Article) => void;
  onUpdateArticle: (article: Article) => void;
}

export function Page3D({
  articles,
  pages,
  onEditArticle,
  onUpdateArticle
}: Page3DProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewWidth, setViewWidth] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);
  const {
    currentPage,
    flipDirection,
    isAnimating,
    opacity,
    handleFlip,
    makePolygons
  } = usePageFlip(pages);

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

  const polygons = [
    ...makePolygons('front', viewWidth, viewHeight),
    ...makePolygons('back', viewWidth, viewHeight)
  ];

  return (
    <div
      ref={viewportRef}
      className="viewport select-none relative"
      style={{
        width: '50vw',
        height: '50vh',
        perspective: '2400px'
      }}
    >
      <div 
        className="flipbook-container"
        style={{
          transform: 'scale(0.9)',
          transformOrigin: 'center center',
          width: '100%',
          height: '100%'
        }}
      >
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
            <div className="w-1/2 h-full bg-white">
              <PageContent
                article={getArticlesForPage(currentPage)[0]}
                pageIndex={currentPage}
                isFlipbook={true}
                margins={{ top: 5, right: 5, bottom: 5, left: 5 }}
                onEditArticle={onEditArticle}
                onUpdateArticle={onUpdateArticle}
              />
            </div>
            <div className="w-1/2 h-full bg-white">
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
  );
}