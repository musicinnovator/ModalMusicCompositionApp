/**
 * OscilloscopeDisplay Component
 * Professional animated waveform display inspired by MOTU MX4
 * Features: Real-time animation, multiple waveforms, grid overlay
 */

import { useRef, useEffect, useState } from 'react';

export type OscilloscopeWaveform = 'sine' | 'square' | 'saw' | 'triangle' | 'noise';
export type OscilloscopeColorScheme = 'cyan' | 'green' | 'amber' | 'blue';

export interface OscilloscopeDisplayProps {
  waveform?: OscilloscopeWaveform;
  colorScheme?: OscilloscopeColorScheme;
  frequency?: number; // Hz
  amplitude?: number; // 0-1
  width?: number;
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
}

const COLORS: Record<OscilloscopeColorScheme, { trace: string; grid: string; glow: string }> = {
  cyan: { trace: '#00d4ff', grid: 'rgba(0, 212, 255, 0.2)', glow: '#00d4ff' },
  green: { trace: '#00ff88', grid: 'rgba(0, 255, 136, 0.2)', glow: '#00ff88' },
  amber: { trace: '#ffaa00', grid: 'rgba(255, 170, 0, 0.2)', glow: '#ffaa00' },
  blue: { trace: '#4a9eff', grid: 'rgba(74, 158, 255, 0.2)', glow: '#4a9eff' }
};

export function OscilloscopeDisplay({
  waveform = 'sine',
  colorScheme = 'cyan',
  frequency = 2,
  amplitude = 0.8,
  width = 400,
  height = 200,
  showGrid = true,
  animated = true
}: OscilloscopeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const phaseRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const colors = COLORS[colorScheme];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas resolution
    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(2, 2);
    
    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid
      if (showGrid) {
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let x = 0; x <= width; x += width / 10) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= height; y += height / 6) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        
        // Center line
        ctx.strokeStyle = colors.grid.replace('0.2', '0.4');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }
      
      // Generate waveform
      const points: [number, number][] = [];
      const samples = width * 2;
      
      for (let i = 0; i < samples; i++) {
        const x = (i / samples) * width;
        const phase = (i / samples) * Math.PI * 2 * frequency + phaseRef.current;
        let y = 0;
        
        switch (waveform) {
          case 'sine':
            y = Math.sin(phase);
            break;
          case 'square':
            y = Math.sin(phase) > 0 ? 1 : -1;
            break;
          case 'saw':
            y = 2 * ((phase / (Math.PI * 2)) % 1) - 1;
            break;
          case 'triangle':
            const sawValue = 2 * ((phase / (Math.PI * 2)) % 1) - 1;
            y = 2 * Math.abs(sawValue) - 1;
            break;
          case 'noise':
            y = Math.random() * 2 - 1;
            break;
        }
        
        y = y * amplitude * (height / 2 - 10) + height / 2;
        points.push([x, y]);
      }
      
      // Draw waveform with glow
      const drawWave = (lineWidth: number, opacity: number) => {
        ctx.beginPath();
        ctx.strokeStyle = colors.trace.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        points.forEach(([x, y], i) => {
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();
      };
      
      // Draw glow layers
      ctx.filter = `blur(${isHovered ? 8 : 4}px)`;
      drawWave(6, 0.3);
      ctx.filter = `blur(${isHovered ? 4 : 2}px)`;
      drawWave(4, 0.5);
      ctx.filter = 'none';
      drawWave(2, 1);
      
      // Animate phase
      if (animated) {
        phaseRef.current += 0.05;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [waveform, colorScheme, frequency, amplitude, width, height, showGrid, animated, isHovered, colors]);
  
  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        className="rounded-lg bg-black border-2 border-slate-800 shadow-2xl cursor-crosshair"
        style={{ 
          boxShadow: isHovered 
            ? `0 0 30px ${colors.glow}40` 
            : `0 0 15px ${colors.glow}20, inset 0 2px 8px rgba(0,0,0,0.8)`
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      {/* Corner labels */}
      <div className="absolute top-2 left-2 text-[10px] opacity-50 uppercase tracking-wide">
        {waveform}
      </div>
      <div className="absolute top-2 right-2 text-[10px] opacity-50 uppercase tracking-wide">
        {frequency.toFixed(1)} Hz
      </div>
    </div>
  );
}

export default OscilloscopeDisplay;
