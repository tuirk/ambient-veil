
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
    const initialRadius = 50 * config.zoom; // Initial radius - renamed to avoid conflict
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.45; // Max radius

    // Draw base spiral (faint gray background)
    drawBaseSpiral(
      ctx,
      centerX,
      centerY,
      initialRadius,
      spiralSpacing,
      totalYears,
      maxRadius
    );

    // Draw events on spiral
    drawEvents(
      ctx,
      events,
      centerX,
      centerY,
      initialRadius, // Pass initialRadius instead of startRadius
      spiralSpacing,
      config.startYear,
      maxRadius
    );
  }, [dimensions, events, config]);

  // Helper functions for drawing
  const drawBaseSpiral = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    startRadius: number,
    spiralSpacing: number,
    totalYears: number,
    maxRadius: number
  ) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    // Draw spiral outline
    ctx.beginPath();
    const totalAngles = totalYears * 2 * Math.PI;
    const angleStep = 0.05; // Small steps for smooth curve

    for (let angle = 0; angle <= totalAngles; angle += angleStep) {
      const radius = startRadius + (spiralSpacing * angle) / (2 * Math.PI);
      if (radius > maxRadius) break;

      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw month dividers
    for (let year = 0; year < totalYears; year++) {
      for (let month = 0; month < 12; month++) {
        const angle = year * 2 * Math.PI + (month / 12) * 2 * Math.PI;
        const nextAngle = year * 2 * Math.PI + ((month + 1) / 12) * 2 * Math.PI;
        const innerRadius = startRadius + (spiralSpacing * angle) / (2 * Math.PI);
        const outerRadius = startRadius + (spiralSpacing * nextAngle) / (2 * Math.PI);

        if (outerRadius > maxRadius) break;

        // Draw faint radial lines for months
        if (month % 3 === 0) { // Draw only quarterly for less clutter
          const x1 = centerX + innerRadius * Math.cos(angle);
          const y1 = centerY + innerRadius * Math.sin(angle);
          const x2 = centerX + outerRadius * Math.cos(angle);
          const y2 = centerY + outerRadius * Math.sin(angle);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          ctx.stroke();
        }

        // Draw month particles - subtle dust in the background
        drawDustForSegment(
          ctx, 
          centerX, 
          centerY, 
          innerRadius, 
          outerRadius, 
          angle, 
          nextAngle, 
          "rgba(255, 255, 255, 0.1)",
          3 // fewer particles for empty sections
        );
      }
    }
  };

  const drawEvents = (
    ctx: CanvasRenderingContext2D,
    events: TimeEvent[],
    centerX: number,
    centerY: number,
    initialRadius: number, // Renamed parameter to avoid conflict
    spiralSpacing: number,
    startYear: number,
    maxRadius: number
  ) => {
    events.forEach((event) => {
      const startYearDiff = event.startDate.getFullYear() - startYear;
      const startMonth = event.startDate.getMonth();
      
      const startAngle = startYearDiff * 2 * Math.PI + (startMonth / 12) * 2 * Math.PI;
      
      if (!event.endDate) {
        // Single point event
        const radius = initialRadius + (spiralSpacing * startAngle) / (2 * Math.PI);
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
        const endYearDiff = event.endDate.getFullYear() - startYear;
        const endMonth = event.endDate.getMonth();
        const endAngle = endYearDiff * 2 * Math.PI + (endMonth / 12) * 2 * Math.PI;
        
        const startRadius = initialRadius + (spiralSpacing * startAngle) / (2 * Math.PI);
        const endRadius = initialRadius + (spiralSpacing * endAngle) / (2 * Math.PI);
        
        if (startRadius <= maxRadius || endRadius <= maxRadius) {
          drawEventArc(
            ctx,
            centerX,
            centerY,
            startRadius,
            endRadius,
            startAngle,
            endAngle,
            spiralSpacing,
            event.color,
            event.intensity
          );
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
    if (angle < 0) angle += 2 * Math.PI; // Convert to 0-2π range

    // Calculate year and month based on angle and radius
    const spiralSpacing = 30 * config.zoom;
    const startRadius = 50 * config.zoom;

    // Calculate which spiral loop we're on (year)
    const yearOffset = Math.floor((radius - startRadius) / spiralSpacing);
    const year = config.startYear + yearOffset;

    // Calculate position within the loop (month)
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
