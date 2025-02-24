import React, { useCallback } from 'react';
import { Check, Users } from 'lucide-react';
import { Modal } from '../Modal';
import { getSharedState, joinSession } from '../../utils/collaboration';
import { useDispatch } from 'react-redux';
import { setConnectionStatus, syncState } from '../../store/magazineSlice';
import { updateSettings } from '../../store/settingsSlice';

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
  const dispatch = useDispatch();

  const handleShareClick = useCallback(async () => {
    if (allowEdit) {
      try {
        const shareId = 'some-share-id'; // Replace with actual share ID logic
        const sharedState = await getSharedState(shareId);
        if (!sharedState) {
          throw new Error('Share not found or expired');
        }

        dispatch(setConnectionStatus(true));
        await joinSession(shareId);

        dispatch(syncState({
          magazine: {
            ...sharedState.magazine,
            isShared: true,
            allowEdit: true
          }
        }));

        dispatch(updateSettings(sharedState.settings));
      } catch (err) {
        console.error('Error connecting to session:', err);
        dispatch(setConnectionStatus(false));
      }
    }
    onShare();
  }, [allowEdit, dispatch, onShare]);

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
          <div className="bg-blue-50 p-4 rounded-md">
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
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Allow editing</span>
          </label>

          {allowEdit && (
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex items-center text-sm text-blue-700">
                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                Recipients will be able to edit and collaborate on the layout
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleShareClick}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
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