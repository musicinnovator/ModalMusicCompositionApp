/**
 * Smart Text Wrapper
 * ADDITIVE ONLY - Intelligent text display component for Option C
 * Automatically handles wrapping, truncation, and tooltips based on content length
 * 
 * Purpose: Fix text-squeezing by using appropriate text display strategy
 * Features:
 * - Auto-detects text length
 * - Shows tooltip for truncated text
 * - Allows wrapping for medium-length text
 * - Supports multiple display modes
 */

import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export type TextDisplayMode = 'wrap' | 'truncate' | 'auto';

export interface SmartTextWrapperProps {
  text: string;
  mode?: TextDisplayMode;
  maxLength?: number;
  className?: string;
  tooltipEnabled?: boolean;
  maxLines?: number;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function SmartTextWrapper({
  text,
  mode = 'auto',
  maxLength = 50,
  className = '',
  tooltipEnabled = true,
  maxLines = 2,
  as: Component = 'span'
}: SmartTextWrapperProps) {
  
  // Determine display strategy based on mode and text length
  const getDisplayStrategy = () => {
    if (mode !== 'auto') return mode;
    
    // Auto mode logic:
    // - Very long text (>100 chars): truncate with tooltip
    // - Medium text (30-100 chars): wrap with line clamp
    // - Short text (<30 chars): display normally
    if (text.length > 100) return 'truncate';
    if (text.length > 30) return 'wrap';
    return 'wrap'; // Default to wrap for flexibility
  };

  const strategy = getDisplayStrategy();
  const shouldShowTooltip = tooltipEnabled && (strategy === 'truncate' || text.length > maxLength);

  // Build CSS classes based on strategy
  const displayClasses = strategy === 'truncate' 
    ? 'truncate max-w-full'
    : `break-words line-clamp-${maxLines}`;

  const textElement = (
    <Component className={`${displayClasses} ${className}`}>
      {text}
    </Component>
  );

  // Wrap with tooltip if needed
  if (shouldShowTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help inline-block max-w-full">
            {textElement}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs break-words">{text}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return textElement;
}

export default SmartTextWrapper;
