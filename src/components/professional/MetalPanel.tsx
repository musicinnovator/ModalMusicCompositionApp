/**
 * MetalPanel Component
 * Professional brushed metal panel container inspired by MOTU hardware aesthetics
 * Features: Multiple metal finishes, optional screws, depth effects
 */

import { ReactNode } from 'react';

export type MetalFinish = 
  | 'brushed-aluminum'
  | 'dark-metal'
  | 'carbon-fiber'
  | 'black-anodized'
  | 'silver-metal'
  | 'gunmetal';

export interface MetalPanelProps {
  children: ReactNode;
  finish?: MetalFinish;
  showScrews?: boolean;
  depth?: 'flat' | 'shallow' | 'deep';
  className?: string;
  glowColor?: string;
}

const FINISH_STYLES: Record<MetalFinish, string> = {
  'brushed-aluminum': 'bg-gradient-to-br from-slate-300 via-slate-200 to-slate-300',
  'dark-metal': 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800',
  'carbon-fiber': 'bg-gradient-to-br from-zinc-900 via-neutral-800 to-zinc-900',
  'black-anodized': 'bg-gradient-to-br from-black via-slate-900 to-black',
  'silver-metal': 'bg-gradient-to-br from-gray-300 via-slate-200 to-gray-300',
  'gunmetal': 'bg-gradient-to-br from-gray-700 via-slate-600 to-gray-700'
};

const DEPTH_STYLES = {
  flat: 'shadow-sm',
  shallow: 'shadow-md',
  deep: 'shadow-2xl shadow-black/50'
};

export function MetalPanel({
  children,
  finish = 'dark-metal',
  showScrews = false,
  depth = 'shallow',
  className = '',
  glowColor
}: MetalPanelProps) {
  return (
    <div className={`relative rounded-lg overflow-hidden ${DEPTH_STYLES[depth]} ${className}`}>
      {/* Metal texture background */}
      <div className={`absolute inset-0 ${FINISH_STYLES[finish]}`} 
           style={{
             backgroundImage: finish.includes('brushed') || finish.includes('metal')
               ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
               : undefined
           }}
      />
      
      {/* Carbon fiber texture */}
      {finish === 'carbon-fiber' && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 4px
            )`
          }}
        />
      )}
      
      {/* Optional glow effect */}
      {glowColor && (
        <div 
          className="absolute inset-0 opacity-20 blur-xl"
          style={{ backgroundColor: glowColor }}
        />
      )}
      
      {/* Corner screws */}
      {showScrews && (
        <>
          {/* Top-left screw */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner">
            <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-gray-500 to-gray-700">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-gray-800 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Top-right screw */}
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner">
            <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-gray-500 to-gray-700">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-gray-800 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Bottom-left screw */}
          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner">
            <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-gray-500 to-gray-700">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-gray-800 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Bottom-right screw */}
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-inner">
            <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-gray-500 to-gray-700">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-gray-800 rounded-full" />
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent" />
    </div>
  );
}

export default MetalPanel;
