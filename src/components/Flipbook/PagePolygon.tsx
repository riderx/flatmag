import React from 'react';
import { PageContent } from '../PageContent';
import type { Article } from '../../types';

interface PagePolygonProps {
  pageIndex: number;
  totalPages: number;
  articles: Article[];
  transform: string;
  lighting: string;
  bgPos: string;
  width: number;
  height: number;
  opacity: number;
  zIndex: number;
  onEditArticle: (article: Article) => void;
  onUpdateArticle: (article: Article) => void;
}

export function PagePolygon({
  pageIndex,
  totalPages,
  articles,
  transform,
  lighting,
  bgPos,
  width,
  height,
  opacity,
  zIndex,
  onEditArticle,
  onUpdateArticle
}: PagePolygonProps) {
  const getArticlesForPage = (pageIndex: number) => {
    return articles.filter(article => {
      const startPage = article.startPage;
      const endPage = startPage + article.pageCount - 1;
      return pageIndex + 1 >= startPage && pageIndex + 1 <= endPage;
    });
  };

  return (
    <div
      className="polygon"
      style={{
        backgroundSize: `${width}px ${height}px`,
        backgroundPosition: bgPos,
        width: `${width / N_POLYGONS}px`,
        height: `${height}px`,
        transform,
        zIndex,
        opacity,
        transformStyle: 'preserve-3d',
        backgroundColor: 'white',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        MozBackfaceVisibility: 'hidden'
      }}
    >
      <div 
        className="polygon-content"
        style={{
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          MozTransformStyle: 'preserve-3d'
        }}
      >
        {pageIndex >= 0 && pageIndex < totalPages && (
          <PageContent
            article={getArticlesForPage(pageIndex)[0]}
            pageIndex={pageIndex}
            isFlipbook={true}
            margins={{ top: 5, right: 5, bottom: 5, left: 5 }}
            onEditArticle={onEditArticle}
            onUpdateArticle={onUpdateArticle}
          />
        )}
      </div>
      {lighting && (
        <div
          className="lighting"
          style={{ 
            backgroundImage: lighting,
            transformStyle: 'preserve-3d'
          }}
        />
      )}
    </div>
  );
}