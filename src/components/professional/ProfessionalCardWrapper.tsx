/**
 * Professional Card Wrapper
 * ADDITIVE ONLY - Wraps existing cards with professional UI components
 * Preserves all existing functionality while adding MOTU-inspired aesthetics
 */

import { ReactNode } from 'react';
import { Card } from '../ui/card';
import { MetalPanel } from './MetalPanel';
import { LCDDisplay } from './LCDDisplay';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { motion } from 'motion/react';

export type CardVisualType = 
  | 'standard'        // Basic professional card
  | 'oscilloscope'    // For waveform/melody visualization
  | 'spectrum'        // For frequency/harmonic analysis
  | 'envelope'        // For ADSR/timing controls
  | 'mixer'          // For audio controls
  | 'lcd-panel';     // For data display

export interface ProfessionalCardWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  visualType?: CardVisualType;
  glowColor?: string;
  className?: string;
  showMetalFinish?: boolean;
  headerBadges?: Array<{ label: string; variant?: 'default' | 'secondary' | 'outline' }>;
  lcdText?: string;
  // ADDITIVE: Flexible width control for Option C implementation
  minWidth?: string;
  maxWidth?: string;
  allowFlexibleWidth?: boolean;
}

export function ProfessionalCardWrapper({
  children,
  title,
  subtitle,
  visualType = 'standard',
  glowColor,
  className = '',
  showMetalFinish = true,
  headerBadges = [],
  lcdText,
  // ADDITIVE: Default flexible width settings for Option C
  minWidth = '400px',
  maxWidth = 'full',
  allowFlexibleWidth = true
}: ProfessionalCardWrapperProps) {
  
  // Select appropriate metal finish based on visual type
  const getMetalFinish = () => {
    switch (visualType) {
      case 'oscilloscope':
      case 'spectrum':
        return 'black-anodized';
      case 'envelope':
      case 'mixer':
        return 'dark-metal';
      case 'lcd-panel':
        return 'gunmetal';
      default:
        return 'dark-metal';
    }
  };

  // Determine glow color based on visual type if not specified
  const effectiveGlowColor = glowColor || (() => {
    switch (visualType) {
      case 'oscilloscope':
      case 'spectrum':
        return '#06b6d4'; // cyan
      case 'envelope':
        return '#8b5cf6'; // purple
      case 'mixer':
        return '#10b981'; // green
      case 'lcd-panel':
        return '#3b82f6'; // blue
      default:
        return undefined;
    }
  })();

  const WrapperComponent = showMetalFinish ? MetalPanel : Card;
  
  // ADDITIVE: Flexible width classes for Option C
  const flexibleWidthClasses = allowFlexibleWidth 
    ? `min-w-[${minWidth}] ${maxWidth === 'full' ? 'max-w-full' : `max-w-[${maxWidth}]`} w-full`
    : '';
  
  const wrapperProps = showMetalFinish ? {
    finish: getMetalFinish(),
    showScrews: true,
    depth: 'shallow' as const,
    glowColor: effectiveGlowColor,
    className: `p-1 ${flexibleWidthClasses} ${className}`
  } : {
    className: `p-4 ${flexibleWidthClasses} ${className}`
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={flexibleWidthClasses}
    >
      <WrapperComponent {...wrapperProps}>
        {/* Inner content card */}
        <div className="relative bg-background/95 backdrop-blur-sm rounded-md p-4 overflow-hidden">
          {/* Header Section */}
          {(title || lcdText || headerBadges.length > 0) && (
            <div className="mb-4 space-y-2 overflow-hidden">
              {/* LCD Display for title if specified */}
              {lcdText && (
                <LCDDisplay
                  content={lcdText}
                  mode="alphanumeric"
                  colorScheme="cyan"
                  className="mb-2"
                />
              )}
              
              {/* Traditional header - ENHANCED with Option C smart wrapping */}
              {(title || headerBadges.length > 0) && (
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  {title && (
                    <div className="flex-1 min-w-0">
                      {/* ADDITIVE: Allow 2 lines for title with tooltip for full text */}
                      {title.length > 50 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h3 className="font-semibold tracking-tight line-clamp-2 cursor-help">
                              {title}
                            </h3>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{title}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <h3 className="font-semibold tracking-tight line-clamp-2">{title}</h3>
                      )}
                      {subtitle && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{subtitle}</p>
                      )}
                    </div>
                  )}
                  
                  {headerBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center flex-shrink-0">
                      {headerBadges.map((badge, index) => {
                        // ADDITIVE: Smart badge rendering with tooltip for long labels
                        const isLongLabel = badge.label.length > 20;
                        const badgeElement = (
                          <Badge 
                            key={index} 
                            variant={badge.variant || 'outline'}
                            className="text-xs max-w-[150px] break-words"
                          >
                            {badge.label}
                          </Badge>
                        );
                        
                        return isLongLabel ? (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              {badgeElement}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{badge.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : badgeElement;
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Main Content - Preserve all existing functionality */}
          <div className="relative">
            {children}
          </div>
        </div>
      </WrapperComponent>
    </motion.div>
  );
}
