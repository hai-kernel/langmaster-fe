import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Video, Mic, MessageCircle, Brain, Lock, CheckCircle, Clock } from 'lucide-react';
import type { Lesson, LessonType } from '@/types';
import { motion } from 'motion/react';

interface LessonItemProps {
  lesson: Lesson;
  onClick?: () => void;
}

const lessonIcons: Record<LessonType, React.ComponentType<{ className?: string }>> = {
  video: Video,
  pronunciation: Mic,
  'ai-conversation': MessageCircle,
  flashcard: Brain,
};

const lessonColors: Record<LessonType, string> = {
  video: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
  pronunciation: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
  'ai-conversation': 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
  flashcard: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
};

export function LessonItem({ lesson, onClick }: LessonItemProps) {
  const Icon = lessonIcons[lesson.type];
  const iconColor = lessonColors[lesson.type];
  const isLocked = lesson.status === 'locked';
  const isCompleted = lesson.status === 'completed';

  return (
    <motion.div
      whileHover={{ scale: isLocked ? 1 : 1.01 }}
      whileTap={{ scale: isLocked ? 1 : 0.99 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`flex cursor-pointer items-center gap-4 p-4 transition-all hover:shadow-md ${
          isLocked ? 'opacity-60 cursor-not-allowed' : ''
        } ${isCompleted ? 'border-green-500 border-2' : ''}`}
        onClick={() => !isLocked && onClick?.()}
      >
        {/* Icon */}
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${iconColor}`}>
          {isLocked ? (
            <Lock className="h-6 w-6" />
          ) : isCompleted ? (
            <CheckCircle className="h-6 w-6" />
          ) : (
            <Icon className="h-6 w-6" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="mb-1 font-semibold">{lesson.title}</h3>
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            {lesson.description}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{lesson.duration} phút</span>
            {lesson.minScore && (
              <Badge variant="outline" className="ml-2">
                Điểm tối thiểu: {lesson.minScore}
              </Badge>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex-shrink-0">
          {isCompleted && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          )}
          {lesson.status === 'in-progress' && (
            <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500" />
          )}
        </div>
      </Card>
    </motion.div>
  );
}
