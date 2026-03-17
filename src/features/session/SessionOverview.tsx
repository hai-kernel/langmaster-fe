import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '@/services/apiService';
import { useAppStore } from '@/store/appStore';
import { BookOpen, Clock, Layers, ChevronRight, Search, Sparkles } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { SessionListCard } from './SessionListCard';

interface TopicSession {
  id: number;
  title: string;
  orderIndex: number;
  lessonCount: number;
  description?: string;
  estimatedMinutes?: number;
  difficultyLevel?: string;
  thumbnailUrl?: string;
}

interface Topic {
  id: number;
  name: string;
  description: string;
  difficultyLevel: string;
  orderIndex: number;
  estimatedDurationMinutes: number;
  thumbnailUrl?: string;
  isActive: boolean;
  sessionCount: number;
  sessions: TopicSession[];
}

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Cơ bản',
  INTERMEDIATE: 'Trung cấp',
  ADVANCED: 'Nâng cao',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  INTERMEDIATE: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  ADVANCED: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
};

const TOPIC_GRADIENTS = [
  'from-violet-500 via-purple-600 to-indigo-600',
  'from-emerald-500 via-teal-600 to-cyan-600',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-pink-500 via-rose-600 to-fuchsia-600',
  'from-blue-500 via-indigo-600 to-violet-600',
  'from-teal-500 via-cyan-600 to-sky-600',
];

