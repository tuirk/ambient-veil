
import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDuration: number;
  animationDelay: number;
  color: string;
}

interface Galaxy {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  hue: number;
  blur: number;
}

const DeepSpaceBackground: React.FC = () => {
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const galaxiesContainerRef = useRef<HTMLDivElement>(null);
  const backgroundImageRef = useRef<HTMLDivElement>(null);
  
  // Generate stars with different colors and sizes
  const generateStars = (count: number): Star[] => {
    return Array.from({ length: count }).map(() => {
      // Generate star colors (white, blue-white, red-orange, etc)
      const colorChoices = [
        'rgb(255, 255, 255)', // pure white
        'rgb(240, 248, 255)', // blue-white
        'rgb(255, 220, 200)', // slight orange
        'rgb(230, 230, 255)', // slight blue
        'rgb(255, 230, 230)', // slight red
      ];
      
      return {
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        animationDuration: Math.random() * 10 + 5,
        animationDelay: Math.random() * 5,
        color: colorChoices[Math.floor(Math.random() * colorChoices.length)],
      };
    });
  };
  
  // Generate distant galaxies and clusters
  const generateGalaxies = (count: number): Galaxy[] => {
    return Array.from({ length: count }).map(() => {
      // More subtle, varied colors for galaxies
      return {
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 300 + 100,
        opacity: Math.random() * 0.15 + 0.05, // More subtle
        rotation: Math.random() * 360,
        hue: Math.floor(Math.random() * 360),
        blur: Math.random() * 50 + 20, // More blur for distant effect
      };
    });
  };
  
  // Create stars with lens flare effect
  const generateLensFlareStars = (count: number): Star[] => {
    return Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2, // Slightly larger for lens flare effect
      opacity: Math.random() * 0.9 + 0.6,
      animationDuration: Math.random() * 15 + 10,
      animationDelay: Math.random() * 5,
      color: 'rgb(255, 255, 255)',
    }));
  };
  
  useEffect(() => {
    const stars = generateStars(200);
    const galaxies = generateGalaxies(12);
    const lensFlareStars = generateLensFlareStars(15);
    
    if (starsContainerRef.current) {
      // Clear existing stars
      starsContainerRef.current.innerHTML = '';
      
      // Create regular stars
      stars.forEach((star) => {
        const starElement = document.createElement('div');
        starElement.className = 'star';
        starElement.style.left = `${star.x}%`;
        starElement.style.top = `${star.y}%`;
        starElement.style.width = `${star.size}px`;
        starElement.style.height = `${star.size}px`;
        starElement.style.opacity = `${star.opacity}`;
        starElement.style.backgroundColor = star.color;
        starElement.style.animation = `twinkle ${star.animationDuration}s ease-in-out infinite`;
        starElement.style.animationDelay = `${star.animationDelay}s`;
        
        starsContainerRef.current?.appendChild(starElement);
      });
      
      // Create lens flare stars
      lensFlareStars.forEach((star) => {
        const starElement = document.createElement('div');
        starElement.className = 'lens-flare-star';
        starElement.style.left = `${star.x}%`;
        starElement.style.top = `${star.y}%`;
        starElement.style.width = `${star.size}px`;
        starElement.style.height = `${star.size}px`;
        starElement.style.opacity = `${star.opacity}`;
        starElement.style.animation = `pulse ${star.animationDuration}s ease-in-out infinite`;
        starElement.style.animationDelay = `${star.animationDelay}s`;
        
        starsContainerRef.current?.appendChild(starElement);
      });
    }
    
    if (galaxiesContainerRef.current) {
      // Clear existing galaxies
      galaxiesContainerRef.current.innerHTML = '';
      
      // Create galaxy elements
      galaxies.forEach((galaxy) => {
        const galaxyElement = document.createElement('div');
        galaxyElement.className = 'galaxy';
        galaxyElement.style.left = `${galaxy.x}%`;
        galaxyElement.style.top = `${galaxy.y}%`;
        galaxyElement.style.width = `${galaxy.size}px`;
        galaxyElement.style.height = `${galaxy.size}px`;
        galaxyElement.style.opacity = `${galaxy.opacity}`;
        galaxyElement.style.transform = `rotate(${galaxy.rotation}deg)`;
        galaxyElement.style.filter = `blur(${galaxy.blur}px) hue-rotate(${galaxy.hue}deg)`;
        galaxyElement.style.animation = `drift ${Math.random() * 60 + 40}s ease-in-out infinite`;
        
        galaxiesContainerRef.current?.appendChild(galaxyElement);
      });
    }
  }, []);
  
  return (
    <div className="deep-space-bg">
      <div ref={backgroundImageRef} className="background-image"></div>
      <div ref={galaxiesContainerRef} className="absolute inset-0 overflow-hidden"></div>
      <div ref={starsContainerRef} className="absolute inset-0 overflow-hidden"></div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/50 opacity-70"></div>
    </div>
  );
};

export default DeepSpaceBackground;
