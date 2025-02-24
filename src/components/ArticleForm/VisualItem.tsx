import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Visual, SizeRatio } from '../../types';
import { SIZE_RATIOS } from './constants';
import { ratioToPercent } from '../../utils/calculations';
import { inputStyles, selectStyles } from './styles';
import { VisualUploader } from '../VisualUploader';

interface VisualItemProps {
  visual: Visual;
  pageCount: number;
  onUpdate: (field: keyof Visual, value: any) => void;
  onRemove: () => void;
}

const calculateSpaceOccupied = (width: SizeRatio, height: SizeRatio): number => {
  const widthPercent = ratioToPercent(width);
  const heightPercent = ratioToPercent(height);
  return (widthPercent * heightPercent) / 100;
};

export function VisualItem({
  visual,
  pageCount,
  onUpdate,
  onRemove
}: VisualItemProps) {
  return (
    <div className="grid grid-cols-6 gap-4 items-end border-b pb-4">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-500">Title</label>
        <input
          type="text"
          value={visual.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder="Visual title"
          className={inputStyles}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-500">Type</label>
        <select
          value={visual.type}
          onChange={(e) => onUpdate('type', e.target.value)}
          className={selectStyles}
        >
          <option value="image">Image</option>
          <option value="illustration">Illustration</option>
        </select>
      </div>

      {pageCount > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-500">
            Page
          </label>
          <select
            value={visual.page}
            onChange={(e) => {
              onUpdate('page', parseInt(e.target.value))
            }}
            className={selectStyles}
          >
            {Array.from({ length: pageCount }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>
                Page {num}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={`${pageCount > 1 ? 'col-span-1' : 'col-span-2'}`}>
        <label className="block text-sm font-medium text-gray-500">Size</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Width</label>
            <select
              value={visual.width}
              onChange={(e) => {
                const newWidth = e.target.value as SizeRatio;
                const spaceOccupied = calculateSpaceOccupied(newWidth, visual.height);
                onUpdate('width', newWidth);
                onUpdate('spaceOccupied', spaceOccupied);
              }}
              className={selectStyles}
            >
              {SIZE_RATIOS.map(ratio => (
                <option key={ratio} value={ratio}>
                  {ratio === 'full' ? 'Full width' : `${ratio} width`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Height</label>
            <select
              value={visual.height}
              onChange={(e) => {
                const newHeight = e.target.value as SizeRatio;
                const spaceOccupied = calculateSpaceOccupied(visual.width, newHeight);
                onUpdate('height', newHeight);
                onUpdate('spaceOccupied', spaceOccupied);
              }}
              className={selectStyles}
            >
              {SIZE_RATIOS.map(ratio => (
                <option key={ratio} value={ratio}>
                  {ratio === 'full' ? 'Full height' : `${ratio} height`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <VisualUploader
          visual={visual}
          onUpload={(url) => onUpdate('url', url)}
          onError={(error) => console.error(error)}
        />
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}