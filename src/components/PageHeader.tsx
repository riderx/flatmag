import React, { useState } from 'react';
import { Edit2, Lock, Unlock, Settings2 } from 'lucide-react';
import type { Article } from '../types';
import { useDispatch } from 'react-redux';
import { updateAllMargins, updateArticleMargins } from '../store/magazineSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

interface PageHeaderProps {
  pageNumber: number;
  article?: Article;
  margins: { top: number; right: number; bottom: number; left: number };
  onMarginsChange: (margins: { top: number; right: number; bottom: number; left: number }) => void;
  onEditArticle?: (article: Article) => void;
  onUpdateArticle?: (article: Article) => void;
}

export function PageHeader({
  pageNumber,
  article,
  margins,
  onMarginsChange,
  onEditArticle,
  onUpdateArticle
}: PageHeaderProps) {
  const zoomLevel = useSelector((state: RootState) => state.magazine.zoomLevel);
  const [showMarginSettings, setShowMarginSettings] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);
  const [applyToArticle, setApplyToArticle] = useState(false);
  const showList = useSelector((state: RootState) => state.magazine.showList);
  const dispatch = useDispatch();

  const handleMarginChange = (newMargins: typeof margins) => {
    onMarginsChange(newMargins);
    if (applyToAll) {
      dispatch(updateAllMargins(newMargins));
    } else if (applyToArticle && article) {
      dispatch(updateArticleMargins({ articleId: article.id, margins: newMargins }));
    }
  };

  return (
    <div className="bg-white p-2 rounded-lg shadow relative flex items-center justify-between min-h-[40px]">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
          {pageNumber}
        </div>
        {article && (
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {article.url ? (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 truncate hover:text-blue-800 hover:underline"
                title={article.title}
              >
                {article.title}
              </a>
            ) : (
              <span className="text-sm font-medium text-gray-900 truncate"
                    title={article.title}>
                {article.title}
              </span>
            )}
            <div className="flex gap-1 flex-shrink-0 ml-2 flex-nowrap">
              {(article.tags || []).map(tag => (
                <div
                  key={tag.id}
                  className="w-2 h-2 rounded-full cursor-help transition-all duration-300 ease-out group hover:scale-110 hover:w-auto hover:px-2 hover:h-5 hover:flex hover:items-center whitespace-nowrap"
                  style={{
                    backgroundColor: tag.color,
                    color: isLightColor(tag.color) ? 'black' : 'white'
                  }}
                  title={tag.name}
                >
                  <span className="hidden group-hover:inline text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{tag.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {article && onEditArticle && onUpdateArticle && zoomLevel !== 'all' && (
        <div className="flex items-center space-x-2 ml-2 flex-shrink-0"> 
          <button
            onClick={() => setShowMarginSettings(!showMarginSettings)}
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Adjust margins"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          {(!article.visuals.some(v => v.width === 'full' && v.height === 'full') || showList) && (
            <button
              onClick={() => onUpdateArticle({ ...article, isLocked: !article.isLocked })}
              className="p-1 text-gray-500 hover:text-gray-700"
              title={article.isLocked ? "Unlock layout" : "Lock layout"}
            >
              {article.isLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={() => onEditArticle(article)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Edit article"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {showMarginSettings && (
        <div className="absolute bottom-full left-0 mb-2 z-10 bg-white rounded-lg shadow-lg p-4 space-y-3 min-w-[300px]">
          <h3 className="font-medium text-gray-900">Page Margins</h3>
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="applyToAll"
                checked={applyToAll}
                onChange={(e) => {
                  setApplyToAll(e.target.checked);
                  if (e.target.checked) {
                    setApplyToArticle(false);
                  }
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="applyToAll" className="text-sm text-gray-600">
                Apply to all pages
              </label>
            </div>
            {article && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="applyToArticle"
                  checked={applyToArticle}
                  onChange={(e) => {
                    setApplyToArticle(e.target.checked);
                    if (e.target.checked) {
                      setApplyToAll(false);
                    }
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="applyToArticle" className="text-sm text-gray-600">
                  Apply to all pages of "{article.title}"
                </label>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {Object.entries(margins).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-gray-600 capitalize">
                  {key}:
                </label>
                <div className="flex items-center space-x-2 flex-1 ml-4">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={value}
                    onChange={(e) => handleMarginChange({ ...margins, [key]: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-8 text-right">{value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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