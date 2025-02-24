import React from 'react';
import type { Tag } from '../../types';
import { TagInput } from '../TagInput';
import { inputStyles } from './styles';

interface BasicInfoProps {
  title: string;
  url: string;
  tags: Tag[];
  onTitleChange: (title: string) => void;
  onUrlChange: (url: string) => void;
  onTagsChange: (tags: Tag[]) => void;
  isEditing: boolean;
}

export function BasicInfo({
  title,
  url,
  tags,
  onTitleChange,
  onUrlChange,
  onTagsChange,
  isEditing
}: BasicInfoProps) {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Content' : 'Add New Content'}
      </h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">
            Content Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={`${inputStyles} text-xl`}
            required
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Content URL (optional)
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            className={inputStyles}
            placeholder="https://example.com"
          />
        </div>

        <div className="mt-4">
          <TagInput
            selectedTags={tags}
            onTagsChange={onTagsChange}
          />
        </div>
      </div>
    </>
  );
}