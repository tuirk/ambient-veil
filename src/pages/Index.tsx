
import React from 'react';
import CosmicBackground from '../components/CosmicBackground';

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      <CosmicBackground />
      <div className="relative z-10 flex items-center justify-center h-screen">
        <div className="text-center text-white opacity-0 animate-pulse-fade">
          <h1 className="text-4xl font-light tracking-wider mb-2">You Are Here</h1>
        </div>
      </div>
    </div>
  );
};

export default Index;
