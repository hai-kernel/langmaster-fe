import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { Sparkles, BookOpen, Award, Users } from 'lucide-react';

export function WelcomeScreen() {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Lessons',
      description: 'Learn through video, pronunciation, and AI conversations',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered',
      description: 'Get instant feedback on your pronunciation and speaking',
    },
    {
      icon: Award,
      title: 'Gamified Learning',
      description: 'Earn XP, unlock badges, and track your progress',
    },
    {
      icon: Users,
      title: 'Teacher Support',
      description: 'Learn with guidance from experienced teachers',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-green-400 to-green-600 text-white font-bold shadow-2xl text-4xl">
              E
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Welcome to English AI
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8"
          >
            Learn English with AI-powered lessons and pronunciation practice
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={() => navigate('/onboarding/level')}
            className="bg-green-500 hover:bg-green-600 text-white rounded-2xl px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Get Started
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/login')}
            className="rounded-2xl px-8 py-6 text-lg border-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            I have an account
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
