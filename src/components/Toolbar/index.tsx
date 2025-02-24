import React from 'react';
import { History, Book, LayoutGrid, LayoutList, Settings } from 'lucide-react';
import { Share } from '../Share';

interface ToolbarProps {
  showList: boolean;
  onHistoryClick: () => void;
  onFlipbookClick: () => void;
  onViewToggle: () => void;
  onSettingsClick: () => void;
}

export function Toolbar({
  showList,
  onHistoryClick,
  onFlipbookClick,
  onViewToggle,
  onSettingsClick
}: ToolbarProps) {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onHistoryClick}
        className="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <History className="w-4 h-4 mr-2" />
        History
      </button>
      
      <button
        onClick={onFlipbookClick}
        className="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <Book className="w-4 h-4 mr-2" />
        Flipbook
      </button>
      
      <button
        onClick={onSettingsClick}
        className="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </button>

      <Share />

      <div className="w-px h-6 bg-gray-300 mx-2" />

      <button
        onClick={onViewToggle}
        className="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        {showList ? (
          <>
            <LayoutGrid className="w-4 h-4 mr-2" />
            Show Grid
          </>
        ) : (
          <>
            <LayoutList className="w-4 h-4 mr-2" />
            Show List
          </>
        )}
      </button>
    </div>
  );
}