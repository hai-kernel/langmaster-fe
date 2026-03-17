import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { motion } from 'motion/react';
import { Users, BookOpen, BarChart3, TrendingUp, Award, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import apiService from '@/services/apiService';

export function TeacherDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.teacherClasses.getAll()
      .then((res) => {
        const data = res.data?.data ?? [];
        setClasses(Array.isArray(data) ? data : []);
      })
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, []);

  const totalClasses = classes.length;
  const activeClasses = classes.filter((c) => (c.status || '').toUpperCase() === 'ACTIVE').length;
  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount ?? 0), 0);
  const totalAssignments = classes.reduce((sum, c) => sum + (c.assignmentCount ?? 0), 0);

  const stats = [
    { label: 'Học viên', value: String(totalStudents), icon: Users, color: 'from-green-400 to-green-600' },
    { label: 'Tổng lớp', value: String(totalClasses), icon: BookOpen, color: 'from-blue-400 to-blue-600' },
    { label: 'Lớp đang hoạt động', value: String(activeClasses), icon: Award, color: 'from-purple-400 to-purple-600' },
    { label: 'Bài tập đã giao', value: String(totalAssignments), icon: BarChart3, color: 'from-orange-400 to-orange-600' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Xin chào, {user?.name ?? user?.email}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tổng quan lớp học — dữ liệu từ hệ thống
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Lớp học của tôi
              </h2>
              {classes.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có lớp nào. Tạo lớp từ Quản lý lớp học.</p>
              ) : (
                <div className="space-y-3">
                  {classes.slice(0, 5).map((c: any) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => navigate(`/teacher/classes/${c.id}`)}
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{c.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {c.studentCount ?? 0} học viên · {c.assignmentCount ?? 0} bài tập
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">{c.status === 'ACTIVE' ? 'Đang hoạt động' : c.status === 'FINISHED' ? 'Kết thúc' : 'Sắp diễn ra'}</span>
                    </div>
                  ))}
                  {classes.length > 5 && (
                    <Button variant="outline" className="w-full" onClick={() => navigate('/teacher/classes')}>
                      Xem tất cả {classes.length} lớp
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Thao tác nhanh</h2>
              <div className="space-y-3">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl justify-start" onClick={() => navigate('/teacher/classes')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Quản lý lớp học
                </Button>
                <Button variant="outline" className="w-full rounded-xl justify-start" onClick={() => navigate('/teacher/classes')}>
                  <Users className="h-4 w-4 mr-2" />
                  Xem lớp & học viên
                </Button>
                <Button variant="outline" className="w-full rounded-xl justify-start" onClick={() => navigate('/admin/topics')}>
                  <Award className="h-4 w-4 mr-2" />
                  Nội dung (Topic / Lesson)
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tổng quan
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tổng lớp</span>
                  <span className="font-bold text-gray-900 dark:text-white">{totalClasses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Bài tập đã giao</span>
                  <span className="font-bold text-gray-900 dark:text-white">{totalAssignments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Học viên</span>
                  <span className="font-bold text-gray-900 dark:text-white">{totalStudents}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
