import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { AdminPageLayout } from '@/app/components/layout/AdminPageLayout';
import {
  BookOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  ListOrdered,
  Loader2,
  Users,
} from 'lucide-react';
import apiService from '@/services/apiService';
import { toast } from 'sonner';

interface Curriculum {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  teacherId?: number;
  teacherName?: string;
}

interface Session {
  id: number;
  title: string;
  orderIndex?: number;
  courseId: number;
  courseName?: string;
  lessonCount?: number;
}

export function AdminCurriculumManagement() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [sessionsByCourse, setSessionsByCourse] = useState<Record<number, Session[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState<'curriculum' | 'session' | null>(null);
  const [sessionCourseId, setSessionCourseId] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<{ id: string; fullName: string }[]>([]);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formTeacherId, setFormTeacherId] = useState<string>('');
  const [formSessionTitle, setFormSessionTitle] = useState('');
  const [formOrderIndex, setFormOrderIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsCourse, setParticipantsCourse] = useState<Curriculum | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  const loadCurriculums = async () => {
    try {
      setLoading(true);
      const res = await apiService.curriculum.getAll();
      setCurriculums(res.data?.data ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không tải được danh sách lộ trình');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionsForCourse = async (courseId: number) => {
    try {
      const res = await apiService.session.getByCourse(courseId);
      setSessionsByCourse((prev) => ({ ...prev, [courseId]: res.data?.data ?? [] }));
    } catch {
      setSessionsByCourse((prev) => ({ ...prev, [courseId]: [] }));
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await apiService.user.getAllUsers();
      const list = res.data?.data ?? [];
      const teacherList = list
        .filter((u: any) => {
          const r = (u.role?.name ?? u.role ?? '').toString().toUpperCase();
          return r === 'TEACHER';
        })
        .map((u: any) => ({ id: String(u.id), fullName: u.fullName || u.email || 'Giáo viên' }));
      setTeachers(teacherList);
    } catch {
      setTeachers([]);
    }
  };

  useEffect(() => {
    loadCurriculums();
    loadTeachers();
  }, []);

  useEffect(() => {
    if (expandedCourseId != null) {
      loadSessionsForCourse(expandedCourseId);
    }
  }, [expandedCourseId]);

  const openAddCurriculum = () => {
    setFormTitle('');
    setFormDescription('');
    setFormThumbnailUrl('');
    setFormPrice(0);
    setFormTeacherId('');
    setModalOpen('curriculum');
  };

  const openAddSession = (courseId: number) => {
    setSessionCourseId(courseId);
    setFormSessionTitle('');
    const sessions = sessionsByCourse[courseId] ?? [];
    setFormOrderIndex(sessions.length);
    setModalOpen('session');
  };

  const handleCreateCurriculum = async () => {
    if (!formTitle.trim()) {
      toast.error('Vui lòng nhập tên lộ trình');
      return;
    }
    setSubmitting(true);
    try {
      await apiService.curriculum.create({
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        thumbnailUrl: formThumbnailUrl.trim() || undefined,
        price: formPrice || 0,
        teacherId: formTeacherId ? Number(formTeacherId) : undefined,
      });
      toast.success('Đã thêm lộ trình học');
      setModalOpen(null);
      loadCurriculums();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Thêm lộ trình thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSession = async () => {
    if (!sessionCourseId || !formSessionTitle.trim()) {
      toast.error('Vui lòng nhập tên buổi học');
      return;
    }
    setSubmitting(true);
    try {
      await apiService.session.create({
        title: formSessionTitle.trim(),
        orderIndex: formOrderIndex,
        courseId: sessionCourseId,
      });
      toast.success('Đã thêm buổi học');
      setModalOpen(null);
      setSessionCourseId(null);
      loadSessionsForCourse(sessionCourseId);
      setExpandedCourseId(sessionCourseId);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Thêm buổi học thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCurriculum = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa lộ trình này? Các buổi học trong lộ trình cũng sẽ bị ảnh hưởng.')) return;
    try {
      await apiService.curriculum.delete(id);
      toast.success('Đã xóa lộ trình');
      loadCurriculums();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Xóa thất bại';
      toast.error(msg);
    }
  };

  const handleDeleteSession = async (courseId: number, sessionId: number) => {
    if (!window.confirm('Xóa buổi học này?')) return;
    try {
      await apiService.session.delete(sessionId);
      toast.success('Đã xóa buổi học');
      loadSessionsForCourse(courseId);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Xóa thất bại';
      toast.error(msg);
    }
  };

  const openCourseParticipants = async (course: Curriculum) => {
    setParticipantsCourse(course);
    setParticipantsModalOpen(true);
    setParticipantsLoading(true);
    try {
      const res = await apiService.curriculum.getParticipants(course.id);
      setParticipants(res.data?.data ?? []);
    } catch {
      toast.error('Không tải được danh sách người tham gia khóa học');
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleRemoveCourseParticipant = async (user: any) => {
    if (!participantsCourse) return;
    if (!window.confirm(`Xóa ${user.fullName || user.email} khỏi khóa "${participantsCourse.title}"? Tiến trình học trong khóa sẽ bị reset.`)) return;
    try {
      await apiService.curriculum.removeParticipant(participantsCourse.id, user.email);
      toast.success('Đã xóa người dùng khỏi khóa học');
      setParticipants(prev => prev.filter((x: any) => x.email !== user.email));
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Không thể xóa người dùng khỏi khóa học';
      toast.error(msg);
    }
  };

  return (
    <>
    <AdminPageLayout
      title="Lộ trình học (Courses)"
      subtitle="Quản lý các khóa học và buổi học bên trong"
      icon={ListOrdered}
      action={
        <Button onClick={openAddCurriculum} className="gap-2">
          <Plus className="h-5 w-5" />
          Thêm lộ trình
        </Button>
      }
      stats={[
        { label: 'Lộ trình', value: curriculums.length },
      ]}
    >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {curriculums.length === 0 ? (
              <Card className="p-12 text-center border-border bg-card">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Chưa có lộ trình nào</h3>
                <p className="text-muted-foreground mb-6">Thêm lộ trình học để học viên có thể đăng ký và học.</p>
                <Button onClick={openAddCurriculum} className="gap-2">
                  <Plus className="h-5 w-5" />
                  Thêm lộ trình đầu tiên
                </Button>
              </Card>
            ) : (
              curriculums.map((course) => {
                const sessions = sessionsByCourse[course.id] ?? [];
                const isExpanded = expandedCourseId === course.id;
                return (
                  <Card key={course.id} className="overflow-hidden border-border bg-card text-card-foreground">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-primary" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-primary" />
                        )}
                        <div>
                          <h3 className="font-bold text-lg text-foreground">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {course.teacherName ? `GV: ${course.teacherName}` : 'Chưa gán giáo viên'}
                            {course.price != null && course.price > 0 && ` · ${course.price} đ`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAddSession(course.id)}
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Buổi học
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => openCourseParticipants(course)}
                        >
                          <Users className="h-4 w-4" />
                          Người tham gia
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCurriculum(course.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-border bg-muted/30 px-4 py-3">
                        {sessions.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">Chưa có buổi học. Nhấn &quot;Buổi học&quot; để thêm.</p>
                        ) : (
                          <ul className="space-y-2">
                            {sessions
                              .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                              .map((s) => (
                                <li
                                  key={s.id}
                                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-card border border-border"
                                >
                                  <span className="font-medium text-foreground">{s.title}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{s.lessonCount ?? 0} bài</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-destructive h-8 w-8 p-0"
                                      onClick={() => handleDeleteSession(course.id, s.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        )}
      </AdminPageLayout>

      {/* Course participants modal */}
      <Dialog open={participantsModalOpen} onOpenChange={setParticipantsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Người tham gia khóa học
              {participantsCourse && (
                <span className="block text-sm font-normal text-muted-foreground mt-1">
                  {participantsCourse.title}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {participantsLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang tải danh sách người tham gia...</span>
            </div>
          ) : participants.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">
              Chưa có học viên nào có tiến trình trong khóa học này.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto mt-2 space-y-2">
              {participants.map((p: any) => {
                const percent = p.totalLessons > 0 ? Math.round((p.completedLessons / p.totalLessons) * 100) : 0;
                const completed = p.courseCompleted || percent === 100;
                return (
                  <div
                    key={`${p.email}-${p.courseId}`}
                    className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/40 px-3 py-2"
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {p.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground truncate">{p.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-muted-foreground">
                            {p.completedLessons}/{p.totalLessons} bài
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              completed
                                ? 'bg-emerald-100 text-emerald-700'
                                : percent > 0
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {completed ? 'Hoàn thành' : percent > 0 ? 'Đang học' : 'Mới bắt đầu'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="mt-1 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveCourseParticipant(p)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Thêm lộ trình */}
      <Dialog open={modalOpen === 'curriculum'} onOpenChange={(open) => !open && setModalOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm lộ trình học</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Tên lộ trình *</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ví dụ: Tiếng Anh giao tiếp A1"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Mô tả ngắn về lộ trình"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Link ảnh bìa</Label>
              <Input
                value={formThumbnailUrl}
                onChange={(e) => setFormThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Giá (VNĐ, 0 = miễn phí)</Label>
              <Input
                type="number"
                min={0}
                value={formPrice || ''}
                onChange={(e) => setFormPrice(Number(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Giáo viên phụ trách</Label>
              <select
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">-- Không gán --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(null)}>
              Hủy
            </Button>
            <Button onClick={handleCreateCurriculum} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Thêm buổi học */}
      <Dialog open={modalOpen === 'session'} onOpenChange={(open) => !open && setModalOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm buổi học</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Tên buổi học *</Label>
              <Input
                value={formSessionTitle}
                onChange={(e) => setFormSessionTitle(e.target.value)}
                placeholder="Ví dụ: Buổi 1 - Chào hỏi"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Thứ tự</Label>
              <Input
                type="number"
                min={0}
                value={formOrderIndex}
                onChange={(e) => setFormOrderIndex(Number(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(null)}>
              Hủy
            </Button>
            <Button onClick={handleCreateSession} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Thêm buổi học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
