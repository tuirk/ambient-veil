
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StaticSpaceBackground } from '@/components/spiral/StaticSpaceBackground';

const Index = () => {
  const [visible, setVisible] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Slight delay before showing the text for a more dramatic reveal
    const textTimer = setTimeout(() => {
      setVisible(true);
    }, 1500);

    // Additional delay before showing the button
    const buttonTimer = setTimeout(() => {
      setShowButton(true);
    }, 3000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  const handleBeginMapping = () => {
    navigate('/spiral');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen relative">
      <div className="w-full h-full bg-black absolute">
        <StaticSpaceBackground />
      </div>
      <div className={`text-center text-white transition-opacity duration-1000 ease-in-out ${visible ? 'opacity-90' : 'opacity-0'} z-10 relative`}>
        <h1 className="text-4xl font-light tracking-wider mb-2">You Are Here</h1>
        <p className="text-xl font-thin tracking-wide opacity-70 mb-8">a moment for reflection</p>
        
        <div className={`mt-12 transition-all duration-1000 ease-in-out ${showButton ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`}>
          <Button 
            onClick={handleBeginMapping}
            className="mt-4 bg-cosmic-nebula-purple/60 hover:bg-cosmic-nebula-purple/80 text-white border border-cosmic-nebula-purple/30 backdrop-blur-sm px-6 py-2"
          >
            Begin Mapping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
