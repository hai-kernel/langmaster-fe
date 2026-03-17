import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { SessionCard } from '@/features/session/SessionCard';
import { AnimatedMascot } from '@/shared/ui/AnimatedMascot';
import { useAppStore } from '@/store/appStore';
import { useStudentDashboard } from '@/hooks/useStudentData';
import {
  BookOpen,
  Award,
  Sparkles,
  Zap,
  Target,
  Users,
  Calendar,
  GraduationCap,
  PlayCircle,
  ArrowRight,
  Loader2,
  Trophy,
  Flame,
  Star,
  KeyRound,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import apiService from '@/services/apiService';
import type { Session } from '@/types';

export function Dashboard() {
  const { user, sessions, userProgress, setSelectedSession, setSessions, hydrateFromDashboard } = useAppStore();
  const navigate = useNavigate();
  const { data, loading, refetch } = useStudentDashboard();
  const hydratedRef = useRef(false);
  const [showMascot, setShowMascot] = useState(true);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinSubmitting, setJoinSubmitting] = useState(false);

  useEffect(() => {
    if (!data || hydratedRef.current) return;
    hydratedRef.current = true;
    if (data.user) {
      hydrateFromDashboard({
        user: {
          id: String(data.user.id),
          fullName: data.user.fullName,
          avatarUrl: data.user.avatarUrl,
          level: data.user.level ?? 1,
          xp: data.user.xp ?? 0,
          streak: data.user.streak ?? 0,
          totalLessonsCompleted: data.user.totalLessonsCompleted ?? 0,
        },
      });
    }
    apiService.student
      .getParticipatedSessions()
      .then((res) => {
        const list = res.data?.data ?? [];
        const participated: Session[] = (Array.isArray(list) ? list : []).map((s: any) => ({
          id: String(s.sessionId),
          title: s.title || '',
          description: s.topicName ? `Chủ đề: ${s.topicName}` : '',
          level: 'beginner' as const,
          totalLessons: s.totalLessons ?? 0,
          completedLessons: s.completedLessons ?? 0,
          estimatedTime: (s.totalLessons ?? 0) * 5,
          status: s.sessionCompleted ? ('completed' as const) : ('in-progress' as const),
          order: 0,
        }));
        participated.sort((a, b) => (b.completedLessons / Math.max(1, b.totalLessons)) - (a.completedLessons / Math.max(1, a.totalLessons)));
        setSessions(participated);
      })
      .catch(() => setSessions([]));
  }, [data, hydrateFromDashboard, setSessions]);

  const enrolledClasses = data?.enrolledClasses ?? [];
  const currentSession = sessions.find((s) => s.status === 'in-progress') || sessions[0];
  const inProgressSessions = sessions;

  const getMascotMessage = () => {
    if (!user) return 'Chào bạn! Hôm nay chúng ta học gì nào? 😊';
    if (user.streak >= 7) return 'Wow! Bạn đã học liên tục 7 ngày! Tuyệt vời! 🔥';
    if (user.totalLessonsCompleted >= 10) return 'Bạn đã hoàn thành nhiều bài học rồi đấy! Tiếp tục phát huy nhé! 💪';
    return 'Chào bạn! Hôm nay chúng ta học gì nào? 😊';
  };

  if (loading && !user) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Loader2 className="h-7 w-7 text-white animate-spin" />
          </div>
        </div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Đang tải...</p>
      </div>
    );
  }

  const displayUser = user ?? {
    id: '',
    name: 'Học viên',
    avatar: undefined,
    level: 1,
    xp: 0,
    streak: 0,
    totalLessonsCompleted: 0,
  };

  const xpToNextLevel = (displayUser.level + 1) * 250;
  const xpInLevel = displayUser.xp % 250;
  const xpProgressRounded = Math.round((xpInLevel / 250) * 100);

  const quickActions = [
    {
      icon: BookOpen,
      title: 'Chủ đề',
      description: 'Học theo chủ đề và session',
      href: '/sessions',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      icon: BookOpen,
      title: 'Từ vựng',
      description: 'Ôn tập từ vựng đã học',
      href: '/vocabulary',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Award,
      title: 'Thành tích',
      description: 'Xem huy hiệu và thành tích',
      href: '/achievements',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  const leaderboardPlaceholder = [
    { rank: 1, name: 'Nguyễn A', xp: 2450 },
    { rank: 2, name: 'Trần B', xp: 2100 },
    { rank: 3, name: 'Lê C', xp: 1890 },
    { rank: 4, name: 'Bạn', xp: displayUser.xp, isCurrentUser: true },
  ].sort((a, b) => b.xp - a.xp).slice(0, 5);

  return (
    <div className="relative w-full min-h-[calc(100vh-8rem)]">
      <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {showMascot && (
          <AnimatedMascot
            mood={displayUser.streak >= 7 ? 'celebrating' : 'happy'}
            message={getMascotMessage()}
            position="bottom-right"
          />
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
          {/* ——— LEFT COLUMN: Banner + Courses ——— */}
          <div className="space-y-8 min-w-0">
            {/* Compact Welcome Banner — gradient green-teal, illustration, focus "Học tiếp" */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400/90 via-teal-400/90 to-cyan-500/90 dark:from-emerald-600/95 dark:via-teal-600/95 dark:to-cyan-600/95 shadow-lg shadow-emerald-500/15"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_100%_0%,rgba(255,255,255,0.25),transparent)]" />
              <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-white/10 blur-2xl translate-y-1/3 translate-x-1/3" />
              {/* Illustration corner */}
              <div className="absolute top-0 right-0 w-32 sm:w-40 h-full flex items-center justify-end pr-2 sm:pr-4 opacity-95">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl sm:text-6xl shadow-inner">
                  📚
                </div>
              </div>
              <div className="relative py-5 px-5 sm:py-6 sm:px-6 text-white">
                <p className="text-white/90 text-sm font-medium mb-0.5">Chào trở lại</p>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {displayUser.name}! 👋
                </h1>
                <p className="mt-1 text-white/90 text-sm max-w-xs">
                  Tiếp tục hành trình chinh phục tiếng Anh
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    className="bg-white text-emerald-700 hover:bg-white/95 shadow-md gap-2 rounded-xl font-semibold"
                    onClick={() => {
                      if (currentSession) {
                        if (userProgress.currentLessonId) {
                          navigate(`/lessons/${userProgress.currentLessonId}`);
                        } else {
                          setSelectedSession(currentSession.id);
                          navigate(`/sessions/${currentSession.id}`);
                        }
                      } else {
                        navigate('/sessions');
                      }
                    }}
                  >
                    <PlayCircle className="h-5 w-5" />
                    Học tiếp
                  </Button>
                  {displayUser.streak > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 backdrop-blur-sm px-3 py-1.5 text-sm font-medium">
                      <Flame className="h-4 w-4 text-amber-200" />
                      {displayUser.streak} ngày
                    </span>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Continue Learning — only when there is a session */}
            {currentSession && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.06 }}
              >
                <div
                  className="group relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-slate-800/80 shadow-sm hover:shadow-md p-5 sm:p-6 cursor-pointer transition-all"
                  onClick={() => {
                    if (userProgress.currentLessonId) {
                      navigate(`/lessons/${userProgress.currentLessonId}`);
                    } else {
                      setSelectedSession(currentSession.id);
                      navigate(`/sessions/${currentSession.id}`);
                    }
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-700/50">
                        <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h2 className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-0.5">
                          Tiếp tục học
                        </h2>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {currentSession.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5 line-clamp-1">
                          {currentSession.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Target className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                            {currentSession.completedLessons}/{currentSession.totalLessons} bài
                          </span>
                          <span>~{currentSession.estimatedTime} phút</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="default"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl font-semibold shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (userProgress.currentLessonId) {
                          navigate(`/lessons/${userProgress.currentLessonId}`);
                        } else {
                          setSelectedSession(currentSession.id);
                          navigate(`/sessions/${currentSession.id}`);
                        }
                      }}
                    >
                      <PlayCircle className="h-4 w-4" strokeWidth={1.5} />
                      Tiếp tục ngay
                    </Button>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Quick Actions — outline icons */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Truy cập nhanh</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.04 }}
                    whileHover={{ y: -2 }}
                  >
                    <Card
                      className="group cursor-pointer p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-600/50 hover:shadow-md transition-all"
                      onClick={() => navigate(action.href)}
                    >
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                        <action.icon className={`h-5 w-5 ${action.iconColor}`} strokeWidth={1.5} />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {action.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {action.description}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Mở
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </span>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Tham gia lớp bằng mã */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
            >
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
                  <KeyRound className="h-4 w-4 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                </div>
                Tham gia lớp bằng mã
              </h2>
              <Card className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Nhập mã lớp do giáo viên cung cấp. Sau khi gửi, giáo viên sẽ duyệt và bạn sẽ thấy lớp trong danh sách.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Input
                    placeholder="VD: ABC123"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase().slice(0, 12))}
                    className="max-w-[140px] font-mono uppercase"
                    maxLength={12}
                  />
                  <Button
                    onClick={async () => {
                      const code = joinCodeInput.trim();
                      if (!code) {
                        toast.error('Vui lòng nhập mã lớp');
                        return;
                      }
                      setJoinSubmitting(true);
                      try {
                        const res = await apiService.student.requestJoinClass(code);
                        const msg = res.data?.data?.message || res.data?.message || 'Đã gửi yêu cầu. Chờ giáo viên duyệt.';
                        toast.success(msg);
                        setJoinCodeInput('');
                        refetch();
                      } catch (e: any) {
                        toast.error(e?.response?.data?.message || e?.message || 'Gửi yêu cầu thất bại');
                      } finally {
                        setJoinSubmitting(false);
                      }
                    }}
                    disabled={joinSubmitting || !joinCodeInput.trim()}
                  >
                    {joinSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gửi yêu cầu'}
                  </Button>
                </div>
              </Card>
            </motion.section>

            {/* My Classes */}
            {enrolledClasses.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
              >
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
                    <GraduationCap className="h-4 w-4 text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
                  </div>
                  Lớp học của tôi
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {enrolledClasses.map((classItem: any, index: number) => {
                    const item = {
                      id: String(classItem.id),
                      name: classItem.name ?? '',
                      description: classItem.description ?? '',
                      teacherName: classItem.teacherName ?? '',
                      studentCount: classItem.studentCount ?? 0,
                      level: (classItem.level ?? 'beginner') as 'beginner' | 'intermediate' | 'advanced',
                      schedule: classItem.startDate
                        ? [classItem.startDate, classItem.endDate].filter(Boolean).join(' → ')
                        : undefined,
                    };
                    const levelStyles =
                      item.level === 'beginner'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : item.level === 'intermediate'
                          ? 'bg-violet-500/15 text-violet-700 dark:text-violet-400'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400';
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 + index * 0.04 }}
                      >
                        <Card
                          className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:shadow-md transition-all"
                          onClick={() => navigate(`/classes/${item.id}`)}
                        >
                          <div
                            className={`h-1 bg-gradient-to-r ${(classItem as any).color || 'from-emerald-500 to-teal-500'}`}
                          />
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">
                                {item.name}
                              </h3>
                              <span className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium ${levelStyles}`}>
                                {item.level === 'beginner' ? 'Cơ bản' : item.level === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700">
                                  <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
                                    {item.teacherName.charAt(0)}
                                  </span>
                                </div>
                                <span>{item.teacherName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
                                <span>{item.studentCount} học viên</span>
                              </div>
                              {item.schedule && (
                                <>
                                  <div className="h-3 w-px bg-slate-200 dark:bg-slate-600" />
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    <span>{item.schedule}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* In Progress / Participated Sessions — course cards with thumbnail */}
            {inProgressSessions.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
                    <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
                  </div>
                  Đang học / Đã tham gia
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  {inProgressSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22 + index * 0.03 }}
                    >
                      <SessionCard
                        session={session}
                        onClick={() => {
                          setSelectedSession(session.id);
                          navigate(`/sessions/${session.id}`);
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* ——— RIGHT COLUMN: Stats + Leaderboard ——— */}
          <aside className="space-y-6 lg:space-y-6">
            {/* Stats — badge-style cards with soft shadow */}
            <motion.section
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="space-y-3"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                Thành tích
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/25">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Level</p>
                      <p className="font-bold text-lg text-slate-900 dark:text-white">{displayUser.level}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-md ${displayUser.streak > 0 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-500/25' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Streak</p>
                      <p className="font-bold text-lg text-slate-900 dark:text-white">{displayUser.streak} ngày</p>
                    </div>
                  </div>
                </Card>
                <Card className="col-span-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md shadow-emerald-500/25 flex-shrink-0">
                        <Star className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">XP</p>
                        <p className="font-bold text-lg text-slate-900 dark:text-white">{displayUser.xp} / {xpToNextLevel}</p>
                      </div>
                    </div>
                    <div className="flex-1 max-w-[120px]">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300"
                          style={{ width: `${xpProgressRounded}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 text-right">
                        {xpProgressRounded}%
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="col-span-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-md shadow-violet-500/25">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">Hoàn thành</p>
                      <p className="font-bold text-lg text-slate-900 dark:text-white">{displayUser.totalLessonsCompleted} bài</p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.section>

            {/* Leaderboard */}
            <motion.section
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-3">
                Bảng xếp hạng
              </h3>
              <Card className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-700/80">
                  {leaderboardPlaceholder.map((entry, i) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-3 px-4 py-3 ${entry.isCurrentUser ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {i + 1}
                      </span>
                      <span className={`flex-1 truncate text-sm font-medium ${entry.isCurrentUser ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {entry.name}
                        {entry.isCurrentUser && ' (bạn)'}
                      </span>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {entry.xp} XP
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.section>
          </aside>
        </div>
      </div>
    </div>
  );
}
