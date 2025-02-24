import React, { useState } from 'react';
import { Share2, Check, Users } from 'lucide-react';
import { generateShareUrl } from '../utils/share';
import { Modal } from './Modal';
import { useLocation } from 'react-router-dom';

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [allowEdit, setAllowEdit] = useState(true);
  const location = useLocation();

  const handleShare = async () => {
    const url = generateShareUrl(allowEdit);
    setShowModal(false);

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Only show share button on flat-plan page
  if (location.pathname !== '/flat-plan') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Share Layout</h3>
            <p className="mt-1 text-sm text-gray-500">
              Choose how you want to share your magazine layout
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={allowEdit}
                onChange={(e) => setAllowEdit(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Allow editing</span>
            </label>

            {allowEdit && (
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex items-center text-sm text-blue-700">
                  <Users className="w-4 h-4 mr-2" />
                  Recipients will be able to edit and collaborate on the layout
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
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
    </>
  );
}