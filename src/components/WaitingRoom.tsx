import React from 'react';
import { Layout, Loader, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WaitingRoomProps {
  status: 'connecting' | 'waiting' | 'syncing' | 'error';
  error?: string;
}

export function WaitingRoom({ status, error }: WaitingRoomProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-6">
        {status === 'error' ? (
          <>
            <div className="flex justify-center">
              <AlertTriangle className="w-16 h-16 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Connection Error</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/magazines')}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Back to Magazines
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <Layout className="w-16 h-16 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {status === 'connecting' && 'Connecting to Session'}
                {status === 'waiting' && 'Waiting for Host'}
                {status === 'syncing' && 'Loading Magazine'}
              </h2>
              <p className="text-gray-600">
                {status === 'connecting' && 'Establishing connection...'}
                {status === 'waiting' && 'Waiting for host to accept...'}
                {status === 'syncing' && 'Syncing magazine data...'}
              </p>
            </div>
            <div className="flex justify-center">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}