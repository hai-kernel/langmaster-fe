import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { Briefcase, GraduationCap, Plane, MessageCircle, ArrowRight } from 'lucide-react';

type GoalType = 'career' | 'education' | 'travel' | 'conversation';

interface Goal {
  id: GoalType;
  title: string;
  description: string;
  icon: typeof Briefcase;
  color: string;
}

export function LearningGoal() {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);

  const goals: Goal[] = [
    {
      id: 'career',
      title: 'Career & Business',
      description: 'Improve English for work, meetings, and professional communication',
      icon: Briefcase,
      color: 'from-blue-400 to-blue-600',
    },
    {
      id: 'education',
      title: 'Education & Exams',
      description: 'Prepare for IELTS, TOEFL, or improve academic English',
      icon: GraduationCap,
      color: 'from-purple-400 to-purple-600',
    },
    {
      id: 'travel',
      title: 'Travel & Culture',
      description: 'Learn English for traveling, exploring, and meeting new people',
      icon: Plane,
      color: 'from-orange-400 to-orange-600',
    },
    {
      id: 'conversation',
      title: 'Daily Conversation',
      description: 'Build confidence in everyday English conversations',
      icon: MessageCircle,
      color: 'from-green-400 to-green-600',
    },
  ];

  const handleContinue = () => {
    if (selectedGoal) {
      localStorage.setItem('learningGoal', selectedGoal);
      navigate('/onboarding/face-enrollment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            What's your learning goal?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            This helps us personalize your lessons
          </p>
        </motion.div>

        {/* Goal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {goals.map((goal, index) => {
            const Icon = goal.icon;
            const isSelected = selectedGoal === goal.id;
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card
                  className={`p-6 cursor-pointer transition-all duration-300 h-full ${
                    isSelected
                      ? 'ring-4 ring-green-500 shadow-xl scale-105'
                      : 'hover:shadow-lg hover:scale-102'
                  }`}
                  onClick={() => setSelectedGoal(goal.id)}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${goal.color} text-white shadow-lg mb-4`}>
                      <Icon className="h-8 w-8" />
                    </div>

                    {/* Content */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {goal.title}
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
                    <p className="text-gray-600 dark:text-gray-400">
                      {goal.description}
                    </p>
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
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            disabled={!selectedGoal}
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
          transition={{ delay: 0.6 }}
          className="text-center mt-4"
        >
          <button
            onClick={() => navigate('/onboarding/face-enrollment')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline"
          >
            Skip for now
          </button>
        </motion.div>
      </div>
    </div>
  );
}
