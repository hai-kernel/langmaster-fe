import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Lock, CheckCircle, Play } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { motion } from 'motion/react';

const DIFFICULTY_STYLES: Record<string, string> = {
  BEGINNER: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  INTERMEDIATE: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  ADVANCED: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
};

export interface SessionCardData {
  id: number;
  title: string;
  description?: string;
  lessonCount: number;
  orderIndex: number;
  estimatedMinutes?: number;
  difficultyLevel?: string;
  thumbnailUrl?: string;
}

interface SessionCardProps {
  session: SessionCardData;
  index: number;
  status: 'available' | 'completed' | 'locked';
  progress?: { completed: number; total: number };
  difficultyLabels?: Record<string, string>;
  gradientClass: string;
}

export const SessionListCard = forwardRef<HTMLElement, SessionCardProps>(function SessionListCard({
  session,
  index,
  status,
  progress,
  difficultyLabels = { BEGINNER: 'Cơ bản', INTERMEDIATE: 'Trung cấp', ADVANCED: 'Nâng cao' },
  gradientClass,
}, ref) {
  const navigate = useNavigate();
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const progressPercent = progress && progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  const handleClick = () => {
    if (isLocked) return;
    navigate(`/sessions/${session.id}`);
  };

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleClick}
      className={`
        group relative flex flex-col rounded-2xl overflow-hidden border bg-white dark:bg-gray-800 text-left
        shadow-sm hover:shadow-xl transition-all duration-300
        ${isLocked ? 'opacity-75 cursor-not-allowed border-gray-200 dark:border-gray-700' : 'cursor-pointer hover:-translate-y-1 border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600/50'}
        ${isCompleted ? 'ring-2 ring-emerald-400/50 dark:ring-emerald-500/50' : ''}
      `}
    >
      {/* Image / Illustration area */}
      <div className={`relative h-36 sm:h-40 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
        {session.thumbnailUrl ? (
          <img src={session.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              {isLocked ? (
                <Lock className="h-8 w-8 text-white" />
              ) : isCompleted ? (
                <CheckCircle className="h-8 w-8 text-white" />
              ) : (
                <Play className="h-8 w-8 text-white ml-1" />
              )}
            </div>
          </div>
        )}
        {isLocked && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        )}
        <span className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/25 text-sm font-bold text-white backdrop-blur-sm">
          {index + 1}
        </span>
        {session.difficultyLevel && (
          <span className={`absolute top-3 right-3 rounded-lg border px-2 py-0.5 text-xs font-medium ${DIFFICULTY_STYLES[session.difficultyLevel] || DIFFICULTY_STYLES.BEGINNER}`}>
            {difficultyLabels[session.difficultyLevel] ?? session.difficultyLevel}
          </span>
        )}
        {isCompleted && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white">
            <CheckCircle className="h-3.5 w-3.5" /> Hoàn thành
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors text-lg leading-snug line-clamp-2">
          {session.title}
        </h3>
        {session.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{session.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            ~{session.estimatedMinutes ?? session.lessonCount * 5} phút
          </span>
          <span className="text-gray-400 dark:text-gray-500">·</span>
          <span>{session.lessonCount} bài học</span>
        </div>

        {progress && progress.total > 0 && !isLocked && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Tiến độ</span>
              <span>{progress.completed}/{progress.total} bài</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        <div className="mt-4">
          {isLocked ? (
            <Button disabled size="sm" variant="secondary" className="w-full rounded-xl">
              <Lock className="mr-2 h-4 w-4" />
              Hoàn thành session trước
            </Button>
          ) : isCompleted ? (
            <Button size="sm" variant="outline" className="w-full rounded-xl border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Xem lại
            </Button>
          ) : (
            <Button size="sm" className="w-full rounded-xl bg-violet-600 hover:bg-violet-700" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
              <Play className="mr-2 h-4 w-4" />
              {progressPercent > 0 ? 'Tiếp tục' : 'Bắt đầu'}
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
});
