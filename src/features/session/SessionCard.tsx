import { Card } from '@/app/components/ui/card';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { LevelBadge } from '@/shared/ui/LevelBadge';
import { Clock, BookOpen, Lock, CheckCircle } from 'lucide-react';
import type { Session } from '@/types';
import { motion } from 'motion/react';

interface SessionCardProps {
  session: Session;
  onClick?: () => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  const rawProgress = session.totalLessons > 0 ? (session.completedLessons / session.totalLessons) * 100 : 0;
  const progress = Math.round(rawProgress);
  const isLocked = session.status === 'locked';

  return (
    <motion.div
      whileHover={{ scale: isLocked ? 1 : 1.03, y: isLocked ? 0 : -4 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`relative cursor-pointer overflow-hidden transition-all hover:shadow-lg rounded-2xl border ${
          isLocked
            ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-700'
            : 'border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-600/50'
        }`}
        onClick={() => !isLocked && onClick?.()}
      >
        {/* Thumbnail */}
        <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 rounded-t-2xl">
          {session.thumbnail && (
            <img
              src={session.thumbnail}
              alt={session.title}
              className="h-full w-full object-cover"
            />
          )}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="rounded-xl bg-slate-800/80 p-3">
                <Lock className="h-10 w-10 text-white" strokeWidth={1.5} />
              </div>
            </div>
          )}
          {session.status === 'completed' && (
            <div className="absolute right-3 top-3 rounded-xl bg-emerald-500 p-1.5 shadow-md">
              <CheckCircle className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute left-3 top-3">
            <LevelBadge level={session.level} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-1.5 line-clamp-1 font-semibold text-base text-slate-900 dark:text-white">
            {session.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {session.description}
          </p>

          {/* Stats */}
          <div className="mb-2.5 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1">
              <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              <span className="font-medium">{session.totalLessons} bài</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1">
              <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              <span className="font-medium">{session.estimatedTime}p</span>
            </div>
          </div>

          {/* Progress — thin bar, rounded % */}
          {!isLocked && (
            <ProgressBar value={progress} showLabel />
          )}
        </div>
      </Card>
    </motion.div>
  );
}