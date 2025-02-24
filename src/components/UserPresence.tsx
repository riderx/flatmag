import React from 'react';
import { Users } from 'lucide-react';

interface User {
  id: string;
  animal: {
    name: string;
    color: string;
  };
}

interface UserPresenceProps {
  users: User[];
  currentUserId: string;
}

export function UserPresence({ users, currentUserId }: UserPresenceProps) {
  if (users.length <= 1) return null;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="relative inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-white"
            style={{ backgroundColor: user.animal.color }}
            title={`${user.animal.name}${user.id === currentUserId ? ' (You)' : ''}`}
          >
            <span className="text-xs font-medium text-white">
              {user.animal.name.charAt(0)}
            </span>
            {user.id === currentUserId && (
              <span className="absolute -bottom-1 -right-1 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
            )}
          </div>
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {users.length} active
      </span>
    </div>
  );
}