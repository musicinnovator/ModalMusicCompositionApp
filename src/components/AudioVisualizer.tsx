import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  color?: string;
  className?: string;
}

/**
 * AudioVisualizer - Animated waveform bars that react to playback state
 * Provides visual feedback during audio playback with customizable appearance
 */
export function AudioVisualizer({ 
  isPlaying, 
  barCount = 5, 
  color = '#6366f1',
  className = '' 
}: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    // Initialize random heights for bars
    setBars(Array.from({ length: barCount }, () => Math.random()));
    
    if (!isPlaying) return;

    // Animate bars while playing
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random()));
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, barCount]);

  if (!isPlaying) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center gap-1 h-6 ${className}`}>
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full"
          style={{
            backgroundColor: color,
            height: `${Math.max(20, height * 100)}%`,
          }}
          animate={{
            height: `${Math.max(20, height * 100)}%`,
          }}
          transition={{
            duration: 0.15,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

/**
 * MiniAudioVisualizer - Compact version for inline display
 */
export function MiniAudioVisualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <AudioVisualizer 
      isPlaying={isPlaying} 
      barCount={3} 
      color="currentColor"
      className="h-4"
    />
  );
}
