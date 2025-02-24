import React from 'react';
import { Users } from 'lucide-react';

interface CollaborationStatusProps {
  isCollaborating: boolean;
  peersCount: number;
  isEditingAllowed: boolean;
}

export function CollaborationStatus({ isCollaborating, peersCount, isEditingAllowed }: CollaborationStatusProps) {
  if (!isCollaborating) return null;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700">
        <Users className="w-4 h-4 mr-2" />
        <span>{peersCount} connected</span>
      </div>
      {!isEditingAllowed && (
        <div className="px-3 py-1 rounded-full bg-gray-50 text-gray-700">
          View Only
        </div>
      )}
    </div>
  );
}