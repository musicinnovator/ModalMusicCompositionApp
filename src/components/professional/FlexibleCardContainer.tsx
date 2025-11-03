/**
 * Flexible Card Container
 * ADDITIVE ONLY - Wrapper component for Option C implementation
 * Provides flexible width constraints without modifying existing card components
 * 
 * Purpose: Fix text-squeezing issues by allowing cards to grow naturally
 * Usage: Wrap any existing card component to add flexible width behavior
 */

import { ReactNode } from 'react';

export interface FlexibleCardContainerProps {
  children: ReactNode;
  minWidth?: string;
  maxWidth?: string;
  className?: string;
  // Responsive breakpoints
  smMinWidth?: string;
  mdMinWidth?: string;
  lgMinWidth?: string;
}

export function FlexibleCardContainer({
  children,
  minWidth = '400px',
  maxWidth = 'full',
  className = '',
  smMinWidth,
  mdMinWidth,
  lgMinWidth
}: FlexibleCardContainerProps) {
  
  // Build responsive width classes
  const baseWidthClass = `min-w-[${minWidth}] ${maxWidth === 'full' ? 'max-w-full' : `max-w-[${maxWidth}]`} w-full`;
  
  const responsiveClasses = [
    smMinWidth ? `sm:min-w-[${smMinWidth}]` : '',
    mdMinWidth ? `md:min-w-[${mdMinWidth}]` : '',
    lgMinWidth ? `lg:min-w-[${lgMinWidth}]` : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={`${baseWidthClass} ${responsiveClasses} ${className}`}>
      {children}
    </div>
  );
}

export default FlexibleCardContainer;
