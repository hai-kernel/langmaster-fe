import { useCallback } from 'react';
import { toast } from 'sonner';
import apiService from '@/services/apiService';
import { useAppStore } from '@/store/appStore';

/**
 * Hook to complete a lesson: call backend to save progress (XP, totalLessonsCompleted)
 * and sync the response to the app store.
 */
export function useCompleteLesson() {
  const user = useAppStore(s => s.user);
  const hydrateFromDashboard = useAppStore(s => s.hydrateFromDashboard);
  const completeLessonLocal = useAppStore(s => s.completeLesson);
  const invalidateProgress = useAppStore(s => s.invalidateProgress);

  const completeAndSave = useCallback(
    async (lessonId: string, score?: number): Promise<boolean> => {
      try {
        const res = await apiService.student.completeLesson(lessonId, score);
        const d = res.data?.data;
        if (!d) {
          toast.error('Không nhận được dữ liệu thành tích');
          return false;
        }
        if (user) {
          hydrateFromDashboard({
            user: {
              id: user.id,
              fullName: user.name,
              avatarUrl: user.avatar,
              level: d.level,
              xp: d.xp,
              streak: user.streak,
              totalLessonsCompleted: d.totalLessonsCompleted,
            },
          });
        }
        completeLessonLocal(lessonId, score ?? 0);
        invalidateProgress();
        const xpEarned = (d?.xp ?? 0) - (user?.xp ?? 0);
        toast.success(`Đã lưu thành tích! +${Math.max(0, xpEarned)} XP`);
        return true;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Không lưu được thành tích';
        toast.error(msg);
        return false;
      }
    },
    [user, hydrateFromDashboard, completeLessonLocal, invalidateProgress]
  );

  return { completeAndSave };
}
