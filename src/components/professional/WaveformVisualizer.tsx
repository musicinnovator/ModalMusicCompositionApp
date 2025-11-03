/**
 * WaveformVisualizer Component
 * Professional real-time waveform visualization inspired by MOTU hardware
 * Features: Multiple display styles, animation, peak detection
 */

import { useRef, useEffect, useState } from 'react';

export type WaveformStyle = 'line' | 'filled' | 'bars' | 'mirror';
export type WaveformColorScheme = 'cyan' | 'green' | 'blue' | 'rainbow';

export interface WaveformVisualizerProps {
  audioData?: number[]; // -1 to 1
  style?: WaveformStyle;
  colorScheme?: WaveformColorScheme;
  width?: number;
  height?: number;
  showPeaks?: boolean;
  animated?: boolean;
}

const COLORS: Record<WaveformColorScheme, string[]> = {
  cyan: ['#00d4ff'],
  green: ['#00ff88'],
  blue: ['#4a9eff'],
  rainbow: ['#ff0080', '#ff8000', '#ffff00', '#00ff80', '#0080ff', '#8000ff']
};

export function WaveformVisualizer({
  audioData,
  style = 'filled',
  colorScheme = 'cyan',
  width = 600,
  height = 150,
  showPeaks = true,
  animated = true
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [peaks, setPeaks] = useState<number[]>([]);
  const phaseRef = useRef(0);
  
  // Generate default audio data if not provided
  const generateAudioData = () => {
    const data: number[] = [];
    const samples = 200;
    
    for (let i = 0; i < samples; i++) {
      const t = (i / samples) * Math.PI * 4 + phaseRef.current;
      const sine = Math.sin(t) * 0.7;
      const noise = (Math.random() - 0.5) * 0.1;
      data.push(sine + noise);
    }
    
    return data;
  };
  
  const data = audioData || generateAudioData();
  
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
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let y = 0; y <= height; y += height / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Center line
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      
      const currentData = animated ? generateAudioData() : data;
      const colors = COLORS[colorScheme];
      const step = width / currentData.length;
      
      // Detect peaks
      if (showPeaks) {
        const newPeaks: number[] = [];
        currentData.forEach((value, i) => {
          if (Math.abs(value) > 0.8) {
            newPeaks.push(i);
          }
        });
        setPeaks(newPeaks);
      }
      
      // Draw waveform based on style
      switch (style) {
        case 'line':
          drawLineWaveform(ctx, currentData, colors, step);
          break;
        case 'filled':
          drawFilledWaveform(ctx, currentData, colors, step);
          break;
        case 'bars':
          drawBarsWaveform(ctx, currentData, colors, step);
          break;
        case 'mirror':
          drawMirrorWaveform(ctx, currentData, colors, step);
          break;
      }
      
      // Draw peak indicators
      if (showPeaks && peaks.length > 0) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        peaks.forEach(peakIndex => {
          const x = peakIndex * step;
          ctx.fillRect(x - 1, 0, 2, height);
        });
      }
      
      if (animated) {
        phaseRef.current += 0.05;
        animationRef.current = requestAnimationFrame(draw);
      }
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, style, colorScheme, width, height, showPeaks, animated, peaks]);
  
  const drawLineWaveform = (
    ctx: CanvasRenderingContext2D,
    data: number[],
    colors: string[],
    step: number
  ) => {
    const color = colors[0];
    
    // Glow layers
    const drawWave = (lineWidth: number, blur: number) => {
      ctx.filter = blur > 0 ? `blur(${blur}px)` : 'none';
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      data.forEach((value, i) => {
        const x = i * step;
        const y = height / 2 - (value * height / 2) * 0.8;
        
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
  
  const drawFilledWaveform = (
    ctx: CanvasRenderingContext2D,
    data: number[],
    colors: string[],
    step: number
  ) => {
    const color = colors[0];
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color.replace(')', ', 0.4)').replace('rgb', 'rgba'));
    gradient.addColorStop(0.5, color.replace(')', ', 0.2)').replace('rgb', 'rgba'));
    gradient.addColorStop(1, color.replace(')', ', 0.4)').replace('rgb', 'rgba'));
    
    ctx.filter = 'none';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    
    data.forEach((value, i) => {
      const x = i * step;
      const y = height / 2 - (value * height / 2) * 0.8;
      ctx.lineTo(x, y);
    });
    
    ctx.lineTo(width, height / 2);
    ctx.closePath();
    ctx.fill();
    
    // Draw line on top
    drawLineWaveform(ctx, data, colors, step);
  };
  
  const drawBarsWaveform = (
    ctx: CanvasRenderingContext2D,
    data: number[],
    colors: string[],
    step: number
  ) => {
    data.forEach((value, i) => {
      const x = i * step;
      const barHeight = Math.abs(value) * (height / 2) * 0.8;
      const y = height / 2 - barHeight / 2;
      
      const colorIndex = colorScheme === 'rainbow' 
        ? Math.floor((i / data.length) * colors.length) 
        : 0;
      const color = colors[colorIndex];
      
      // Glow
      ctx.filter = 'blur(2px)';
      ctx.fillStyle = color.replace(')', ', 0.6)').replace('rgb', 'rgba');
      ctx.fillRect(x, y - 2, step * 0.8, barHeight + 4);
      
      // Bar
      ctx.filter = 'none';
      ctx.fillStyle = color;
      ctx.fillRect(x, y, step * 0.8, barHeight);
    });
  };
  
  const drawMirrorWaveform = (
    ctx: CanvasRenderingContext2D,
    data: number[],
    colors: string[],
    step: number
  ) => {
    const color = colors[0];
    
    // Top half
    const gradient1 = ctx.createLinearGradient(0, 0, 0, height / 2);
    gradient1.addColorStop(0, color.replace(')', ', 0.1)').replace('rgb', 'rgba'));
    gradient1.addColorStop(1, color.replace(')', ', 0.4)').replace('rgb', 'rgba'));
    
    ctx.filter = 'none';
    ctx.fillStyle = gradient1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    
    data.forEach((value, i) => {
      const x = i * step;
      const y = height / 2 - (Math.abs(value) * height / 2) * 0.8;
      ctx.lineTo(x, y);
    });
    
    ctx.lineTo(width, height / 2);
    ctx.closePath();
    ctx.fill();
    
    // Bottom half (mirror)
    const gradient2 = ctx.createLinearGradient(0, height / 2, 0, height);
    gradient2.addColorStop(0, color.replace(')', ', 0.4)').replace('rgb', 'rgba'));
    gradient2.addColorStop(1, color.replace(')', ', 0.1)').replace('rgb', 'rgba'));
    
    ctx.fillStyle = gradient2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    
    data.forEach((value, i) => {
      const x = i * step;
      const y = height / 2 + (Math.abs(value) * height / 2) * 0.8;
      ctx.lineTo(x, y);
    });
    
    ctx.lineTo(width, height / 2);
    ctx.closePath();
    ctx.fill();
    
    // Center line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.filter = 'blur(2px)';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };
  
  return (
    <div className="inline-block">
      <canvas
        ref={canvasRef}
        className="rounded-lg bg-black border-2 border-slate-800 shadow-2xl"
        style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 2px 8px rgba(0,0,0,0.8)' }}
      />
    </div>
  );
}

export default WaveformVisualizer;
