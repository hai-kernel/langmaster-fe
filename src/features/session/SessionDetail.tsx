import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSessionById, useLessonsBySession } from '@/hooks/useStudentData';
import apiService from '@/services/apiService';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import {
  ArrowLeft, Clock, BookOpen, Play, Mic, Brain, MessageCircle,
  Lock, CheckCircle, ChevronRight, Loader2, Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LESSON_TYPE_META: Record<string, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  route: string;
}> = {
  VIDEO: {
    label: 'Video',
    icon: Play,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/15 dark:bg-blue-500/20 border-blue-500/30',
    route: 'video-conversation',
  },
  SPEAKING: {
    label: 'Phát âm',
    icon: Mic,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/15 dark:bg-emerald-500/20 border-emerald-500/30',
    route: 'pronunciation-lesson',
  },
  VOCAB: {
    label: 'Từ vựng',
    icon: Brain,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-500/30',
    route: 'flashcard-lesson',
  },
  QUIZ: {
    label: 'Hội thoại AI',
    icon: MessageCircle,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/15 dark:bg-violet-500/20 border-violet-500/30',
    route: 'ai-conversation-lesson',
  },
};

const DEFAULT_META = LESSON_TYPE_META.VIDEO;

export function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const idNum = sessionId ? Number(sessionId) : null;

  const { session, loading: sessionLoading } = useSessionById(idNum);
  const { lessons, loading: lessonsLoading } = useLessonsBySession(idNum ?? 0);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(new Set());
  const isAuthenticated = useAuthStore((s) => !!s.tokens?.accessToken);
  const progressVersion = useAppStore((s) => s.progressVersion);

  useEffect(() => {
    if (!idNum || !isAuthenticated) return;
    apiService.student
      .getCompletedLessonIds()
      .then((res) => {
        try {
          const list = res?.data?.data;
          setCompletedLessonIds(new Set(Array.isArray(list) ? list : []));
        } catch {
          setCompletedLessonIds(new Set());
        }
      })
      .catch(() => setCompletedLessonIds(new Set()));
  }, [idNum, isAuthenticated, progressVersion]);

  const lessonsWithStatus = lessons.map((l: any) => ({
    ...l,
    status: completedLessonIds.has(l.id) ? 'completed' : (l.status ?? undefined),
  }));

  const sortedLessons = lessonsWithStatus
    .slice()
    .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  if (!idNum) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-slate-500 dark:text-slate-400">Session không tồn tại</p>
        <Button onClick={() => navigate('/sessions')} variant="outline" className="mt-4">Quay lại</Button>
      </div>
    );
  }

  if (sessionLoading && !session) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Loader2 className="h-7 w-7 text-white animate-spin" />
          </div>
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 blur-xl animate-pulse" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Đang tải session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-700">
          <BookOpen className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-slate-500 dark:text-slate-400">Không tìm thấy session</p>
        <Button onClick={() => navigate('/sessions')} variant="outline" className="mt-5">Quay lại</Button>
      </div>
    );
  }

  const totalLessons = sortedLessons.length || session.lessonCount || 0;
  const completedLessons = sortedLessons.filter((l: any) => l.status === 'completed').length;
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const estimatedTime = sortedLessons.reduce((sum: number, l: any) => sum + (l.durationMinutes ?? 5), 0) || totalLessons * 5;
  const topicName = (session as any).topicName;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb + Back */}
      <motion.nav
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-2 text-sm"
        aria-label="Breadcrumb"
      >
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 -ml-2"
          onClick={() => navigate('/sessions')}
        >
          <ArrowLeft className="h-4 w-4" />
          Chủ đề
        </Button>
        {topicName && (
          <>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{topicName}</span>
          </>
        )}
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <span className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{session.title}</span>
      </motion.nav>

      {/* Session Hero - compact, rounded 20px */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative mb-8 overflow-hidden rounded-[20px] bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 py-5 px-5 sm:py-6 sm:px-6 lg:py-6 lg:px-8 text-white shadow-xl shadow-violet-500/20"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.12),transparent)]" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70 mb-1">
              Khóa học
            </p>
            {topicName && (
              <p className="flex items-center gap-2 text-sm font-medium text-white/90 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                </span>
                {topicName}
              </p>
            )}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight drop-shadow-sm">
              {session.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/90">
              <span className="flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-sm px-2.5 py-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {totalLessons} bài học
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-sm px-2.5 py-1.5">
                <Clock className="h-3.5 w-3.5" />
                ~{estimatedTime} phút
              </span>
            </div>
          </div>
          <div className="w-full sm:w-64 flex-shrink-0 space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-white/85">
              <span>Tiến độ</span>
              <span>{completedLessons}/{totalLessons}</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20 [&>div]:bg-white rounded-full" />
          </div>
        </div>
      </motion.section>

      {/* Lessons - full width grid */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        aria-label="Danh sách bài học"
      >
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Bài học
          </h2>
          {sortedLessons.length > 0 && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {completedLessons} / {sortedLessons.length} hoàn thành
            </span>
          )}
        </div>

        {lessonsLoading ? (
          <div className="flex items-center justify-center py-20 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
            <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
          </div>
        ) : sortedLessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/30 p-14 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-700">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có bài học nào trong session này.</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            <AnimatePresence mode="popLayout">
              {sortedLessons.map((lesson: any, idx: number) => {
                const meta = LESSON_TYPE_META[lesson.type] ?? DEFAULT_META;
                const Icon = meta.icon;
                const isCompleted = lesson.status === 'completed';
                const isLocked = lesson.status === 'locked';
                const lessonProgress = isCompleted ? 100 : 0;
                const thumbUrl = lesson.thumbnailUrl ?? lesson.image;

                return (
                  <motion.article
                    key={lesson.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, delay: idx * 0.02 }}
                    onClick={() => {
                      if (isLocked) return;
                      navigate(`/lessons/${lesson.id}`);
                    }}
                    className={`
                      group relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200
                      bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80
                      shadow-sm hover:shadow-lg
                      ${isLocked ? 'opacity-70 cursor-not-allowed' : 'hover:border-violet-300 dark:hover:border-violet-600/50 hover:shadow-violet-500/5'}
                      ${isCompleted ? 'border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/50 dark:bg-emerald-900/10' : ''}
                    `}
                  >
                    {/* Thumbnail left */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/50">
                      {thumbUrl ? (
                        <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${meta.bg}`}>
                          {isLocked ? (
                            <Lock className={`h-8 w-8 ${meta.color}`} />
                          ) : isCompleted ? (
                            <CheckCircle className="h-8 w-8 text-emerald-500" />
                          ) : (
                            <Icon className={`h-8 w-8 ${meta.color}`} />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Bài {idx + 1}</span>
                        <span className={`rounded-lg border px-2 py-0.5 text-xs font-medium ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </span>
                        {lesson.s3Status === 'PROCESSING' && (
                          <span className="rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-xs font-medium animate-pulse">
                            ⏳ Đang xử lý
                          </span>
                        )}
                        {lesson.s3Status === 'COMPLETED' && lesson.type === 'VIDEO' && (
                          <span className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-xs font-medium">
                            ✓ Script
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{lesson.description}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{lesson.durationMinutes ?? 5} phút</span>
                      </div>
                      {/* Progress bar per lesson */}
                      <div className="mt-2">
                        <Progress value={lessonProgress} className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 [&>div]:bg-emerald-500 dark:[&>div]:bg-emerald-500" />
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{lessonProgress}% hoàn thành</p>
                      </div>
                    </div>

                    {!isLocked && (
                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.section>
    </div>
  );
}
