import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { History, Undo2, Redo2, Trash2 } from 'lucide-react';
import type { RootState } from '../store/store';
import { undo, redo, jumpToHistory, resetState, setConnectionStatus } from '../store/magazineSlice';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const dispatch = useDispatch();
  const { past = [], future = [] } = useSelector((state: RootState) => state.magazine.history || { past: [], future: [] });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmStep, setResetConfirmStep] = useState(0);

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleRedo = () => {
    dispatch(redo());
  };

  const handleJumpToHistory = (index: number) => {
    dispatch(jumpToHistory(index));
  };

  const handleReset = () => {
    if (resetConfirmStep === 0) {
      setShowResetConfirm(true);
      setResetConfirmStep(1);
    } else if (resetConfirmStep === 1) {
      setResetConfirmStep(2);
    } else {
      dispatch(setConnectionStatus(false));
      dispatch(resetState());
      localStorage.clear();
      setShowResetConfirm(false);
      setResetConfirmStep(0);
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <History className="w-5 h-5 mr-2" />
          History
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleUndo}
            disabled={past.length === 0}
            className={`p-2 rounded ${
              past.length === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={future.length === 0}
            className={`p-2 rounded ${
              future.length === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 rounded text-red-600 hover:bg-red-50"
            title="Reset All"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {past.map((entry, index) => (
          <button
            key={index}
            onClick={() => handleJumpToHistory(index)}
            className="w-full text-left p-2 hover:bg-gray-100 rounded"
          >
            <div className="text-sm font-medium">{entry.description}</div>
            <div className="text-xs text-gray-500">
              {new Date().toLocaleTimeString()}
            </div>
          </button>
        ))}
        {past.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No history yet
          </div>
        )}
      </div>
      
      {showResetConfirm && (
        <div className="absolute inset-0 bg-white p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-red-600">Reset Everything</h3>
            <button
              onClick={() => {
                setShowResetConfirm(false);
                setResetConfirmStep(0);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            {resetConfirmStep === 0 && (
              <>
                <p>Are you sure you want to reset everything? This will:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Delete all articles</li>
                  <li>Clear all history</li>
                  <li>Reset all settings</li>
                  <li>Clear local storage</li>
                </ul>
                <p className="mt-2 font-medium">This action cannot be undone!</p>
              </>
            )}
            {resetConfirmStep === 1 && (
              <p className="font-medium">Click again to confirm reset.</p>
            )}
            {resetConfirmStep === 2 && (
              <p className="font-medium text-red-600">
                Final warning: Click one more time to permanently delete everything.
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowResetConfirm(false);
                setResetConfirmStep(0);
              }}
              className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className={`px-3 py-2 text-sm font-medium rounded-md text-white ${
                resetConfirmStep === 2
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {resetConfirmStep === 0 ? 'Reset Everything' : 'Confirm Reset'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}