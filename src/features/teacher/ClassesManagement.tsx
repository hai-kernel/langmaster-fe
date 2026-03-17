import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import {
  Users,
  Plus,
  Calendar,
  BookOpen,
  TrendingUp,
  MoreVertical,
  Eye,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { CreateClassModal } from './CreateClassModal';
import apiService from '@/services/apiService';
import { toast } from 'sonner';

export function ClassesManagement() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteConfirmClassId, setDeleteConfirmClassId] = useState<number | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await apiService.teacherClasses.getAll();
      const data = res.data?.data ?? [];
      setClasses(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không tải được danh sách lớp');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const statusMap: Record<string, 'active' | 'upcoming' | 'completed'> = {
    ACTIVE: 'active',
    UPCOMING: 'upcoming',
    FINISHED: 'completed',
  };
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };

  const stats = {
    total: classes.length,
    active: classes.filter((c) => (c.status || '').toUpperCase() === 'ACTIVE').length,
    totalStudents: classes.reduce((sum, c) => sum + (c.studentCount ?? 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Quản lý lớp học</h1>
                <p className="text-blue-50">Tạo lớp, gắn khóa học và giao bài cho học viên</p>
              </div>
            </div>
            <Button className="bg-white text-blue-600 hover:bg-blue-50 gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-5 w-5" />
              Tạo lớp
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-white" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-blue-50">Tổng số lớp</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <div className="text-sm text-blue-50">Đang hoạt động</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <div className="text-sm text-blue-50">Học viên</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">{classes.reduce((s, c) => s + (c.assignmentCount ?? 0), 0)}</div>
                  <div className="text-sm text-blue-50">Bài tập đã giao</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid gap-4">
          {classes.map((classItem) => {
            const statusKey = statusMap[(classItem.status || '').toUpperCase()] || 'upcoming';
            const studentCount = classItem.studentCount ?? 0;
            const maxStudents = 50;
            return (
              <Card key={classItem.id} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{classItem.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={statusColors[statusKey]}>
                            {statusKey === 'active' ? 'Đang hoạt động' : statusKey === 'upcoming' ? 'Sắp diễn ra' : 'Kết thúc'}
                          </Badge>
                          {classItem.courseTitle && (
                            <Badge variant="outline">{classItem.courseTitle}</Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => navigate(`/teacher/classes/${classItem.id}`)}>
                            <Eye className="h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                            onClick={() => setDeleteConfirmClassId(Number(classItem.id))}
                          >
                            <Trash2 className="h-4 w-4" />
                            Xoá lớp
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {classItem.startDate ? new Date(classItem.startDate).toLocaleDateString('vi-VN') : '—'} -{' '}
                          {classItem.endDate ? new Date(classItem.endDate).toLocaleDateString('vi-VN') : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Học viên</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {studentCount}/{maxStudents}
                      </div>
                      <Progress value={(studentCount / maxStudents) * 100} className="mt-2" />
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-purple-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Bài tập</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {classItem.assignmentCount ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/teacher/classes/${classItem.id}`)}>
                    <Eye className="h-4 w-4" />
                    Xem chi tiết
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {!loading && classes.length === 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa có lớp nào</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Tạo lớp đầu tiên và gắn khóa học để bắt đầu</p>
                <Button className="bg-blue-500 hover:bg-blue-600 gap-2" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-5 w-5" />
                  Tạo lớp
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <CreateClassModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={(newClassId) => {
          fetchClasses();
          setCreateOpen(false);
          if (newClassId != null) {
            navigate(`/teacher/classes/${newClassId}?addContent=1`);
          }
        }}
      />

      <Dialog open={deleteConfirmClassId != null} onOpenChange={(open) => !open && setDeleteConfirmClassId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xoá lớp</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 dark:text-gray-400">
            Bạn có chắc muốn xoá lớp này? Hành động không thể hoàn tác. Toàn bộ bài tập và danh sách học viên của lớp sẽ bị xoá.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmClassId(null)} disabled={deleteSubmitting}>
              Huỷ
            </Button>
            <Button
              variant="destructive"
              disabled={deleteSubmitting}
              onClick={async () => {
                if (deleteConfirmClassId == null) return;
                setDeleteSubmitting(true);
                try {
                  await apiService.teacherClasses.delete(deleteConfirmClassId);
                  toast.success('Đã xoá lớp.');
                  setDeleteConfirmClassId(null);
                  fetchClasses();
                } catch (e: any) {
                  toast.error(e?.response?.data?.message || 'Không thể xoá lớp.');
                } finally {
                  setDeleteSubmitting(false);
                }
              }}
            >
              {deleteSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleteSubmitting ? 'Đang xoá...' : 'Xoá lớp'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
