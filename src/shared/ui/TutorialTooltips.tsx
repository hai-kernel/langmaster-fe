import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { X, ChevronRight, ChevronLeft, Lightbulb, Sparkles } from 'lucide-react';

interface TutorialStep {
  target: string; // CSS selector or element ID
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface TutorialTooltipProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
  storageKey?: string; // To remember if user has seen this tutorial
}

export function TutorialTooltip({ steps, onComplete, onSkip, storageKey }: TutorialTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Check if user has already seen this tutorial
    if (storageKey) {
      const hasSeenTutorial = localStorage.getItem(storageKey);
      if (hasSeenTutorial) {
        setIsVisible(false);
        return;
      }
    }

    // Calculate position based on target element
    const updatePosition = () => {
      const step = steps[currentStep];
      const targetElement = document.querySelector(step.target);
      
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const placement = step.placement || 'bottom';
        
        let top = 0;
        let left = 0;

        switch (placement) {
          case 'top':
            top = rect.top - 150;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 300;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 20;
            break;
        }

        setPosition({ top, left });

        // Add highlight to target element
        if (step.highlight) {
          targetElement.classList.add('tutorial-highlight');
          // Scroll element into view
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      
      // Remove all highlights
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
    };
  }, [currentStep, steps, storageKey]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            transform: 'translate(-50%, 0)',
            zIndex: 101,
          }}
          className="w-[320px]"
        >
          <Card className="p-4 shadow-2xl border-2 border-green-500">
            <div className="flex items-start gap-3 mb-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="size-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{currentStepData.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {currentStepData.content}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSkip}
                className="size-6 p-0 flex-shrink-0"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 w-8 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-green-500'
                        : index < currentStep
                        ? 'bg-green-300'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button size="sm" variant="outline" onClick={handlePrevious}>
                    <ChevronLeft className="size-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {isLastStep ? 'Got it!' : 'Next'}
                  {!isLastStep && <ChevronRight className="size-4 ml-1" />}
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              {currentStep + 1} of {steps.length}
            </div>
          </Card>

          {/* Arrow pointer */}
          <div
            className={`absolute w-0 h-0 border-8 ${
              currentStepData.placement === 'top'
                ? 'border-t-green-500 border-x-transparent border-b-transparent -bottom-4 left-1/2 -translate-x-1/2'
                : currentStepData.placement === 'left'
                ? 'border-l-green-500 border-y-transparent border-r-transparent -right-4 top-1/2 -translate-y-1/2'
                : currentStepData.placement === 'right'
                ? 'border-r-green-500 border-y-transparent border-l-transparent -left-4 top-1/2 -translate-y-1/2'
                : 'border-b-green-500 border-x-transparent border-t-transparent -top-4 left-1/2 -translate-x-1/2'
            }`}
          />
        </motion.div>
      </AnimatePresence>

      {/* CSS for highlight effect */}
      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 99;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5);
          border-radius: 8px;
          animation: tutorial-pulse 2s infinite;
        }

        @keyframes tutorial-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(34, 197, 94, 0.3), 0 0 0 9999px rgba(0, 0, 0, 0.5);
          }
        }
      `}</style>
    </>
  );
}

// Feature highlight tooltip (inline, non-blocking)
export function FeatureHighlight({
  title,
  description,
  onDismiss,
  show = true,
  icon: Icon = Sparkles
}: {
  title: string;
  description: string;
  onDismiss: () => void;
  show?: boolean;
  icon?: React.ElementType;
}) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-4"
    >
      <Card className="p-4 border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
            <Icon className="size-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1 text-green-900 dark:text-green-100">
              {title}
            </h4>
            <p className="text-xs text-green-700 dark:text-green-300">{description}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="size-6 p-0 flex-shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

// Inline tooltip (like tooltips in forms)
export function InlineTip({ children, tip }: { children: React.ReactNode; tip: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
          >
            <Card className="p-2 text-xs max-w-[200px] shadow-lg">
              {tip}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
