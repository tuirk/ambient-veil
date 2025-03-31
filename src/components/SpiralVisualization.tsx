
import React, { useEffect, useRef, useState, useMemo } from "react";
import { TimeEvent, SpiralConfig } from "@/types/event";

interface SpiralVisualizationProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onSpiralClick: (year: number, month: number, x: number, y: number) => void;
}

const SpiralVisualization: React.FC<SpiralVisualizationProps> = ({
  events,
  config,
  onSpiralClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef<number>();
  
  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate visible years based on zoom level
  const visibleYears = useMemo(() => {
    const currentSystemYear = new Date().getFullYear();
    
    // Ensure startYear is within 10 years of current system year
    const minStartYear = Math.max(config.startYear, currentSystemYear - 10);
    
    // Calculate the years to display based on zoom
    const years: number[] = [];
    
    // Always include startYear (center)
    years.push(minStartYear);
    
    // Current year (outermost) is always visible
    if (!years.includes(config.currentYear)) {
      years.push(config.currentYear);
    }
    
    // Calculate which years to show based on zoom
    const zoomLevel = Math.max(0, Math.min(3, config.zoom));
    const zoomIndex = Math.floor(zoomLevel);
    
    // Add previous years based on zoom level
    for (let i = 1; i <= 2; i++) {
      const year = config.currentYear - (i + zoomIndex);
      // Only add years that are at or after the startYear
      if (year >= minStartYear && !years.includes(year)) {
        years.push(year);
      }
    }
    
    // Sort years from earliest to latest
    return years.sort((a, b) => a - b);
  }, [config.zoom, config.startYear, config.currentYear]);

  // Draw the spiral
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const draw = () => {
      // Set canvas dimensions
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Center point
      const centerX = config.centerX || canvas.width / 2;
      const centerY = config.centerY || canvas.height / 2;

      // Spiral parameters
      const spiralSpacing = 30 * config.zoom; // Space between spiral loops
      const initialRadius = 50 * config.zoom; // Initial radius
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.45; // Max radius

      // Draw ambient particles
      drawAmbientParticles(ctx, canvas.width, canvas.height);

      // Draw clock-like month guides
      drawMonthGuides(ctx, centerX, centerY, initialRadius, maxRadius);

      // Calculate total years to display
      const systemCurrentYear = new Date().getFullYear();
      
      // Split events into past/present and future events
      const pastPresentEvents = events.filter(event => 
        event.startDate.getFullYear() <= systemCurrentYear
      );
      
      const futureEvents = events.filter(event => 
        event.startDate.getFullYear() > systemCurrentYear
      );

      // Draw base spiral for visible years
      if (visibleYears.length > 0) {
        drawVisibleSpiral(
          ctx,
          centerX,
          centerY,
          initialRadius,
          spiralSpacing,
          visibleYears,
          config.currentYear,
          maxRadius
        );

        // Draw events on spiral
        drawEvents(
          ctx,
          pastPresentEvents,
          centerX,
          centerY,
          initialRadius,
          spiralSpacing,
          config.startYear,
          maxRadius,
          visibleYears
        );
      }
      
      // Draw future events as space debris
      drawFutureEvents(ctx, futureEvents, canvas.width, canvas.height);
      
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, events, config, visibleYears]);

  // Helper function for drawing ambient particles
  const drawAmbientParticles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const now = Date.now() / 1000;
    const particleCount = 300; // Increased particle count for better ambient effect
    
    for (let i = 0; i < particleCount; i++) {
      // Random position across the canvas
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      // Size and opacity variations with time-based animation
      const sizeVariation = Math.sin(now * 0.5 + i * 0.1) * 0.3 + 0.7;
      const opacityVariation = Math.sin(now * 0.3 + i * 0.05) * 0.3 + 0.4;
      
      const size = 0.5 + Math.random() * 1.5 * sizeVariation;
      
      // Draw ambient particle
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacityVariation * 0.3})`;
      ctx.fill();
    }
  };
  
  // Helper function for drawing month guides
  const drawMonthGuides = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    initialRadius: number,
    maxRadius: number
  ) => {
    // Draw faint radial lines to indicate months (clock-like)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    
    for (let month = 0; month < 12; month++) {
      // Calculate angle (January at 12 o'clock, etc.)
      const angle = (month / 12) * 2 * Math.PI - Math.PI / 2; // -90 degrees to start at 12 o'clock
      
      const x1 = centerX + initialRadius * Math.cos(angle);
      const y1 = centerY + initialRadius * Math.sin(angle);
      const x2 = centerX + maxRadius * Math.cos(angle);
      const y2 = centerY + maxRadius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // Add small month markers
      const labelRadius = initialRadius * 0.8;
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY + labelRadius * Math.sin(angle);
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(labelX, labelY, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  // Helper function for drawing the visible spiral years
  const drawVisibleSpiral = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    initialRadius: number,
    spiralSpacing: number,
    visibleYears: number[],
    currentYear: number,
    maxRadius: number
  ) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    
    // Draw each visible year as a separate spiral ring
    visibleYears.forEach((year, index) => {
      // Calculate year distance from startYear (first in visibleYears)
      const yearOffset = visibleYears.indexOf(year);
      
      // Calculate radius for this year's spiral ring
      // Map year position to a radius value between initialRadius and maxRadius
      const yearRange = visibleYears.length - 1;
      const radiusStep = yearRange > 0 ? (maxRadius - initialRadius) / yearRange : 0;
      const radius = initialRadius + yearOffset * radiusStep;
      
      // Adjust opacity based on distance from current year
      const yearDistance = Math.abs(currentYear - year);
      const opacity = 1 - (yearDistance / 5) * 0.7; // Fade older years
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
      
      // Draw year ring
      if (radius <= maxRadius) {
        ctx.beginPath();
        for (let angle = 0; angle <= 2 * Math.PI; angle += 0.05) {
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        
        // Draw month markers and dust
        for (let month = 0; month < 12; month++) {
          // Calculate clockwise angle (January at 12 o'clock)
          const startAngle = (month / 12) * 2 * Math.PI - Math.PI / 2; // -90 degrees offset
          const endAngle = ((month + 1) / 12) * 2 * Math.PI - Math.PI / 2;
          
          // Draw dust particles for empty sections
          drawDustForSegment(
            ctx, 
            centerX, 
            centerY, 
            radius - 5, 
            radius + 5, 
            startAngle, 
            endAngle, 
            "rgba(255, 255, 255, 0.1)",
            yearOffset === 0 ? 10 : 5 // More particles for the current year
          );
        }
        
        // Label the year
        const yearLabelAngle = -Math.PI / 4; // Label at 1:30 position
        const labelX = centerX + (radius - 15) * Math.cos(yearLabelAngle);
        const labelY = centerY + (radius - 15) * Math.sin(yearLabelAngle);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
        ctx.font = "10px Arial";
        ctx.fillText(year.toString(), labelX, labelY);
      }
    });
  };

  const drawEvents = (
    ctx: CanvasRenderingContext2D,
    events: TimeEvent[],
    centerX: number,
    centerY: number,
    initialRadius: number,
    spiralSpacing: number,
    startYear: number,
    maxRadius: number,
    visibleYears: number[]
  ) => {
    events.forEach((event) => {
      const eventYear = event.startDate.getFullYear();
      
      // Only process events for visible years
      if (!visibleYears.includes(eventYear)) return;
      
      // Find the index of the year in the visibleYears array
      const yearIndex = visibleYears.indexOf(eventYear);
      
      // Calculate the radius based on the year's position in the visible years
      const yearRange = visibleYears.length - 1;
      const radiusStep = yearRange > 0 ? (maxRadius - initialRadius) / yearRange : 0;
      const baseRadius = initialRadius + yearIndex * radiusStep;
      
      // Calculate clock-like angle for the month (January at 12 o'clock)
      const month = event.startDate.getMonth();
      const startAngle = (month / 12) * 2 * Math.PI - Math.PI / 2; // -90 degrees offset
      
      if (!event.endDate) {
        // Single point event
        const radius = baseRadius;
        if (radius <= maxRadius) {
          drawEventPoint(
            ctx,
            centerX,
            centerY,
            radius,
            startAngle,
            event.color,
            event.intensity
          );
        }
      } else {
        // Duration event
        const endYear = event.endDate.getFullYear();
        const endMonth = event.endDate.getMonth();
        
        // Calculate end angle (clock-like)
        const endAngle = (endMonth / 12) * 2 * Math.PI - Math.PI / 2;
        
        // Handle events that span multiple years
        if (endYear === eventYear) {
          // Same year event
          if (baseRadius <= maxRadius) {
            drawEventArc(
              ctx,
              centerX,
              centerY,
              baseRadius,
              baseRadius,
              startAngle,
              endAngle,
              event.color,
              event.intensity
            );
          }
        } else {
          // Multi-year event - draw segments for each visible year
          for (const year of visibleYears) {
            if (year < eventYear || year > endYear) continue;
            
            // Find the index of this year in the visibleYears array
            const yearIdx = visibleYears.indexOf(year);
            const yearRadius = initialRadius + yearIdx * radiusStep;
            
            if (yearRadius > maxRadius) continue;
            
            let segmentStartAngle = startAngle;
            let segmentEndAngle = Math.PI * 3/2; // Full circle ending at 12 o'clock
            
            if (year > eventYear) {
              // If not the start year, begin at 12 o'clock
              segmentStartAngle = -Math.PI/2;
            }
            
            if (year === endYear) {
              // If end year, use the actual end angle
              segmentEndAngle = endAngle;
            }
            
            drawEventArc(
              ctx,
              centerX,
              centerY,
              yearRadius,
              yearRadius,
              segmentStartAngle,
              segmentEndAngle,
              event.color,
              event.intensity
            );
          }
        }
      }
    });
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
    
    // Create a glow effect based on intensity
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
    // Handle reverse angles (when end is before start in the clock)
    if (endAngle < startAngle) {
      endAngle += Math.PI * 2;
    }
    
    // Calculate alpha based on intensity (1-10)
    const alpha = 0.2 + (intensity / 10) * 0.8;
    
    // Draw dust particles along the arc
    const particleCount = 20 + intensity * 10; // More particles for higher intensity
    drawDustForSegment(
      ctx,
      centerX, 
      centerY, 
      startRadius - 2, 
      endRadius + 2, 
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
      // Random position within the segment
      const randomAngle = startAngle + Math.random() * (endAngle - startAngle);
      const randomRadius = innerRadius + Math.random() * (outerRadius - innerRadius);
      
      const x = centerX + randomRadius * Math.cos(randomAngle);
      const y = centerY + randomRadius * Math.sin(randomAngle);
      
      // Random particle size based on position (smaller as we go outward)
      const sizeVariance = 1 - (randomRadius - innerRadius) / (outerRadius - innerRadius);
      const particleSize = 0.5 + Math.random() * 2 * sizeVariance;
      
      // Draw the particle
      ctx.beginPath();
      ctx.arc(x, y, particleSize, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha * Math.random(); // Vary opacity for dust effect
      ctx.fill();
    }
    ctx.globalAlpha = 1; // Reset opacity
  };
  
  // Draw future events as floating space debris
  const drawFutureEvents = (
    ctx: CanvasRenderingContext2D,
    futureEvents: TimeEvent[],
    width: number,
    height: number
  ) => {
    const now = Date.now() / 1000;
    
    futureEvents.forEach((event, index) => {
      // Create a pseudo-random position for each event based on event ID
      const idSum = event.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const seed = idSum / 1000;
      
      // Drift motion
      const xOffset = Math.sin(now * 0.1 + seed * 10) * 20;
      const yOffset = Math.cos(now * 0.08 + seed * 5) * 15;
      
      // Position in the upper half of the screen
      const x = (width * 0.3) + (width * 0.4 * ((seed * 7) % 1)) + xOffset;
      const y = (height * 0.2) + (height * 0.3 * ((seed * 13) % 1)) + yOffset;
      
      // Pulsing size based on intensity
      const baseSize = 2 + event.intensity * 0.8;
      const pulseSize = baseSize * (0.7 + 0.3 * Math.sin(now * 0.5 + seed * 20));
      
      // Draw a glowing orb
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 3);
      gradient.addColorStop(0, event.color);
      gradient.addColorStop(0.5, `${event.color}40`); // 25% opacity
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.beginPath();
      ctx.arc(x, y, pulseSize * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw a core
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = event.color;
      ctx.globalAlpha = 0.7 + 0.3 * Math.sin(now * 0.7 + seed * 15);
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Draw title if hovering near
      if (pulseSize > baseSize * 0.9) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(event.title, x, y + pulseSize * 4);
        
        // Draw year
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '8px Arial';
        ctx.fillText(event.startDate.getFullYear().toString(), x, y + pulseSize * 5.5);
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate center
    const centerX = config.centerX || canvas.width / 2;
    const centerY = config.centerY || canvas.height / 2;

    // Calculate radius and angle from center
    const dx = x - centerX;
    const dy = y - centerY;
    const radius = Math.sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx);
    
    // Adjust angle to start from 12 o'clock position (negative PI/2)
    angle = (angle + Math.PI * 2.5) % (Math.PI * 2);
    
    // Calculate month based on clock-like position (0-11)
    const month = Math.floor((angle / (Math.PI * 2)) * 12);

    // Determine which year ring was clicked based on radius
    if (visibleYears.length > 0) {
      // Calculate which year based on radius relative to visible years
      const yearRange = visibleYears.length - 1;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.45;
      const initialRadius = 50 * config.zoom;
      const radiusStep = yearRange > 0 ? (maxRadius - initialRadius) / yearRange : 0;
      
      // Find the closest year based on radius
      let closestYearIndex = Math.round((radius - initialRadius) / radiusStep);
      closestYearIndex = Math.max(0, Math.min(closestYearIndex, visibleYears.length - 1));
      
      const year = visibleYears[closestYearIndex];
      onSpiralClick(year, month, x, y);
    } else {
      // Default to current year if no visible years
      onSpiralClick(new Date().getFullYear(), month, x, y);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 cursor-pointer"
      onClick={handleCanvasClick}
    />
  );
};

export default SpiralVisualization;
