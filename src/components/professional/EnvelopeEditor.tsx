/**
 * EnvelopeEditor Component
 * Professional ADSR envelope editor inspired by MOTU Proton
 * Features: Draggable points, visual feedback, multiple color schemes
 */

import { useState, useRef, useEffect } from 'react';

export interface ADSREnvelope {
  attack: number;   // 0-1
  decay: number;    // 0-1
  sustain: number;  // 0-1
  release: number;  // 0-1
}

export interface EnvelopeEditorProps {
  envelope?: ADSREnvelope;
  onChange?: (envelope: ADSREnvelope) => void;
  colorScheme?: 'cyan' | 'green' | 'blue' | 'purple';
  width?: number;
  height?: number;
  showLabels?: boolean;
}

const COLORS = {
  cyan: { fill: 'rgba(0, 212, 255, 0.2)', stroke: '#00d4ff', glow: 'rgba(0, 212, 255, 0.6)' },
  green: { fill: 'rgba(0, 255, 136, 0.2)', stroke: '#00ff88', glow: 'rgba(0, 255, 136, 0.6)' },
  blue: { fill: 'rgba(74, 158, 255, 0.2)', stroke: '#4a9eff', glow: 'rgba(74, 158, 255, 0.6)' },
  purple: { fill: 'rgba(170, 0, 255, 0.2)', stroke: '#aa00ff', glow: 'rgba(170, 0, 255, 0.6)' }
};

export function EnvelopeEditor({
  envelope = { attack: 0.2, decay: 0.3, sustain: 0.7, release: 0.4 },
  onChange,
  colorScheme = 'cyan',
  width = 400,
  height = 200,
  showLabels = true
}: EnvelopeEditorProps) {
  const [env, setEnv] = useState<ADSREnvelope>(envelope);
  const [dragging, setDragging] = useState<keyof ADSREnvelope | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<keyof ADSREnvelope | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = COLORS[colorScheme];
  
  useEffect(() => {
    setEnv(envelope);
  }, [envelope]);
  
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
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= width; x += width / 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += height / 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Calculate envelope points
    const padding = 40;
    const w = width - padding * 2;
    const h = height - padding;
    
    const points = {
      start: { x: padding, y: height - padding },
      attack: { x: padding + w * env.attack, y: padding },
      decay: { x: padding + w * (env.attack + env.decay), y: padding + h * (1 - env.sustain) },
      sustain: { x: padding + w * (env.attack + env.decay + 0.3), y: padding + h * (1 - env.sustain) },
      release: { x: width - padding, y: height - padding }
    };
    
    // Draw envelope curve with glow
    const drawEnvelope = (lineWidth: number, blur: number) => {
      ctx.filter = blur > 0 ? `blur(${blur}px)` : 'none';
      ctx.beginPath();
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      // Attack
      ctx.moveTo(points.start.x, points.start.y);
      ctx.lineTo(points.attack.x, points.attack.y);
      
      // Decay
      ctx.lineTo(points.decay.x, points.decay.y);
      
      // Sustain
      ctx.lineTo(points.sustain.x, points.sustain.y);
      
      // Release
      ctx.lineTo(points.release.x, points.release.y);
      
      ctx.stroke();
    };
    
    // Fill area under curve
    ctx.filter = 'none';
    ctx.fillStyle = colors.fill;
    ctx.beginPath();
    ctx.moveTo(points.start.x, points.start.y);
    ctx.lineTo(points.attack.x, points.attack.y);
    ctx.lineTo(points.decay.x, points.decay.y);
    ctx.lineTo(points.sustain.x, points.sustain.y);
    ctx.lineTo(points.release.x, points.release.y);
    ctx.lineTo(points.release.x, height - padding);
    ctx.closePath();
    ctx.fill();
    
    // Draw glow layers
    drawEnvelope(6, 4);
    drawEnvelope(3, 2);
    ctx.filter = 'none';
    drawEnvelope(2, 0);
    
    // Draw control points
    const drawPoint = (key: keyof ADSREnvelope, point: { x: number; y: number }) => {
      const isHovered = hoveredPoint === key;
      const isDragged = dragging === key;
      const radius = isDragged ? 8 : isHovered ? 7 : 6;
      
      // Glow
      if (isHovered || isDragged) {
        ctx.filter = 'blur(4px)';
        ctx.fillStyle = colors.glow;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius + 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.filter = 'none';
      
      // Outer ring
      ctx.fillStyle = colors.stroke;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner circle
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius - 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Center dot
      ctx.fillStyle = colors.stroke;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      ctx.fill();
    };
    
    drawPoint('attack', points.attack);
    drawPoint('decay', points.decay);
    drawPoint('sustain', points.sustain);
    drawPoint('release', points.release);
    
    // Draw labels
    if (showLabels) {
      ctx.fillStyle = colors.stroke;
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      
      ctx.fillText('A', points.attack.x, points.attack.y - 15);
      ctx.fillText('D', points.decay.x, points.decay.y - 15);
      ctx.fillText('S', points.sustain.x, points.sustain.y - 15);
      ctx.fillText('R', points.release.x - 20, points.release.y - 10);
    }
    
  }, [env, dragging, hoveredPoint, width, height, showLabels, colors]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const padding = 40;
    const w = width - padding * 2;
    const h = height - padding;
    
    const points = {
      attack: { x: padding + w * env.attack, y: padding },
      decay: { x: padding + w * (env.attack + env.decay), y: padding + h * (1 - env.sustain) },
      sustain: { x: padding + w * (env.attack + env.decay + 0.3), y: padding + h * (1 - env.sustain) },
      release: { x: width - padding, y: height - padding }
    };
    
    // Check if clicking on a control point
    for (const [key, point] of Object.entries(points)) {
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
      if (distance < 10) {
        setDragging(key as keyof ADSREnvelope);
        break;
      }
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (dragging) {
      const padding = 40;
      const w = width - padding * 2;
      const h = height - padding;
      
      const newEnv = { ...env };
      
      switch (dragging) {
        case 'attack':
          newEnv.attack = Math.max(0, Math.min(1, (x - padding) / w));
          break;
        case 'decay':
          newEnv.decay = Math.max(0, Math.min(1, (x - padding - w * env.attack) / w));
          break;
        case 'sustain':
          newEnv.sustain = Math.max(0, Math.min(1, 1 - (y - padding) / h));
          break;
        case 'release':
          newEnv.release = Math.max(0, Math.min(1, (width - padding - x) / w));
          break;
      }
      
      setEnv(newEnv);
      onChange?.(newEnv);
    } else {
      // Check hover
      const padding = 40;
      const w = width - padding * 2;
      const h = height - padding;
      
      const points = {
        attack: { x: padding + w * env.attack, y: padding },
        decay: { x: padding + w * (env.attack + env.decay), y: padding + h * (1 - env.sustain) },
        sustain: { x: padding + w * (env.attack + env.decay + 0.3), y: padding + h * (1 - env.sustain) },
        release: { x: width - padding, y: height - padding }
      };
      
      let found = false;
      for (const [key, point] of Object.entries(points)) {
        const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
        if (distance < 10) {
          setHoveredPoint(key as keyof ADSREnvelope);
          found = true;
          break;
        }
      }
      
      if (!found) {
        setHoveredPoint(null);
      }
    }
  };
  
  const handleMouseUp = () => {
    setDragging(null);
  };
  
  return (
    <div className="inline-block">
      <canvas
        ref={canvasRef}
        className="rounded-lg bg-black border-2 border-slate-800 shadow-2xl cursor-crosshair"
        style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 2px 8px rgba(0,0,0,0.8)' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}

export default EnvelopeEditor;
