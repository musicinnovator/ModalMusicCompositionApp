import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface MotionWrapperProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: 'fade' | 'slide-up' | 'slide-right' | 'slide-left' | 'scale';
  duration?: number;
  once?: boolean;
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'slide-up': {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
  },
  'slide-right': {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  },
  'slide-left': {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
};

/**
 * MotionWrapper - Adds consistent motion animations to any component
 * Provides entrance/exit animations with configurable variants
 */
export function MotionWrapper({
  children,
  delay = 0,
  className = '',
  variant = 'fade',
  duration = 0.5,
  once = true,
}: MotionWrapperProps) {
  const selectedVariant = variants[variant];

  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Custom easing for smooth motion
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer - Wraps children with staggered animation delays
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className = '',
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem - Individual item in a stagger container
 */
export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * HoverScale - Adds a subtle scale effect on hover
 */
export function HoverScale({
  children,
  scale = 1.02,
  className = '',
}: {
  children: ReactNode;
  scale?: number;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * PulseOnActive - Adds a pulse animation when active
 */
export function PulseOnActive({
  children,
  isActive,
  className = '',
}: {
  children: ReactNode;
  isActive: boolean;
  className?: string;
}) {
  return (
    <motion.div
      animate={
        isActive
          ? {
              scale: [1, 1.02, 1],
              boxShadow: [
                '0 0 0 rgba(99, 102, 241, 0)',
                '0 0 20px rgba(99, 102, 241, 0.4)',
                '0 0 0 rgba(99, 102, 241, 0)',
              ],
            }
          : {}
      }
      transition={{
        duration: 2,
        repeat: isActive ? Infinity : 0,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
