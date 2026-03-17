import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Trophy,
  Target,
  Calendar,
  Loader2,
} from 'lucide-react';
import apiService from '@/services/apiService';
import { toast } from 'sonner';

interface TestItem {
  id: number;
  title: string;
  durationMinutes: number | null;
  passScore: number | null;
  maxAttempts: number | null;
  deadline: string | null;
  questionCount: number;
  totalPoints: number;
  attemptCount: number;
  bestScore: number | null;
  lastAttemptAt: string | null;
  status: 'not-started' | 'in-progress' | 'completed';
  courseTitle?: string | null;
}

export function TestsScreen() {
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    apiService.test
      .getAll()
      .then((res) => {
        if (cancelled || !res.data?.data) return;
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        setTests(
          list.map((t: any) => ({
            id: t.id,
            title: t.title || 'Bài test',
            durationMinutes: t.durationMinutes ?? null,
            passScore: t.passScore ?? null,
            maxAttempts: t.maxAttempts ?? 999,
            deadline: t.deadline ?? null,
            questionCount: t.questionCount ?? 0,
            totalPoints: t.totalPoints ?? 0,
            attemptCount: t.attemptCount ?? 0,
            bestScore: t.bestScore ?? null,
            lastAttemptAt: t.lastAttemptAt ?? null,
            status: t.status || 'not-started',
            courseTitle: t.courseTitle,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) toast.error('Không tải được danh sách bài test');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const availableTests = tests.filter((t) => t.status !== 'completed');
  const completedTests = tests.filter((t) => t.status === 'completed');

  const getStatusIcon = (status: TestItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const displayList = activeTab === 'available' ? availableTests : completedTests;
  const stats = {
    totalTests: tests.length,
    completed: completedTests.length,
    averageScore:
      completedTests.length > 0
        ? Math.round(
            completedTests.reduce((acc, t) => acc + (t.bestScore ?? 0), 0) / completedTests.length
          )
        : 0,
    pending: availableTests.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Tests & Assessments</h1>
              <p className="text-green-50">Theo dõi tiến độ và kết quả của bạn</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalTests}</div>
                  <div className="text-sm text-green-50">Tổng bài test</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-sm text-green-50">Đã hoàn thành</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">{stats.averageScore}%</div>
                  <div className="text-sm text-green-50">Điểm trung bình</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <div className="text-sm text-green-50">Chưa hoàn thành</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'available' ? 'default' : 'outline'}
            onClick={() => setActiveTab('available')}
            className={activeTab === 'available' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            Có thể làm ({availableTests.length})
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'default' : 'outline'}
            onClick={() => setActiveTab('completed')}
            className={activeTab === 'completed' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            Đã hoàn thành ({completedTests.length})
          </Button>
        </div>

        <div className="grid gap-4">
          {displayList.map((test) => (
            <Card key={test.id} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-2xl">
                    {getStatusIcon(test.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {test.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {test.courseTitle && (
                        <Badge variant="outline" className="text-xs">
                          {test.courseTitle}
                        </Badge>
                      )}
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {test.durationMinutes ?? '—'} phút
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Target className="h-3 w-3" />
                        {test.questionCount} câu
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        Lần làm: {test.attemptCount}/{test.maxAttempts ?? '∞'}
                      </div>
                      {test.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Hạn: {new Date(test.deadline).toLocaleDateString()}
                        </div>
                      )}
                      {test.status === 'completed' && test.bestScore != null && test.totalPoints > 0 && (
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(test.bestScore / test.totalPoints) * 100}
                            className="w-24"
                          />
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {test.bestScore}/{test.totalPoints}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {test.status === 'not-started' && (
                    <Button
                      className="bg-green-500 hover:bg-green-600 gap-2"
                      onClick={() => navigate(`/tests/${test.id}`)}
                    >
                      <Play className="h-4 w-4" />
                      Bắt đầu
                    </Button>
                  )}
                  {test.status === 'in-progress' && (
                    <Button
                      className="bg-yellow-500 hover:bg-yellow-600 gap-2"
                      onClick={() => navigate(`/tests/${test.id}`)}
                    >
                      <Play className="h-4 w-4" />
                      Tiếp tục
                    </Button>
                  )}
                  {test.status === 'completed' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/tests/${test.id}/results`)}
                      >
                        Xem kết quả
                      </Button>
                      {(test.maxAttempts == null || test.attemptCount < test.maxAttempts) && (
                        <Button
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => navigate(`/tests/${test.id}`)}
                        >
                          Làm lại
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {displayList.length === 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {activeTab === 'available'
                    ? 'Chưa có bài test nào'
                    : 'Chưa hoàn thành bài test nào'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeTab === 'available'
                    ? 'Quay lại sau khi giáo viên tạo bài test'
                    : 'Hoàn thành bài test để xem kết quả ở đây'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