export function SessionOverview() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [completedSessionIds, setCompletedSessionIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const progressVersion = useAppStore((s) => s.progressVersion);

  useEffect(() => {
    apiService.student
      .getCompletedSessionIds()
      .then((res) => {
        const list = res.data?.data ?? [];
        setCompletedSessionIds(new Set(Array.isArray(list) ? list : []));
      })
      .catch(() => setCompletedSessionIds(new Set()));
  }, [progressVersion]);

  useEffect(() => {
    const parseList = (raw: any): Topic[] => {
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    };

    apiService.topic
      .getActive()
      .then(async (res) => {
        let list = parseList(res.data);
        if (list.length === 0) {
          const res2 = await apiService.topic.getAll();
          list = parseList(res2.data);
        }
        setTopics(list);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message ?? err?.message ?? 'Lỗi kết nối';
        toast.error('Không tải được chủ đề', { description: msg });
        setTopics([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredTopics = topics.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 blur-xl" />
        </div>
        <p className="mt-6 text-slate-500 dark:text-slate-400 font-medium">Đang tải chủ đề học...</p>
        <div className="mt-2 h-1.5 w-28 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '70%' }}
            transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
          />
        </div>
      </div>
    );
  }

  // --- Session list view for a selected topic (full-width, card grid, learning path) ---
  if (selectedTopic) {
    const sessions = selectedTopic.sessions ?? [];
    const completedCount = sessions.filter((s) => completedSessionIds.has(s.id)).length;
    const topicProgress = sessions.length > 0 ? (completedCount / sessions.length) * 100 : 0;
    const gradientClass = TOPIC_GRADIENTS[selectedTopic.orderIndex % TOPIC_GRADIENTS.length];

    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb / Back */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => setSelectedTopic(null)}
            className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40">
              <ChevronRight className="h-4 w-4 rotate-180" />
            </span>
            <span>Chủ đề học</span>
            <ChevronRight className="h-4 w-4 opacity-50" />
            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{selectedTopic.name}</span>
          </button>
        </motion.div>

        {/* Topic Hero - full width */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 shadow-lg"
        >
          <div className={`relative h-40 sm:h-44 bg-gradient-to-br ${gradientClass} p-6 flex flex-col justify-end`}>
            {selectedTopic.thumbnailUrl && (
              <img src={selectedTopic.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
            )}
            <div className="absolute top-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">{selectedTopic.name}</h1>
                {selectedTopic.difficultyLevel && (
                  <Badge className={`mt-2 text-xs font-medium border ${DIFFICULTY_COLORS[selectedTopic.difficultyLevel]}`}>
                    {DIFFICULTY_LABELS[selectedTopic.difficultyLevel] ?? selectedTopic.difficultyLevel}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-white/90">
                <span className="flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm px-3 py-1.5">
                  <Layers className="h-4 w-4" />
                  {sessions.length} session
                </span>
                {selectedTopic.estimatedDurationMinutes && (
                  <span className="flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm px-3 py-1.5">
                    <Clock className="h-4 w-4" />
                    ~{selectedTopic.estimatedDurationMinutes} phút
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {selectedTopic.description && (
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mb-4 max-w-3xl">{selectedTopic.description}</p>
            )}
            {/* Learning path progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">Lộ trình</span>
                <span className="text-slate-500 dark:text-slate-400">{completedCount}/{sessions.length} session hoàn thành</span>
              </div>
              <Progress value={topicProgress} className="h-2 rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Session cards grid */}
        {sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30 py-20 text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-700 mb-4">
              <Layers className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Chủ đề này chưa có session nào.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Vui lòng quay lại sau.</p>
          </motion.div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 px-1">Các session</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {sessions.map((session, idx) => {
                  const isCompleted = completedSessionIds.has(session.id);
                  const isLocked = false; // optional: lock if previous not completed
                  const status = isCompleted ? 'completed' : isLocked ? 'locked' : 'available';
                  return (
                    <SessionListCard
                      key={session.id}
                      session={{
                        id: session.id,
                        title: session.title,
                        description: session.description,
                        lessonCount: session.lessonCount,
                        orderIndex: session.orderIndex,
                        estimatedMinutes: session.estimatedMinutes ?? session.lessonCount * 5,
                        difficultyLevel: session.difficultyLevel ?? selectedTopic.difficultyLevel,
                        thumbnailUrl: session.thumbnailUrl,
                      }}
                      index={idx}
                      status={status}
                      progress={undefined}
                      difficultyLabels={DIFFICULTY_LABELS}
                      gradientClass={TOPIC_GRADIENTS[idx % TOPIC_GRADIENTS.length]}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- Topic list view (full width) ---
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <Sparkles className="h-6 w-6 text-white" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Chủ đề học</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-0.5">
                Chọn một chủ đề để bắt đầu luyện tập tiếng Anh
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm chủ đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus-visible:ring-violet-500"
          />
        </div>
      </motion.div>

      {filteredTopics.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30 py-24 text-center"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-700 mb-6">
            <BookOpen className="h-12 w-12 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-500 font-medium text-lg">Chưa có chủ đề nào</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Admin đang cập nhật nội dung, vui lòng quay lại sau.</p>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic, idx) => (
            <motion.button
              key={topic.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              onClick={() => setSelectedTopic(topic)}
              className="group text-left rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-200 dark:hover:border-violet-800/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`relative h-32 sm:h-36 flex items-center justify-center ${
                  topic.thumbnailUrl ? 'bg-slate-900' : `bg-gradient-to-br ${TOPIC_GRADIENTS[idx % TOPIC_GRADIENTS.length]}`
                }`}
              >
                {topic.thumbnailUrl && (
                  <img
                    src={topic.thumbnailUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {!topic.thumbnailUrl && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                )}
                <BookOpen className="relative h-12 w-12 text-white/90 drop-shadow-md" />
                <span className="absolute top-3 left-3 rounded-lg bg-white/20 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white">
                  #{topic.orderIndex + 1}
                </span>
                {topic.difficultyLevel && (
                  <Badge className={`absolute top-3 right-3 text-xs font-medium border-0 ${DIFFICULTY_COLORS[topic.difficultyLevel]}`}>
                    {DIFFICULTY_LABELS[topic.difficultyLevel] ?? topic.difficultyLevel}
                  </Badge>
                )}
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors text-lg leading-snug line-clamp-2">
                  {topic.name}
                </h3>
                {topic.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{topic.description}</p>
                )}
                <div className="flex items-center gap-3 mt-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-violet-500" />
                    {topic.sessionCount} session
                  </span>
                  {topic.estimatedDurationMinutes && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-violet-500" />
                      ~{topic.estimatedDurationMinutes} phút
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-violet-600 dark:text-violet-400 text-sm font-medium">
                  Xem các session
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
