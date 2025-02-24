import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Settings } from 'lucide-react';
import { updateSettings, setPageRatio } from '../store/settingsSlice';
import type { RootState } from '../store/store';
import { pageRatios } from '../types';

interface MagazineSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MagazineSettings({ isOpen, onClose }: MagazineSettingsProps) {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const { isShared, allowEdit } = useSelector((state: RootState) => state.magazine);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            Magazine Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Magazine Title
            </label>
            <input
              type="text"
              value={settings.title}
              disabled={isShared && !allowEdit}
              onChange={(e) => dispatch(updateSettings({ title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Issue Number
            </label>
            <input
              type="text"
              value={settings.issueNumber}
              disabled={isShared && !allowEdit}
              onChange={(e) => dispatch(updateSettings({ issueNumber: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Publication Date
            </label>
            <input
              type="date"
              value={settings.publicationDate}
              disabled={isShared && !allowEdit}
              onChange={(e) => dispatch(updateSettings({ publicationDate: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Page Ratio
            </label>
            <select
              value={settings.pageRatio}
              disabled={isShared && !allowEdit}
              onChange={(e) => dispatch(setPageRatio(e.target.value as any))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {pageRatios.map((ratio) => (
                <option key={ratio.value} value={ratio.value}>
                  {ratio.name} ({ratio.description})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}