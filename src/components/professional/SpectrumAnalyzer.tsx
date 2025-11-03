/**
 * SpectrumAnalyzer Component
 * Professional frequency spectrum analyzer inspired by MOTU hardware
 * Features: FFT visualization, multiple color schemes, peak detection
 */

import { useRef, useEffect, useState } from 'react';

export type SpectrumColorScheme = 'cyan' | 'green' | 'rainbow' | 'heat';
export type SpectrumStyle = 'bars' | 'line' | 'filled';

export interface SpectrumAnalyzerProps {
  audioData?: number[]; // Frequency magnitude data
  colorScheme?: SpectrumColorScheme;
  style?: SpectrumStyle;
  width?: number;
  height?: number;
  bars?: number;
  showPeaks?: boolean;
  showGrid?: boolean;
  animated?: boolean;
}

const COLOR_SCHEMES = {
  cyan: {
    colors: ['#00d4ff'],
    gradient: (ctx: CanvasRenderingContext2D, height: number) => {
      const g = ctx.createLinearGradient(0, height, 0, 0);
      g.addColorStop(0, '#00d4ff40');
      g.addColorStop(0.5, '#00d4ff');
      g.addColorStop(1, '#00ffff');
      return g;
    }
  },
  green: {
    colors: ['#00ff88'],
    gradient: (ctx: CanvasRenderingContext2D, height: number) => {
      const g = ctx.createLinearGradient(0, height, 0, 0);
      g.addColorStop(0, '#00ff8840');
      g.addColorStop(0.5, '#00ff88');
      g.addColorStop(1, '#00ffaa');
      return g;
    }
  },
  rainbow: {
    colors: ['#ff0080', '#ff8000', '#ffff00', '#00ff80', '#0080ff', '#8000ff'],
    gradient: (ctx: CanvasRenderingContext2D, height: number) => {
      const g = ctx.createLinearGradient(0, height, 0, 0);
      g.addColorStop(0, '#00ff88');
      g.addColorStop(0.5, '#ffaa00');
      g.addColorStop(0.8, '#ff6600');
      g.addColorStop(1, '#ff0000');
      return g;
    }
  },
  heat: {
    colors: ['#ff0000'],
    gradient: (ctx: CanvasRenderingContext2D, height: number) => {
      const g = ctx.createLinearGradient(0, height, 0, 0);
      g.addColorStop(0, '#00ff00');
      g.addColorStop(0.3, '#ffff00');
      g.addColorStop(0.6, '#ff8800');
      g.addColorStop(1, '#ff0000');
      return g;
    }
  }
};

