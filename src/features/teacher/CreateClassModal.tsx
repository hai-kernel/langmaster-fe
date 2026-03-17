import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import apiService from '@/services/apiService';

interface CreateClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Gọi với classId của lớp vừa tạo (để có thể chuyển sang trang lớp và mở thêm nội dung bài học). */
  onSuccess?: (classId?: number) => void;
}

export function CreateClassModal({ open, onOpenChange, onSuccess }: CreateClassModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    courseId: '' as string,
    startDate: '',
    endDate: '',
    status: 'UPCOMING',
  });
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      apiService.curriculum.getAll().then((res) => {
        const list = res.data?.data ?? [];
        setCourses(Array.isArray(list) ? list : []);
      }).catch(() => setCourses([]));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error('Vui lòng nhập tên lớp');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiService.teacherClasses.create({
        name: formData.name.trim(),
        courseId: formData.courseId ? Number(formData.courseId) : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        status: formData.status,
      });
      const newClass = res.data?.data as { id?: number } | undefined;
      const newClassId = newClass?.id != null ? Number(newClass.id) : undefined;
      toast.success('Tạo lớp thành công! Bạn có thể thêm nội dung bài học cho lớp.');
      onOpenChange(false);
      onSuccess?.(newClassId);
      setFormData({ name: '', courseId: '', startDate: '', endDate: '', status: 'UPCOMING' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Tạo lớp thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo lớp mới</DialogTitle>
          <DialogDescription>
            Đặt tên lớp và chọn khóa học (tùy chọn). Có thể thêm học viên và giao bài sau.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên lớp *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: TA01, Lớp A1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Khóa học</Label>
            <Select value={formData.courseId} onValueChange={(v) => setFormData({ ...formData, courseId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khóa học (tùy chọn)" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngày bắt đầu</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ngày kết thúc</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UPCOMING">Sắp diễn ra</SelectItem>
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="FINISHED">Kết thúc</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo lớp'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}