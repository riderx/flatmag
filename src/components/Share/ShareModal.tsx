import React from 'react';
import { Check, Users } from 'lucide-react';
import { Modal } from '../Modal';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  allowEdit: boolean;
  onAllowEditChange: (allow: boolean) => void;
  copied: boolean;
  connectedUsers: number;
}

export function ShareModal({
  isOpen,
  onClose,
  onShare,
  allowEdit,
  onAllowEditChange,
  copied,
  connectedUsers
}: ShareModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Share Layout</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose how you want to share your magazine layout
          </p>
        </div>

        {connectedUsers > 1 && (
          <div className="p-4 rounded-md bg-blue-50">
            <div className="flex items-center text-sm text-blue-700">
              <Users className="w-4 h-4 mr-2" />
              {connectedUsers} users currently connected
            </div>
          </div>
        )}

        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={allowEdit}
              onChange={(e) => onAllowEditChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Allow editing</span>
          </label>

          {allowEdit && (
            <div className="p-4 rounded-md bg-blue-50">
              <div className="flex items-center text-sm text-blue-700">
                <Users className="flex-shrink-0 w-4 h-4 mr-2" />
                Recipients will be able to edit and collaborate on the layout
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onShare}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              'Copy Share Link'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
