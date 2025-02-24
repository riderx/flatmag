import React from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { ratioToPercent } from '../utils/calculations';
import { TextLines } from './TextLines';
import { DraggableVisual } from './DraggableVisual';
import { calculatePageAvailableSpace } from '../utils/calculations';
import { validateVisualPosition } from '../utils/imageHandler';
import type { Article } from '../types';

interface PageContentProps {
  article: Article;
  pageIndex: number;
  isFlipbook?: boolean;
  margins: { top: number; right: number; bottom: number; left: number };
  isEditingAllowed: boolean;
  onEditArticle: (article: Article) => void;
  onUpdateArticle: (article: Article) => void;
}

const isFullPage = (article: Article): boolean => {
  return article.visuals.some(v => 
    v.width === 'full' && v.height === 'full' && v.page === article.startPage
  );
};

export function PageContent({
  article,
  pageIndex,
  isFlipbook = false,
  margins,
  isEditingAllowed,
  onEditArticle,
  onUpdateArticle
}: PageContentProps) {
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!active || article.isLocked || !isEditingAllowed) return;

    const container = document.getElementById(`article-${article.id}-page-${pageIndex}`);
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const currentPage = pageIndex + 1;
    const visual = article.visuals.find(v => v.id === active.id);
    
    if (!visual) return;

    const deltaX = (delta.x / rect.width) * 100;
    const deltaY = (delta.y / rect.height) * 100;
    const newPosition = validateVisualPosition(
      {
        ...visual,
        x: visual.x + deltaX,
        y: visual.y + deltaY
      },
      rect.width,
      rect.height
    );

    if (currentPage >= article.startPage && currentPage <= article.startPage + article.pageCount - 1) {
      const updatedVisuals = article.visuals.map(v =>
        v.id === active.id ? { 
          ...v, 
          ...newPosition,
          page: currentPage
        } : v
      );

      const updatedPages = article.pages.map(page => {
        const pageVisuals = updatedVisuals.filter(v => v.page === page.pageNumber);
        return {
          ...page,
          visuals: pageVisuals,
          availableSpace: calculatePageAvailableSpace(pageVisuals)
        };
      });

      onUpdateArticle({ 
        ...article, 
        visuals: updatedVisuals,
        pages: updatedPages
      });
    }
  };

  const currentPage = pageIndex + 1;
  const page = article.pages.find(p => p.pageNumber === currentPage);

  if (!page) {
    console.warn(`No page data found for article ${article.id} page ${currentPage}`);
    return null;
  }

  const isCurrentPageFull = article.visuals.some(v => 
    v.width === 'full' && v.height === 'full' && v.page === currentPage
  );

  return (
    <DndContext
      sensors={sensors}
      modifiers={isFlipbook ? [] : [restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <div
        id={`article-${article.id}-page-${pageIndex}`}
        className="relative h-full rounded overflow-hidden"
        style={{
          padding: `${margins.top}% ${margins.right}% ${margins.bottom}% ${margins.left}%`
        }}
      >
        <div className="h-full relative">
          {!isCurrentPageFull && (
            <TextLines
              wordCount={page.wordCount}
              availableSpace={page.availableSpace}
              columns={article.columns}
              lineHeight={article.lineHeight}
              margins={margins}
              visuals={page.visuals}
            />
          )}
          {article.visuals.filter(v => v.page === currentPage).map((visual) => (
            <DraggableVisual
              key={visual.id}
              visual={visual}
              isLocked={article.isLocked || isFlipbook}
              currentPage={currentPage}
              article={article}
              onUpdateArticle={onUpdateArticle}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}