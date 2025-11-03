/**
 * LEDRingKnob Component
 * Professional knob with LED ring indicator inspired by MOTU hardware
 * Features: Mouse drag control, LED ring animation, center value display
 */

import { useState, useRef, useEffect } from 'react';

export type LEDColorScheme = 'cyan' | 'green' | 'blue' | 'red' | 'amber' | 'purple';

export interface LEDRingKnobProps {
  value?: number; // 0-100
  onChange?: (value: number) => void;
  label?: string;
  colorScheme?: LEDColorScheme;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

const COLOR_SCHEMES: Record<LEDColorScheme, { led: string; glow: string; text: string }> = {
  cyan: { led: '#00d4ff', glow: 'rgba(0, 212, 255, 0.6)', text: '#00d4ff' },
  green: { led: '#00ff88', glow: 'rgba(0, 255, 136, 0.6)', text: '#00ff88' },
  blue: { led: '#4a9eff', glow: 'rgba(74, 158, 255, 0.6)', text: '#4a9eff' },
  red: { led: '#ff4a6e', glow: 'rgba(255, 74, 110, 0.6)', text: '#ff4a6e' },
  amber: { led: '#ffaa00', glow: 'rgba(255, 170, 0, 0.6)', text: '#ffaa00' },
  purple: { led: '#aa00ff', glow: 'rgba(170, 0, 255, 0.6)', text: '#aa00ff' }
};

const SIZE_CONFIGS = {
  small: { knob: 48, ring: 60, led: 2, fontSize: 10 },
  medium: { knob: 64, ring: 80, led: 3, fontSize: 12 },
  large: { knob: 80, ring: 100, led: 4, fontSize: 14 }
};

export function LEDRingKnob({
  value = 50,
  onChange,
  label = 'KNOB',
  colorScheme = 'cyan',
  size = 'medium',
  showValue = true,
  min = 0,
  max = 100,
  step = 1
}: LEDRingKnobProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);
  const colors = COLOR_SCHEMES[colorScheme];
  const sizes = SIZE_CONFIGS[size];
  
  useEffect(() => {
    setInternalValue(value);
  }, [value]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = internalValue;
    e.preventDefault();
  };
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY;
      const sensitivity = 0.5;
      const newValue = Math.max(min, Math.min(max, startValueRef.current + deltaY * sensitivity));
      const steppedValue = Math.round(newValue / step) * step;
      setInternalValue(steppedValue);
      onChange?.(steppedValue);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, step, onChange]);
  
  const normalizedValue = (internalValue - min) / (max - min);
  const angle = -135 + (normalizedValue * 270); // -135° to +135°
  const ledCount = 40;
  const activeLEDs = Math.round(normalizedValue * ledCount);
  
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label */}
      {label && (
        <div className="text-[10px] tracking-widest opacity-60 uppercase">
          {label}
        </div>
      )}
      
      {/* Knob with LED Ring */}
      <div 
        className="relative cursor-ns-resize select-none"
        style={{ width: sizes.ring, height: sizes.ring }}
        onMouseDown={handleMouseDown}
      >
        {/* LED Ring */}
        <svg 
          className="absolute inset-0"
          viewBox="0 0 100 100"
          style={{ width: sizes.ring, height: sizes.ring }}
        >
          {Array.from({ length: ledCount }).map((_, i) => {
            const ledAngle = -135 + (i / ledCount) * 270;
            const isActive = i < activeLEDs;
            const radians = (ledAngle * Math.PI) / 180;
            const radius = 45;
            const x = 50 + radius * Math.cos(radians);
            const y = 50 + radius * Math.sin(radians);
            
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={sizes.led}
                fill={isActive ? colors.led : '#333'}
                opacity={isActive ? 1 : 0.3}
                style={{
                  filter: isActive ? `drop-shadow(0 0 ${sizes.led * 2}px ${colors.glow})` : 'none'
                }}
              />
            );
          })}
        </svg>
        
        {/* Knob body */}
        <div 
          className="absolute inset-0 m-auto rounded-full bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 shadow-2xl"
          style={{ 
            width: sizes.knob, 
            height: sizes.knob,
            boxShadow: isDragging 
              ? `0 0 20px ${colors.glow}, inset 0 2px 4px rgba(0,0,0,0.5)` 
              : 'inset 0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {/* Knob indicator line */}
          <div
            className="absolute inset-0"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <div 
              className="absolute top-1 left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: sizes.led * 1.5,
                height: sizes.knob * 0.3,
                backgroundColor: colors.led,
                boxShadow: `0 0 ${sizes.led * 3}px ${colors.glow}`
              }}
            />
          </div>
          
          {/* Center circle */}
          <div className="absolute inset-0 m-auto w-2/3 h-2/3 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 shadow-inner" />
          
          {/* Value display */}
          {showValue && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ 
                fontSize: sizes.fontSize,
                color: colors.text,
                textShadow: `0 0 ${sizes.led * 2}px ${colors.glow}`
              }}
            >
              {Math.round(internalValue)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LEDRingKnob;
