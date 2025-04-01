
import React, { useEffect, useRef, useState } from "react";
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

  // Helper function to get position on spiral
  const getSpiralPosition = (
    year: number,
    month: number,
    day: number = 15,
    startYear: number,
    startRadius: number,
    spiralSpacing: number
  ) => {
    // Calculate years since start
    const yearsSinceStart = year - startYear;
    
    // Calculate progress in the year (0-1)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthProgress = day / daysInMonth;
    const yearProgress = (month + monthProgress) / 12;
    
    // Calculate total angle - Start at 12 o'clock (Math.PI/2) and go clockwise
    // In the canvas coordinate system, 0 angle is at 3 o'clock and positive rotation is clockwise
    // So to start at 12 o'clock, we offset by -Math.PI/2
    const totalAngle = yearsSinceStart * 2 * Math.PI + yearProgress * 2 * Math.PI - Math.PI/2;
    
    // Calculate radius
    const radius = startRadius + spiralSpacing * yearsSinceStart + (spiralSpacing * yearProgress);
    
    return { angle: totalAngle, radius };
  };

  // Draw the spiral
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Center point
    const centerX = config.centerX || canvas.width / 2;
    const centerY = config.centerY || canvas.height / 2;

    // Calculate total years to display
    const totalYears = config.currentYear - config.startYear + 1;

    // Spiral parameters
    const spiralSpacing = 30 * config.zoom; // Space between spiral loops
    const startRadius = 50 * config.zoom; // Initial radius
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.45; // Max radius

    // Draw base spiral (faint gray background)
    drawBaseSpiral(
      ctx,
      centerX,
      centerY,
      startRadius,
      spiralSpacing,
      totalYears,
      maxRadius,
      config.startYear
    );

    // Draw events on spiral
    drawEvents(
      ctx,
      events,
      centerX,
      centerY,
      startRadius,
      spiralSpacing,
      config.startYear,
      maxRadius
    );

    // Add month markers (clock-like)
    drawMonthMarkers(
      ctx, 
      centerX, 
      centerY, 
      startRadius, 
      spiralSpacing, 
      totalYears,
      config.startYear,
      maxRadius
    );

    // Add ambient particles
    drawAmbientParticles(ctx, canvas.width, canvas.height);
  }, [dimensions, events, config]);

  // Helper functions for drawing
  const drawBaseSpiral = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    startRadius: number,
    spiralSpacing: number,
    totalYears: number,
    maxRadius: number,
    startYear: number
  ) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    // Draw spiral outline
    ctx.beginPath();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    // Steps for smooth curve
    const stepsPerYear = 100;
    
    // Draw from start year to current date
    for (let yearStep = 0; yearStep <= totalYears * stepsPerYear; yearStep++) {
      const progress = yearStep / stepsPerYear;
      const year = startYear + Math.floor(progress);
      const yearFraction = progress % 1;
      const month = Math.floor(yearFraction * 12);
      const monthFraction = (yearFraction * 12) % 1;
      const day = Math.floor(monthFraction * 30) + 1; // approximate
      
      // If beyond current date, stop drawing
      if (year > currentYear || (year === currentYear && month > currentMonth) || 
          (year === currentYear && month === currentMonth && day > currentDay)) {
        break;
      }
      
      const { angle, radius } = getSpiralPosition(
        year, month, day, startYear, startRadius, spiralSpacing
      );
      
      if (radius > maxRadius) break;

      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      if (yearStep === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  const drawMonthMarkers = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    startRadius: number,
    spiralSpacing: number,
    totalYears: number,
    startYear: number,
    maxRadius: number
  ) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Draw month markers for all years
    for (let yearOffset = 0; yearOffset < totalYears; yearOffset++) {
      const year = startYear + yearOffset;
      if (year > currentYear) break;
      
      // Draw month markers
      for (let month = 0; month < 12; month++) {
        // Skip months beyond current month in current year
        if (year === currentYear && month > now.getMonth()) break;
        
        const { angle, radius } = getSpiralPosition(
          year, month, 15, startYear, startRadius, spiralSpacing
        );
        
        if (radius > maxRadius) continue;
        
        const innerX = centerX + (radius - 5) * Math.cos(angle);
        const innerY = centerY + (radius - 5) * Math.sin(angle);
        const outerX = centerX + (radius + 5) * Math.cos(angle);
        const outerY = centerY + (radius + 5) * Math.sin(angle);
        
        // Draw month marker line
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw month label for quarter months
        if (month % 3 === 0) {
          const labelX = centerX + (radius + 15) * Math.cos(angle);
          const labelY = centerY + (radius + 15) * Math.sin(angle);
          
          const monthNames = ["Jan", "Apr", "Jul", "Oct"];
          const monthIndex = month / 3;
          
          ctx.font = "10px Arial";
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(monthNames[monthIndex], labelX, labelY);
        }
      }
    }
  };

  const drawEvents = (
    ctx: CanvasRenderingContext2D,
    events: TimeEvent[],
    centerX: number,
    centerY: number,
    startRadius: number,
    spiralSpacing: number,
    startYear: number,
    maxRadius: number
  ) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    events.forEach((event) => {
      const eventYear = event.startDate.getFullYear();
      const eventMonth = event.startDate.getMonth();
      const eventDay = event.startDate.getDate();
      
      // Handle future events differently
      if (eventYear > currentYear) {
        // Draw as floating debris
        drawFutureEvent(ctx, centerX, centerY, event);
        return;
      }
      
      // Get position on spiral
      const { angle, radius } = getSpiralPosition(
        eventYear, 
        eventMonth, 
        eventDay, 
        startYear, 
        startRadius, 
        spiralSpacing
      );
      
      if (radius > maxRadius) return; // Skip if outside visible range
      
      if (!event.endDate) {
        // Single point event
        drawEventPoint(
          ctx,
          centerX,
          centerY,
          radius,
          angle,
          event.color,
          event.intensity
        );
      } else {
        // Duration event
        const endYear = event.endDate.getFullYear();
        const endMonth = event.endDate.getMonth();
        const endDay = event.endDate.getDate();
        
        const endPos = getSpiralPosition(
          endYear,
          endMonth,
          endDay,
          startYear,
          startRadius,
          spiralSpacing
        );
        
        drawEventArc(
          ctx,
          centerX,
          centerY,
          radius,
          endPos.radius,
          angle,
          endPos.angle,
          spiralSpacing,
          event.color,
          event.intensity
        );
      }
    });
  };

  const drawFutureEvent = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    event: TimeEvent
  ) => {
    // Calculate random position around the edge of the spiral
    const angle = Math.random() * Math.PI * 2;
    const distanceFromCenter = 100 + Math.random() * 200; // Random distance
    
    const x = centerX + distanceFromCenter * Math.cos(angle);
    const y = centerY + distanceFromCenter * Math.sin(angle);
    
    // Create a glow effect based on intensity
    const glowSize = 3 + event.intensity * 1.5;
    const glowOpacity = 0.3 + event.intensity * 0.07;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
    gradient.addColorStop(0, event.color);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    
    ctx.beginPath();
    ctx.arc(x, y, glowSize, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.globalAlpha = glowOpacity;
    ctx.fill();
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
    spiralSpacing: number,
    color: string,
    intensity: number
  ) => {
    // Calculate alpha based on intensity (1-10)
    const alpha = 0.2 + (intensity / 10) * 0.8;
    
    // Draw dust particles along the arc
    const particleCount = 20 + intensity * 10; // More particles for higher intensity
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
      // Calculate angles correctly to handle wrap-around
      let effectiveStartAngle = startAngle;
      let effectiveEndAngle = endAngle;
      
      // Make sure end angle is greater than start angle for interpolation
      if (effectiveEndAngle < effectiveStartAngle) {
        effectiveEndAngle += 2 * Math.PI;
      }
      
      // Random position within the segment
      const randomAngle = effectiveStartAngle + Math.random() * (effectiveEndAngle - effectiveStartAngle);
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

  const drawAmbientParticles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const particleCount = 200; // Increase for higher particle density
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 0.5 + Math.random() * 1.5;
      const opacity = 0.1 + Math.random() * 0.3;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
      ctx.fill();
    }
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
    
    // Get angle in proper clock-like direction
    // In canvas, 0 is at 3 o'clock and positive angles go clockwise
    // Convert to have 0 at 12 o'clock
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2 * Math.PI;
    
    // Adjust to have January at 12 o'clock
    angle = (angle + Math.PI/2) % (2 * Math.PI);
    
    // Calculate year and month based on angle and radius
    const spiralSpacing = 30 * config.zoom;
    const startRadius = 50 * config.zoom;

    // Calculate which spiral loop we're on (year)
    const yearOffset = Math.floor((radius - startRadius) / spiralSpacing);
    const year = config.startYear + yearOffset;

    // Calculate position within the loop (month)
    // Since our spiral has January at 12 o'clock, we need to calculate month appropriately
    const yearAngle = angle % (2 * Math.PI);
    const month = Math.floor((yearAngle / (2 * Math.PI)) * 12);

    onSpiralClick(year, month, x, y);
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
