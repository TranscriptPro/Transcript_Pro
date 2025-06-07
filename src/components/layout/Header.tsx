import React from 'react';
import { Headphones } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <div className="flex items-center space-x-2">
          <Headphones className="h-6 w-6 text-blue-500" />
          <span className="font-semibold text-lg text-gray-900">Transcript Pro</span>
        </div>
        <div className="ml-auto text-sm text-gray-600">
          Powered by Whisper
        </div>
      </div>
    </header>
  );
};

export default Header;