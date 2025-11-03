import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ParallaxBackgroundProps {
  theme?: string;
  className?: string;
}

/**
 * ParallaxBackground - Multi-layer animated background with depth
 * Creates an immersive environment with subtle parallax scrolling
 */
export function ParallaxBackground({ theme = 'indigo-purple', className = '' }: ParallaxBackgroundProps) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -100]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -50]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -25]);

  // Animated gradient positions
  const [gradientPosition, setGradientPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPosition((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getThemeColors = () => {
    switch (theme) {
      case 'blue-cyan':
        return {
          layer1: 'from-blue-400/10 to-cyan-400/10',
          layer2: 'from-blue-500/5 to-cyan-500/5',
          layer3: 'from-blue-600/3 to-cyan-600/3',
        };
      case 'green-emerald':
        return {
          layer1: 'from-green-400/10 to-emerald-400/10',
          layer2: 'from-green-500/5 to-emerald-500/5',
          layer3: 'from-green-600/3 to-emerald-600/3',
        };
      case 'orange-red':
        return {
          layer1: 'from-orange-400/10 to-red-400/10',
          layer2: 'from-orange-500/5 to-red-500/5',
          layer3: 'from-orange-600/3 to-red-600/3',
        };
      case 'pink-rose':
        return {
          layer1: 'from-pink-400/10 to-rose-400/10',
          layer2: 'from-pink-500/5 to-rose-500/5',
          layer3: 'from-pink-600/3 to-rose-600/3',
        };
      case 'dark-slate':
        return {
          layer1: 'from-slate-700/20 to-slate-800/20',
          layer2: 'from-slate-800/10 to-slate-900/10',
          layer3: 'from-slate-900/5 to-black/5',
        };
      default: // indigo-purple
        return {
          layer1: 'from-indigo-400/10 to-purple-400/10',
          layer2: 'from-indigo-500/5 to-purple-500/5',
          layer3: 'from-indigo-600/3 to-purple-600/3',
        };
    }
  };

  const colors = getThemeColors();

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Layer 1 - Far background (slowest) */}
      <motion.div
        style={{ y: y1 }}
        className={`absolute inset-0 bg-gradient-to-br ${colors.layer1}`}
      >
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`blob-1-${i}`}
              className="absolute rounded-full blur-3xl"
              style={{
                width: Math.random() * 400 + 200,
                height: Math.random() * 400 + 200,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(99, 102, 241, 0.1)' : 'rgba(139, 92, 246, 0.1)'} 0%, transparent 70%)`,
              }}
              animate={{
                x: [0, Math.random() * 40 - 20, 0],
                y: [0, Math.random() * 40 - 20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Layer 2 - Mid background (medium speed) */}
      <motion.div
        style={{ y: y2 }}
        className={`absolute inset-0 bg-gradient-to-tl ${colors.layer2}`}
      >
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`blob-2-${i}`}
              className="absolute rounded-full blur-2xl"
              style={{
                width: Math.random() * 300 + 150,
                height: Math.random() * 300 + 150,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(139, 92, 246, 0.15)'} 0%, transparent 70%)`,
              }}
              animate={{
                x: [0, Math.random() * 30 - 15, 0],
                y: [0, Math.random() * 30 - 15, 0],
              }}
              transition={{
                duration: 15 + Math.random() * 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Layer 3 - Near background (fastest) */}
      <motion.div
        style={{ y: y3 }}
        className={`absolute inset-0 bg-gradient-to-tr ${colors.layer3}`}
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`blob-3-${i}`}
              className="absolute rounded-full blur-xl"
              style={{
                width: Math.random() * 200 + 100,
                height: Math.random() * 200 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(139, 92, 246, 0.2)'} 0%, transparent 70%)`,
              }}
              animate={{
                x: [0, Math.random() * 20 - 10, 0],
                y: [0, Math.random() * 20 - 10, 0],
              }}
              transition={{
                duration: 10 + Math.random() * 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Animated mesh gradient overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            radial-gradient(at ${gradientPosition % 100}% ${(gradientPosition * 2) % 100}%, rgba(99, 102, 241, 0.3) 0, transparent 50%),
            radial-gradient(at ${(gradientPosition + 50) % 100}% ${(gradientPosition * 3) % 100}%, rgba(139, 92, 246, 0.3) 0, transparent 50%)
          `,
        }}
      />
    </div>
  );
}
