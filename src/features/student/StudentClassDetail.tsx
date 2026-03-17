import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  ExternalLink,
  Video,
  Mic,
  ClipboardList,
  Clock,
  CheckCircle2,
  Trophy,
  MapPin,
} from 'lucide-react';
import apiService from '@/services/apiService';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

const QUOTES = [
  'Mỗi ngày một chút, thành công sẽ đến!',
  'Học tiếng Anh là đầu tư cho tương lai.',
  'Practice makes perfect – Luyện tập tạo nên hoàn hảo.',
  'Bạn làm được! Cố lên!',
  'Một bước nhỏ hôm nay, bước nhảy lớn ngày mai.',
];

function getQuote() {
  const day = new Date().getDate();
  return QUOTES[day % QUOTES.length];
}

function getAssignmentTag(type?: string) {
  const t = (type || '').toUpperCase();
  if (t === 'VIDEO') return { label: 'Video', icon: Video, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' };
  if (t === 'QUIZ' || t.includes('QUIZ')) return { label: 'Quiz', icon: ClipboardList, className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' };
  if (t.includes('SPEAKING') || t.includes('PRONUNCIATION')) return { label: 'Phát âm', icon: Mic, className: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300' };
  return { label: 'Bài học', icon: BookOpen, className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' };
}

function getCardStatus(a: { completed?: boolean; dueAt?: string }) {
  if (a.completed) return { label: 'Đã hoàn thành', className: 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30', textClass: 'text-gray-500 dark:text-gray-400' };
  const due = a.dueAt ? new Date(a.dueAt).getTime() : null;
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  if (due != null && due < now) return { label: 'Quá hạn', className: 'border-red-200 dark:border-red-900/50 bg-[#FEE2E2]/30 dark:bg-red-900/20', textClass: 'text-red-700 dark:text-red-400' };
  if (due != null && due - now <= 2 * oneDay) return { label: 'Sắp hết hạn', className: 'border-amber-200 dark:border-amber-800 bg-[#FEE2E2]/20 dark:bg-amber-900/20', textClass: 'text-amber-700 dark:text-amber-400' };
  return { label: 'Mới', className: 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/20', textClass: 'text-blue-700 dark:text-blue-400' };
}

export function StudentClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const id = classId ? Number(classId) : NaN;
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!id || isNaN(id)) return;
    Promise.all([
      apiService.student.getClassAssignments(id),
      apiService.student.getClasses(),
    ])
      .then(([assignRes, classesRes]) => {
        const list = assignRes.data?.data ?? [];
        setAssignments(Array.isArray(list) ? list : []);
        const classes = classesRes.data?.data ?? [];
        const found = (Array.isArray(classes) ? classes : []).find((c: any) => c.id === id);
        setClassInfo(found || { name: 'Lớp học', id });
      })
      .catch(() => {
        toast.error('Không tải được thông tin lớp hoặc bạn chưa ghi danh lớp này.');
        setAssignments([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#10B981]" />
      </div>
    );
  }

  const completedCount = assignments.filter((a: any) => a.completed).length;
  const totalCount = assignments.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const greeting = user?.fullName ? `Xin chào, ${user.fullName}!` : 'Xin chào!';

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-950 pb-20">
      {/* Banner */}
      <div className="bg-gradient-to-br from-[#10B981] to-emerald-700 text-white p-4 md:p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/90 hover:bg-white/20 gap-2 -ml-1 mb-3"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">{classInfo?.name ?? 'Lớp học'}</h1>
          <p className="text-emerald-100 mt-1">{greeting}</p>
          <p className="text-white/90 text-sm mt-2 italic">&ldquo;{getQuote()}&rdquo;</p>

          {totalCount > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-white/15 backdrop-blur-sm">
              <p className="text-sm font-medium">
                Bạn đã hoàn thành {completedCount}/{totalCount} bài tập. {completedCount >= totalCount ? 'Xuất sắc!' : 'Cố lên!'}
              </p>
              <Progress value={progressPercent} className="mt-2 h-2 bg-white/30 [&>div]:bg-white" />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {assignments.length === 0 ? (
          <Card className="p-8 md:p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="max-w-xs mx-auto mb-4 flex justify-center">
              <div className="w-32 h-32 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Hiện chưa có bài tập mới</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Hãy dành thời gian ôn lại từ vựng hoặc luyện phát âm nhé! Giáo viên sẽ giao bài sớm thôi.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
          </Card>
        ) : (
          <ul className="space-y-4">
            {assignments.map((a: any) => {
              const tag = getAssignmentTag(a.lessonType);
              const status = getCardStatus(a);
              const TagIcon = tag.icon;
              return (
                <Card
                  key={a.id}
                  className={`p-4 md:p-5 transition-all hover:shadow-md ${status.className}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tag.className}`}>
                          <TagIcon className="h-3.5 w-3.5" />
                          {tag.label}
                        </span>
                        {a.completed && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Đã hoàn thành
                          </span>
                        )}
                      </div>
                      <h3 className={`font-semibold ${a.completed ? 'text-gray-600 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                        {a.title}
                      </h3>
                      {a.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{a.description}</p>
                      )}
                      {a.dueAt && (
                        <p className={`text-xs mt-2 flex items-center gap-1 ${status.textClass}`}>
                          <Clock className="h-3.5 w-3.5" />
                          Hạn: {new Date(a.dueAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                      {a.completed && a.score != null && (
                        <p className="text-sm font-medium text-[#10B981] mt-2">
                          Điểm: {a.score}/{a.maxScore ?? 100}
                        </p>
                      )}
                    </div>
                    {!a.completed && (
                      <Button
                        size="sm"
                        className="shrink-0 bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-1"
                        onClick={() => a.lessonId && navigate(`/lessons/${a.lessonId}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Vào bài
                      </Button>
                    )}
                    {a.completed && a.lessonId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1"
                        onClick={() => navigate(`/lessons/${a.lessonId}`)}
                      >
                        Xem lại
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </ul>
        )}

        {/* Placeholder cho Leaderboard / Lộ trình (có thể bật khi có API) */}
        {assignments.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Card className="p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Bảng xếp hạng lớp
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hoàn thành bài tập để leo hạng. Tính năng đang được cập nhật.</p>
            </Card>
            <Card className="p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                Lộ trình khóa học
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bạn đã hoàn thành {completedCount}/{totalCount} bài trong lớp này.</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
