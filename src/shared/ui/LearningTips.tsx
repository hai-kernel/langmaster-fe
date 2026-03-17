import { Card } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';

interface LearningTip {
  text: string;
  icon?: string;
}

interface LearningTipsProps {
  tips: LearningTip[];
  title?: string;
  variant?: 'default' | 'video' | 'pronunciation' | 'conversation';
}

const variantStyles = {
  default: {
    bg: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-gray-700 dark:text-gray-300',
  },
  video: {
    bg: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-gray-700 dark:text-gray-300',
  },
  pronunciation: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-gray-700 dark:text-gray-300',
  },
  conversation: {
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-gray-700 dark:text-gray-300',
  },
};

export function LearningTips({ 
  tips, 
  title = '💡 Mẹo học tập',
  variant = 'default' 
}: LearningTipsProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={`p-4 ${styles.bg} ${styles.border}`}>
      <h3 className="mb-3 font-bold flex items-center gap-2">
        {title.includes('💡') ? title : (
          <>
            <Lightbulb className="h-5 w-5" />
            {title}
          </>
        )}
      </h3>
      <ul className={`space-y-2 text-sm ${styles.text}`}>
        {tips.map((tip, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {tip.icon ? `${tip.icon} ${tip.text}` : `• ${tip.text}`}
          </motion.li>
        ))}
      </ul>
    </Card>
  );
}