export function SpectrumAnalyzer({
  audioData,
  colorScheme = 'cyan',
  style = 'bars',
  width = 600,
  height = 200,
  bars = 64,
  showPeaks = true,
  showGrid = true,
  animated = true
}: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const peaksRef = useRef<number[]>(Array(bars).fill(0));
  const peakHoldRef = useRef<number[]>(Array(bars).fill(0));
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate default spectrum data if not provided
  const generateSpectrumData = () => {
    const data: number[] = [];
    
    for (let i = 0; i < bars; i++) {
      // Simulate frequency response (lower frequencies have more energy)
      const baseLevel = Math.random() * 0.3;
      const freqFalloff = 1 - (i / bars) * 0.7;
      const value = (baseLevel + Math.random() * 0.7) * freqFalloff;
      data.push(value);
    }
    
    return data;
  };
  
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
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
        ctx.lineWidth = 0.5;
        
        // Horizontal lines (dB levels)
        for (let y = 0; y <= height; y += height / 10) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        
        // Vertical lines (frequency markers)
        const freqMarkers = [20, 100, 500, 1000, 5000, 10000, 20000];
        freqMarkers.forEach((freq, i) => {
          const x = (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * width;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
          
          // Frequency labels
          ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
          ctx.font = '8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(freq >= 1000 ? `${freq / 1000}k` : freq.toString(), x, height - 5);
        });
      }
      
      const currentData = animated ? generateSpectrumData() : (audioData || generateSpectrumData());
      const scheme = COLOR_SCHEMES[colorScheme];
      const barWidth = width / bars;
      const gap = barWidth * 0.2;
      
      // Update peaks
      currentData.forEach((value, i) => {
        if (value > peaksRef.current[i]) {
          peaksRef.current[i] = value;
          peakHoldRef.current[i] = 30; // Hold for 30 frames
        } else {
          if (peakHoldRef.current[i] > 0) {
            peakHoldRef.current[i]--;
          } else {
            peaksRef.current[i] *= 0.95; // Decay
          }
        }
      });
      
      // Draw spectrum based on style
      switch (style) {
        case 'bars':
          drawBarsSpectrum(ctx, currentData, scheme, barWidth, gap);
          break;
        case 'line':
          drawLineSpectrum(ctx, currentData, scheme, barWidth);
          break;
        case 'filled':
          drawFilledSpectrum(ctx, currentData, scheme, barWidth);
          break;
      }
      
      // Draw peaks
      if (showPeaks) {
        peaksRef.current.forEach((peak, i) => {
          const x = i * barWidth;
          const y = height - (peak * height);
          
          ctx.fillStyle = scheme.colors[0];
          ctx.shadowBlur = 4;
          ctx.shadowColor = scheme.colors[0];
          ctx.fillRect(x + gap / 2, y - 2, barWidth - gap, 2);
          ctx.shadowBlur = 0;
        });
      }
      
      if (animated) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData, colorScheme, style, width, height, bars, showPeaks, showGrid, animated, isHovered]);
  
  const drawBarsSpectrum = (
    ctx: CanvasRenderingContext2D,
    data: number[],
    scheme: typeof COLOR_SCHEMES.cyan,
    barWidth: number,
    gap: number
  ) => {
    data.forEach((value, i) => {
      const x = i * barWidth;
      const barHeight = value * height;
      const y = height - barHeight;
      
      let color;
      if (colorScheme === 'rainbow') {
        const colorIndex = Math.floor((i / data.length) * scheme.colors.length);
        color = scheme.colors[colorIndex];
      } else {
        color = scheme.gradient(ctx, height);
      }
      
      // Glow
      if (isHovered) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = typeof color === 'string' ? color : scheme.colors[0];
      } else {
        ctx.shadowBlur = 4;
        ctx.shadowColor = typeof color === 'string' ? color : scheme.colors[0];
      }
      
      ctx.fillStyle = color;
      ctx.fillRect(x + gap / 2, y, barWidth - gap, barHeight);
      ctx.shadowBlur = 0;
    });
  };
  
  const drawLineSpectrum = (
    ctx: CanvasRenderingContext2D,
    data: number[],
    scheme: typeof COLOR_SCHEMES.cyan,
    barWidth: number
  ) => {
    const drawWave = (lineWidth: number, blur: number) => {
      ctx.filter = blur > 0 ? `blur(${blur}px)` : 'none';
      ctx.beginPath();
      ctx.strokeStyle = scheme.colors[0];
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      data.forEach((value, i) => {
        const x = i * barWidth + barWidth / 2;
        const y = height - (value * height);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    };
    
    drawWave(6, 4);
    drawWave(3, 2);
    ctx.filter = 'none';
    drawWave(2, 0);
  };
  
  const drawFilledSpectrum = (
    ctx: CanvasRenderingContext2D,
    data: number[],
    scheme: typeof COLOR_SCHEMES.cyan,
    barWidth: number
  ) => {
    const gradient = scheme.gradient(ctx, height);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    data.forEach((value, i) => {
      const x = i * barWidth + barWidth / 2;
      const y = height - (value * height);
      ctx.lineTo(x, y);
    });
    
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
    
    // Draw line on top
    drawLineSpectrum(ctx, data, scheme, barWidth);
  };
  
  return (
    <div className="inline-block">
      <canvas
        ref={canvasRef}
        className="rounded-lg bg-black border-2 border-slate-800 shadow-2xl cursor-crosshair"
        style={{ 
          boxShadow: isHovered 
            ? '0 0 30px rgba(0, 212, 255, 0.3)' 
            : '0 0 20px rgba(0,0,0,0.5), inset 0 2px 8px rgba(0,0,0,0.8)' 
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    </div>
  );
}

export default SpectrumAnalyzer;
