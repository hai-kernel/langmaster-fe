import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/app/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { AdminPageLayout } from '@/app/components/layout/AdminPageLayout';
import { BookOpen, Plus, Pencil, Trash2, Layers, Search, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '@/services/apiService';

interface Session {
  id: number;
  title: string;
  orderIndex: number;
  courseId: number;
  courseTitle: string;
  lessonCount: number;
}

interface SessionParticipant {
  userId?: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  sessionId: number;
  sessionTitle: string;
  completedLessons: number;
  totalLessons: number;
  sessionCompleted: boolean;
  lastActivityAt?: string;
}

interface Course {
  id: number;
  title: string;
  description?: string;
}

const emptyForm = { title: '', courseId: '', orderIndex: '1' };

export function AdminSessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsSession, setParticipantsSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessRes, courseRes] = await Promise.all([
        apiService.session.getAll(),
        apiService.curriculum.getAll(),
      ]);
      setSessions((sessRes.data?.data as Session[]) ?? []);
      setCourses((courseRes.data?.data as Course[]) ?? []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingSession(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s: Session) => {
    setEditingSession(s);
    setForm({ title: s.title, courseId: String(s.courseId), orderIndex: String(s.orderIndex) });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.courseId) {
      toast.error('Vui lòng điền đủ thông tin');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        courseId: Number(form.courseId),
        orderIndex: Number(form.orderIndex) || 1,
      };
      if (editingSession) {
        await apiService.session.update(editingSession.id, payload);
        toast.success('Session đã được cập nhật');
      } else {
        await apiService.session.create(payload);
        toast.success('Session đã được tạo thành công 🎉');
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error('Lỗi khi lưu session');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa session này? Tất cả lessons trong session cũng sẽ bị ảnh hưởng.')) return;
    try {
      await apiService.session.delete(id);
      toast.success('Đã xóa session');
      fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Không thể xóa session';
      toast.error(msg);
    }
  };

  const openParticipants = async (session: Session) => {
    setParticipantsSession(session);
    setParticipantsModalOpen(true);
    setParticipantsLoading(true);
    try {
      const res = await apiService.session.getParticipants(session.id);
      setParticipants((res.data?.data as SessionParticipant[]) ?? []);
    } catch {
      toast.error('Không tải được danh sách người tham gia');
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleRemoveParticipant = async (p: SessionParticipant) => {
    if (!participantsSession) return;
    if (!confirm(`Xóa ${p.fullName} khỏi session "${participantsSession.title}"? Tiến trình học trong session sẽ bị reset.`)) return;
    try {
      await apiService.session.removeParticipant(participantsSession.id, p.email);
      toast.success('Đã xóa người dùng khỏi session');
      setParticipants(prev => prev.filter(x => x.email !== p.email));
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Không thể xóa người dùng khỏi session';
      toast.error(msg);
    }
  };

  const filtered = sessions.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchCourse = filterCourse === 'all' || String(s.courseId) === filterCourse;
    return matchSearch && matchCourse;
  });

  return (
    <AdminPageLayout
      title="Buổi học (Sessions)"
      subtitle="Quản lý các buổi học thuộc từng khóa (course)"
      icon={Layers}
      action={
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-5 w-5" />
          Tạo buổi học
        </Button>
      }
      stats={[
        { label: 'Tổng buổi học', value: sessions.length },
        { label: 'Số khóa học (courses)', value: courses.length },
        { label: 'Kết quả tìm kiếm', value: filtered.length },
      ]}
    >
      {/* Filters */}
      <Card className="p-4 mb-6 border-border bg-card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên session..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tất cả courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả courses</SelectItem>
              {courses.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Session List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center border-border bg-card">
          <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            {sessions.length === 0 ? 'Chưa có session nào. Tạo session đầu tiên!' : 'Không tìm thấy session phù hợp.'}
          </p>
          {sessions.length === 0 && (
            <Button onClick={openCreate} className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> Tạo Session ngay
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(session => (
          <Card key={session.id} className="p-5 hover:shadow-md transition-all duration-200 group border-border bg-card text-card-foreground flex flex-col gap-3">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(session)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(session.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{session.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{session.courseTitle || 'Chưa có course'}</p>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">Thứ tự: {session.orderIndex}</Badge>
                <Badge variant="outline" className="text-xs">{session.lessonCount} bài học</Badge>
              </div>
              <div className="mt-auto flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs"
                  onClick={() => openParticipants(session)}
                >
                  <Users className="h-3 w-3" />
                  Người tham gia
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSession ? 'Cập nhật Session' : 'Tạo Session mới'}</DialogTitle>
            <DialogDescription>
              {editingSession ? 'Chỉnh sửa thông tin session' : 'Điền thông tin để tạo session học tập mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tên Session *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="VD: Chương 1 - Giới thiệu"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Course *</Label>
              <Select value={form.courseId} onValueChange={v => setForm({ ...form, courseId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {courses.length === 0 && (
                <p className="text-xs text-orange-500">Chưa có course nào. Vui lòng tạo course trước.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderIndex">Thứ tự chương</Label>
              <Input
                id="orderIndex"
                type="number"
                min="1"
                value={form.orderIndex}
                onChange={e => setForm({ ...form, orderIndex: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingSession ? 'Cập nhật' : 'Tạo Session'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Participants Modal */}
      <Dialog open={participantsModalOpen} onOpenChange={setParticipantsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Người tham gia session
              {participantsSession && (
                <span className="block text-sm font-normal text-muted-foreground mt-1">
                  {participantsSession.title}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Xem tiến trình học và có thể xóa người dùng khỏi session này.
            </DialogDescription>
          </DialogHeader>
          {participantsLoading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang tải danh sách người tham gia...</span>
            </div>
          ) : participants.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">
              Chưa có học viên nào có tiến trình trong session này.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto mt-2 space-y-2">
              {participants.map(p => {
                const percent = p.totalLessons > 0 ? Math.round((p.completedLessons / p.totalLessons) * 100) : 0;
                const completed = p.sessionCompleted || percent === 100;
                return (
                  <div
                    key={`${p.email}-${p.sessionId}`}
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
                      onClick={() => handleRemoveParticipant(p)}
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
    </AdminPageLayout>
  );
}
