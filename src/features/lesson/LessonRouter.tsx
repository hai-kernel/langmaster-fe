import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/app/components/ui/card';
import { Loader2 } from 'lucide-react';
import apiService from '@/services/apiService';

const TYPE_TO_ROUTE: Record<string, string> = {
  VIDEO: 'video-conversation',
  SPEAKING: 'pronunciation-lesson',
  QUIZ: 'ai-conversation-lesson',
  VOCAB: 'flashcard-lesson',
};

/**
 * LessonRouter - Fetch lesson type từ API rồi redirect đến đúng trang bài học
 */
export function LessonRouter() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!lessonId) { navigate('/sessions'); return; }

    apiService.lesson.getById(Number(lessonId))
      .then((res) => {
        const lesson = res.data?.data ?? res.data;
        if (!lesson) { navigate('/sessions'); return; }
        const route = TYPE_TO_ROUTE[lesson.type] ?? 'video-conversation';
        navigate(`/lessons/${route}/${lessonId}`, { replace: true });
      })
      .catch(() => navigate('/sessions'));
  }, [lessonId, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-500" />
        <p className="text-lg font-semibold">Đang tải bài học...</p>
      </Card>
    </div>
  );
}
