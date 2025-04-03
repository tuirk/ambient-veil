
import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDuration: number;
  animationDelay: number;
}

interface Nebula {
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDuration: number;
  hue: number;
}

const DeepSpaceBackground: React.FC = () => {
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const nebulasContainerRef = useRef<HTMLDivElement>(null);
  const dustParticlesRef = useRef<HTMLDivElement>(null);
  const galaxiesRef = useRef<HTMLDivElement>(null);
  
  // Generate random stars
  const generateStars = (count: number): Star[] => {
    return Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      animationDuration: Math.random() * 10 + 5,
      animationDelay: Math.random() * 5,
    }));
  };
  
  // Generate nebula clouds
  const generateNebulas = (count: number): Nebula[] => {
    return Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 400 + 200,
      opacity: Math.random() * 0.3 + 0.1,
      animationDuration: Math.random() * 60 + 30,
      hue: Math.floor(Math.random() * 360),
    }));
  };
  
  useEffect(() => {
    const stars = generateStars(150);
    const nebulas = generateNebulas(7);
    
    if (starsContainerRef.current) {
      // Clear any existing stars
      starsContainerRef.current.innerHTML = '';
      
      // Create star elements
      stars.forEach((star) => {
        const starElement = document.createElement('div');
        starElement.className = 'star';
        starElement.style.left = `${star.x}%`;
        starElement.style.top = `${star.y}%`;
        starElement.style.width = `${star.size}px`;
        starElement.style.height = `${star.size}px`;
        starElement.style.opacity = `${star.opacity}`;
        starElement.style.animation = `twinkle ${star.animationDuration}s ease-in-out infinite`;
        starElement.style.animationDelay = `${star.animationDelay}s`;
        
        starsContainerRef.current.appendChild(starElement);
      });
      
      // Add a few lens flare stars for extra effect
      for (let i = 0; i < 5; i++) {
        const lensFlare = document.createElement('div');
        lensFlare.className = 'lens-flare-star';
        lensFlare.style.left = `${Math.random() * 100}%`;
        lensFlare.style.top = `${Math.random() * 100}%`;
        lensFlare.style.width = `${Math.random() * 4 + 2}px`;
        lensFlare.style.height = `${Math.random() * 4 + 2}px`;
        lensFlare.style.opacity = `${Math.random() * 0.5 + 0.5}`;
        lensFlare.style.animation = `pulse ${Math.random() * 8 + 4}s ease-in-out infinite`;
        
        starsContainerRef.current.appendChild(lensFlare);
      }
    }
    
    if (nebulasContainerRef.current) {
      // Clear any existing nebulas
      nebulasContainerRef.current.innerHTML = '';
      
      // Create nebula elements
      nebulas.forEach((nebula) => {
        const nebulaElement = document.createElement('div');
        nebulaElement.className = 'nebula';
        nebulaElement.style.left = `${nebula.x}%`;
        nebulaElement.style.top = `${nebula.y}%`;
        nebulaElement.style.width = `${nebula.size}px`;
        nebulaElement.style.height = `${nebula.size}px`;
        nebulaElement.style.opacity = `${nebula.opacity}`;
        nebulaElement.style.animation = `nebula-drift ${nebula.animationDuration}s ease-in-out infinite`;
        
        // Randomize the nebula colors slightly
        const hueRotate = nebula.hue;
        nebulaElement.style.filter = `hue-rotate(${hueRotate}deg)`;
        
        nebulasContainerRef.current.appendChild(nebulaElement);
      });
    }
    
    // Add dust particles
    if (dustParticlesRef.current) {
      dustParticlesRef.current.innerHTML = '';
      
      for (let i = 0; i < 100; i++) {
        const dust = document.createElement('div');
        dust.className = 'dust-particle';
        dust.style.left = `${Math.random() * 100}%`;
        dust.style.top = `${Math.random() * 100}%`;
        dust.style.width = `${Math.random() * 1 + 0.5}px`;
        dust.style.height = `${Math.random() * 1 + 0.5}px`;
        dust.style.opacity = `${Math.random() * 0.5 + 0.1}`;
        dust.style.backgroundColor = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 0.8)`;
        
        // Set custom property for random values
        dust.style.setProperty('--tw-random', Math.random().toString());
        dust.style.animation = `float ${Math.random() * 60 + 30}s linear infinite`;
        
        dustParticlesRef.current.appendChild(dust);
      }
    }
    
    // Add galaxies
    if (galaxiesRef.current) {
      galaxiesRef.current.innerHTML = '';
      
      for (let i = 0; i < 3; i++) {
        const galaxy = document.createElement('div');
        galaxy.className = 'galaxy';
        galaxy.style.left = `${Math.random() * 100}%`;
        galaxy.style.top = `${Math.random() * 100}%`;
        galaxy.style.width = `${Math.random() * 300 + 400}px`;
        galaxy.style.height = `${Math.random() * 300 + 400}px`;
        galaxy.style.opacity = `${Math.random() * 0.1 + 0.05}`;
        galaxy.style.animation = `drift ${Math.random() * 120 + 60}s ease-in-out infinite`;
        galaxy.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        galaxiesRef.current.appendChild(galaxy);
      }
    }
  }, []);
  
  return (
    <>
      <div className="deep-space-bg">
        <div className="background-image"></div>
        <div ref={galaxiesRef} className="absolute inset-0 overflow-hidden"></div>
        <div ref={nebulasContainerRef} className="absolute inset-0 overflow-hidden"></div>
        <div ref={starsContainerRef} className="absolute inset-0 overflow-hidden"></div>
        <div ref={dustParticlesRef} className="absolute inset-0 overflow-hidden"></div>
      </div>
    </>
  );
};

export default DeepSpaceBackground;
