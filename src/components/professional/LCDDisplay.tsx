/**
 * LCDDisplay Component
 * Professional segment-style LCD display inspired by MOTU hardware
 * Features: Multiple display modes, animated segments, cyan/green glow
 */

import { useState, useEffect } from 'react';

export type LCDDisplayMode = 'text' | 'numeric' | 'timecode' | 'level';
export type LCDColorScheme = 'cyan' | 'green' | 'amber' | 'red';

export interface LCDDisplayProps {
  content: string | number;
  mode?: LCDDisplayMode;
  colorScheme?: LCDColorScheme;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  showBorder?: boolean;
  // ADDITIVE: Flexible width control for Option C
  allowWrap?: boolean;
  minWidth?: string;
  maxWidth?: string;
}

const LCD_COLORS: Record<LCDColorScheme, { bg: string; text: string; glow: string }> = {
  cyan: { 
    bg: 'bg-slate-900', 
    text: '#00d4ff', 
    glow: '0 0 10px rgba(0, 212, 255, 0.8)' 
  },
  green: { 
    bg: 'bg-black', 
    text: '#00ff88', 
    glow: '0 0 10px rgba(0, 255, 136, 0.8)' 
  },
  amber: { 
    bg: 'bg-slate-900', 
    text: '#ffaa00', 
    glow: '0 0 10px rgba(255, 170, 0, 0.8)' 
  },
  red: { 
    bg: 'bg-slate-900', 
    text: '#ff4a6e', 
    glow: '0 0 10px rgba(255, 74, 110, 0.8)' 
  }
};

const SIZE_CONFIGS = {
  small: { height: 'h-8', padding: 'px-3 py-1', fontSize: 'text-sm', spacing: 'tracking-wider' },
  medium: { height: 'h-12', padding: 'px-4 py-2', fontSize: 'text-base', spacing: 'tracking-widest' },
  large: { height: 'h-16', padding: 'px-6 py-3', fontSize: 'text-xl', spacing: 'tracking-widest' }
};

export function LCDDisplay({
  content,
  mode = 'text',
  colorScheme = 'cyan',
  size = 'medium',
  animated = true,
  showBorder = true,
  // ADDITIVE: Default flexible settings for Option C
  allowWrap = false,
  minWidth = 'auto',
  maxWidth = 'full'
}: LCDDisplayProps) {
  const [displayContent, setDisplayContent] = useState<string>('');
  const [blink, setBlink] = useState(false);
  const colors = LCD_COLORS[colorScheme];
  const sizeConfig = SIZE_CONFIGS[size];
  
  useEffect(() => {
    // Format content based on mode
    let formatted = String(content);
    
    switch (mode) {
      case 'numeric':
        formatted = String(content).padStart(4, '0');
        break;
      case 'timecode':
        if (typeof content === 'number') {
          const mins = Math.floor(content / 60);
          const secs = Math.floor(content % 60);
          const frames = Math.floor((content % 1) * 100);
          formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(frames).padStart(2, '0')}`;
        }
        break;
      case 'level':
        if (typeof content === 'number') {
          const bars = Math.round((content / 100) * 20);
          formatted = '█'.repeat(bars) + '░'.repeat(20 - bars);
        }
        break;
    }
    
    setDisplayContent(formatted);
  }, [content, mode]);
  
  // Blink animation
  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      setBlink(prev => !prev);
    }, 500);
    
    return () => clearInterval(interval);
  }, [animated]);
  
  // ADDITIVE: Flexible width classes for Option C
  const widthClasses = `${minWidth !== 'auto' ? `min-w-[${minWidth}]` : ''} ${maxWidth === 'full' ? 'w-full' : `max-w-[${maxWidth}]`}`;
  
  return (
    <div className={`relative ${sizeConfig.height} ${widthClasses}`}>
      {/* LCD Frame - ENHANCED with flexible width */}
      <div 
        className={`
          ${colors.bg} 
          ${sizeConfig.height} 
          ${sizeConfig.padding} 
          rounded-md 
          ${showBorder ? 'border-2 border-slate-700' : ''}
          relative overflow-hidden
          shadow-inner
          ${widthClasses}
        `}
      >
        {/* Scanline effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0.2) 2px)',
            backgroundSize: '100% 2px'
          }}
        />
        
        {/* Content - ENHANCED with Option C smart wrapping */}
        <div 
          className={`
            relative z-10 
            flex items-center justify-center 
            h-full 
            ${sizeConfig.fontSize} 
            ${sizeConfig.spacing} 
            font-mono
            uppercase
            overflow-hidden
            ${allowWrap ? 'break-words' : ''}
            text-center
            px-1
          `}
          style={{
            color: colors.text,
            textShadow: colors.glow,
            fontWeight: 600,
            letterSpacing: '0.1em',
            wordBreak: allowWrap ? 'break-word' : 'normal',
            overflowWrap: allowWrap ? 'break-word' : 'normal'
          }}
        >
          <span className={allowWrap ? 'break-words max-w-full' : 'truncate max-w-full'}>
            {displayContent}
          </span>
          {animated && mode === 'text' && (
            <span style={{ opacity: blink ? 1 : 0 }}>_</span>
          )}
        </div>
        
        {/* Glass reflection */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      </div>
      
      {/* Bezel shadow */}
      {showBorder && (
        <div className="absolute inset-0 rounded-md shadow-2xl pointer-events-none" 
             style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)' }} 
        />
      )}
    </div>
  );
}

export default LCDDisplay;
