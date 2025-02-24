import React from 'react';
import { Layout } from 'lucide-react';

export function Loader() {
  return (
    <div className="flex items-center justify-center space-x-3">
      <div className="relative w-16 h-16">
        <Layout className="w-16 h-16 text-blue-600 animate-pulse" />
        <div className="absolute inset-0 border-4 border-blue-600 rounded-lg animate-spin" 
          style={{ 
            animationDuration: '3s',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent'
          }} 
        />
      </div>
    </div>
  );
}