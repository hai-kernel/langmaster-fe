import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  CheckCircle,
  Target,
  Layers,
  GraduationCap,
  Shield,
  RefreshCw,
  ListOrdered,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import apiService from '@/services/apiService';

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalTopics: number;
  activeTopics: number;
  totalSessions: number;
  recentUsers: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: string | null;
  }[];
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  student: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  teacher: 'Giáo viên',
  student: 'Học viên',
};

function timeAgo(isoStr: string | null): string {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

export function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.admin.getStats();
      // Backend wraps in BaseResponse: { success, data: AdminStats }
      const payload = res.data?.data ?? res.data;
      if (payload && typeof payload.totalUsers === 'number') {
        setStats(payload);
      } else {
        setError('Dữ liệu không hợp lệ từ server.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Không thể kết nối backend.';
      setError(msg);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const statCards = stats
    ? [
        {
          label: 'Tổng người dùng',
          value: stats.totalUsers.toLocaleString(),
          sub: `${stats.totalStudents} học viên · ${stats.totalTeachers} giáo viên`,
          icon: Users,
          color: 'from-green-400 to-green-600',
        },
        {
          label: 'Chủ đề học',
          value: stats.totalTopics.toLocaleString(),
          sub: `${stats.activeTopics} đang hoạt động`,
          icon: Target,
          color: 'from-blue-400 to-blue-600',
        },
        {
          label: 'Tổng Sessions',
          value: stats.totalSessions.toLocaleString(),
          sub: 'Bài luyện tập',
          icon: Layers,
          color: 'from-purple-400 to-purple-600',
        },
        {
          label: 'Quản trị viên',
          value: stats.totalAdmins.toLocaleString(),
          sub: 'Tài khoản admin',
          icon: Shield,
          color: 'from-orange-400 to-orange-600',
        },
      ]
    : [];

  const systemStatus = [
    { label: 'API Server', status: 'Hoạt động', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Database', status: 'Hoạt động', icon: CheckCircle, color: 'text-green-600' },
    { label: 'AI Service', status: 'Hoạt động', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Storage', status: 'Hoạt động', icon: CheckCircle, color: 'text-green-600' },
  ];

  return (
    <div className="min-h-[60vh] bg-[var(--page-bg)] pb-6 md:pb-8">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[var(--foreground)] mb-0.5">
                Xin chào, {user?.fullName ?? 'Admin'}
              </h1>
              <p className="text-sm text-muted-foreground">Tổng quan hệ thống học tiếng Anh</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadStats}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>

          {error && !loading && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <span className="text-lg">⚠️</span>
              <div className="flex-1">
                <p className="font-medium">Lỗi tải dữ liệu</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <button onClick={loadStats} className="text-sm underline hover:no-underline flex-shrink-0">
                Thử lại
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <Card className="p-5 hover:shadow-md transition-shadow border-border bg-card text-card-foreground">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm font-medium text-foreground">{stat.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border-border bg-card text-card-foreground">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <Users className="h-5 w-5 text-primary" />
                    Người dùng mới nhất
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin/users')}
                    className="text-primary text-xs"
                  >
                    Xem tất cả →
                  </Button>
                </div>
                {loading ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : (stats?.recentUsers ?? []).length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">Chưa có người dùng nào.</p>
                ) : (
                  <div className="space-y-3">
                    {(stats?.recentUsers ?? []).map((u, index) => (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + 0.05 * index }}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                            {(u.fullName ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{u.fullName}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${ROLE_COLORS[u.role] ?? 'bg-muted text-muted-foreground'}`}>
                            {ROLE_LABELS[u.role] ?? u.role}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">{timeAgo(u.createdAt)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 border-border bg-card text-card-foreground">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5 text-success" />
                  Trạng thái hệ thống
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {systemStatus.map((system) => {
                    const Icon = system.icon;
                    return (
                      <div
                        key={system.label}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/60"
                      >
                        <Icon className={`h-5 w-5 ${system.color}`} />
                        <div>
                          <p className="font-medium text-foreground text-sm">{system.label}</p>
                          <p className="text-xs text-success">{system.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6 border-border bg-card text-card-foreground">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Thao tác nhanh</h2>
                <div className="space-y-2">
                  <Button className="w-full justify-start gap-2" onClick={() => navigate('/admin/topics')}>
                    <Target className="h-4 w-4" />
                    Quản lý Chủ đề học
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/admin/users')}>
                    <Users className="h-4 w-4" />
                    Quản lý người dùng
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/admin/sessions')}>
                    <Layers className="h-4 w-4" />
                    Quản lý Sessions
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/admin/curriculum')}>
                    <ListOrdered className="h-4 w-4" />
                    Lộ trình học
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/admin/classes')}>
                    <GraduationCap className="h-4 w-4" />
                    Lớp học
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/admin/analytics')}>
                    <TrendingUp className="h-4 w-4" />
                    Xem thống kê
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/admin/content')}>
                    <BookOpen className="h-4 w-4" />
                    Quản lý nội dung
                  </Button>
                </div>
              </Card>

              {stats && (
                <Card className="p-6 border-border bg-card text-card-foreground">
                  <h2 className="text-lg font-semibold mb-4 text-foreground">Tóm tắt hệ thống</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Học viên', value: stats.totalStudents, color: 'text-success' },
                      { label: 'Giáo viên', value: stats.totalTeachers, color: 'text-primary' },
                      { label: 'Chủ đề đang mở', value: stats.activeTopics, color: 'text-primary' },
                      { label: 'Tổng sessions', value: stats.totalSessions, color: 'text-warning' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className={`font-semibold ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
