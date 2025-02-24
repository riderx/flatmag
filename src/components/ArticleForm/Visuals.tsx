import React from 'react';
import { PlusCircle } from 'lucide-react';
import type { Visual } from '../../types';
import { VisualItem } from './VisualItem';

interface VisualsProps {
  visuals: Visual[];
  pageCount: number;
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Visual, value: any) => void;
  onRemove: (index: number) => void;
}

export function Visuals({
  visuals,
  pageCount,
  onAdd,
  onUpdate,
  onRemove
}: VisualsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Visuals (Images & Illustrations)
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Visual
        </button>
      </div>

      {visuals.map((visual, index) => (
        <VisualItem
          key={visual.id}
          visual={visual}
          pageCount={pageCount}
          onUpdate={(field, value) => onUpdate(index, field, value)}
          onRemove={() => onRemove(index)}
        />
      ))}
    </div>
  );
}