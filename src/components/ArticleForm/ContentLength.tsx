import React from 'react';
import type { LineHeight } from '../../types';
import { LINE_HEIGHTS } from './constants';
import { inputStyles, selectStyles } from './styles';
import { calculateWordsPerPage } from '../../utils/calculations';

interface ContentLengthProps {
  useWordCount: boolean;
  wordCount: string;
  pageCount: string;
  lineHeight: LineHeight;
  columns: 1 | 2 | 3;
  onUseWordCountChange: (useWordCount: boolean) => void;
  onWordCountChange: (wordCount: string) => void;
  onPageCountChange: (pageCount: string) => void;
  onLineHeightChange: (lineHeight: LineHeight) => void;
  onColumnsChange: (columns: 1 | 2 | 3) => void;
}

export function ContentLength({
  useWordCount,
  wordCount,
  pageCount,
  lineHeight,
  columns,
  onUseWordCountChange,
  onWordCountChange,
  onPageCountChange,
  onLineHeightChange,
  onColumnsChange
}: ContentLengthProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Content Length:</label>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="useWords"
            checked={useWordCount}
            onChange={() => onUseWordCountChange(true)}
            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
          />
          <label htmlFor="useWords" className="text-sm text-gray-700">Word Count</label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="usePages"
            checked={!useWordCount}
            onChange={() => onUseWordCountChange(false)}
            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
          />
          <label htmlFor="usePages" className="text-sm text-gray-700">Page Count</label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {useWordCount ? (
          <div>
            <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700">
              Word Count
            </label>
            <input
              type="number"
              id="wordCount"
              value={wordCount}
              onChange={(e) => onWordCountChange(e.target.value)}
              className={inputStyles}
              min="0"
            />
            <p className="mt-1 text-sm text-gray-500">
              Will take approximately {pageCount} page{parseInt(pageCount) !== 1 ? 's' : ''} 
              ({calculateWordsPerPage(lineHeight, columns, 100)} words per page)
            </p>
          </div>
        ) : (
          <div>
            <label htmlFor="pageCount" className="block text-sm font-medium text-gray-700">
              Number of Pages
            </label>
            <input
              type="number"
              id="pageCount"
              value={pageCount}
              onChange={(e) => onPageCountChange(e.target.value)}
              className={inputStyles}
              min="1"
            />
            <p className="mt-1 text-sm text-gray-500">
              Can fit approximately {calculateWordsPerPage(lineHeight, columns, 100)} words per page
            </p>
          </div>
        )}

        <div>
          <label htmlFor="lineHeight" className="block text-sm font-medium text-gray-700">
            Line Height
          </label>
          <select
            id="lineHeight"
            value={lineHeight}
            onChange={(e) => onLineHeightChange(e.target.value as LineHeight)}
            className={selectStyles}
          >
            {LINE_HEIGHTS.map(height => (
              <option key={height} value={height}>
                {height} of page
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="columns" className="block text-sm font-medium text-gray-700">
            Number of Columns
          </label>
          <select
            id="columns"
            value={columns}
            onChange={(e) => onColumnsChange(parseInt(e.target.value) as 1 | 2 | 3)}
            className={selectStyles}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>
      </div>
    </div>
  );
}