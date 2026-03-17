import { create } from 'zustand';
import type { User, UserProgress, Session, Lesson } from '@/types';

interface AppState {
  user: User | null;
  userProgress: UserProgress;
  sessions: Session[];
  lessons: Lesson[];
  currentView: 'home' | 'sessions' | 'session-detail' | 'lesson' | 'vocabulary' | 'profile';
  selectedSessionId: string | null;
  selectedLessonId: string | null;
  /** Tăng lên sau mỗi lần hoàn thành bài/session để màn hình tiến độ refetch. */
  progressVersion: number;

  hydrateFromDashboard: (payload: {
    user: {
      id: string;
      fullName: string;
      avatarUrl?: string;
      level: number;
      xp: number;
      streak: number;
      totalLessonsCompleted: number;
    };
  }) => void;
  setSessions: (sessions: Session[]) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  setSelectedSession: (sessionId: string) => void;
  setSelectedLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string, score: number) => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  /** Gọi sau khi hoàn thành bài/session để các màn tiến độ refetch từ BE. */
  invalidateProgress: () => void;
}

const defaultProgress: UserProgress = {
  currentSessionId: null,
  currentLessonId: null,
  completedLessons: [],
  lessonScores: {},
};

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  userProgress: defaultProgress,
  sessions: [],
  lessons: [],
  currentView: 'home',
  selectedSessionId: null,
  selectedLessonId: null,
  progressVersion: 0,

  hydrateFromDashboard: ({ user: u }) =>
    set({
      user: {
        id: u.id,
        name: u.fullName,
        avatar: u.avatarUrl,
        level: u.level,
        xp: u.xp,
        streak: u.streak,
        totalLessonsCompleted: u.totalLessonsCompleted,
      },
    }),

  setSessions: (sessions) => set({ sessions }),

  setCurrentView: (view) => set({ currentView: view }),
  
  setSelectedSession: (sessionId) => set({ 
    selectedSessionId: sessionId,
    currentView: 'session-detail'
  }),
  
  setSelectedLesson: (lessonId) => set({ 
    selectedLessonId: lessonId,
    currentView: 'lesson'
  }),
  
  completeLesson: (lessonId, score) => set((state) => {
    const updatedProgress = {
      ...state.userProgress,
      completedLessons: [...state.userProgress.completedLessons, lessonId],
      lessonScores: {
        ...state.userProgress.lessonScores,
        [lessonId]: score,
      },
    };

    const updatedLessons = state.lessons.map(lesson =>
      lesson.id === lessonId
        ? { ...lesson, status: 'completed' as const }
        : lesson
    );

    const updatedUser = {
      ...state.user,
      totalLessonsCompleted: state.user.totalLessonsCompleted + 1,
    };

    return {
      userProgress: updatedProgress,
      lessons: updatedLessons,
      user: updatedUser,
    };
  }),

  addXP: (amount) => set((state) => ({
    user: {
      ...state.user,
      xp: state.user.xp + amount,
      level: Math.floor((state.user.xp + amount) / 250) + 1,
    },
  })),

  incrementStreak: () => set((state) => ({
    user: {
      ...state.user,
      streak: state.user.streak + 1,
    },
  })),
  invalidateProgress: () => set((state) => ({ progressVersion: state.progressVersion + 1 })),
}));
