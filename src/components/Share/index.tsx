import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { ShareModal } from './ShareModal';
import { initializeShare } from '../../utils/share';
import { getConnectedUsers } from '../../utils/collaboration';

export function Share() {
  const [showModal, setShowModal] = useState(false);
  const [allowEdit, setAllowEdit] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sharePermission, setSharePermission] = useState(allowEdit ? 'edit' : 'read');
  const connectedUsers = getConnectedUsers();

  const handleBroadcast = () => {
    if (allowEdit) {
      console.log('Broadcast started');
      // Logic to start broadcast
    } else {
      console.log('Broadcast stopped');
      // Logic to stop broadcast
    }
  };

  const handleShare = async () => {
    try {
      // Initialize share session
      const shareId = await initializeShare(allowEdit);
      
      // Generate share URL
      const shareUrl = new URL('/share', window.location.origin);
      shareUrl.searchParams.set('id', shareId);
      
      // Store permission in state
      setSharePermission(allowEdit ? 'edit' : 'read');
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Activate broadcast
      handleBroadcast();
      
      // Close modal
      setShowModal(false);
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to create share link. Please try again.');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border rounded-md hover:bg-gray-50"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </button>

      <ShareModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onShare={handleShare}
        allowEdit={allowEdit}
        onAllowEditChange={setAllowEdit}
        copied={copied}
        connectedUsers={connectedUsers.length}
      />
    </>
  );
}
