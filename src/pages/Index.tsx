
import React, { useEffect, useState } from 'react';
import DeepSpaceBackground from '../components/DeepSpaceBackground';

const Index = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slight delay before showing the text for a more dramatic reveal
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      <DeepSpaceBackground />
      <div className="relative z-10 flex items-center justify-center h-screen">
        <div className={`text-center text-white transition-opacity duration-1000 ease-in-out ${visible ? 'opacity-90' : 'opacity-0'}`}>
          <h1 className="text-4xl font-light tracking-wider mb-2">You Are Here</h1>
          <p className="text-xl font-thin tracking-wide opacity-70">a moment for reflection</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
