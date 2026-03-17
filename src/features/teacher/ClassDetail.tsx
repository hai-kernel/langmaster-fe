import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ArrowLeft, Users, BookOpen, ListTodo, LayoutDashboard, Loader2, Plus, Trash2, ClipboardList, BarChart3, KeyRound, Copy, Check, XCircle } from 'lucide-react';
import apiService from '@/services/apiService';
import { toast } from 'sonner';

export function ClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = classId ? Number(classId) : NaN;
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignLessonId, setAssignLessonId] = useState<string>('');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDueAt, setAssignDueAt] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentSubmitting, setStudentSubmitting] = useState(false);
  const [usersList, setUsersList] = useState<{ id: string; email?: string; fullName?: string; role?: string }[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [assignmentStats, setAssignmentStats] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const loadDetail = useCallback(() => {
    if (!id || isNaN(id)) return;
    setLoading(true);
    apiService.teacherClasses.getById(id)
      .then((res) => setDetail(res.data?.data ?? null))
      .catch(() => toast.error('Không tải được thông tin lớp'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    if (!detail || !id) return;
    if (searchParams.get('addContent') === '1') {
      setActiveTab('assignments');
      setAssignModalOpen(true);
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.delete('addContent');
        return p;
      }, { replace: true });
    }
  }, [detail, id, searchParams]);

  useEffect(() => {
    if (studentModalOpen) {
      apiService.user.getAllUsers()
        .then((res) => {
          const list = res.data?.data ?? [];
          setUsersList(Array.isArray(list) ? list : []);
        })
        .catch(() => setUsersList([]));
    }
  }, [studentModalOpen]);

  // Tải danh sách bài học có thể giao ngay khi vào trang lớp → nút "Thêm bài tập" không bị disabled
  useEffect(() => {
    if (!detail || !id) return;
    const loadAssignableLessons = () => {
      apiService.teacher.getLessons()
        .then((res) => {
          const list = res.data?.data ?? [];
          const arr = Array.isArray(list) ? list : [];
          if (arr.length > 0) {
            setAllLessons(arr);
            return;
          }
          return apiService.lesson.getAll().then((r) => {
            const all = r.data?.data ?? [];
            setAllLessons(Array.isArray(all) ? all : []);
          });
        })
        .catch(() => {
          apiService.lesson.getAll()
            .then((res) => {
              const list = res.data?.data ?? [];
              setAllLessons(Array.isArray(list) ? list : []);
            })
            .catch(() => setAllLessons([]));
        });
    };
    loadAssignableLessons();
  }, [detail, id]);

  useEffect(() => {
    if (assignModalOpen) {
      setAssignLessonId('');
      setAssignTitle('');
      setAssignDueAt('');
    }
  }, [assignModalOpen]);

  useEffect(() => {
    if (activeTab === 'stats' && id && !isNaN(id)) {
      setStatsLoading(true);
      apiService.teacherClasses.getAssignmentStats(id)
        .then((res) => setAssignmentStats((res.data?.data ?? []) as any[]))
        .catch(() => setAssignmentStats([]))
        .finally(() => setStatsLoading(false));
    }
  }, [activeTab, id]);

  useEffect(() => {
    if ((activeTab === 'students' || activeTab === 'overview') && id && !isNaN(id)) {
      setJoinRequestsLoading(true);
      apiService.teacherClasses.getJoinRequests(id)
        .then((res) => setJoinRequests((res.data?.data ?? []) as any[]))
        .catch(() => setJoinRequests([]))
        .finally(() => setJoinRequestsLoading(false));
    }
  }, [activeTab, id]);

  if (loading || !detail) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const classInfo = detail.classInfo ?? detail;
  const course = detail.course;
  const sessions = detail.sessions ?? [];
  const courseLessons = detail.lessons ?? [];
  const lessonsForAssign = (() => {
    const teacherList = allLessons ?? [];
    const courseList = courseLessons ?? [];
    if (teacherList.length === 0) return courseList;
    const byId = new Map(teacherList.map((l: any) => [l.id, l]));
    courseList.forEach((c: any) => { if (!byId.has(c.id)) byId.set(c.id, c); });
    return Array.from(byId.values());
  })();
  const students = detail.students ?? [];
  const assignments = detail.assignments ?? [];

  const handleDeleteClass = () => {
    if (!id || isNaN(id)) return;
    setDeleteSubmitting(true);
    apiService.teacherClasses.delete(id)
      .then(() => {
        toast.success('Đã xoá lớp.');
        navigate('/teacher/classes');
      })
      .catch((e: any) => {
        toast.error(e?.response?.data?.message || 'Không thể xoá lớp.');
        setDeleteConfirmOpen(false);
      })
      .finally(() => setDeleteSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <Button variant="ghost" className="text-white hover:bg-white/20 gap-2" onClick={() => navigate('/teacher/classes')}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <Button
              variant="outline"
              className="border-white/50 text-white hover:bg-red-500/20 hover:border-red-300 gap-2"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Xoá lớp
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{classInfo.name}</h1>
          <p className="text-blue-50 mt-1">
            {course?.title && `${course.title} • `}
            {classInfo.studentCount ?? 0} học viên • {classInfo.assignmentCount ?? 0} bài tập
          </p>
          {classInfo.joinCode && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-blue-100 text-sm">Mã lớp:</span>
              <code className="px-3 py-1.5 rounded-lg bg-white/20 font-mono text-lg font-bold tracking-wider">
                {classInfo.joinCode}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => {
                  navigator.clipboard.writeText(classInfo.joinCode);
                  setCopiedCode(true);
                  toast.success('Đã copy mã lớp');
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
              >
                {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xoá lớp</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 dark:text-gray-400">
            Bạn có chắc muốn xoá lớp &quot;{classInfo.name}&quot;? Hành động này không thể hoàn tác. Toàn bộ bài tập và danh sách học viên của lớp sẽ bị xoá.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={deleteSubmitting}>
              Huỷ
            </Button>
            <Button variant="destructive" onClick={handleDeleteClass} disabled={deleteSubmitting}>
              {deleteSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleteSubmitting ? 'Đang xoá...' : 'Xoá lớp'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Lộ trình
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <ListTodo className="h-4 w-4" />
              Bài tập
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Tổng hợp
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              Học viên
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Thông tin lớp</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Khóa học</dt>
                  <dd>{course?.title ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Trạng thái</dt>
                  <dd>
                    <Badge variant="outline">
                      {classInfo.status === 'ACTIVE' ? 'Đang hoạt động' : classInfo.status === 'UPCOMING' ? 'Sắp diễn ra' : 'Kết thúc'}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Ngày bắt đầu / kết thúc</dt>
                  <dd>
                    {classInfo.startDate ? new Date(classInfo.startDate).toLocaleDateString('vi-VN') : '—'} –{' '}
                    {classInfo.endDate ? new Date(classInfo.endDate).toLocaleDateString('vi-VN') : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Số học viên / Bài tập</dt>
                  <dd>{classInfo.studentCount ?? 0} / {classInfo.assignmentCount ?? 0}</dd>
                </div>
              </dl>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Session & Lesson (khóa học)</h3>
              {sessions.length === 0 && courseLessons.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có session/lesson trong khóa học.</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((s: any) => (
                    <div key={s.id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{s.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{s.lessonCount ?? 0} bài</p>
                    </div>
                  ))}
                  {courseLessons.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tất cả bài học ({courseLessons.length})</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        {courseLessons.slice(0, 20).map((l: any) => (
                          <li key={l.id}>{l.title}</li>
                        ))}
                        {courseLessons.length > 20 && <li>... và {courseLessons.length - 20} bài khác</li>}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-semibold text-lg">Bài tập đã giao</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigate('/teacher/create-test')}
                  >
                    <ClipboardList className="h-4 w-4" /> Thêm bài kiểm tra
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setAssignLessonId('');
                      setAssignTitle('');
                      setAssignDueAt('');
                      setAssignModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" /> Thêm bài tập (Video/Bài học)
                  </Button>
                </div>
              </div>
              {assignments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {lessonsForAssign.length === 0 ? 'Chưa có bài học. Tạo bài học Video trong Thư viện nội dung trước.' : 'Chưa giao bài nào.'}
                </p>
              ) : (
                <ul className="space-y-3">
                  {assignments.map((a: any) => (
                    <li key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="font-medium">{a.title}</p>
                        {a.dueAt && (
                          <p className="text-xs text-gray-500">Hạn: {new Date(a.dueAt).toLocaleString('vi-VN')}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          if (confirm('Xóa bài tập này?')) {
                            apiService.teacherClasses.deleteAssignment(id, a.id)
                              .then(() => { loadDetail(); toast.success('Đã xóa'); })
                              .catch(() => toast.error('Không xóa được'));
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Bảng tổng hợp bài tập</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Số học viên đã làm và điểm chi tiết theo từng bài tập.
              </p>
              {statsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
              ) : assignmentStats.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có bài tập nào hoặc chưa có dữ liệu.</p>
              ) : (
                <div className="space-y-4 overflow-x-auto">
                  {assignmentStats.map((stat: any) => (
                    <div key={stat.assignmentId} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">{stat.title}</span>
                        <Badge variant="outline">
                          {stat.completedCount}/{stat.totalStudents} HV đã làm
                        </Badge>
                        {stat.dueAt && (
                          <span className="text-xs text-gray-500">Hạn: {new Date(stat.dueAt).toLocaleString('vi-VN')}</span>
                        )}
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50/50 dark:bg-gray-900/50">
                            <th className="text-left p-2 font-medium">Học viên</th>
                            <th className="text-left p-2 font-medium">Trạng thái</th>
                            <th className="text-left p-2 font-medium">Điểm</th>
                            <th className="text-left p-2 font-medium">Hoàn thành</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(stat.students ?? []).map((s: any) => (
                            <tr key={s.studentId} className="border-b last:border-0">
                              <td className="p-2">{s.studentName}</td>
                              <td className="p-2">{s.completed ? 'Đã làm' : 'Chưa làm'}</td>
                              <td className="p-2">{s.score != null ? s.score : '—'}</td>
                              <td className="p-2">{s.completedAt ? new Date(s.completedAt).toLocaleString('vi-VN') : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            {/* Yêu cầu tham gia lớp (nhập mã) — GV duyệt/từ chối */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600" />
                Yêu cầu chờ duyệt
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Học viên nhập mã lớp để gửi yêu cầu. Bạn duyệt hoặc từ chối bên dưới.
              </p>
              {joinRequestsLoading ? (
                <div className="flex items-center gap-2 text-gray-500 py-4">
                  <Loader2 className="h-5 w-5 animate-spin" /> Đang tải...
                </div>
              ) : joinRequests.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có yêu cầu nào.</p>
              ) : (
                <ul className="space-y-3">
                  {joinRequests.map((req: any) => (
                    <li key={req.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50 dark:bg-gray-800/50">
                      <div>
                        <p className="font-medium">{req.studentName ?? req.studentId}</p>
                        <p className="text-xs text-gray-500">{req.studentEmail}</p>
                        {req.requestedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Gửi lúc: {new Date(req.requestedAt).toLocaleString('vi-VN')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="gap-1 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            apiService.teacherClasses.approveJoinRequest(id, req.id)
                              .then(() => {
                                toast.success('Đã duyệt');
                                loadDetail();
                                setJoinRequests((prev) => prev.filter((r: any) => r.id !== req.id));
                              })
                              .catch((e: any) => toast.error(e?.response?.data?.message || 'Không duyệt được'));
                          }}
                        >
                          <Check className="h-4 w-4" /> Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => {
                            if (!confirm('Từ chối yêu cầu này?')) return;
                            apiService.teacherClasses.rejectJoinRequest(id, req.id)
                              .then(() => {
                                toast.success('Đã từ chối');
                                setJoinRequests((prev) => prev.filter((r: any) => r.id !== req.id));
                              })
                              .catch((e: any) => toast.error(e?.response?.data?.message || 'Không từ chối được'));
                          }}
                        >
                          <XCircle className="h-4 w-4" /> Từ chối
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-semibold text-lg">Danh sách học viên</h3>
                <Button size="sm" className="gap-2" onClick={() => { setStudentIdInput(''); setStudentModalOpen(true); }}>
                  <Plus className="h-4 w-4" /> Thêm học viên
                </Button>
              </div>
              {students.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có học viên trong lớp.</p>
              ) : (
                <ul className="space-y-2">
                  {students.map((s: any) => (
                    <li key={s.studentId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="font-medium">{s.fullName}</p>
                        <p className="text-xs text-gray-500">{s.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          if (confirm(`Xóa ${s.fullName} khỏi lớp?`)) {
                            apiService.teacherClasses.removeStudent(id, s.studentId)
                              .then(() => { loadDetail(); toast.success('Đã xóa'); })
                              .catch(() => toast.error('Không xóa được'));
                          }
                        }}
                      >
                        Xóa
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal: Thêm bài tập */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Giao bài tập</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Bài học *</Label>
              {lessonsForAssign.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/50 p-4 text-sm text-muted-foreground">
                  Chưa có bài học. Vào <button type="button" className="underline font-medium text-primary" onClick={() => { setAssignModalOpen(false); navigate('/teacher/curriculum'); }}>Thư viện nội dung</button> để tạo bài học Video trước, sau đó quay lại giao bài cho lớp.
                </div>
              ) : (
                <Select value={assignLessonId} onValueChange={(v) => { setAssignLessonId(v); const l = lessonsForAssign.find((x: any) => String(x.id) === v); if (l) setAssignTitle(l.title || ''); }}>
                  <SelectTrigger><SelectValue placeholder="Chọn bài học" /></SelectTrigger>
                  <SelectContent>
                    {lessonsForAssign.map((l: any) => (
                      <SelectItem key={l.id} value={String(l.id)}>{l.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label>Tên bài tập (tùy chọn)</Label>
              <Input value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} placeholder="Mặc định = tên bài học" />
            </div>
            <div>
              <Label>Hạn nộp (tùy chọn)</Label>
              <Input type="datetime-local" value={assignDueAt} onChange={(e) => setAssignDueAt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>Hủy</Button>
            <Button
              disabled={!assignLessonId || assignSubmitting}
              onClick={async () => {
                const lessonId = Number(assignLessonId);
                if (!lessonId || isNaN(lessonId)) {
                  toast.error('Vui lòng chọn bài học');
                  return;
                }
                setAssignSubmitting(true);
                try {
                  const dueAtVal = assignDueAt?.trim();
                  await apiService.teacherClasses.createAssignment(id, {
                    lessonId,
                    title: assignTitle.trim() || undefined,
                    dueAt: dueAtVal ? dueAtVal : undefined,
                  });
                  toast.success('Đã giao bài tập');
                  setAssignModalOpen(false);
                  loadDetail();
                } catch (e: any) {
                  const msg = e?.response?.data?.message ?? e?.message ?? 'Giao bài thất bại';
                  toast.error(msg);
                } finally {
                  setAssignSubmitting(false);
                }
              }}
            >
              {assignSubmitting ? 'Đang giao...' : 'Giao bài'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Thêm học viên */}
      <Dialog open={studentModalOpen} onOpenChange={setStudentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm học viên vào lớp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Chọn tài khoản (hoặc nhập ID)</Label>
              <Select value={studentIdInput} onValueChange={setStudentIdInput}>
                <SelectTrigger><SelectValue placeholder="Chọn học viên" /></SelectTrigger>
                <SelectContent>
                  {usersList
                    .filter((u: any) => u.role === 'STUDENT' || !u.role)
                    .map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>{u.fullName || u.email || u.id}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Nếu không thấy, nhập ID tài khoản bên dưới.</p>
            </div>
            <div>
              <Label>Hoặc nhập ID tài khoản (userId)</Label>
              <Input value={studentIdInput} onChange={(e) => setStudentIdInput(e.target.value)} placeholder="VD: user-uuid" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentModalOpen(false)}>Hủy</Button>
            <Button
              disabled={!studentIdInput.trim() || studentSubmitting}
              onClick={async () => {
                const sid = studentIdInput.trim();
                if (!sid) return;
                setStudentSubmitting(true);
                try {
                  await apiService.teacherClasses.addStudent(id, sid);
                  toast.success('Đã thêm học viên');
                  setStudentModalOpen(false);
                  loadDetail();
                } catch (e: any) {
                  toast.error(e?.response?.data?.message || 'Thêm học viên thất bại');
                } finally {
                  setStudentSubmitting(false);
                }
              }}
            >
              {studentSubmitting ? 'Đang thêm...' : 'Thêm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
