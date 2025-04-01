
import React, { useEffect, useRef, useState } from "react";
import { TimeEvent, SpiralConfig } from "@/types/event";

interface SpiralVisualizationProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onSpiralClick: (year: number, month: number, x: number, y: number) => void;
}

const getSpiralPosition = ({
  year,
  month,
  startYear,
  startRadius,
  spiralSpacing,
}: {
  year: number;
  month: number;
  startYear: number;
  startRadius: number;
  spiralSpacing: number;
}) => {
  // Calculate position based on year and month
  // With month position based on clock layout: January at 12 o'clock, December at 11 o'clock
  const yearDiff = year - startYear;
  
  // Convert month to clock position (0-11, with 0 at 12 o'clock position)
  // We subtract from 3 and take modulo 12 to start January at top (12 o'clock)
  const clockPosition = (month + 12 - 3) % 12;
  const monthAngle = (clockPosition / 12) * 2 * Math.PI;
  
  // Calculate final angle and radius
  const angle = yearDiff * 2 * Math.PI + monthAngle;
  const radius = startRadius + spiralSpacing * yearDiff;
  
  return { angle, radius };
};

const SpiralVisualization: React.FC<SpiralVisualizationProps> = ({
  events,
  config,
  onSpiralClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", updateDimensions);
    updateDimensions();
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = config.centerX || canvas.width / 2;
    const centerY = config.centerY || canvas.height / 2;
    const spiralSpacing = 30 * config.zoom;
    const startRadius = 50 * config.zoom;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.45;

    // Calculate visible years based on zoom level
    // We always show: currentYear, two previous years, and startYear
    const visibleYears = getVisibleYears(config);
    
    // Draw background particles
    drawBackgroundParticles(ctx, canvas.width, canvas.height, 200);
    
    // Draw the base spiral for visible years
    drawBaseSpiral(ctx, centerX, centerY, startRadius, spiralSpacing, visibleYears, maxRadius);
    
    // Draw month markers (radial clock-like divisions)
    drawMonthMarkers(ctx, centerX, centerY, startRadius, spiralSpacing, visibleYears, maxRadius);
    
    // Draw events
    drawEvents(ctx, events, centerX, centerY, startRadius, spiralSpacing, config.startYear, maxRadius, visibleYears);
    
    // Draw future events as floating debris
    drawFutureEvents(ctx, events, centerX, centerY, config.currentYear, canvas.width, canvas.height);
    
  }, [dimensions, events, config]);

  // Get array of years that should be visible based on zoom level
  const getVisibleYears = (config: SpiralConfig): number[] => {
    const { startYear, currentYear, zoom } = config;
    
    // Calculate how many years to show based on zoom
    // At higher zoom levels, we show fewer years (camera moving inward)
    const zoomFactor = Math.max(0, Math.min(1, zoom)); // Normalize zoom between 0-1
    const yearsFromCurrent = Math.max(0, currentYear - startYear);
    
    // Determine which years are visible based on zoom level
    // We always show currentYear, two previous years, and startYear
    const visibleYears: number[] = [];
    
    // Current year is always visible
    visibleYears.push(currentYear);
    
    // Add two previous years (if they exist)
    if (currentYear - 1 >= startYear) visibleYears.push(currentYear - 1);
    if (currentYear - 2 >= startYear) visibleYears.push(currentYear - 2);
    
    // Add earlier years based on zoom level
    const zoomedYear = Math.floor(startYear + (currentYear - startYear) * (1 - zoomFactor));
    for (let y = currentYear - 3; y >= zoomedYear; y--) {
      if (y >= startYear) visibleYears.push(y);
    }
    
    // Always include the startYear
    if (!visibleYears.includes(startYear)) {
      visibleYears.push(startYear);
    }
    
    return visibleYears;
  };

  const drawBackgroundParticles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    count: number
  ) => {
    ctx.save();
    
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 1.5;
      const opacity = 0.1 + Math.random() * 0.2;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }
    
    ctx.restore();
  };

  const drawBaseSpiral = (
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    startRadius: number, 
    spiralSpacing: number, 
    visibleYears: number[], 
    maxRadius: number
  ) => {
    ctx.save();
    
    // Sort years to draw from oldest to newest
    const sortedYears = [...visibleYears].sort((a, b) => a - b);
    
    for (const year of sortedYears) {
      // For each visible year, draw a full spiral loop
      ctx.strokeStyle = `rgba(255, 255, 255, ${year === config.currentYear ? 0.2 : 0.1})`;
      ctx.lineWidth = year === config.currentYear ? 1.5 : 1;
      ctx.beginPath();
      
      // Draw a full 360° loop for the year
      for (let month = 0; month <= 12; month++) {
        const { angle, radius } = getSpiralPosition({
          year,
          month,
          startYear: config.startYear,
          startRadius,
          spiralSpacing,
        });
        
        if (radius > maxRadius) continue;
        
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (month === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      
      // Add year label
      const { angle, radius } = getSpiralPosition({
        year, 
        month: 6, // Middle of the year for label
        startYear: config.startYear,
        startRadius,
        spiralSpacing,
      });
      
      const labelX = centerX + radius * Math.cos(angle);
      const labelY = centerY + radius * Math.sin(angle);
      
      ctx.font = '12px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(year.toString(), labelX, labelY);
    }
    
    ctx.restore();
  };

  const drawMonthMarkers = (
    ctx: CanvasRenderingContext2D,
    centerX: number, 
    centerY: number, 
    startRadius: number, 
    spiralSpacing: number, 
    visibleYears: number[],
    maxRadius: number
  ) => {
    ctx.save();
    
    const sortedYears = [...visibleYears].sort((a, b) => a - b);
    
    for (const year of sortedYears) {
      // Draw month dividers for the year
      for (let month = 0; month < 12; month++) {
        const { angle, radius } = getSpiralPosition({
          year,
          month,
          startYear: config.startYear,
          startRadius,
          spiralSpacing,
        });
        
        if (radius > maxRadius) continue;
        
        // Calculate inner and outer points for the radial line
        const innerX = centerX + radius * 0.97 * Math.cos(angle);
        const innerY = centerY + radius * 0.97 * Math.sin(angle);
        const outerX = centerX + radius * 1.03 * Math.cos(angle);
        const outerY = centerY + radius * 1.03 * Math.sin(angle);
        
        // Draw month marker line
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${month % 3 === 0 ? 0.15 : 0.07})`;
        ctx.lineWidth = month % 3 === 0 ? 1 : 0.5;
        ctx.stroke();
        
        // For quarter months, add small labels
        if (month % 3 === 0) {
          const monthNames = ['Jan', 'Apr', 'Jul', 'Oct'];
          const labelX = centerX + radius * 1.07 * Math.cos(angle);
          const labelY = centerY + radius * 1.07 * Math.sin(angle);
          
          ctx.font = '10px sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(monthNames[month/3], labelX, labelY);
        }
      }
    }
    
    ctx.restore();
  };

  const drawEvents = (
    ctx: CanvasRenderingContext2D, 
    events: TimeEvent[], 
    centerX: number, 
    centerY: number, 
    startRadius: number, 
    spiralSpacing: number, 
    startYear: number, 
    maxRadius: number,
    visibleYears: number[]
  ) => {
    events.forEach((event) => {
      const eventYear = event.startDate.getFullYear();
      
      // Skip future events (they're handled separately)
      if (eventYear > config.currentYear) return;
      
      // Skip events not in visible years
      if (!visibleYears.includes(eventYear)) return;
      
      const start = getSpiralPosition({
        year: eventYear,
        month: event.startDate.getMonth(),
        startYear,
        startRadius,
        spiralSpacing,
      });

      if (!event.endDate) {
        // Single point event
        if (start.radius <= maxRadius) {
          drawEventPoint(
            ctx, 
            centerX, 
            centerY, 
            start.radius, 
            start.angle, 
            event.color, 
            event.intensity
          );
        }
      } else {
        // Duration event
        const end = getSpiralPosition({
          year: event.endDate.getFullYear(),
          month: event.endDate.getMonth(),
          startYear,
          startRadius,
          spiralSpacing,
        });

        if (start.radius <= maxRadius || end.radius <= maxRadius) {
          drawEventArc(
            ctx, 
            centerX, 
            centerY, 
            start.radius, 
            end.radius, 
            start.angle, 
            end.angle, 
            event.color, 
            event.intensity
          );
        }
      }
    });
  };

  const drawFutureEvents = (
    ctx: CanvasRenderingContext2D,
    events: TimeEvent[],
    centerX: number,
    centerY: number,
    currentYear: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    // Filter only future events
    const futureEvents = events.filter(
      (event) => event.startDate.getFullYear() > currentYear
    );
    
    if (futureEvents.length === 0) return;
    
    // For each future event, create floating debris
    futureEvents.forEach((event) => {
      // Generate a random position in the future area (to the right of the spiral)
      const randomX = centerX + Math.random() * (canvasWidth/2 - 100) + 100;
      const randomY = centerY + (Math.random() - 0.5) * (canvasHeight/2);
      
      // Draw a soft glowing particle
      const glowSize = 4 + event.intensity * 1.5;
      const glowOpacity = 0.2 + event.intensity * 0.07;
      
      const gradient = ctx.createRadialGradient(
        randomX, randomY, 0, 
        randomX, randomY, glowSize
      );
      gradient.addColorStop(0, event.color);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      
      ctx.beginPath();
      ctx.arc(randomX, randomY, glowSize, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.globalAlpha = glowOpacity;
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Add a small dust trail
      drawDustTrail(ctx, randomX, randomY, event.color, event.intensity);
    });
  };

  const drawDustTrail = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    intensity: number
  ) => {
    const particles = 5 + Math.floor(intensity * 1.5);
    const trailLength = 20 + intensity * 5;
    
    for (let i = 0; i < particles; i++) {
      const distance = Math.random() * trailLength;
      const angle = Math.random() * Math.PI * 2;
      
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;
      const particleSize = 0.5 + Math.random() * (intensity / 5);
      
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.1 + Math.random() * 0.2;
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  };

  const drawEventPoint = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    angle: number,
    color: string,
    intensity: number
  ) => {
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const glowSize = 2 + intensity * 1.5;
    const glowOpacity = 0.3 + intensity * 0.07;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.beginPath();
    ctx.arc(x, y, glowSize, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.globalAlpha = glowOpacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const drawEventArc = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    startRadius: number,
    endRadius: number,
    startAngle: number,
    endAngle: number,
    color: string,
    intensity: number
  ) => {
    const alpha = 0.2 + (intensity / 10) * 0.8;
    const particleCount = 20 + intensity * 10;
    drawDustForSegment(
      ctx,
      centerX,
      centerY,
      startRadius,
      endRadius,
      startAngle,
      endAngle,
      color,
      particleCount,
      alpha
    );
  };

  const drawDustForSegment = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    color: string,
    particleCount: number,
    alpha = 0.5
  ) => {
    for (let i = 0; i < particleCount; i++) {
      const randomAngle = startAngle + Math.random() * (endAngle - startAngle);
      const randomRadius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const x = centerX + randomRadius * Math.cos(randomAngle);
      const y = centerY + randomRadius * Math.sin(randomAngle);
      const sizeVariance = 1 - (randomRadius - innerRadius) / (outerRadius - innerRadius);
      const particleSize = 0.5 + Math.random() * 2 * sizeVariance;
      ctx.beginPath();
      ctx.arc(x, y, particleSize, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha * Math.random();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = config.centerX || canvas.width / 2;
    const centerY = config.centerY || canvas.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const radius = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate angle in radians
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2 * Math.PI;
    
    // Adjust angle to match our clock layout (January at 12 o'clock)
    // Convert angle to month (0-11)
    const clockAngle = (angle + Math.PI/2) % (2 * Math.PI); // Rotate by 90° so 0 is at 12 o'clock
    const month = Math.floor((clockAngle / (2 * Math.PI)) * 12);

    const spiralSpacing = 30 * config.zoom;
    const startRadius = 50 * config.zoom;
    
    // Calculate which year ring was clicked based on distance from center
    const yearDiff = (radius - startRadius) / spiralSpacing;
    const year = config.startYear + Math.floor(yearDiff);

    onSpiralClick(year, month, x, y);
  };

  return <canvas ref={canvasRef} className="absolute inset-0 z-20 cursor-pointer" onClick={handleCanvasClick} />;
};

export default SpiralVisualization;
