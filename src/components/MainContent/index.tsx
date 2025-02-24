import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ArticleList } from '../ArticleList';
import { MagazineView } from '../MagazineView';
import { FlipbookView } from '../Flipbook';
import type { Article, ZoomLevel } from '../../types';

interface MainContentProps {
  showList: boolean;
  showFlipbook: boolean;
  articles: Article[];
  pages: number;
  zoomLevel: ZoomLevel;
  onAddPage: () => void;
  onRemovePage: () => void;
  onEditArticle: (article: Article) => void;
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  isEditingAllowed: boolean;
  onDragEnd: (event: any) => void;
  onFlipbookClose: () => void;
}

export function MainContent({
  showList,
  showFlipbook,
  articles,
  pages,
  zoomLevel,
  onAddPage,
  onRemovePage,
  onEditArticle,
  onUpdateArticle,
  onDeleteArticle,
  isEditingAllowed,
  onDragEnd,
  onFlipbookClose
}: MainContentProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="relative">
      {showList ? (
        isEditingAllowed ? <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={articles}
            strategy={verticalListSortingStrategy}
          >
            <ArticleList
              articles={articles}
              pages={pages}
              onDelete={onDeleteArticle}
              onEdit={onEditArticle}
              isEditingAllowed={isEditingAllowed}
            />
          </SortableContext>
        </DndContext> : (
          <ArticleList
            articles={articles}
            pages={pages}
            onDelete={onDeleteArticle}
            onEdit={onEditArticle}
            isEditingAllowed={isEditingAllowed}
          />
        )
      ) : (
        <MagazineView
          articles={articles}
          pages={pages}
          zoomLevel={zoomLevel}
          onAddPage={onAddPage}
          onRemovePage={onRemovePage}
          onEditArticle={onEditArticle}
          onUpdateArticle={onUpdateArticle}
          isEditingAllowed={isEditingAllowed}
        />
      )}
      {showFlipbook && (
        <FlipbookView
          articles={articles}
          pages={pages}
          onClose={onFlipbookClose}
          onEditArticle={onEditArticle}
          onUpdateArticle={onUpdateArticle}
        />
      )}
    </div>
  );
}
