import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, ArrowRight, Music, Sparkles, Layers } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Imitative Fugue Suite',
    description: 'Create professional modal compositions with imitations, counterpoint, and fugues. Let\'s take a quick tour!',
    icon: <Music className="w-6 h-6" />,
    position: 'center',
  },
  {
    id: 'modes',
    title: 'Select Your Mode',
    description: 'Choose from 80+ global modes including Western, Eastern, and world music traditions. Each mode shapes your composition\'s character.',
    icon: <Sparkles className="w-6 h-6" />,
    targetSelector: '[data-onboarding="mode-selector"]',
    position: 'right',
  },
  {
    id: 'theme',
    title: 'Create Your Theme',
    description: 'Compose your main melodic theme using the virtual piano keyboard or MIDI input. This will be the foundation of your composition.',
    icon: <Music className="w-6 h-6" />,
    targetSelector: '[data-onboarding="theme-composer"]',
    position: 'right',
  },
  {
    id: 'generate',
    title: 'Generate Compositions',
    description: 'Use the powerful engine to create imitations, counterpoint, and fugues. Each component can be customized with rhythm controls and instruments.',
    icon: <Layers className="w-6 h-6" />,
    targetSelector: '[data-onboarding="imitation-fugue-controls"]',
    position: 'right',
  },
];

export function OnboardingOverlay() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const seen = localStorage.getItem('fugue-suite-onboarding-seen');
    if (!seen) {
      // Delay showing onboarding to allow page to render
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setHasSeenOnboarding(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('fugue-suite-onboarding-seen', 'true');
    setIsVisible(false);
    setHasSeenOnboarding(true);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (hasSeenOnboarding && !isVisible) {
    return null;
  }

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          {/* Spotlight effect on target element */}
          {step.targetSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-[51]"
              style={{
                background: 'radial-gradient(circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), transparent 150px, rgba(0, 0, 0, 0.7) 300px)',
              }}
            />
          )}

          {/* Onboarding card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[52] w-full max-w-md px-4"
          >
            <Card className="p-6 glass-panel elevation-extreme">
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="absolute top-2 right-2 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-4 glow-primary">
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground mb-6">{step.description}</p>

              {/* Progress indicators */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {ONBOARDING_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'w-8 bg-indigo-600'
                        : index < currentStep
                        ? 'w-1.5 bg-indigo-400'
                        : 'w-1.5 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={handleSkip} className="text-sm">
                  Skip Tour
                </Button>
                <Button onClick={handleNext} className="gap-2">
                  {currentStep < ONBOARDING_STEPS.length - 1 ? (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Animated arrow pointing to target (if applicable) */}
          {step.targetSelector && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="fixed z-[51] pointer-events-none"
              style={{
                left: '50%',
                top: 'calc(50% + 200px)',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="w-6 h-6 border-l-2 border-b-2 border-indigo-500 transform rotate-[-45deg]" />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Button to restart onboarding tour
 */
export function OnboardingTrigger() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleRestart = () => {
    localStorage.removeItem('fugue-suite-onboarding-seen');
    window.location.reload();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRestart}
      className="gap-2 text-xs"
    >
      <Sparkles className="w-3 h-3" />
      Quick Tour
    </Button>
  );
}
