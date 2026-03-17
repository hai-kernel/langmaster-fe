import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { Zap, Flame, Trophy, ArrowRight } from 'lucide-react';

type LevelType = 'beginner' | 'intermediate' | 'advanced';

interface Level {
  id: LevelType;
  title: string;
  description: string;
  icon: typeof Zap;
  color: string;
  examples: string[];
}

export function LevelSelection() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<LevelType | null>(null);

  const levels: Level[] = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'I\'m just starting to learn English',
      icon: Zap,
      color: 'from-blue-400 to-blue-600',
      examples: ['Hello', 'Thank you', 'How are you?'],
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: 'I can have simple conversations',
      icon: Flame,
      color: 'from-orange-400 to-orange-600',
      examples: ['I\'d like to...', 'Could you help me?', 'Let me think about it'],
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'I can communicate confidently',
      icon: Trophy,
      color: 'from-purple-400 to-purple-600',
      examples: ['In my opinion...', 'Furthermore...', 'I tend to believe...'],
    },
  ];

  const handleContinue = () => {
    if (selectedLevel) {
      // Save level to storage or state if needed
      localStorage.setItem('selectedLevel', selectedLevel);
      navigate('/onboarding/goal');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            What's your English level?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            We'll customize your learning path based on your level
          </p>
        </motion.div>

        {/* Level Cards */}
        <div className="space-y-4 mb-8">
          {levels.map((level, index) => {
            const Icon = level.icon;
            const isSelected = selectedLevel === level.id;
            
            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card
                  className={`p-6 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'ring-4 ring-green-500 shadow-xl scale-105'
                      : 'hover:shadow-lg hover:scale-102'
                  }`}
                  onClick={() => setSelectedLevel(level.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${level.color} text-white shadow-lg`}>
                      <Icon className="h-7 w-7" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {level.title}
                        </h3>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {level.description}
                      </p>
                      
                      {/* Examples */}
                      <div className="flex flex-wrap gap-2">
                        {level.examples.map((example) => (
                          <span
                            key={example}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            disabled={!selectedLevel}
            onClick={handleContinue}
            className="bg-green-500 hover:bg-green-600 text-white rounded-2xl px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Skip for now */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4"
        >
          <button
            onClick={() => navigate('/onboarding/goal')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline"
          >
            I'm not sure, I'll decide later
          </button>
        </motion.div>
      </div>
    </div>
  );
}
