import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { PlusCircle, Wand2, Trash2 } from 'lucide-react';
import { Dropdown } from '../Dropdown';
import type { Article, Visual, LineHeight, Tag } from '../../types';
import { generateRandomArticle } from '../../utils/articleGenerator'; 
import { calculateWordsPerPage, calculateRequiredPages, ratioToPercent } from '../../utils/calculations';
import { BasicInfo } from './BasicInfo';
import { ContentLength } from './ContentLength';
import { Visuals } from './Visuals';
import type { RootState } from '../../store/store';

interface ArticleFormProps {
  onAdd: (article: Omit<Article, 'id' | 'startPage'>) => void;
  onDelete?: (id: string) => void;
  article?: Article | null;
}

export function ArticleForm({ onAdd, onDelete, article }: ArticleFormProps) {
  const availableTags = useSelector((state: RootState) => state.tags.tags);
  const [title, setTitle] = useState(article?.title || '');
  const [url, setUrl] = useState(article?.url || '');
  const [tags, setTags] = useState<Tag[]>(article?.tags || []);
  const [wordCount, setWordCount] = useState(article?.wordCount.toString() || '');
  const [pageCount, setPageCount] = useState(article?.pageCount.toString() || '1');
  const [columns, setColumns] = useState<1 | 2 | 3>(article?.columns || 1);
  const [visuals, setVisuals] = useState<Visual[]>(article?.visuals || []);
  const [useWordCount, setUseWordCount] = useState(true);
  const [lineHeight, setLineHeight] = useState<LineHeight>(article?.lineHeight || '1/50');

  useEffect(() => {
    if (useWordCount) {
      const words = parseInt(wordCount) || 0;
      const wordsPerPage = calculateWordsPerPage(lineHeight, columns, 100);
      const pagesForWords = Math.max(1, Math.ceil(words / wordsPerPage));
      const pagesForVisuals = calculateRequiredPages(visuals);
      const calculatedPages = Math.max(pagesForWords, pagesForVisuals);
      setPageCount(calculatedPages.toString());
    }
  }, [wordCount, useWordCount, lineHeight, columns, visuals]);

  useEffect(() => {
    // Update page count when visuals change
    if (!useWordCount) {
      const pagesForVisuals = calculateRequiredPages(visuals);
      const currentPages = parseInt(pageCount) || 1;
      if (pagesForVisuals > currentPages) {
        setPageCount(pagesForVisuals.toString());
      }
    }
  }, [visuals, useWordCount, pageCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalPages = parseInt(pageCount) || 1;
    const wordsPerPage = calculateWordsPerPage(lineHeight, columns, 100);
    
    // Ensure visuals have valid page numbers
    const updatedVisuals = visuals.map(visual => ({
      ...visual,
      page: Math.min(Math.max(1, visual.page || 1), totalPages),
      spaceOccupied: (ratioToPercent(visual.width) * ratioToPercent(visual.height)) / 100
    }));

    onAdd({
      title,
      tags,
      url,
      wordCount: useWordCount ? (parseInt(wordCount) || 0) : 0,
      pageCount: totalPages,
      visuals: updatedVisuals,
      columns,
      wordsPerPage,
      lineHeight,
      isLocked: false,
      pages: []
    });
  };

  const handleRandomArticleByType = (type: 'regular' | 'cover' | 'full-page') => {
    const random = generateRandomArticle(availableTags, type);
    setTitle(random.title);
    setTags(random.tags);
    setWordCount(random.wordCount.toString());
    setColumns(random.columns);
    setLineHeight(random.lineHeight);
    setVisuals(random.visuals.map(v => ({ ...v, id: Math.random().toString(36).substr(2, 9) })));
    setUseWordCount(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfo
        title={title}
        tags={tags}
        url={url}
        onTitleChange={setTitle}
        onUrlChange={setUrl}
        onTagsChange={setTags}
        isEditing={!!article}
      />

      <ContentLength
        useWordCount={useWordCount}
        wordCount={wordCount}
        pageCount={pageCount}
        lineHeight={lineHeight}
        columns={columns}
        onUseWordCountChange={setUseWordCount}
        onWordCountChange={setWordCount}
        onPageCountChange={setPageCount}
        onLineHeightChange={setLineHeight}
        onColumnsChange={setColumns}
      />

      <Visuals
        visuals={visuals}
        pageCount={parseInt(pageCount)}
        onAdd={() => {
          setVisuals([
            ...visuals,
            {
              id: Math.random().toString(36).substr(2, 9),
              title: '',
              type: 'image',
              width: '1/2',
              height: '1/3',
              x: 0,
              y: 0,
              page: 1,
              spaceOccupied: 0
            }
          ]);
        }}
        onUpdate={(index, field, value) => {
          const newVisuals = [...visuals];
          newVisuals[index] = { ...newVisuals[index], [field]: value };
          setVisuals(newVisuals);
        }}
        onRemove={(index) => {
          setVisuals(visuals.filter((_, i) => i !== index));
        }}
      />
      
      <div className="flex justify-end space-x-3">
        {article && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(article.id)}
            className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Article
          </button>
        )}
        <Dropdown
          options={[
            {
              label: 'Regular Article',
              onClick: () => handleRandomArticleByType('regular')
            },
            {
              label: 'Cover Page',
              onClick: () => handleRandomArticleByType('cover')
            },
            {
              label: 'Full Page Image',
              onClick: () => handleRandomArticleByType('full-page')
            }
          ]}
          buttonContent={
            <div className="flex">
              <button
                type="button"
                onClick={() => handleRandomArticleByType('regular')}
                className="inline-flex items-center px-4 py-2 border border-r-0 border-gray-300 shadow-sm text-sm font-medium rounded-l-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Random Article
              </button>
              <button
                type="button"
                className="inline-flex items-center px-2 py-2 border border-l-0 border-gray-300 shadow-sm text-sm font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 transform rotate-180" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          }
        />
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          {article ? 'Update Content' : 'Add Content'}
        </button>
      </div>
    </form>
  );
}