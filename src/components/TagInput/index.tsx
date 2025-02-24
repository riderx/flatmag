import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, X, Trash2 } from 'lucide-react';
import { addTag, deleteTag } from '../../store/tagSlice';
import type { RootState } from '../../store/store';
import type { Tag } from '../../types';

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export function TagInput({ selectedTags, onTagsChange }: TagInputProps) {
  const dispatch = useDispatch();
  const tags = useSelector((state: RootState) => state.tags.tags);
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [newTagColor, setNewTagColor] = useState('#3B82F6');

  const handleDeleteTag = (tag: Tag) => {
    if (selectedTags.some(t => t.id === tag.id)) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    }
    dispatch(deleteTag(tag.id));
    setTagToDelete(null);
  };

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag: Tag = {
        id: Math.random().toString(36).substr(2, 9),
        name: newTagName.trim(),
        color: newTagColor
      };
      dispatch(addTag(newTag));
      setNewTagName('');
      setNewTagColor('#3B82F6');
      setIsAdding(false);
      onTagsChange([...selectedTags, newTag]);
    }
  };

  const toggleTag = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Content Tags
      </label>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <div
              key={tag.id}
              className={`group inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedTags.some(t => t.id === tag.id)
                  ? 'ring-2 ring-offset-2 ring-gray-500 shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: tag.color,
                color: isLightColor(tag.color) ? 'black' : 'white'
              }}
              onClick={() => toggleTag(tag)}
            >
              <span>{tag.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTagToDelete(tag);
                }}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                title="Delete tag"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {tags.length === 0 && (
            <div className="text-sm text-gray-500 italic">
              No tags created yet
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAdding(true);
            }}
            className="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Tag
          </button>
        </div>

        {isAdding && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Create New Tag</h4>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Tag Name</label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="h-9 w-9 rounded border-2 border-white shadow cursor-pointer"
                  />
                  <div
                    className="h-9 px-3 rounded flex items-center text-sm"
                    style={{
                      backgroundColor: newTagColor,
                      color: isLightColor(newTagColor) ? 'black' : 'white'
                    }}
                  >
                    Preview
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddTag();
                  }}
                  disabled={!newTagName.trim()}
                  className="px-3 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsAdding(false);
                  }}
                  className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {tagToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Tag</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete the tag "{tagToDelete.name}"? This will remove it from all articles that use it.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setTagToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTag(tagToDelete)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
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