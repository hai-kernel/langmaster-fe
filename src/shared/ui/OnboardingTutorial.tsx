import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

interface OnboardingTutorialProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingTutorial({ steps, onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <Card className="relative w-full max-w-lg overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 z-10 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            {/* Icon/Image */}
            {steps[currentStep].icon && (
              <div className="mb-6 text-center text-6xl">
                {steps[currentStep].icon}
              </div>
            )}

            {/* Title */}
            <h2 className="mb-3 text-center text-2xl font-bold">
              {steps[currentStep].title}
            </h2>

            {/* Description */}
            <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
              {steps[currentStep].description}
            </p>

            {/* Progress Dots */}
            <div className="mb-6 flex justify-center gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-blue-600'
                      : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>

              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-600 dark:text-gray-400"
              >
                Bỏ qua
              </Button>

              <Button
                onClick={handleNext}
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {currentStep === steps.length - 1 ? 'Bắt đầu' : 'Tiếp theo'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// Example tutorial steps for the app
export const appTutorialSteps: TutorialStep[] = [
  {
    title: 'Chào mừng đến với English AI! 🎉',
    description: 'Học tiếng Anh thông minh với AI, tập trung vào Listening, Speaking và Pronunciation',
    icon: '👋',
  },
  {
    title: 'Học theo lộ trình rõ ràng 📚',
    description: 'Mỗi session có nhiều bài học đa dạng: Video, Luyện phát âm, Hội thoại AI, và Flashcard từ vựng',
    icon: '🎯',
  },
  {
    title: 'AI chấm phát âm chính xác 🎤',
    description: 'Luyện phát âm với AI, nhận phản hồi chi tiết về từng từ và gợi ý cải thiện',
    icon: '🤖',
  },
  {
    title: 'Tích lũy XP và huy hiệu 🏆',
    description: 'Hoàn thành bài học để nhận XP, level up, và mở khóa các huy hiệu thành tích',
    icon: '⭐',
  },
  {
    title: 'Sẵn sàng chưa? 🚀',
    description: 'Hãy bắt đầu hành trình chinh phục tiếng Anh của bạn ngay bây giờ!',
    icon: '🎊',
  },
];
