import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { FileText, Plus, Pencil, Trash2, Loader2, ListOrdered } from 'lucide-react';
import apiService from '@/services/apiService';
import { toast } from 'sonner';

interface TestItem {
  id: number;
  title: string;
  durationMinutes: number | null;
  passScore: number | null;
  maxAttempts: number | null;
  questionCount: number;
  totalPoints: number;
  courseTitle?: string | null;
}

const emptyTestForm = {
  title: '',
  durationMinutes: 30,
  passScore: 70,
  maxAttempts: 3,
  deadline: '',
  courseId: '' as string | number,
  lessonId: '' as string | number,
};

type QuestionType = 'MCQ' | 'FILL_BLANK' | 'SPEAKING';
const questionTypeOptions: { value: QuestionType; label: string }[] = [
  { value: 'MCQ', label: 'Trắc nghiệm (MCQ)' },
  { value: 'FILL_BLANK', label: 'Điền từ' },
  { value: 'SPEAKING', label: 'Nói (ghi âm)' },
];

export function AdminTestManagement() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [curriculums, setCurriculums] = useState<{ id: number; title: string }[]>([]);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<number | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [testForm, setTestForm] = useState(emptyTestForm);
  const [saving, setSaving] = useState(false);

  const [questionForm, setQuestionForm] = useState({
    content: '',
    type: 'MCQ' as QuestionType,
    orderIndex: 0,
    points: 1,
    options: [{ content: '', isCorrect: false }],
    correctOptionIndex: 0,
    fillAccepted: '',
  });

  const loadTests = async () => {
    try {
      const res = await apiService.testManage.getAll();
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setTests(
        list.map((t: any) => ({
          id: t.id,
          title: t.title,
          durationMinutes: t.durationMinutes,
          passScore: t.passScore,
          maxAttempts: t.maxAttempts,
          questionCount: t.questionCount ?? 0,
          totalPoints: t.totalPoints ?? 0,
          courseTitle: t.courseTitle,
        }))
      );
    } catch {
      toast.error('Không tải được danh sách bài test');
    } finally {
      setLoading(false);
    }
  };

  const loadCurriculums = async () => {
    try {
      const res = await apiService.curriculum.getAll();
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setCurriculums(list.map((c: any) => ({ id: c.id, title: c.title || '' })));
    } catch {
      setCurriculums([]);
    }
  };

  useEffect(() => {
    loadTests();
    loadCurriculums();
  }, []);

  const openCreateTest = () => {
    setEditingTestId(null);
    setTestForm(emptyTestForm);
    setTestModalOpen(true);
  };

  const openEditTest = (t: TestItem) => {
    setEditingTestId(t.id);
    setTestForm({
      title: t.title,
      durationMinutes: t.durationMinutes ?? 30,
      passScore: t.passScore ?? 70,
      maxAttempts: t.maxAttempts ?? 3,
      deadline: '',
      courseId: '',
      lessonId: '',
    });
    setTestModalOpen(true);
  };

  const saveTest = async () => {
    if (!testForm.title.trim()) {
      toast.error('Vui lòng nhập tên bài test');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        title: testForm.title.trim(),
        durationMinutes: testForm.durationMinutes ?? 30,
        passScore: testForm.passScore ?? 70,
        maxAttempts: testForm.maxAttempts ?? null,
        courseId: testForm.courseId ? Number(testForm.courseId) : null,
        lessonId: testForm.lessonId ? Number(testForm.lessonId) : null,
      };
      if (testForm.deadline) payload.deadline = new Date(testForm.deadline).toISOString();
      if (editingTestId) {
        await apiService.testManage.update(editingTestId, payload);
        toast.success('Đã cập nhật bài test');
      } else {
        await apiService.testManage.create(payload);
        toast.success('Đã tạo bài test');
      }
      setTestModalOpen(false);
      loadTests();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const deleteTest = async (id: number) => {
    if (!window.confirm('Xóa bài test này? Học sinh sẽ không thể làm bài.')) return;
    try {
      await apiService.testManage.delete(id);
      toast.success('Đã xóa bài test');
      loadTests();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Xóa thất bại');
    }
  };

  const openAddQuestion = (testId: number) => {
    setSelectedTestId(testId);
    setQuestionForm({
      content: '',
      type: 'MCQ',
      orderIndex: 0,
      points: 1,
      options: [{ content: '', isCorrect: false }],
      correctOptionIndex: 0,
      fillAccepted: '',
    });
    setQuestionModalOpen(true);
  };

  const addOption = () => {
    setQuestionForm((prev) => ({
      ...prev,
      options: [...prev.options, { content: '', isCorrect: false }],
    }));
  };

  const updateOption = (index: number, content: string, isCorrect: boolean) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === index ? { content, isCorrect } : o)),
    }));
  };

  const removeOption = (index: number) => {
    setQuestionForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctOptionIndex: prev.correctOptionIndex >= index && prev.correctOptionIndex > 0 ? prev.correctOptionIndex - 1 : prev.correctOptionIndex,
    }));
  };

  const saveQuestion = async () => {
    if (!selectedTestId || !questionForm.content.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    if (questionForm.type === 'MCQ' && questionForm.options.some((o) => !o.content.trim())) {
      toast.error('Vui lòng điền đủ các đáp án');
      return;
    }
    if (questionForm.type === 'MCQ' && questionForm.options.every((o) => !o.isCorrect)) {
      toast.error('Chọn ít nhất một đáp án đúng');
      return;
    }
    setSaving(true);
    try {
      let correctSchema: Record<string, unknown> = {};
      const optionsPayload: { content: string; isCorrect: boolean }[] = [];
      if (questionForm.type === 'MCQ') {
        optionsPayload.push(...questionForm.options.map((o) => ({ content: o.content, isCorrect: o.isCorrect })));
        correctSchema = {};
      } else if (questionForm.type === 'FILL_BLANK') {
        const accepted = questionForm.fillAccepted
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (accepted.length) correctSchema = { accepted };
        questionForm.options.forEach((o) => {
          if (o.content.trim()) optionsPayload.push({ content: o.content, isCorrect: accepted.includes(o.content.trim()) });
        });
        if (optionsPayload.length === 0 && accepted.length > 0) {
          optionsPayload.push(...accepted.map((a) => ({ content: a, isCorrect: true })));
        }
      }
      const payload: any = {
        content: questionForm.content.trim(),
        type: questionForm.type,
        orderIndex: questionForm.orderIndex,
        points: questionForm.points,
        correctSchema: Object.keys(correctSchema).length ? correctSchema : undefined,
        correctOptionIndex: questionForm.type === 'MCQ' ? questionForm.options.findIndex((o) => o.isCorrect) : undefined,
        options: optionsPayload.length ? optionsPayload : undefined,
      };
      await apiService.testManage.addQuestion(selectedTestId, payload);
      toast.success('Đã thêm câu hỏi');
      setQuestionModalOpen(false);
      loadTests();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Thêm câu hỏi thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 md:pb-6">
      <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <ListOrdered className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Quản lý bài test</h1>
                <p className="text-green-50">Tạo và chỉnh sửa bài kiểm tra cho học sinh</p>
              </div>
            </div>
            <Button className="bg-white text-green-600 hover:bg-green-50 gap-2" onClick={openCreateTest}>
              <Plus className="h-5 w-5" />
              Tạo bài test
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-green-500" />
          </div>
        ) : tests.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa có bài test nào</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Tạo bài test đầu tiên để học sinh làm bài.</p>
            <Button onClick={openCreateTest} className="gap-2">
              <Plus className="h-5 w-5" />
              Tạo bài test
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {tests.map((t) => (
              <Card key={t.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{t.durationMinutes ?? '—'} phút</Badge>
                    <Badge variant="outline">Đạt: {t.passScore ?? 70}%</Badge>
                    <Badge variant="outline">{t.questionCount} câu</Badge>
                    {t.courseTitle && <Badge variant="secondary">{t.courseTitle}</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openAddQuestion(t.id)} className="gap-1">
                    <Plus className="h-4 w-4" />
                    Thêm câu hỏi
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEditTest(t)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteTest(t.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Tạo/Sửa test */}
      <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTestId ? 'Chỉnh sửa bài test' : 'Tạo bài test mới'}</DialogTitle>
            <DialogDescription>Điền thông tin chung. Sau khi tạo có thể thêm câu hỏi.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Tên bài test *</Label>
              <Input
                value={testForm.title}
                onChange={(e) => setTestForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ví dụ: Quiz Unit 1"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Thời gian (phút)</Label>
                <Input
                  type="number"
                  min={1}
                  value={testForm.durationMinutes}
                  onChange={(e) => setTestForm((p) => ({ ...p, durationMinutes: Number(e.target.value) || 30 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Điểm đạt (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={testForm.passScore}
                  onChange={(e) => setTestForm((p) => ({ ...p, passScore: Number(e.target.value) || 70 }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Số lần làm tối đa (để trống = không giới hạn)</Label>
              <Input
                type="number"
                min={1}
                value={testForm.maxAttempts || ''}
                onChange={(e) => setTestForm((p) => ({ ...p, maxAttempts: e.target.value ? Number(e.target.value) : 0 }))}
                placeholder="Ví dụ: 3"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Thuộc khóa học (tùy chọn)</Label>
              <Select
                value={testForm.courseId != null && testForm.courseId !== '' ? String(testForm.courseId) : '_none'}
                onValueChange={(v) => setTestForm((p) => ({ ...p, courseId: v === '_none' ? '' : Number(v) }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn khóa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— Không —</SelectItem>
                  {curriculums.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={saveTest} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingTestId ? 'Cập nhật' : 'Tạo bài test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Thêm câu hỏi */}
      <Dialog open={questionModalOpen} onOpenChange={setQuestionModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm câu hỏi</DialogTitle>
            <DialogDescription>Chọn loại câu và nhập nội dung, đáp án.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Nội dung câu hỏi *</Label>
              <Input
                value={questionForm.content}
                onChange={(e) => setQuestionForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Ví dụ: Chọn từ đúng điền vào chỗ trống..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loại câu</Label>
                <Select
                  value={questionForm.type}
                  onValueChange={(v: QuestionType) =>
                    setQuestionForm((p) => ({
                      ...p,
                      type: v,
                      options: v === 'MCQ' ? [{ content: '', isCorrect: false }, { content: '', isCorrect: false }] : p.options,
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Điểm</Label>
                <Input
                  type="number"
                  min={1}
                  value={questionForm.points}
                  onChange={(e) => setQuestionForm((p) => ({ ...p, points: Number(e.target.value) || 1 }))}
                  className="mt-1"
                />
              </div>
            </div>

            {questionForm.type === 'MCQ' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Đáp án (chọn một đáp án đúng)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-1" /> Thêm đáp án
                  </Button>
                </div>
                <div className="space-y-2">
                  {questionForm.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={questionForm.options[idx].isCorrect}
                        onChange={() =>
                          setQuestionForm((p) => ({
                            ...p,
                            options: p.options.map((o, i) => ({ ...o, isCorrect: i === idx })),
                            correctOptionIndex: idx,
                          }))
                        }
                      />
                      <Input
                        value={opt.content}
                        onChange={(e) => updateOption(idx, e.target.value, opt.isCorrect)}
                        placeholder={`Đáp án ${idx + 1}`}
                        className="flex-1"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(idx)} disabled={questionForm.options.length <= 1}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questionForm.type === 'FILL_BLANK' && (
              <div>
                <Label>Các đáp án chấp nhận (cách nhau bằng dấu phẩy)</Label>
                <Input
                  value={questionForm.fillAccepted}
                  onChange={(e) => setQuestionForm((p) => ({ ...p, fillAccepted: e.target.value }))}
                  placeholder="Ví dụ: apple, Apple, táo"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Học sinh có thể chọn một trong các đáp án (so khớp không phân biệt hoa thường).</p>
              </div>
            )}

            {questionForm.type === 'SPEAKING' && (
              <p className="text-sm text-gray-500">Câu hỏi nói: học sinh ghi âm. Hệ thống lưu bản ghi; chấm điểm thủ công hoặc để 0 điểm tự động.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={saveQuestion} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Thêm câu hỏi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
