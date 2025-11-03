/**
 * ChannelStrip Component
 * Professional mixer channel strip inspired by MOTU Model12
 * Features: Fader, mute/solo, VU meter, pan control
 */

import { useState } from 'react';

export interface ChannelStripProps {
  channelNumber?: number;
  label?: string;
  volume?: number; // 0-100
  pan?: number; // -50 to 50
  muted?: boolean;
  solo?: boolean;
  onVolumeChange?: (volume: number) => void;
  onPanChange?: (pan: number) => void;
  onMuteToggle?: (muted: boolean) => void;
  onSoloToggle?: (solo: boolean) => void;
  colorScheme?: 'cyan' | 'green' | 'amber';
  showVU?: boolean;
}

const COLOR_SCHEMES = {
  cyan: { accent: '#00d4ff', fader: '#00d4ff', meter: ['#00d4ff', '#00ff88', '#ffaa00', '#ff4a6e'] },
  green: { accent: '#00ff88', fader: '#00ff88', meter: ['#00ff88', '#ffaa00', '#ff4a6e', '#ff0000'] },
  amber: { accent: '#ffaa00', fader: '#ffaa00', meter: ['#00ff88', '#ffaa00', '#ff6600', '#ff0000'] }
};

export function ChannelStrip({
  channelNumber = 1,
  label = 'CH',
  volume = 75,
  pan = 0,
  muted = false,
  solo = false,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  colorScheme = 'cyan',
  showVU = true
}: ChannelStripProps) {
  const [internalVolume, setInternalVolume] = useState(volume);
  const [internalPan, setInternalPan] = useState(pan);
  const [isDraggingFader, setIsDraggingFader] = useState(false);
  const [vuLevel, setVuLevel] = useState(volume);
  
  const colors = COLOR_SCHEMES[colorScheme];
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setInternalVolume(newVolume);
    setVuLevel(newVolume);
    onVolumeChange?.(newVolume);
  };
  
  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPan = Number(e.target.value);
    setInternalPan(newPan);
    onPanChange?.(newPan);
  };
  
  const getMeterColor = (level: number) => {
    if (level < 60) return colors.meter[0]; // Green
    if (level < 80) return colors.meter[1]; // Amber
    if (level < 95) return colors.meter[2]; // Orange
    return colors.meter[3]; // Red
  };
  
  return (
    <div className="relative w-20 bg-gradient-to-b from-slate-800 via-slate-900 to-black rounded-lg p-3 shadow-2xl border border-slate-700">
      {/* Channel Label */}
      <div className="text-center mb-3">
        <div className="text-[10px] tracking-widest opacity-60 mb-1">{label}</div>
        <div 
          className="text-sm font-mono"
          style={{ color: colors.accent }}
        >
          {channelNumber}
        </div>
      </div>
      
      {/* VU Meter */}
      {showVU && (
        <div className="mb-3 flex justify-center">
          <div className="relative w-8 h-32 bg-black rounded border border-slate-700 overflow-hidden">
            {/* Meter segments */}
            {Array.from({ length: 20 }).map((_, i) => {
              const segmentLevel = ((20 - i) / 20) * 100;
              const isActive = vuLevel >= segmentLevel;
              const color = getMeterColor(segmentLevel);
              
              return (
                <div
                  key={i}
                  className="absolute w-full h-1.5 mb-0.5"
                  style={{
                    bottom: `${i * 6.4}px`,
                    backgroundColor: isActive ? color : '#1a1a1a',
                    boxShadow: isActive ? `0 0 4px ${color}` : 'none',
                    opacity: isActive ? 1 : 0.3
                  }}
                />
              );
            })}
            
            {/* Peak indicator */}
            <div 
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{
                backgroundColor: vuLevel >= 95 ? colors.meter[3] : 'transparent',
                boxShadow: vuLevel >= 95 ? `0 0 8px ${colors.meter[3]}` : 'none'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Fader */}
      <div className="mb-4 flex justify-center">
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={internalVolume}
            onChange={handleVolumeChange}
            onMouseDown={() => setIsDraggingFader(true)}
            onMouseUp={() => setIsDraggingFader(false)}
            className="h-48 w-8 appearance-none bg-transparent cursor-ns-resize"
            style={{
              writingMode: 'bt-lr',
              WebkitAppearance: 'slider-vertical'
            }}
          />
          
          {/* Custom fader track */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-48 bg-slate-950 rounded-full border border-slate-700 pointer-events-none" />
          
          {/* Fader thumb */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-6 h-8 rounded pointer-events-none transition-all"
            style={{
              bottom: `${(internalVolume / 100) * (192 - 32)}px`,
              background: `linear-gradient(to bottom, ${colors.fader}, ${colors.fader}80)`,
              boxShadow: isDraggingFader 
                ? `0 0 12px ${colors.fader}` 
                : `0 2px 4px rgba(0,0,0,0.5), 0 0 6px ${colors.fader}40`,
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-px bg-slate-900" />
            <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 translate-y-1 h-px bg-slate-900" />
            <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 -translate-y-1 h-px bg-slate-900" />
          </div>
        </div>
      </div>
      
      {/* Pan Control */}
      <div className="mb-3">
        <div className="text-[8px] text-center opacity-50 mb-1 tracking-widest">PAN</div>
        <input
          type="range"
          min="-50"
          max="50"
          value={internalPan}
          onChange={handlePanChange}
          className="w-full h-1 appearance-none bg-slate-800 rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
              ${colors.accent}40 0%, 
              ${colors.accent} 50%, 
              ${colors.accent}40 100%)`
          }}
        />
        <div className="text-[8px] text-center mt-1 opacity-70">
          {internalPan === 0 ? 'C' : internalPan > 0 ? `R${internalPan}` : `L${Math.abs(internalPan)}`}
        </div>
      </div>
      
      {/* Mute/Solo Buttons */}
      <div className="flex gap-1">
        <button
          onClick={() => onMuteToggle?.(!muted)}
          className={`
            flex-1 px-2 py-1 rounded text-[10px] tracking-wider border transition-all
            ${muted 
              ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/50' 
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-amber-500/50'
            }
          `}
        >
          M
        </button>
        <button
          onClick={() => onSoloToggle?.(!solo)}
          className={`
            flex-1 px-2 py-1 rounded text-[10px] tracking-wider border transition-all
            ${solo 
              ? `bg-[${colors.accent}] text-black border-[${colors.accent}] shadow-lg` 
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-cyan-500/50'
            }
          `}
          style={solo ? {
            backgroundColor: colors.accent,
            borderColor: colors.accent,
            boxShadow: `0 0 12px ${colors.accent}80`
          } : {}}
        >
          S
        </button>
      </div>
      
      {/* Channel indicator light */}
      <div className="absolute top-2 right-2">
        <div 
          className={`w-2 h-2 rounded-full ${solo || !muted ? 'opacity-100' : 'opacity-30'}`}
          style={{
            backgroundColor: solo ? colors.accent : !muted ? colors.meter[0] : '#333',
            boxShadow: (solo || !muted) ? `0 0 6px ${solo ? colors.accent : colors.meter[0]}` : 'none'
          }}
        />
      </div>
    </div>
  );
}

export default ChannelStrip;
