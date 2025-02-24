import React, { useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { X } from 'lucide-react';
import { PageContent } from '../PageContent';
import type { Article } from '../../types';

interface FlipbookViewProps {
  articles: Article[];
  pages: number;
  onClose: () => void;
  onEditArticle: (article: Article) => void;
  onUpdateArticle: (article: Article) => void;
}

export function FlipbookView({
  articles,
  pages,
  onClose,
  onEditArticle,
  onUpdateArticle
}: FlipbookViewProps) {
  const bookRef = useRef(null);

  const getArticlesForPage = (pageIndex: number) => {
    return articles.filter(article => {
      const startPage = article.startPage;
      const endPage = startPage + article.pageCount - 1;
      return pageIndex + 1 >= startPage && pageIndex + 1 <= endPage;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-white hover:text-gray-300 z-50"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="w-[90vw] h-[80vh] relative">
        <HTMLFlipBook
          ref={bookRef}
          width={800}
          height={1000}
          size="stretch"
          minWidth={300}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1500}
          showCover={true}
          maxShadowOpacity={0.5}
          className="mx-auto"
        >
          {Array.from({ length: pages }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              className="bg-white shadow-lg rounded overflow-hidden"
            >
              {getArticlesForPage(pageIndex)[0] ? (
                <PageContent
                  article={getArticlesForPage(pageIndex)[0]}
                  pageIndex={pageIndex}
                  isFlipbook={true}
                  margins={{ top: 5, right: 5, bottom: 5, left: 5 }}
                  onEditArticle={onEditArticle}
                  onUpdateArticle={onUpdateArticle}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Empty Page
                </div>
              )}
            </div>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  );
}