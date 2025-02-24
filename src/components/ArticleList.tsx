import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit, FileText, Plus } from 'lucide-react';
import type { Article } from '../types';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ArticleListProps {
  articles: Article[];
  pages: number;
  onDelete: (id: string) => void;
  onEdit: (article: Article) => void;
  isEditingAllowed: boolean;
}

export function ArticleList({
  articles,
  pages,
  onDelete,
  onEdit,
  isEditingAllowed
}: ArticleListProps) {
  const usedPages = new Set(articles.flatMap(article => 
    Array.from({ length: article.pageCount }, (_, i) => article.startPage + i)
  ));
  const settings = useSelector((state: RootState) => state.settings);

  if (articles.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{settings.title}</h2>
          <div className="text-sm text-gray-500">
            Issue {settings.issueNumber} • {new Date(settings.publicationDate).toLocaleDateString()}
          </div>
          <div className="mt-2 text-sm text-gray-600">{pages} pages total</div>
        </div>
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No articles yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first article.</p>
          <button
            onClick={() => document.querySelector<HTMLButtonElement>('.add-article-button')?.click()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Article
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{settings.title}</h2>
        <div className="text-sm text-gray-500">
          Issue {settings.issueNumber} • {new Date(settings.publicationDate).toLocaleDateString()}
        </div>
        <div className="mt-2 text-sm text-gray-600">{pages} pages total</div>
      </div>
      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleItem
            key={article.id}
            article={article}
            pages={pages}
            onDelete={onDelete}
            onEdit={onEdit}
            isEditingAllowed={isEditingAllowed}
          />
        ))}
      </div>
    </div>
  );
}

interface ArticleItemProps {
  article: Article;
  pages: number;
  onDelete: (id: string) => void;
  onEdit: (article: Article) => void;
  isEditingAllowed: boolean;
}

function ArticleItem({ article, pages, onDelete, onEdit, isEditingAllowed }: ArticleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: article.id });

  const style = {
    transform: CSS.Transform.toString(transform)
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(article.id);
  };

  const pageSlots = Array.from(
    { length: article.pageCount },
    (_, i) => article.startPage + i
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 rounded-lg shadow-sm border border-gray-200 bg-white space-y-2"
    >
      <div className="flex items-center space-x-4">
        <button
          className="cursor-grab hover:text-blue-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center space-x-2 min-w-0">
          <h3 className="font-medium">
            {article.url ? (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {article.title}
              </a>
            ) : (
              <span className="text-gray-900">{article.title}</span>
            )}
          </h3>
          <div className="flex gap-1">
            {(article.tags || []).map(tag => (
              <span
                key={tag.id}
                className="px-2 py-1 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: tag.color,
                  color: isLightColor(tag.color) ? 'black' : 'white'
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(article)}
            disabled={!isEditingAllowed}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={!isEditingAllowed}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
        <span>Pages {article.startPage}–{article.startPage + article.pageCount - 1}</span>
        <span>{article.columns} column{article.columns > 1 ? 's' : ''}</span>
        {article.wordCount > 0 && <span>{article.wordCount} words</span>}
        {article.visuals.length > 0 && (
          <span>
            {article.visuals.length} visual{article.visuals.length > 1 ? 's' : ''}
            {article.visuals.some(v => v.title) && ': '}
            {article.visuals.filter(v => v.title).map(v => v.title).join(', ')}
          </span>
        )}
      </div>

      <div className="flex gap-1">
        {pageSlots.map((pageNum) => (
          <div
            key={pageNum}
            className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200"
          >
            {pageNum}
          </div>
        ))}
      </div>
    </div>
  );
}

function isLightColor(color: string) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 128;
}