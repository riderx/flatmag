import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ZoomIn, Maximize2, Grid2X2, Grid, Plus, Minus } from 'lucide-react';
import { PageContent } from './PageContent';
import { PageHeader } from './PageHeader';
import { useDispatch } from 'react-redux';
import { updatePageMargins, setZoomLevel } from '../store/magazineSlice';
import type { Article, ZoomLevel, PageRatio } from '../types';
import { RootState } from '../store/store';

const DEFAULT_MARGINS = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5
};

interface MagazineViewProps {
  articles: Article[];
  pages: number;
  zoomLevel: ZoomLevel;
  onAddPage: () => void;
  onRemovePage: () => void;
  onEditArticle: (article: Article) => void;
  onUpdateArticle: (article: Article) => void;
  isEditingAllowed: boolean;
}

const calculatePageDimensions = (containerWidth: number, ratio: PageRatio, pagesPerRow: number) => {
  const [num, den] = ratio.split('/').map(Number);
  const gapSize = 32;
  const totalGaps = pagesPerRow - 1;
  const availableWidth = containerWidth - (totalGaps * gapSize);
  const pageWidth = Math.floor(availableWidth / pagesPerRow);
  const pageHeight = Math.floor(pageWidth * (den / num));
  return { width: pageWidth, height: pageHeight };
};

export function MagazineView({
  articles,
  pages,
  zoomLevel,
  onAddPage,
  onRemovePage,
  onEditArticle,
  onUpdateArticle,
  isEditingAllowed
}: MagazineViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const settings = useSelector((state: RootState) => state.settings);
  const pageMargins = useSelector((state: RootState) => state.magazine.pageMargins);
  const dispatch = useDispatch();

  const getPageMargins = (pageNumber: number) => {
    return pageMargins[pageNumber] || DEFAULT_MARGINS;
  };

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    dispatch(setZoomLevel(zoomLevel));
  }, [zoomLevel, dispatch]);

  const getPagesPerRow = (zoom: ZoomLevel) => {
    if (containerWidth < 768) {
      return 1;
    }
    switch (zoom) {
      case 'all': return containerWidth < 1024 ? 2 : containerWidth < 1280 ? 3 : containerWidth < 1536 ? 4 : 6;
      case '4': return containerWidth < 1024 ? 2 : 4;
      case '2': return containerWidth < 1024 ? 1 : 2;
      case '1': return 1;
      default: return 2;
    }
  };

  const pagesPerRow = getPagesPerRow(zoomLevel);
  const { width, height } = calculatePageDimensions(
    containerWidth,
    settings.pageRatio,
    pagesPerRow
  );

  const getPageScale = (zoom: ZoomLevel) => {
    const baseScale = {
      'all': containerWidth < 768 ? 0.95 : containerWidth < 1280 ? 0.92 : 0.88,
      '4': containerWidth < 768 ? 0.95 : containerWidth < 1024 ? 0.92 : 0.85,
      '2': 1,
      '1': containerWidth < 768 ? 0.95 : 1.1
    }[zoom];

    return `scale(${baseScale})`;
  };

  const getArticlesForPage = (pageIndex: number) => {
    return articles.filter(article => {
      const startPage = article.startPage;
      const endPage = startPage + (article.pageCount || 1) - 1;
      return pageIndex + 1 >= startPage && pageIndex + 1 <= endPage;
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{settings.title}</h2>
            <div className="text-sm text-gray-500">
              Issue {settings.issueNumber} • {new Date(settings.publicationDate).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRemovePage}
              disabled={!isEditingAllowed || pages <= 1}
              className={`p-1 ${isEditingAllowed ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-gray-700">{pages} pages</span>
            <button
              onClick={onAddPage}
              disabled={!isEditingAllowed} 
              className={`p-1 ${isEditingAllowed ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => dispatch(setZoomLevel('all'))}
            className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
              zoomLevel === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">All</span>
          </button>
          <button
            onClick={() => dispatch(setZoomLevel('4'))}
            className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
              zoomLevel === '4'
                ? 'border-blue-600 text-blue-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Grid2X2 className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">4 Pages</span>
          </button>
          <button
            onClick={() => dispatch(setZoomLevel('2'))}
            className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
              zoomLevel === '2'
                ? 'border-blue-600 text-blue-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">2 Pages</span>
          </button>
          <button
            onClick={() => dispatch(setZoomLevel('1'))}
            className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
              zoomLevel === '1'
                ? 'border-blue-600 text-blue-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ZoomIn className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">1 Page</span>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`grid ${zoomLevel === 'all' ? 'gap-2' : 'gap-8'} w-full`}
        style={{
          gridTemplateColumns: `repeat(${pagesPerRow}, minmax(0, 1fr))`,
          transform: getPageScale(zoomLevel),
          transformOrigin: 'top left',
          maxWidth: zoomLevel === 'all' ? '100vw' : undefined,
          margin: zoomLevel === 'all' ? '-1rem' : undefined
        }}
      >
        {Array.from({ length: pages }).map((_, pageIndex) => {
          const pageArticles = getArticlesForPage(pageIndex);
          const article = pageArticles[0]; // Since we only show one article per page
          
          return (
            <div key={pageIndex} className="space-y-4">
              <PageHeader
                zoomLevel={zoomLevel}
                pageNumber={pageIndex + 1}
                article={article}
                margins={getPageMargins(pageIndex + 1)}
                onMarginsChange={(newMargins) => 
                  dispatch(updatePageMargins({ page: pageIndex + 1, margins: newMargins }))
                }
                onEditArticle={onEditArticle}
                onUpdateArticle={onUpdateArticle}
              />
              <div 
                className="bg-white rounded-lg shadow-lg mx-auto"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  maxWidth: '100%'
                }}
              >
                {article ? (
                  <PageContent
                    key={article.id}
                    article={article}
                    pageIndex={pageIndex || 0}
                    margins={getPageMargins(pageIndex + 1)}
                    isEditingAllowed={isEditingAllowed}
                    onEditArticle={onEditArticle}
                    onUpdateArticle={onUpdateArticle}
                  />
                ) : (
                  <div className="h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Empty Page</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}