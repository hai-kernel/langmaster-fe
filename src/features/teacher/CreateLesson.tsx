import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateLessonModal } from './CreateLessonModal';

/**
 * Trang tạo bài học của giáo viên.
 * Chỉ hỗ trợ bài học Video (giống admin): chọn khóa học/session, tạo bài học, thêm YouTube hoặc upload video.
 */
export function CreateLesson() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setModalOpen(true);
  }, []);

  return (
    <CreateLessonModal
      open={modalOpen}
      onOpenChange={(open) => {
        setModalOpen(open);
        if (!open) navigate('/teacher/lessons');
      }}
      onSuccess={() => navigate('/teacher/lessons')}
    />
  );
}
